import type { Pool } from 'mysql2/promise';
import type { SiteData, User } from '../../shared/types.js';
import { clone, migrate } from '../../shared/index.js';
import { diff } from '../../shared/diff.js';
import { siteSchema } from '../../shared/schemas.js';
import { exec, rows, transaction, json, iso } from '../db/pool.js';
import { fail } from '../errors.js';
export type Role = User['role'];
export function filterForRole(current: SiteData, incoming: SiteData, role: Role): SiteData {
  if (role === 'admin') return incoming;
  const next = clone(current);
  next.gallery = incoming.gallery; next.albums = incoming.albums;
  if (role === 'editor') {
    next.services = incoming.services; next.reviews = incoming.reviews; next.home = incoming.home;
    next.settings.booking = incoming.settings.booking;
  }
  return next;
}
export function validateSite(input: unknown): SiteData {
  return siteSchema.parse(migrate(input)) as SiteData;
}
const snapshot = (r: Record<string, unknown>) => ({
  id: r.id, version: Number(r.version), data: migrate(json<SiteData>(r.data as string)),
  updatedAt: iso(r.updated_at as string), publishedAt: iso(r.published_at as string),
});
export function contentService(db: Pool) {
  let cache: Awaited<ReturnType<typeof published>> | undefined;
  async function published() {
    const [r] = await rows(db, "SELECT * FROM site_versions WHERE status='published'");
    if (!r) fail(503,'MAINTENANCE','Contenido aún no disponible');
    return snapshot(r);
  }
  async function getPublished() { return cache ||= await published(); }
  async function getContent() {
    const all = await rows(db, "SELECT * FROM site_versions WHERE status IN ('draft','published')");
    const history = await rows(db, "SELECT v.id,v.published_at,v.summary,u.name FROM site_versions v LEFT JOIN users u ON u.id=v.created_by WHERE v.status='archived' ORDER BY v.id DESC");
    return { draft: snapshot(all.find(v => v.status === 'draft')!), published: snapshot(all.find(v => v.status === 'published')!),
      history: history.map(r => ({ id:r.id, at:iso(r.published_at), by:r.name || 'Sistema', summary:(r.summary?json(r.summary):null) ?? {services:0,gallery:0,other:0} })) };
  }
  async function mutate(action: 'draft'|'publish'|'discard'|'restore'|'import', baseVersion: number, role: Role, userId: number, incoming?: unknown, restoreId?: number) {
    if (role === 'fotografo' && action !== 'draft') fail(403,'FORBIDDEN','El fotógrafo solo puede editar galería y álbumes');
    const result = await transaction(db, async c => {
      const [draft] = await rows(c, "SELECT * FROM site_versions WHERE status='draft' FOR UPDATE");
      if (Number(draft.version) !== baseVersion) fail(409,'DRAFT_STALE','Otro usuario modificó el borrador',{draft:snapshot(draft)});
      const current = json<SiteData>(draft.data);
      let next = current;
      if (action === 'draft' || action === 'import') {
        // Filter before validation: unauthorized fields never affect the current document.
        next = validateSite(filterForRole(current, migrate(incoming), role));
      } else if (action === 'discard' || action === 'restore') {
        const [source] = action === 'discard'
          ? await rows(c,"SELECT * FROM site_versions WHERE status='published'")
          : await rows(c,"SELECT * FROM site_versions WHERE status='archived' AND id=?",[restoreId]);
        if (!source) fail(404,'NOT_FOUND','Versión no encontrada');
        const data = json<SiteData>(source.data);
        if (action === 'restore') data.gallery = current.gallery;
        next = validateSite(filterForRole(current,data,role));
      }
      const updated = await exec(c,'UPDATE site_versions SET data=?,version=version+1,created_by=?,updated_at=UTC_TIMESTAMP(3) WHERE id=? AND version=?', [JSON.stringify(next),userId,draft.id,baseVersion]);
      if (!updated.affectedRows) fail(409,'DRAFT_STALE','Borrador modificado');
      let summary;
      if (action === 'publish') {
        const [live] = await rows(c,"SELECT * FROM site_versions WHERE status='published' FOR UPDATE");
        summary = diff(next,json<SiteData>(live.data));
        await exec(c,"UPDATE site_versions SET status='archived' WHERE id=?",[live.id]);
        await exec(c,"INSERT INTO site_versions(status,version,data,summary,created_by,published_at) VALUES ('published',?,?,?,?,UTC_TIMESTAMP(3))",[baseVersion+1,JSON.stringify(next),JSON.stringify(summary),userId]);
        const old = await rows(c,"SELECT id FROM site_versions WHERE status='archived' ORDER BY id DESC LIMIT 100000 OFFSET 20");
        for (const row of old) await exec(c,'DELETE FROM site_versions WHERE id=?',[row.id]);
      }
      const [saved] = await rows(c,'SELECT * FROM site_versions WHERE id=?',[draft.id]);
      return {...snapshot(saved), summary};
    });
    if (action === 'publish') cache = undefined;
    return result;
  }
  return { getPublished, getContent, mutate, invalidate: () => {cache=undefined;} };
}
export type ContentService = ReturnType<typeof contentService>;
