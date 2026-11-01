import { useCallback, useEffect, useState } from 'react';
import { api } from '../store/api';
import { browserImport, clearBrowserImport, clone, DEFAULT, download, isoDate, migrate } from '../store';
import type { Photo, User } from '../store';
import { uploadImage } from './image-pipeline';
import { useContentActions } from '../store/admin-remote';
import { Check, Field, Panel } from './shared';
import { kb } from './utils';
type ServerUser=User&{id:number;username:string;active:boolean;password?:string};
const newUser=()=>({username:'',name:'',role:'editor' as User['role'],password:''});
export function UsersManager({notify}:{notify:(message:string)=>void}){
  const [users,setUsers]=useState<ServerUser[]>([]),[adding,setAdding]=useState(newUser),[current,setCurrent]=useState(''),[next,setNext]=useState('');
  const load=useCallback(async()=>{try{const result=await api.get<ServerUser[]>('/admin/users');setUsers(result);}catch(error){notify((error as Error).message);}},[notify]);
  useEffect(()=>{const initial=setTimeout(()=>void load(),0);return()=>clearTimeout(initial);},[load]);
  function change(id:number,fields:Partial<ServerUser>){setUsers(users.map((u)=>u.id===id?{...u,...fields}:u));}
  async function save(user:ServerUser){try{await api.patch('/admin/users/'+user.id,{name:user.name,role:user.role,active:user.active,...(user.password?{password:user.password}:{})});await load();notify('Usuario actualizado.');}catch(error){notify((error as Error).message);}}
  return <>
    <Panel title="Equipo">
      <p className="muted">Administrador configura todo; editor publica contenido y gestiona reservas; fotógrafo gestiona la galería.</p>
      {users.map((user)=><div className="user-editor" key={user.id}>
        <Field label="Nombre" value={user.name} onChange={(name)=>change(user.id,{name})}/>
        <Field label="Usuario" value={user.username} readOnly onChange={()=>{}}/>
        <Field label="Nueva contraseña (opcional)" type="password" autoComplete="new-password" value={user.password||''} onChange={(password)=>change(user.id,{password})}/>
        <label className="field">Rol<select value={user.role} onChange={(e)=>change(user.id,{role:e.target.value as User['role']})}><option value="admin">Administrador</option><option value="editor">Editor</option><option value="fotografo">Fotógrafo</option></select></label>
        <Check label="Activo" checked={user.active} onChange={(active)=>change(user.id,{active})}/>
        <button className="admin-btn" onClick={()=>void save(user)}>Guardar usuario</button>
        <button className="admin-btn danger" onClick={()=>{if(confirm('¿Eliminar este usuario?'))void api.del('/admin/users/'+user.id).then(load).catch((error)=>notify(error.message));}}>Eliminar</button>
      </div>)}
      <form className="form-grid" onSubmit={(e)=>{e.preventDefault();void api.post('/admin/users',adding).then(()=>{setAdding(newUser());return load();}).then(()=>notify('Usuario creado.')).catch((error)=>notify(error.message));}}>
        <Field label="Nombre del nuevo usuario" value={adding.name} required onChange={(name)=>setAdding({...adding,name})}/>
        <Field label="Nuevo usuario" value={adding.username} required pattern="[a-z0-9._-]+" onChange={(username)=>setAdding({...adding,username})}/>
        <Field label="Contraseña inicial" type="password" autoComplete="new-password" minLength={10} value={adding.password} required onChange={(password)=>setAdding({...adding,password})}/>
        <label className="field">Rol<select value={adding.role} onChange={(e)=>setAdding({...adding,role:e.target.value as User['role']})}><option value="editor">Editor</option><option value="fotografo">Fotógrafo</option><option value="admin">Administrador</option></select></label>
        <button className="admin-btn" type="submit">Añadir usuario</button>
      </form>
    </Panel>
    <Panel title="Cambiar mi contraseña"><form className="form-grid" onSubmit={(e)=>{e.preventDefault();void api.post('/auth/password',{current,next}).then(()=>{setCurrent('');setNext('');notify('Contraseña actualizada.');}).catch((error)=>notify(error.message));}}>
      <Field label="Contraseña actual" type="password" value={current} autoComplete="current-password" required onChange={setCurrent}/>
      <Field label="Nueva contraseña" type="password" value={next} minLength={10} autoComplete="new-password" required onChange={setNext}/>
      <button type="submit" className="admin-btn">Cambiar contraseña</button>
    </form></Panel>
  </>;
}
type Storage={uploadsBytes:number;files:number;dbBytes:number;versions:number};
type Candidate={id:string;src:string;referenced:boolean;deletedAt:string|null};
export function ServerStorage({notify}:{notify:(message:string)=>void}){
  const {importData}=useContentActions();
  const [storage,setStorage]=useState<Storage|null>(null),[candidates,setCandidates]=useState<Candidate[]>([]),[progress,setProgress]=useState('');
  const load=useCallback(async()=>{try{setStorage(await api.get('/admin/storage'));}catch(error){notify((error as Error).message);}},[notify]);
  useEffect(()=>{const initial=setTimeout(()=>void load(),0);return()=>clearTimeout(initial);},[load]);
  async function run(task:()=>Promise<void>){try{await task();}catch(error){notify((error as Error).message);}finally{setProgress('');}}
  async function importJson(file?:File){if(!file)return;await run(async()=>{const input=JSON.parse(await file.text());await importData(migrate(input.draft?.data||input.draft||input.data||input));});}
  async function importBrowser(){await run(async()=>{
    const legacy=browserImport();if(!legacy.data)throw new Error('No hay datos antiguos en este navegador.');
    const next=migrate(legacy.data),sources=[...new Set([...next.gallery.map((g)=>g.src),...next.services.map((s)=>s.cover)].filter((src)=>src.startsWith('data:')))];
    const uploaded=new Map<string,Photo>();
    for(const [i,dataUrl] of sources.entries()){setProgress('Importando foto '+(i+1)+' / '+sources.length);const binary=await fetch(dataUrl), blob=await binary.blob();const file=new File([blob],'importada.'+(blob.type.split('/')[1]||'jpg'),{type:blob.type});uploaded.set(dataUrl,await uploadImage(file,DEFAULT.settings.img,'importada',file.name));}
    next.gallery=next.gallery.map((photo)=>uploaded.has(photo.src)?{...photo,...uploaded.get(photo.src),alt:photo.alt,album:photo.album,hidden:photo.hidden,featured:photo.featured,focus:photo.focus}:photo);
    next.services.forEach((service)=>{service.cover=uploaded.get(service.cover)?.src||service.cover;});
    await importData(next);
    if(Array.isArray(legacy.bookings)&&legacy.bookings.length)await api.post('/admin/bookings/import',legacy.bookings);
    notify('Importado al borrador: revisa y publica.');
    if(confirm('Importación terminada. ¿Borrar las copias antiguas de este navegador?'))clearBrowserImport();
    await load();
  });}
  return <Panel title="Respaldo y almacenamiento">
    <p className="muted">{storage?`${storage.files} archivos · ${kb(storage.uploadsBytes)} en fotos · ${kb(storage.dbBytes)} en MySQL · ${storage.versions} versiones`:'Cargando almacenamiento…'}</p>
    <div className="actions">
      <button className="admin-btn" disabled={!!progress} onClick={()=>void run(async()=>{const result=await api.get('/admin/export');download('evolushon-datos-'+isoDate()+'.json',JSON.stringify(result,null,2),'application/json');})}>Exportar JSON</button>
      <label className="admin-btn file-btn">Importar JSON<input type="file" disabled={!!progress} accept="application/json,.json" onChange={(e)=>{void importJson(e.target.files?.[0]);e.target.value='';}}/></label>
      <button className="admin-btn" disabled={!!progress} onClick={()=>void importBrowser()}>Importar desde este navegador</button>
      <button className="admin-btn danger" disabled={!!progress} onClick={()=>{if(confirm('¿Reemplazar el borrador por los datos originales?'))void run(()=>importData(clone(DEFAULT)));}}>Restaurar originales</button>
      <button className="admin-btn" onClick={()=>void run(async()=>{const result=await api.get<{items:Candidate[]}>('/admin/photos/purge');setCandidates(result.items);})}>Revisar fotos para purgar</button>
    </div>
    {progress&&<p role="status">{progress}</p>}
    <p className="muted">Exporta antes de restaurar. Las imágenes se respaldan aparte; publicar hace los cambios visibles para todos los visitantes.</p>
    {candidates.map((photo)=><div className="admin-row" key={photo.id}><span>{photo.id} · {photo.referenced?'En uso por una versión':'Sin referencias'}{photo.deletedAt?' · Eliminada':' · Sin usar'}</span><button className="admin-btn danger" disabled={photo.referenced} onClick={()=>{if(confirm('¿Borrar permanentemente los archivos de esta foto?'))void run(async()=>{await api.post('/admin/photos/purge',{ids:[photo.id]});setCandidates((all)=>all.filter((p)=>p.id!==photo.id));await load();});}}>Purgar</button></div>)}
  </Panel>;
}
