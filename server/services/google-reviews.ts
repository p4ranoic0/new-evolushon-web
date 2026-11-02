import { createHash } from 'node:crypto';
import type { Pool } from 'mysql2/promise';
import { z } from 'zod';
import type { GoogleReviewsState, Lang } from '../../shared/types.js';
import { safeReviewUrl } from '../../shared/review-utils.js';
import { env } from '../env.js';
import { exec, rows, json, iso } from '../db/pool.js';

export const GOOGLE_REFRESH_MS = 24 * 60 * 60 * 1000;
// Un día de margen para que la purga horaria ocurra antes del máximo de 30 días.
export const GOOGLE_RETENTION_MS = 29 * GOOGLE_REFRESH_MS;
const localizedText = z.object({ text:z.string(), languageCode:z.string().optional() });
const placeSchema = z.object({
  rating:z.number().min(0).max(5).optional(), userRatingCount:z.number().int().nonnegative().optional(), googleMapsUri:z.string().optional(),
  reviews:z.array(z.object({
    name:z.string().optional(), rating:z.number().min(1).max(5), publishTime:z.iso.datetime().optional(),
    relativePublishTimeDescription:z.string().optional(), googleMapsUri:z.string().optional(),
    text:localizedText.optional(), originalText:localizedText.optional(),
    authorAttribution:z.object({ displayName:z.string(), uri:z.string().optional(), photoUri:z.string().optional() }),
  })).max(5).default([]),
});
const empty = (active:boolean):GoogleReviewsState => ({active,updatedAt:null,rating:null,count:null,placeUrl:'',reviews:[],stale:false,error:false});
type Entry = { state:GoogleReviewsState; attemptedAt:number };
export function googleReviewsService(db:Pool, options:{
  key?:string; placeId?:string; now?:()=>number; fetch?:typeof fetch; warn?:()=>void;
} = {}) {
  const key=options.key ?? env.GOOGLE_PLACES_API_KEY, placeId=options.placeId ?? env.GOOGLE_PLACE_ID;
  const active=!!(key && placeId), now=options.now ?? Date.now, fetcher=options.fetch ?? fetch;
  const memory=new Map<Lang,Entry>(), pending=new Map<Lang,Promise<GoogleReviewsState>>();
  function retain(state:GoogleReviewsState):GoogleReviewsState {
    if (!state.updatedAt || now()-Date.parse(state.updatedAt)>=GOOGLE_RETENTION_MS) return {...empty(active),error:state.error};
    return {...state,stale:now()-Date.parse(state.updatedAt)>=GOOGLE_REFRESH_MS};
  }
  async function purge() {
    await exec(db,'DELETE FROM google_reviews_cache WHERE refreshed_at <= ? OR (refreshed_at IS NULL AND attempted_at <= ?)',
      [new Date(now()-GOOGLE_RETENTION_MS),new Date(now()-GOOGLE_RETENTION_MS)]);
    for (const [lang,entry] of memory) memory.set(lang,{...entry,state:retain(entry.state)});
  }
  async function refresh(lang:Lang):Promise<GoogleReviewsState> {
    const cacheKey=createHash('sha256').update(placeId+'\0'+lang).digest('hex');
    let previous=empty(active);
    const c=await db.getConnection();
    let locked=false;
    try {
      // También limita llamadas entre procesos/reinicios. Un fallo cuenta como intento diario.
      const [lock]=await rows(c,'SELECT GET_LOCK(?, 10) AS acquired',['gr-'+cacheKey.slice(0,60)]);
      if (Number(lock.acquired)!==1) return {...retain(memory.get(lang)?.state ?? previous),error:true};
      locked=true;
      await exec(c,'DELETE FROM google_reviews_cache WHERE refreshed_at <= ?',[new Date(now()-GOOGLE_RETENTION_MS)]);
      const [cached]=await rows(c,'SELECT * FROM google_reviews_cache WHERE cache_key=?',[cacheKey]);
      if (cached?.payload) previous=retain({...json<GoogleReviewsState>(cached.payload),active,updatedAt:iso(cached.refreshed_at)});
      const attemptedAt=cached ? Date.parse(iso(cached.attempted_at)!) : 0;
      if (cached && now()-attemptedAt<GOOGLE_REFRESH_MS) {
        // Si el último intento falló, refreshed_at será anterior al intento (o nulo).
        previous.error=!previous.updatedAt || attemptedAt>Date.parse(previous.updatedAt);
        memory.set(lang,{state:previous,attemptedAt}); return previous;
      }
      const attempted=now();
      await exec(c,'INSERT INTO google_reviews_cache(cache_key,attempted_at) VALUES (?,?) ON DUPLICATE KEY UPDATE attempted_at=?',
        [cacheKey,new Date(attempted),new Date(attempted)]);
      let state:GoogleReviewsState;
      try {
        const response=await fetcher('https://places.googleapis.com/v1/places/'+encodeURIComponent(placeId!)+'?languageCode='+lang,{
          headers:{'X-Goog-Api-Key':key!,'X-Goog-FieldMask':'rating,userRatingCount,reviews,googleMapsUri'},signal:AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error('Places request failed');
        const place=placeSchema.parse(await response.json());
        state={active,updatedAt:new Date(attempted).toISOString(),rating:place.rating ?? null,count:place.userRatingCount ?? null,
          placeUrl:safeReviewUrl(place.googleMapsUri) || '',stale:false,error:false,
          reviews:place.reviews.map((r,i)=>({id:'google-'+i,source:'google',url:safeReviewUrl(r.googleMapsUri),
            author:r.authorAttribution.displayName,authorUrl:safeReviewUrl(r.authorAttribution.uri),photoUrl:safeReviewUrl(r.authorAttribution.photoUri),
            rating:r.rating,date:r.publishTime?.slice(0,10) || '',relativeDate:r.relativePublishTimeDescription || '',hidden:false,
            text:{es:r.text?.text || r.originalText?.text || '',en:'',fr:'',de:''},
          })),
        };
        await exec(c,'UPDATE google_reviews_cache SET payload=?,refreshed_at=? WHERE cache_key=?',[JSON.stringify(state),new Date(attempted),cacheKey]);
      } catch {
        // No registrar ni respuesta externa ni excepción fetch: pueden contener la clave.
        options.warn?.(); state={...retain(previous),error:true};
      }
      memory.set(lang,{state,attemptedAt:attempted}); return state;
    } finally {
      try {if(locked) await c.query('SELECT RELEASE_LOCK(?)',['gr-'+cacheKey.slice(0,60)]);} finally {c.release();}
    }
  }
  async function get(lang:Lang):Promise<GoogleReviewsState> {
    if (!active) return empty(false);
    const entry=memory.get(lang);
    if (entry && now()-entry.attemptedAt<GOOGLE_REFRESH_MS) return retain(entry.state);
    if (!pending.has(lang)) pending.set(lang,refresh(lang).catch(()=>{
      options.warn?.();return {...retain(memory.get(lang)?.state ?? empty(active)),error:true};
    }).finally(()=>pending.delete(lang)));
    return pending.get(lang)!;
  }
  return {get,purge};
}
export type GoogleReviewsService=ReturnType<typeof googleReviewsService>;
