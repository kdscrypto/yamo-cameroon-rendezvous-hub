
interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (baseUrl: string = 'https://yamo.lovable.app', dynamicAds: Array<{id: string, updated_at: string}> = []): string => {
  const today = new Date().toISOString().split('T')[0];
  
  const urls: SitemapUrl[] = [
    // Pages principales
    {
      url: `${baseUrl}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/browse`,
      lastmod: today,
      changefreq: 'hourly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/login`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/register`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/create-ad`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/parental-control`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.4
    },
    
    // Pages de catégories
    {
      url: `${baseUrl}/rencontres`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/massages`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/produits`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/evenements`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/events`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.7
    },
    
    // Pages légales
    {
      url: `${baseUrl}/terms`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/privacy`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/contact`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.5
    }
  ];

  // Add dynamic ad pages
  dynamicAds.forEach(ad => {
    urls.push({
      url: `${baseUrl}/ad/${ad.id}`,
      lastmod: ad.updated_at ? new Date(ad.updated_at).toISOString().split('T')[0] : today,
      changefreq: 'weekly',
      priority: 0.6
    });
  });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemapXml;
};

export const generateRobotsTxt = (baseUrl: string = 'https://yamo.lovable.app'): string => {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Block certain paths if needed
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/messages
Disallow: /profile/

# Allow important pages for SEO
Allow: /
Allow: /browse
Allow: /rencontres
Allow: /massages
Allow: /produits
Allow: /evenements
Allow: /login
Allow: /register
Allow: /terms
Allow: /privacy
Allow: /contact
`;
};
