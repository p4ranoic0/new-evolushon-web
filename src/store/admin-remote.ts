import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { clone, DEFAULT } from '../../shared/index';
import type { HistoryEntry, SiteData, User } from '../../shared/types';
import { api, ApiError } from './api';
export type ContentResponse = {draft:{version:number;data:SiteData;updatedAt:string};published:{version:number;data:SiteData;publishedAt:string};history:HistoryEntry[]};
const BACKUP = 'evolushon-draft-v2';
export const ContentActions = createContext<{ importData:(data:SiteData)=>Promise<void>; restore:(id:number)=>Promise<void> } | null>(null);
export function useContentActions() { const value=useContext(ContentActions); if (!value) throw new Error('Panel no disponible.'); return value; }
export function useAdminContent(auth: User | null, notify:(message:string)=>void) {
  const [data,setData]=useState<SiteData>(()=>clone(DEFAULT));
  const [live,setLive]=useState<SiteData>(()=>clone(DEFAULT));
  const [entries,setEntries]=useState<HistoryEntry[]>([]);
  const [loadedFor,setLoadedFor]=useState('');
  const authKey=auth ? String(auth.id||auth.user)+auth.role : '';
  const loaded=!!authKey && loadedFor===authKey;
  const [loadError,setLoadError]=useState('');
  const [busy,setBusy]=useState(false);
  const acting=useRef(false);
  const activeAuth=useRef('');
  const loadSequence=useRef({value:0});
  const [saveState,setSaveState]=useState<'saved'|'saving'|'error'>('saved');
  const [conflict,setConflict]=useState<ContentResponse['draft']|null>(null);
  const [recovery,setRecovery]=useState<SiteData|null>(null);
  const [generation,setGeneration]=useState(0);
  const version=useRef(0), latest=useRef(data), pending=useRef<SiteData|null>(null), timer=useRef<ReturnType<typeof setTimeout>|null>(null), flight=useRef<{key:string;promise:Promise<void>}|null>(null), failure=useRef(false);
  const accept=useCallback((response:ContentResponse)=>{
    if(activeAuth.current!==authKey)return;
    latest.current=response.draft.data;pending.current=null;version.current=response.draft.version;failure.current=false;
    setData(response.draft.data);setLive(response.published.data);setEntries(response.history);setLoadedFor(authKey);setSaveState('saved');setConflict(null);setGeneration((n)=>n+1);
  },[authKey]);
  const reload=useCallback(async()=>{
    const sequence=++loadSequence.current.value;
    try {
      const response=await api.get<ContentResponse>('/admin/content');if(activeAuth.current!==authKey || sequence!==loadSequence.current.value)return;accept(response);setLoadError('');
      try {
        const backup=JSON.parse(localStorage.getItem(BACKUP)||'null');
        if(backup?.savedAt>response.draft.updatedAt && backup?.data) setRecovery(backup.data);
      } catch { /* Copia opcional. */ }
    } catch(error){if(activeAuth.current===authKey && sequence===loadSequence.current.value)setLoadError((error as Error).message);}
  },[accept,authKey]);
  useEffect(()=>{
    activeAuth.current=authKey;
    const loadCounter=loadSequence.current;
    if(authKey)void reload();
    return()=>{loadCounter.value++;activeAuth.current='';pending.current=null;if(timer.current)clearTimeout(timer.current);};
  },[authKey,reload]);
  const flush=useCallback(async()=>{
    if(timer.current){clearTimeout(timer.current);timer.current=null;}
    if(flight.current?.key===authKey)return flight.current.promise;
    const task=(async()=>{
      while(pending.current && activeAuth.current===authKey && authKey){
        const next=pending.current;pending.current=null;setSaveState('saving');
        try {
          const result=await api.put<{version:number;updatedAt:string;data?:SiteData}>('/admin/content/draft',{baseVersion:version.current,data:next});
          if(activeAuth.current!==authKey)return;
          version.current=result.version;failure.current=false;
          if(!pending.current && result.data){latest.current=result.data;setData(result.data);}
          try{localStorage.setItem(BACKUP,JSON.stringify({savedAt:result.updatedAt,data:pending.current||result.data||next}));}catch{/* Respaldo opcional. */}
        }catch(error){
          if(activeAuth.current!==authKey)return;
          pending.current=pending.current||next;failure.current=true;setSaveState('error');
          if(error instanceof ApiError && error.code==='DRAFT_STALE'){
            const details=error.details as {draft?:ContentResponse['draft']};if(details?.draft)setConflict(details.draft);
          }
          notify((error as Error).message);throw error;
        }
      }
      setSaveState('saved');
    })();flight.current={key:authKey,promise:task};
    try{await task;}finally{if(flight.current?.promise===task)flight.current=null;}
  },[authKey,notify]);
  const persist=useCallback((next:SiteData)=>{
    if(!authKey || activeAuth.current!==authKey)return false;
    latest.current=next;pending.current=next;setData(next);setSaveState('saving');
    try{localStorage.setItem(BACKUP,JSON.stringify({savedAt:new Date().toISOString(),data:next}));}catch{/* El servidor sigue siendo la fuente de verdad. */}
    if(timer.current)clearTimeout(timer.current);
    timer.current=setTimeout(()=>{void flush().catch(()=>{});},800);
    return true;
  },[authKey,flush]);
  const action=useCallback(async(path:string,body:Record<string,unknown>={})=>{
    if(acting.current)throw new Error('Espera a que termine la operación actual.');
    acting.current=true;setBusy(true);
    try{
      await flush();if(failure.current)throw new Error('Guarda el borrador antes de continuar.');
      await api.post(path,{...body,baseVersion:version.current});
      accept(await api.get<ContentResponse>('/admin/content'));
    }catch(error){
      if(error instanceof ApiError && error.code==='DRAFT_STALE'){
        const details=error.details as {draft?:ContentResponse['draft']};
        if(details?.draft){setConflict(details.draft);pending.current=latest.current;failure.current=true;setSaveState('error');}
      }
      throw error;
    }finally{acting.current=false;setBusy(false);}
  },[accept,flush]);
  async function resolveConflict(overwrite:boolean){
    if(!conflict)return;
    version.current=conflict.version;setConflict(null);failure.current=false;
    if(overwrite){pending.current=latest.current;await flush();}
    else{
      pending.current=null;latest.current=conflict.data;setData(conflict.data);setSaveState('saved');setGeneration((n)=>n+1);
      try{localStorage.setItem(BACKUP,JSON.stringify({savedAt:conflict.updatedAt,data:conflict.data}));}catch{/* Copia opcional. */}
    }
  }
  const safeAction=async(path:string,body:Record<string,unknown>={})=>{try{await action(path,body);}catch(error){notify((error as Error).message);throw error;}};
  return {current:()=>latest.current,busy,data,live,entries,loaded,loadError,reload,persist,saveState,conflict,resolveConflict,generation,recovery,
    resumeSession(){activeAuth.current=authKey;void reload();},
    async prepareLogout(){
      if(timer.current)clearTimeout(timer.current);
      try{await flush();}catch{/* La copia local permite recuperar cambios no guardados. */}
      activeAuth.current='';pending.current=null;
      if(timer.current)clearTimeout(timer.current);
    },
    recover(){if(recovery)persist(recovery);setRecovery(null);},dismissRecovery(){setRecovery(null);},retry:flush,
    async publish(){await safeAction('/admin/content/publish');notify('Publicado en el sitio.');},
    async discard(){await safeAction('/admin/content/discard');notify('Cambios descartados.');},
    async restore(id:number){await safeAction('/admin/content/restore/'+id);notify('Versión restaurada al borrador.');},
    async importData(value:SiteData){await safeAction('/admin/import',{data:value});notify('Importado al borrador: revisa y publica.');},
  };
}
