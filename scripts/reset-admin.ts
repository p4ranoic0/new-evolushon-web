import { hash } from 'bcryptjs';
import { pool,exec,rows,transaction } from '../server/db/pool.js';
import { env } from '../server/env.js';
try {
  if(!env.ADMIN_INITIAL_EMAIL||!env.ADMIN_INITIAL_PASSWORD)throw new Error('Configura ADMIN_INITIAL_EMAIL y ADMIN_INITIAL_PASSWORD en el entorno');
  await transaction(pool,async c=>{
    const [user]=await rows(c,"SELECT id FROM users WHERE username='admin' FOR UPDATE");
    if(!user)throw new Error('No existe admin; ejecutar seed primero');
    await exec(c,"UPDATE users SET email=?,password_hash=?,role='admin',active=1,failed_attempts=0,locked_until=NULL WHERE id=?",[env.ADMIN_INITIAL_EMAIL,await hash(env.ADMIN_INITIAL_PASSWORD,12),user.id]);
    await exec(c,'DELETE FROM sessions WHERE user_id=?',[user.id]);
  });
  console.log('Administrador recuperado; sesiones revocadas. Retira las variables iniciales del entorno tras cambiar la contraseña.');
} finally { await pool.end(); }
