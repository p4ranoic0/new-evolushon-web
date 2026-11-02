import { useEffect, useState } from 'react';
import { IconBrandGoogle, IconBrandInstagram, IconBrandTiktok, IconMessageCircle, IconMapPin, IconPencil, IconStar, IconStarFilled } from '@tabler/icons-react';
import { BOOKING_UI } from '../../shared/booking-ui';
import { PUBLIC_UI } from '../../shared/public-ui';
import { fmt, tr } from '../../shared/index';
import type { GoogleReview, GoogleReviewsState, Lang, Review, Settings } from '../../shared/types';
import { safeReviewUrl, visibleReviews } from '../../shared/review-utils';
import { api } from '../store/api';
import { Doodle } from './Doodle';

function Stars({ n }: { n:number }) {
  return <span className="stars" role="img" aria-label={n+' / 5'}>{[1,2,3,4,5].map(i => i<=Math.round(n) ? <IconStarFilled key={i} size={18}/> : <IconStar key={i} size={18}/>)}</span>;
}
function ReviewCard({ review:r, lang }: {review:Review|GoogleReview;lang:Lang}) {
  const synced='relativeDate' in r ? r : undefined;
  const source=r.source || 'manual', url=safeReviewUrl(r.url), authorUrl=safeReviewUrl(synced?.authorUrl);
  const Icon={google:IconBrandGoogle,instagram:IconBrandInstagram,tiktok:IconBrandTiktok,manual:IconMessageCircle}[source];
  const label=source==='manual' ? PUBLIC_UI.manualReview[lang] : {google:'Google',instagram:'Instagram',tiktok:'TikTok'}[source];
  const date=r.date ? new Date(r.date.slice(0,7)+'-01T12:00:00') : undefined;
  return <article data-source={source}>
    <div className="flex justify-between"><Stars n={r.rating}/><span className="review-source"><Icon size={20} aria-hidden/>{label}</span></div>
    <p className="serif">“{tr(r.text,lang)}”</p>
    <div className="review-author">
      {synced?.photoUrl ? <img src={synced.photoUrl} alt="" width={38} height={38} loading="lazy" referrerPolicy="no-referrer"/> : <span>{r.author[0] || '?'}</span>}
      <div><b>{authorUrl ? <a href={authorUrl} target="_blank" rel="noopener noreferrer">{r.author}</a> : r.author}</b>
        <small>{synced?.relativeDate || (date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(lang,{month:'long',year:'numeric'}) : '')}</small>
      </div>
    </div>
    {url && <a className="review-origin" href={url} target="_blank" rel="noopener noreferrer">{PUBLIC_UI.reviewOrigin[lang]} · {label}</a>}
    {synced && <small className="google-attribution">{PUBLIC_UI.googleAttribution[lang]} · Google Maps</small>}
  </article>;
}
type Props={reviews:Review[];settings:Settings['reviews'];lang:Lang;google?:GoogleReviewsState};
export function ReviewsSection({reviews,settings,lang,google}:Props) {
  const real=visibleReviews(reviews), synced=google?.active ? google : undefined;
  // Tanto las sincronizadas como las cargadas a mano de Google van primero.
  const all=[...(synced?.reviews || []),...real.filter(r=>r.source==='google'),...real.filter(r=>r.source!=='google')];
  const placeUrl=safeReviewUrl(synced?.placeUrl) || safeReviewUrl(settings.placeUrl);
  if (!all.length && !placeUrl) return null;
  const onlyGoogle=all.every(r=>r.source==='google'), bt=BOOKING_UI[lang];
  const rating=synced?.rating ?? settings.rating, count=synced?.count ?? settings.count;
  return <section className="section reviews"><div className="wrap">
    <Doodle name="star" className="section-doodle"/>
    <div className="section-heading"><div><h2>{(onlyGoogle ? PUBLIC_UI.googleReviewsTitle : PUBLIC_UI.reviewsTitle)[lang]}</h2>
      {placeUrl && rating!=null && <div className="rating"><strong>{rating}</strong><div><Stars n={rating}/><small>{count!=null ? fmt(bt.basedOn,{n:count}) : ''}</small></div></div>}
    </div>
      {placeUrl && <div className="actions">
        <a className="btn outline" href={placeUrl} target="_blank" rel="noopener noreferrer"><IconMapPin size={18}/>{bt.seeAll}</a>
        <a className="btn ink" href={safeReviewUrl(settings.writeUrl) || placeUrl} target="_blank" rel="noopener noreferrer"><IconPencil size={18}/>{bt.write}</a>
      </div>}
    </div>
    {!!all.length && <div className="reviews-strip">{all.map((r,i)=><ReviewCard key={r.id+'-'+i} review={r} lang={lang}/>)}</div>}
    {synced && (synced.reviews.length>0 || synced.rating!=null) && <p className="google-attribution">{PUBLIC_UI.googleAttribution[lang]} · Google Maps</p>}
  </div></section>;
}
export function RemoteReviews(props:Omit<Props,'google'>) {
  const [result,setResult]=useState<{lang:Lang;google:GoogleReviewsState}>();
  useEffect(()=>{
    let cancelled=false;
    const refresh=()=>{void api.get<GoogleReviewsState>('/public/reviews?lang='+props.lang).then(google=>{if(!cancelled)setResult({lang:props.lang,google});}).catch(()=>{});};
    refresh();
    // Revalida pestañas abiertas y retira cualquier dato vencido en el servidor.
    const timer=setInterval(refresh,60*60*1000);
    return ()=>{cancelled=true;clearInterval(timer);};
  },[props.lang]);
  return <ReviewsSection {...props} google={result?.lang===props.lang ? result.google : undefined}/>;
}
