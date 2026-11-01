import { Router } from 'express';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import type { Pool } from 'mysql2/promise';
import { rows,exec,transaction,iso } from '../db/pool.js';
import { roles } from '../auth/session.js';
import { fail } from '../errors.js';
const schema=z.object({username:z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{2,40}$/),name:z.string().trim().min(1).max(80),role:z.enum(['admin','editor','fotografo']),password:z.string().min(10).max(200)});
export function userRoutes(db:Pool){
  const r=Router();r.use(roles('admin'));
  r.get('/',async(_req,res)=>{const all=await rows(db,'SELECT id,username,name,role,active,last_login_at FROM users ORDER BY id');res.json(all.map(u=>({id:u.id,username:u.username,user:u.username,name:u.name,role:u.role,active:!!u.active,lastLoginAt:iso(u.last_login_at)})));});
  r.post('/',async(req,res)=>{
    const u=schema.parse(req.body);
    const result=await exec(db,'INSERT INTO users(username,name,role,password_hash) VALUES (?,?,?,?)',[u.username,u.name,u.role,await hash(u.password,12)]);
    res.status(201).json({id:result.insertId,username:u.username,user:u.username,name:u.name,role:u.role,active:true});
  });
  async function mutate(id:number,input:z.infer<ReturnType<typeof schema.partial>> & {active?:boolean},remove:boolean,self:number){
    await transaction(db,async c=>{
      // Lock all users consistently so two administrators cannot remove each other concurrently.
      const users=await rows(c,'SELECT id,role,active FROM users ORDER BY id FOR UPDATE');
      const user=users.find(u=>u.id===id);if(!user)fail(404,'NOT_FOUND','Usuario no encontrado');
      if(id===self&&(remove||input.active===false||(input.role&&input.role!=='admin')))fail(400,'VALIDATION','No puedes eliminarte, desactivarte o rebajar tu propio rol');
      if(user.role==='admin'&&user.active&&(remove||input.active===false||(input.role&&input.role!=='admin'))&&users.filter(u=>u.role==='admin'&&u.active).length<=1)fail(400,'VALIDATION','Debe existir un administrador activo');
      if(remove){await exec(c,'DELETE FROM users WHERE id=?',[id]);return;}
      if(input.name!==undefined)await exec(c,'UPDATE users SET name=? WHERE id=?',[input.name,id]);
      if(input.role!==undefined)await exec(c,'UPDATE users SET role=? WHERE id=?',[input.role,id]);
      if(input.active!==undefined)await exec(c,'UPDATE users SET active=? WHERE id=?',[input.active,id]);
      if(input.password)await exec(c,'UPDATE users SET password_hash=?,failed_attempts=0,locked_until=NULL WHERE id=?',[await hash(input.password,12),id]);
      if(input.password||input.active===false||(input.role&&input.role!==user.role))await exec(c,'DELETE FROM sessions WHERE user_id=?',[id]);
    });
  }
  r.patch('/:id',async(req,res)=>{
    const id=z.coerce.number().int().positive().parse(req.params.id);
    const input=schema.omit({username:true}).partial().extend({active:z.boolean().optional()}).strict().parse(req.body);
    await mutate(id,input,false,req.auth!.id);res.json({ok:true});
  });
  r.delete('/:id',async(req,res)=>{await mutate(z.coerce.number().int().positive().parse(req.params.id),{},true,req.auth!.id);res.sendStatus(204);});
  return r;
}
