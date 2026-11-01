import type { Lang, Page, Service, SiteData } from '../store';
import { useHead } from './useHead';
export function Seo(props: {data: SiteData; lang: Lang; page: Page; service?: Service}) {
  useHead(props);
  return null;
}
