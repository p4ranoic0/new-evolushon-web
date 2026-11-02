import { useState } from 'react';
import { parseSocialComments, importSocialComments } from '../../shared/social-reviews';
import type { SocialComment } from '../../shared/social-reviews';
import type { Review } from '../../shared/types';
import { Check, Panel } from './shared';
import type { Update } from './shared';

export function SocialReviewsImport({reviews,update,notify}:{reviews:Review[];update:Update;notify:(s:string)=>void}) {
  const [open,setOpen]=useState(false), [comments,setComments]=useState<SocialComment[]>([]);
  const [selected,setSelected]=useState<Set<number>>(new Set()), [error,setError]=useState('');
  return <div className="social-import">
    <button className="admin-btn" onClick={()=>setOpen(v=>!v)}>Importar comentarios de redes</button>
    {open && <Panel title="Elegir comentarios">
      <p className="notice">Son comentarios públicos: pide permiso a sus autores antes de publicarlos</p>
      <label className="field">Archivo comentarios.json
        <input type="file" accept=".json,application/json" onChange={async e=>{
          const file=e.currentTarget.files?.[0];
          setComments([]);setSelected(new Set());setError('');
          if (!file) return;
          if (file.size>5*1024*1024) {setError('El archivo no puede superar 5 MB.');return;}
          try {setComments(parseSocialComments(JSON.parse(await file.text())));}
          catch {setError('Archivo inválido: se requiere un array con red (instagram/tiktok), url_post HTTPS, usuario, texto y fecha (AAAA-MM o fecha ISO).');}
        }}/>
      </label>
      {error && <p role="alert">{error}</p>}
      {!!comments.length && <>
        <p className="muted">{comments.length} comentarios. Los candidatos aparecen primero. Se omiten los duplicados por enlace, autor y texto.</p>
        <div className="social-candidates">{comments.map((c,i)=><div className="social-candidate" key={i}>
          <Check label={(c.testimonio_candidato ? 'Candidato · ' : '')+c.red+' · @'+c.usuario.replace(/^@+/,'')+' · '+c.fecha.slice(0,7)} checked={selected.has(i)} onChange={v=>setSelected(current=>{const next=new Set(current);if(v)next.add(i);else next.delete(i);return next;})}/>
          <p>{c.texto}</p><a href={c.url_post} target="_blank" rel="noopener noreferrer">Ver publicación original</a>
        </div>)}</div>
        <button className="admin-btn primary" disabled={!selected.size} onClick={()=>{
          const added=importSocialComments(reviews,comments.filter((_,i)=>selected.has(i)));
          if (reviews.length+added.length>1000) {setError('El borrador admite como máximo 1000 reseñas.');return;}
          if(added.length)update(d=>{d.reviews.push(...added);});
          notify(added.length+' reseñas añadidas al borrador; '+(selected.size-added.length)+' duplicados omitidos.');
          setSelected(new Set());
        }}>Añadir {selected.size} al borrador</button>
      </>}
    </Panel>}
  </div>;
}
