
import { projectsData } from '@/data/projectsData';

export const generateSitemap = () => {
  const baseUrl = 'https://propertylegal.vn';
  
  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/projects', changefreq: 'daily', priority: '0.9' },
    { url: '/search', changefreq: 'weekly', priority: '0.8' },
    { url: '/calculator', changefreq: 'monthly', priority: '0.7' },
    { url: '/market-overview', changefreq: 'weekly', priority: '0.8' },
    { url: '/legal-matrix', changefreq: 'monthly', priority: '0.6' },
  ];

  // Dynamic project pages
  const projectPages = projectsData.map(project => ({
    url: `/projects/${project.id}`,
    changefreq: 'weekly',
    priority: '0.8'
  }));

  const allPages = [...staticPages, ...projectPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = () => {
  const baseUrl = 'https://propertylegal.vn';
  
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin pages
Disallow: /admin

# Allow important pages for SEO
Allow: /projects/
Allow: /search
Allow: /calculator
Allow: /market-overview`;
};
