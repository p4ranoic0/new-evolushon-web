import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
}

export default function SEO({
  title = 'Evolushon Surf Experience',
  description = 'Clases de surf profesionales en Lima, Perú. Surf, surfskate y surf trips para todos los niveles. ¡Vive la experiencia del mar!',
  keywords = 'surf lima, clases de surf, surfskate, surf trips, escuela de surf peru, surf lessons',
  image = '/og-image.jpg',
  type = 'website'
}: SEOProps) {
  const location = useLocation();
  const url = `https://evolushonsurfexperience.com${location.pathname}`;
  const fullTitle = title === 'Evolushon Surf Experience' ? title : `${title} | Evolushon Surf Experience`;

  useEffect(() => {
    // Actualizar título
    document.title = fullTitle;

    // Actualizar meta tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', url);
    updateMetaTag('property', 'og:image', `https://evolushonsurfexperience.com${image}`);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', `https://evolushonsurfexperience.com${image}`);

    // Actualizar canonical
    updateCanonical(url);
  }, [fullTitle, description, keywords, image, url, type]);

  return null;
}

function updateMetaTag(attribute: string, key: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}
