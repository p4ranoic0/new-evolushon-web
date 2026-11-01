import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
export function useAvailability(sid:string,from:string,to:string,active:boolean){
  const [value,setValue]=useState<{capacity:number;taken:Record<string,Record<string,number>>}|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(false);
  const refresh=useCallback(async()=>{
    setLoading(true);setError(false);
    try{setValue(await api.get('/public/availability?sid='+encodeURIComponent(sid)+'&from='+from+'&to='+to));}catch{setError(true);}finally{setLoading(false);}
  },[sid,from,to]);
  useEffect(()=>{if(active)void refresh();},[active,refresh]);
  return {value,loading,error,refresh};
}
export function normalizeTime(value:string){const m=value.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);if(!m)return value;let hour=Number(m[1]);if(m[3])hour=hour%12+(m[3].toUpperCase()==='PM'?12:0);return String(hour).padStart(2,'0')+':'+m[2];}
