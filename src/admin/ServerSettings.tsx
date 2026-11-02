import { useCallback, useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../store/api';
import { browserImport, clearBrowserImport, clone, DEFAULT, download, isoDate, migrate } from '../store';
import type { Photo, User } from '../store';
import { uploadImage } from './image-pipeline';
import { useContentActions } from '../store/admin-remote';
import { Check, Field, Panel } from './shared';
import { kb } from './utils';
type Role=User['role'];
type ServerUser={id:number;username:string;email:string|null;name:string;role:Role;active:boolean;lastLoginAt:string|null};
type Me={id:number;name:string;user:string;role:Role};
type Draft={name:string;email:string;role:Role;active:boolean;password:string};
type NewUser={name:string;username:string;email:string;role:Role;password:string};

const ROLES:{id:Role;label:string;can:string}[]=[
  {id:'admin',label:'Administrador',can:'Todo: contenido, reservas, galería, equipo y ajustes.'},
  {id:'editor',label:'Editor',can:'Textos, servicios y reservas. Puede publicar cambios.'},
  {id:'fotografo',label:'Fotógrafo',can:'Solo la galería: subir, ordenar y ocultar fotos.'},
];
const roleLabel=(role:Role)=>ROLES.find((r)=>r.id===role)?.label||role;
const emptyNew=():NewUser=>({name:'',username:'',email:'',role:'editor',password:''});
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map((w)=>w[0]!.toUpperCase()).join('')||'?';
/** «Lucho Silva» → «lucho.silva»: sugerencia de usuario para entrar. */
const suggestUsername=(name:string)=>name.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'.').replace(/^\.+|\.+$/g,'').slice(0,40);
function generatePassword(){
  const chars='abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint32Array(14)),(n)=>chars[n%chars.length]).join('');
}
function lastSeen(iso:string|null){
  if(!iso)return 'Nunca ha entrado';
  const days=Math.floor((Date.now()-new Date(iso).getTime())/86400000);
  return 'Último acceso: '+(days<1?'hoy':days===1?'ayer':`hace ${days} días`);
}
function RolePicker({value,onChange,disabled}:{value:Role;onChange:(role:Role)=>void;disabled?:boolean}){
  const group=useId();
  return <fieldset className="role-picker" disabled={disabled}>
    <legend>Rol</legend>
    {ROLES.map((r)=><label key={r.id} className={value===r.id?'selected':''}>
      <input type="radio" name={group} checked={value===r.id} onChange={()=>onChange(r.id)}/>
      <b>{r.label}</b><small>{r.can}</small>
    </label>)}
  </fieldset>;
}
function PasswordField({label,value,onChange,hint,required}:{label:string;value:string;onChange:(v:string)=>void;hint:string;required?:boolean}){
  const [show,setShow]=useState(false);
  return <div className="field">
    <span>{label}</span>
    <div className="password-row">
      <input type={show?'text':'password'} autoComplete="new-password" minLength={10} required={required} value={value} onChange={(e)=>onChange(e.target.value)}/>
      <button type="button" className="admin-btn" onClick={()=>setShow(!show)}>{show?'Ocultar':'Ver'}</button>
      <button type="button" className="admin-btn" onClick={()=>{onChange(generatePassword());setShow(true);}}>Generar</button>
    </div>
    <small className="hint">{hint}</small>
  </div>;
}

