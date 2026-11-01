import { createHash, randomBytes } from 'node:crypto';
import { parseCookie, stringifySetCookie } from 'cookie';
import type { Request, Response, NextFunction } from 'express';
import type { Pool } from 'mysql2/promise';
import { env } from '../env.js';
import { exec, rows } from '../db/pool.js';
import { fail } from '../errors.js';
import type { Role } from '../services/content.js';
export type AuthUser = { id:number; name:string; user:string; role:Role; tokenHash:string };
declare module 'express-serve-static-core' { interface Request { auth?: AuthUser; requestId: string } }
export const digest = (token: string) => createHash('sha256').update(token).digest('hex');
export const tokenFrom = (req: Request) => parseCookie(req.headers.cookie || '').evo_sid || '';
const day = 86400000;
const cookie = (res: Response, token: string, age = 7 * day) => res.setHeader('Set-Cookie',stringifySetCookie({name:'evo_sid',value:token,httpOnly:true,secure:env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:Math.max(0,Math.floor(age/1000))}));
export function sessions(db: Pool) {
  async function create(req: Request, res: Response, id:number) {
    const token = randomBytes(32).toString('base64url');
    await exec(db,'INSERT INTO sessions(token_hash,user_id,last_seen_at,expires_at,ip,user_agent) VALUES (?,?,UTC_TIMESTAMP(3),DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 7 DAY),?,?)',[digest(token),id,req.ip || null,(req.headers['user-agent'] || '').slice(0,255)]);
    cookie(res,token);
  }
  async function guard(req: Request, res:Response, next:NextFunction) {
    const token = tokenFrom(req);
    if (!token) fail(401,'UNAUTHENTICATED','Inicia sesión');
    const [r] = await rows(db,'SELECT s.*,u.name,u.username,u.role,u.active FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP(3) AND s.created_at>DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 30 DAY) AND u.active=1',[digest(token)]);
    if (!r) fail(401,'UNAUTHENTICATED','Sesión vencida');
    req.auth={id:r.user_id,name:r.name,user:r.username,role:r.role,tokenHash:r.token_hash};
    const created = new Date(r.created_at.replace(' ','T')+'Z').getTime();
    if (Date.now()-new Date(r.last_seen_at.replace(' ','T')+'Z').getTime()>=3600000) {
      const expires=new Date(Math.min(Date.now()+7*day,created+30*day));
      await exec(db,'UPDATE sessions SET last_seen_at=UTC_TIMESTAMP(3),expires_at=? WHERE token_hash=?',[expires,r.token_hash]);
      cookie(res,token,expires.getTime()-Date.now());
    }
    next();
  }
  async function logout(req:Request,res:Response) { await exec(db,'DELETE FROM sessions WHERE token_hash=?',[digest(tokenFrom(req))]);cookie(res,'',0); }
  return {create,guard,logout};
}
export const roles = (...allowed:Role[]) => (req:Request,_res:Response,next:NextFunction) => {
  if (!req.auth || !allowed.includes(req.auth.role)) fail(403,'FORBIDDEN','No tienes permiso para esta acción');
  next();
};
export function csrf(req:Request,_res:Response,next:NextFunction) {
  if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();
  if(req.headers['x-requested-with']!=='evolushon' || req.headers.origin!==env.PUBLIC_URL) fail(403,'FORBIDDEN','Origen o cabecera de seguridad no válidos');
  next();
}
export const publicUser = (u: AuthUser) => ({id:u.id,name:u.name,user:u.user,role:u.role});
