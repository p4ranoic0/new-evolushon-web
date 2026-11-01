import { Router } from 'express';
import { z } from 'zod';
import { compare, hash } from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import type { Pool } from 'mysql2/promise';
import { rows, exec, transaction } from '../db/pool.js';
import { sessions, publicUser, csrf } from '../auth/session.js';
import { fail } from '../errors.js';
const credentials = z.object({user:z.string().trim().min(1).max(160),pass:z.string().min(1).max(200)});
const dummyHash = await hash('constant-time-comparison-only',12);
export function authRoutes(db:Pool) {
  const r=Router(), s=sessions(db);
  r.use(csrf);
  r.post('/login',rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-7',legacyHeaders:false,handler:(_req,res)=>res.status(429).json({error:{code:'RATE_LIMITED',message:'Demasiados intentos'}})}),async(req,res)=>{
    const {user,pass}=credentials.parse(req.body);
    const username=user.toLowerCase();
    const [candidate]=await rows(db,'SELECT * FROM users WHERE username=? OR email=? LIMIT 1',[username,username]);
    const valid=await compare(pass,candidate?.password_hash || dummyHash);
    if(candidate?.locked_until && new Date(candidate.locked_until.replace(' ','T')+'Z').getTime()>Date.now()) fail(423,'LOCKED','Espera antes de volver a intentarlo');
    if(!candidate || !candidate.active || !valid) {
      if(candidate) await transaction(db,async c=>{
        const [u]=await rows(c,'SELECT failed_attempts FROM users WHERE id=? FOR UPDATE',[candidate.id]);
        const attempts=Number(u.failed_attempts)+1;
        const seconds=Math.min(60,2**Math.min(attempts-1,6));
        await exec(c,'UPDATE users SET failed_attempts=?,locked_until=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL ? SECOND) WHERE id=?',[attempts,seconds,candidate.id]);
      });
      fail(401,'UNAUTHENTICATED','Usuario o contraseña incorrectos');
    }
    await exec(db,'UPDATE users SET failed_attempts=0,locked_until=NULL,last_login_at=UTC_TIMESTAMP(3) WHERE id=?',[candidate.id]);
    await s.create(req,res,candidate.id);
    res.json({id:candidate.id,name:candidate.name,user:candidate.username,role:candidate.role});
  });
  r.get('/me',s.guard,(req,res)=>res.json(publicUser(req.auth!)));
  r.post('/logout',s.guard,async(req,res)=>{await s.logout(req,res);res.sendStatus(204);});
  r.post('/password',s.guard,async(req,res)=>{
    const {current,next}=z.object({current:z.string().max(200),next:z.string().min(10).max(200)}).parse(req.body);
    const [u]=await rows(db,'SELECT password_hash FROM users WHERE id=?',[req.auth!.id]);
    if(!await compare(current,u.password_hash)) fail(400,'VALIDATION','Contraseña actual incorrecta');
    await transaction(db,async c=>{
      await exec(c,'UPDATE users SET password_hash=? WHERE id=?',[await hash(next,12),req.auth!.id]);
      await exec(c,'DELETE FROM sessions WHERE user_id=? AND token_hash<>?',[req.auth!.id,req.auth!.tokenHash]);
    });
    res.sendStatus(204);
  });
  return r;
}