export function UsersManager({notify}:{notify:(message:string)=>void}){
  const [users,setUsers]=useState<ServerUser[]>([]),[me,setMe]=useState<Me|null>(null);
  const [editing,setEditing]=useState<number|null>(null),[draft,setDraft]=useState<Draft|null>(null);
  const [creating,setCreating]=useState(false),[adding,setAdding]=useState(emptyNew),[touchedUsername,setTouchedUsername]=useState(false);
  const [created,setCreated]=useState<{username:string;email:string|null;password:string}|null>(null);
  const [current,setCurrent]=useState(''),[next,setNext]=useState('');
  const load=useCallback(async()=>{try{const [list,self]=await Promise.all([api.get<ServerUser[]>('/admin/users'),api.get<Me>('/auth/me')]);setUsers(list);setMe(self);}catch(error){notify((error as Error).message);}},[notify]);
  useEffect(()=>{const initial=setTimeout(()=>void load(),0);return()=>clearTimeout(initial);},[load]);
  const fail=(error:unknown)=>notify((error as Error).message);

  function startEdit(user:ServerUser){setEditing(user.id);setDraft({name:user.name,email:user.email||'',role:user.role,active:user.active,password:''});}
  async function saveEdit(user:ServerUser){
    if(!draft)return;
    const isMe=user.id===me?.id;
    try{
      await api.patch('/admin/users/'+user.id,{name:draft.name,email:draft.email,...(isMe?{}:{role:draft.role,active:draft.active}),...(draft.password?{password:draft.password}:{})});
      setEditing(null);setDraft(null);await load();
      notify(draft.password?'Usuario actualizado. Su contraseña cambió y se cerraron sus sesiones abiertas.':'Usuario actualizado.');
    }catch(error){fail(error);}
  }
  async function remove(user:ServerUser){
    if(!confirm(`¿Eliminar a ${user.name}? Ya no podrá entrar al panel.`))return;
    try{await api.del('/admin/users/'+user.id);setEditing(null);await load();notify('Usuario eliminado.');}catch(error){fail(error);}
  }
  async function create(e:FormEvent){
    e.preventDefault();
    try{
      await api.post('/admin/users',adding);
      setCreated({username:adding.username,email:adding.email||null,password:adding.password});
      setAdding(emptyNew());setTouchedUsername(false);setCreating(false);await load();
    }catch(error){fail(error);}
  }

  return <>
    <Panel title="Equipo">
      <div className="team-head">
        <p className="muted">{users.length} {users.length===1?'persona tiene':'personas tienen'} acceso al panel. Cada una entra con su usuario o su correo.</p>
        {!creating&&<button className="admin-btn primary" onClick={()=>{setCreating(true);setCreated(null);}}>Nuevo usuario</button>}
      </div>

      {created&&<div className="created-note" role="status">
        <b>Usuario creado.</b> Comparte estos datos por un canal privado (WhatsApp, en persona):
        <code>{location.origin}/admin · usuario: {created.username}{created.email?` (o ${created.email})`:''} · contraseña: {created.password}</code>
        <div className="actions">
          <button className="admin-btn" onClick={()=>void navigator.clipboard.writeText(`Panel Evolushon: ${location.origin}/admin\nUsuario: ${created.username}\nContraseña: ${created.password}\nCámbiala al entrar, en Equipo → Mi cuenta.`).then(()=>notify('Copiado.'))}>Copiar datos</button>
          <button className="admin-btn" onClick={()=>setCreated(null)}>Listo</button>
        </div>
      </div>}

      {creating&&<form className="new-user" onSubmit={(e)=>void create(e)}>
        <h3>Nuevo usuario</h3>
        <div className="form-grid">
          <Field label="Nombre completo" value={adding.name} required placeholder="Lucho Silva" onChange={(name)=>setAdding({...adding,name,username:touchedUsername?adding.username:suggestUsername(name)})}/>
          <div className="field">
            <span>Usuario para entrar</span>
            <input value={adding.username} required pattern="[a-z0-9._\-]{2,40}" placeholder="lucho.silva" onChange={(e)=>{setTouchedUsername(true);setAdding({...adding,username:e.target.value.toLowerCase()});}}/>
            <small className="hint">Minúsculas, números, punto o guion. Se sugiere a partir del nombre.</small>
          </div>
          <div className="field">
            <span>Correo (opcional)</span>
            <input type="email" value={adding.email} placeholder="lucho@correo.com" onChange={(e)=>setAdding({...adding,email:e.target.value})}/>
            <small className="hint">Si lo pones, también podrá entrar con su correo.</small>
          </div>
        </div>
        <RolePicker value={adding.role} onChange={(role)=>setAdding({...adding,role})}/>
        <PasswordField label="Contraseña inicial" required value={adding.password} onChange={(password)=>setAdding({...adding,password})} hint="Mínimo 10 caracteres. Usa «Generar» y compártela por un canal privado; podrá cambiarla al entrar."/>
        <div className="actions">
          <button className="admin-btn primary" type="submit">Crear usuario</button>
          <button className="admin-btn" type="button" onClick={()=>{setCreating(false);setAdding(emptyNew());setTouchedUsername(false);}}>Cancelar</button>
        </div>
      </form>}

      <ul className="team-list">
        {users.map((user)=>{
          const isMe=user.id===me?.id,open=editing===user.id&&draft;
          return <li key={user.id} className={user.active?'':'inactive'}>
            <div className="team-row">
              <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
              <div className="who">
                <b>{user.name}{isMe&&<span className="status green">Tú</span>}</b>
                <small>Entra con <code>{user.username}</code>{user.email&&<> o <code>{user.email}</code></>} · {lastSeen(user.lastLoginAt)}</small>
              </div>
              <span className="status">{roleLabel(user.role)}</span>
              {!user.active&&<span className="status">Desactivado</span>}
              {!open&&<button className="admin-btn" onClick={()=>startEdit(user)}>Editar</button>}
            </div>
            {open&&draft&&<div className="team-edit">
              <div className="form-grid">
                <Field label="Nombre" value={draft.name} onChange={(name)=>setDraft({...draft,name})}/>
                <Field label="Correo (opcional)" type="email" value={draft.email} onChange={(email)=>setDraft({...draft,email})}/>
              </div>
              <RolePicker value={draft.role} disabled={isMe} onChange={(role)=>setDraft({...draft,role})}/>
              {isMe?<p className="muted">No puedes cambiar tu propio rol ni desactivarte. Tu contraseña se cambia abajo, en «Mi cuenta».</p>
                :<>
                  <Check label="Puede entrar al panel (activo)" checked={draft.active} onChange={(active)=>setDraft({...draft,active})}/>
                  <PasswordField label="Restablecer contraseña (opcional)" value={draft.password} onChange={(password)=>setDraft({...draft,password})} hint="Déjalo vacío para no cambiarla. Si la cambias, se cierran sus sesiones abiertas."/>
                </>}
              <div className="actions">
                <button className="admin-btn primary" onClick={()=>void saveEdit(user)}>Guardar cambios</button>
                <button className="admin-btn" onClick={()=>{setEditing(null);setDraft(null);}}>Cancelar</button>
                {!isMe&&<button className="admin-btn danger" onClick={()=>void remove(user)}>Eliminar usuario</button>}
              </div>
            </div>}
          </li>;
        })}
      </ul>
    </Panel>

    <Panel title="Mi cuenta">
      {me&&<p className="muted">Entraste como <b>{me.name}</b> (<code>{me.user}</code>) · {roleLabel(me.role)}</p>}
      <form className="form-grid" onSubmit={(e)=>{e.preventDefault();void api.post('/auth/password',{current,next}).then(()=>{setCurrent('');setNext('');notify('Contraseña actualizada.');}).catch(fail);}}>
        <Field label="Contraseña actual" type="password" value={current} autoComplete="current-password" required onChange={setCurrent}/>
        <Field label="Nueva contraseña (mínimo 10 caracteres)" type="password" value={next} minLength={10} autoComplete="new-password" required onChange={setNext}/>
        <button type="submit" className="admin-btn primary">Cambiar mi contraseña</button>
      </form>
    </Panel>
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
