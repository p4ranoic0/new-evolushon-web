import { useCallback, useEffect, useState } from 'react';
import type { Booking } from '../../shared/types';
import { api } from './api';
export function useBookings(enabled=true) {
  const [items,setItems]=useState<Booking[]>([]),[error,setError]=useState('');
  const refresh=useCallback(async()=>{
    if(!enabled)return;
    try {
      const all:Booking[]=[];let cursor='';
      do {
        const result=await api.get<{items:Booking[];next:string|null}>('/admin/bookings?limit=200'+(cursor?'&cursor='+encodeURIComponent(cursor):''));
        all.push(...result.items);cursor=result.next||'';
      }while(cursor);
      setItems(all);setError('');
    }catch(e){setError((e as Error).message);}
  },[enabled]);
  useEffect(()=>{
    if(!enabled)return;
    const initial=setTimeout(()=>void refresh(),0);const id=setInterval(()=>{if(!document.hidden)void refresh();},60000);
    const listener=()=>{void refresh();};window.addEventListener('evo-bookings',listener);
    return()=>{clearTimeout(initial);clearInterval(id);window.removeEventListener('evo-bookings',listener);};
  },[enabled,refresh]);
  return {items,error,refresh};
}
