import { createHash } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import type { Photo } from '../../shared/types.js';
import { blank } from '../../shared/index.js';
import { env } from '../env.js';
import { exec, rows, json, transaction } from '../db/pool.js';
import { fail } from '../errors.js';
type Variant = {w:number;path:string;bytes:number;role:'full'|'thumb'};
function fromRow(r:RowDataPacket):Photo {
  const variants=json<Variant[]>(r.variants),full=variants.find(v=>v.role==='full')!,thumb=variants.find(v=>v.role==='thumb')!;
  return {id:r.id,src:full.path,full:full.path,thumb:thumb.path,width:r.width,height:r.height,bytes:full.bytes,originalBytes:r.original_bytes,variants:[{w:thumb.w,webp:thumb.path},{w:full.w,webp:full.path}],alt:blank(),focus:'50% 50%',featured:false,hidden:false,album:''};
}
// {prefijo}-{slug}-{AAAAMMDD}-{6 base36}[-thumb].webp, generado por src/admin/image-pipeline.ts
const pattern=/^(?=.{1,100}$)[a-z0-9]+(?:-[a-z0-9]+)*-\d{8}-[a-z0-9]{6}(?:-thumb)?\.webp$/;
// Nombres de la primera versión (procesado con sharp en el servidor): solo para leer y purgar.
const legacy=/^p-[a-f0-9]{12}-\d{1,4}\.webp$/;
const diskPath=(year:string,month:string,name:string)=>{
  if(!/^\d{4}$/.test(year)||!/^(0[1-9]|1[0-2])$/.test(month)||!pattern.test(name)&&!legacy.test(name))fail(400,'VALIDATION','Ruta/nombre de foto inválido');
  return resolve(env.UPLOADS_DIR,year,month,name);
};
export function webpDimensions(buffer:Buffer){
  if(buffer.length<25||buffer.toString('ascii',0,4)!=='RIFF'||buffer.toString('ascii',8,12)!=='WEBP'||buffer.readUInt32LE(4)+8>buffer.length)fail(415,'UNSUPPORTED_MEDIA','Firma WebP inválida');
  let offset=12;
  while(offset+8<=buffer.length){
    const kind=buffer.toString('ascii',offset,offset+4),length=buffer.readUInt32LE(offset+4),start=offset+8,end=start+length;
    if(end>buffer.length)fail(415,'UNSUPPORTED_MEDIA','Chunk WebP truncado');
    if(kind==='VP8X'&&length>=10)return {width:1+buffer.readUIntLE(start+4,3),height:1+buffer.readUIntLE(start+7,3)};
    if(kind==='VP8L'&&length>=5&&buffer[start]===0x2f){const b1=buffer[start+1]!,b2=buffer[start+2]!,b3=buffer[start+3]!,b4=buffer[start+4]!;return {width:1+b1+((b2&0x3f)<<8),height:1+(b2>>6)+(b3<<2)+((b4&0x0f)<<10)};}
    if(kind==='VP8 '&&length>=10&&buffer[start+3]===0x9d&&buffer[start+4]===0x01&&buffer[start+5]===0x2a)return {width:buffer.readUInt16LE(start+6)&0x3fff,height:buffer.readUInt16LE(start+8)&0x3fff};
    offset=end+(length&1);
  }
  fail(415,'UNSUPPORTED_MEDIA','No se encontró cabecera VP8 válida');
}
export function imageService(db:Pool) {
  async function upload(full:Buffer,thumb:Buffer,fullName:string,thumbName:string,userId:number,originalBytes?:number):Promise<Photo> {
    if(full.length>5*1024*1024||thumb.length>5*1024*1024)fail(413,'TOO_LARGE','Máximo 5 MB por variante');
    if(fullName!==thumbName.replace(/-thumb\.webp$/,'.webp')||!pattern.test(fullName)||fullName.endsWith('-thumb.webp')||!thumbName.endsWith('-thumb.webp'))fail(400,'VALIDATION','Nombres de variantes no coinciden');
    const dimensions=webpDimensions(full),thumbDimensions=webpDimensions(thumb);
    const sha=createHash('sha256').update(full).digest('hex');
    const [existing]=await rows(db,'SELECT * FROM photos WHERE sha256=? AND deleted_at IS NULL LIMIT 1',[sha]);
    if(existing)return fromRow(existing);
    // Una foto borrada (lógicamente) que se vuelve a subir se restaura en vez de duplicarse.
    const [deleted]=await rows(db,'SELECT * FROM photos WHERE sha256=? AND deleted_at IS NOT NULL LIMIT 1',[sha]);
    if(deleted){await exec(db,'UPDATE photos SET deleted_at=NULL WHERE id=?',[deleted.id]);return fromRow({...deleted,deleted_at:null});}
    const id='p-'+sha.slice(0,12),now=new Date(),year=String(now.getUTCFullYear()),month=String(now.getUTCMonth()+1).padStart(2,'0');
    const fullUrl=`/uploads/${year}/${month}/${fullName}`,thumbUrl=`/uploads/${year}/${month}/${thumbName}`;
    const variants:Variant[]=[{w:dimensions.width,path:fullUrl,bytes:full.length,role:'full'},{w:thumbDimensions.width,path:thumbUrl,bytes:thumb.length,role:'thumb'}];
    const fullPath=diskPath(year,month,fullName),thumbPath=diskPath(year,month,thumbName);
    await mkdir(dirname(fullPath),{recursive:true});
    let fullWritten=false,thumbWritten=false;
    try {
      await writeFile(fullPath,full,{flag:'wx'});fullWritten=true;
      await writeFile(thumbPath,thumb,{flag:'wx'});thumbWritten=true;
      await exec(db,'INSERT INTO photos(id,sha256,mime,original_name,original_bytes,width,height,variants,bytes,uploaded_by) VALUES (?,?,?,?,?,?,?,?,?,?)',[id,sha,'image/webp',fullName,originalBytes&&originalBytes>0?Math.round(originalBytes):full.length,dimensions.width,dimensions.height,JSON.stringify(variants),full.length+thumb.length,userId]);
    }catch(error){if(fullWritten)await unlink(fullPath).catch(()=>{});if(thumbWritten)await unlink(thumbPath).catch(()=>{});throw error;}
    const [saved]=await rows(db,'SELECT * FROM photos WHERE id=?',[id]);return fromRow(saved);
  }
  async function remove(id:string){const r=await exec(db,'UPDATE photos SET deleted_at=UTC_TIMESTAMP(3) WHERE id=?',[id]);if(!r.affectedRows)fail(404,'NOT_FOUND','Foto no encontrada');}
  async function candidates(){
    const versions=await rows(db,'SELECT data FROM site_versions');
    const documents=versions.map(v=>JSON.stringify(json(v.data)));
    const photos=await rows(db,'SELECT * FROM photos');
    return photos.map(r=>{
      const variants=json<Variant[]>(r.variants);
      const referenced=documents.some(doc=>doc.includes(JSON.stringify(r.id))||variants.some(v=>doc.includes(v.path)));
      return {id:r.id,src:variants.find(v=>v.role==='full')!.path,referenced,deletedAt:r.deleted_at,bytes:r.bytes};
    });
  }
  async function purge(ids:string[]) {
    // Same process queue as uploads; content rows locked while validating references.
    return transaction(db,async c=>{
      const versions=await rows(c,'SELECT data FROM site_versions ORDER BY id FOR UPDATE');
      const documents=versions.map(v=>JSON.stringify(json(v.data)));
      const purged:string[]=[];
      for(const id of ids){
        const [r]=await rows(c,'SELECT * FROM photos WHERE id=? FOR UPDATE',[id]);if(!r)continue;
        const variants=json<Variant[]>(r.variants);
        if(documents.some(doc=>doc.includes(JSON.stringify(id))||variants.some(v=>doc.includes(v.path))))fail(409,'PHOTO_REFERENCED','La foto está referenciada en una versión',{id});
        for(const v of variants){const parts=v.path.split('/');await unlink(diskPath(parts[2]!,parts[3]!,parts[4]!)).catch(e=>{if(e.code!=='ENOENT')throw e;});}
        await exec(c,'DELETE FROM photos WHERE id=?',[id]);purged.push(id);
      }
      return {purged};
    });
  }
  async function storage(){
    const [photos]=await rows(db,'SELECT COALESCE(SUM(bytes),0) AS bytes,COUNT(*) AS files FROM photos');
    const [versions]=await rows(db,'SELECT COUNT(*) AS n FROM site_versions');
    const [size]=await rows(db,'SELECT COALESCE(SUM(data_length+index_length),0) AS bytes FROM information_schema.tables WHERE table_schema=DATABASE()');
    return {uploadsBytes:Number(photos.bytes),files:Number(photos.files),dbBytes:Number(size.bytes),versions:Number(versions.n)};
  }
  return {upload,remove,candidates,purge,storage};
}
