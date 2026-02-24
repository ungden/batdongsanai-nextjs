"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article';
  schema?: object;
  noIndex?: boolean;
}

/**
 * Client-side SEO head manager for Next.js App Router.
 * Updates document.title and meta tags via DOM manipulation.
 * For static metadata, prefer Next.js Metadata API in page.tsx/layout.tsx.
 */
const SEOHead = ({
  title = "Realprofit.vn - Đầu tư BĐS thông minh",
  description = "Realprofit.vn - Nền tảng kiểm tra pháp lý, phân tích thị trường và tính toán đầu tư bất động sản hàng đầu Việt Nam.",
  keywords = "bất động sản, pháp lý, kiểm tra, đầu tư, chung cư, dự án, realprofit",
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  type = "website",
  schema,
  noIndex = false
}: SEOProps) => {
  const pathname = usePathname();

  useEffect(() => {
    // Set document title
    document.title = title;

    const currentUrl = `${window.location.origin}${pathname}`;

    // Helper to set or create a meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or create a link tag
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.href = href;
    };

    // Basic Meta Tags
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setLink('canonical', currentUrl);

    // Robots
    if (noIndex) {
      setMeta('name', 'robots', 'noindex,nofollow');
    }

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:site_name', 'Realprofit.vn');
    setMeta('property', 'og:locale', 'vi_VN');

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // Schema.org JSON-LD
    const schemaId = 'seo-schema-jsonld';
    let schemaScript = document.getElementById(schemaId);
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = schemaId;
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, keywords, image, type, schema, noIndex, pathname]);

  return null; // This component only manages <head> via side effects
};

export default SEOHead;
