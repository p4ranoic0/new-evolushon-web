import { useEffect, useState } from 'react';
import type { GoogleReviewsState, Lang } from '../../shared/types';
import { api } from '../store/api';
import { Panel } from './shared';

export function GoogleReviewsStatus({lang}:{lang:Lang}) {
  const [result,setResult]=useState<{lang:Lang;state:GoogleReviewsState}>(), [error,setError]=useState(false);
  const state=result?.lang===lang ? result.state : undefined;
  useEffect(()=>{
    let cancelled=false;
    void api.get<GoogleReviewsState>('/admin/reviews/google?lang='+lang).then(state=>{if(!cancelled){setResult({lang,state});setError(false);}}).catch(()=>{if(!cancelled)setError(true);});
    return ()=>{cancelled=true;};
  },[lang]);
  return <Panel title="Reseñas sincronizadas de Google">
    {error ? <p role="alert">No se pudo consultar el estado de sincronización.</p> : !state ? <p role="status">Consultando sincronización…</p> : <>
      <p><strong>Sincronización con Google: {state.active ? 'activa' : 'inactiva'}</strong></p>
      <p>Última actualización: {state.updatedAt ? new Date(state.updatedAt).toLocaleString('es-PE') : 'Sin actualizaciones'} · {state.reviews.length} reseñas · Puntuación: {state.rating ?? 'Sin datos'}{state.count!=null ? ' ('+state.count+' en Google)' : ''}</p>
      {!state.active && <p className="muted">Configura GOOGLE_PLACES_API_KEY y GOOGLE_PLACE_ID en el entorno del servidor para activarla.</p>}
      {state.error && <p role="status">Falló la última consulta a Google. Se conserva la caché anterior si no ha caducado; se reintentará después de 24 h.</p>}
      {state.stale && <p className="muted">Mostrando la última caché disponible.</p>}
      <p className="muted">Solo lectura. No forman parte del borrador ni del historial. Idioma: {lang.toUpperCase()}.</p>
      {state.reviews.map(r=><article className="social-candidate" key={r.id}>
        <b>{r.author}</b> · {r.rating} / 5 · {r.relativeDate}
        <p>{r.text.es}</p>
        {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer">Ver en Google Maps</a>}
        <small> · Reseñas de Google · Google Maps</small>
      </article>)}
    </>}
  </Panel>;
}
