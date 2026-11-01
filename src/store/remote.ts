import { useSyncExternalStore } from 'react';
import { DEFAULT, migrate } from '../../shared/index';
import type { SiteData } from '../../shared/types';
import { api } from './api';
const listeners = new Set<() => void>();
const injected = document.getElementById('evo-data')?.textContent;
let cached: SiteData = DEFAULT;
let fetchedAt = 0;
let pending: Promise<void> | undefined;
try { if (injected) { cached = migrate(JSON.parse(injected)); fetchedAt = Date.now(); } } catch { /* La API recupera datos si el HTML está incompleto. */ }
export function load() { return cached; }
export function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function refreshSite() {
  if (!pending) pending = api.get<SiteData>('/public/site').then((data) => {
    cached = migrate(data); fetchedAt = Date.now(); listeners.forEach((fn) => fn());
  }).finally(() => { pending = undefined; });
  return pending;
}
export function useSiteData() { return useSyncExternalStore(subscribe, load, load); }
if (!injected) void refreshSite().catch(() => { /* La siguiente visita visible reintenta. */ });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && Date.now() - fetchedAt > 60000) void refreshSite().catch(() => {});
});
export function preference(key: string, fallback: string) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }
export function setPreference(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Preferencia opcional. */ } }
export function browserImport() {
  const read=(key:string)=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
  return {data:read('evolushon-draft-v1')||read('evolushon-data-v1'),bookings:read('evolushon-bookings-v1')};
}
export function clearBrowserImport() {
  for(const key of ['evolushon-draft-v1','evolushon-data-v1','evolushon-bookings-v1','evolushon-history-v1'])localStorage.removeItem(key);
}
