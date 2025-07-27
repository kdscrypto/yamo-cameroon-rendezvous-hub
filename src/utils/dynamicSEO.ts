import { supabase } from '@/integrations/supabase/client';
import { generateSitemap, generateRobotsTxt } from './sitemapGenerator';

interface AdForSitemap {
  id: string;
  updated_at: string;
  category: string;
  status: string;
  moderation_status: string;
}

export const generateDynamicSitemap = async (baseUrl: string = 'https://yamo.lovable.app'): Promise<string> => {
  try {
    // Fetch approved ads for sitemap
    const { data: ads, error } = await supabase
      .from('ads')
      .select('id, updated_at, category, status, moderation_status')
      .eq('status', 'active')
      .eq('moderation_status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(1000); // Limit for performance

    if (error) {
      console.error('Error fetching ads for sitemap:', error);
      return generateSitemap(baseUrl, []);
    }

    const dynamicAds = (ads || []).map(ad => ({
      id: ad.id,
      updated_at: ad.updated_at
    }));

    return generateSitemap(baseUrl, dynamicAds);
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return generateSitemap(baseUrl, []);
  }
};

export const generateCategorySitemap = async (category: string, baseUrl: string = 'https://yamo.lovable.app'): Promise<string> => {
  try {
    const { data: ads, error } = await supabase
      .from('ads')
      .select('id, updated_at')
      .eq('category', category)
      .eq('status', 'active')
      .eq('moderation_status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error(`Error fetching ${category} ads for sitemap:`, error);
      return '';
    }

    const categoryUrls = (ads || []).map(ad => `
  <url>
    <loc>${baseUrl}/ad/${ad.id}</loc>
    <lastmod>${new Date(ad.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categoryUrls}
</urlset>`;
  } catch (error) {
    console.error(`Error generating ${category} sitemap:`, error);
    return '';
  }
};

// SEO monitoring utilities
export const trackSEOMetrics = () => {
  const metrics = {
    pageLoadTime: performance.now(),
    hasMetaDescription: !!document.querySelector('meta[name="description"]'),
    hasH1: !!document.querySelector('h1'),
    hasCanonical: !!document.querySelector('link[rel="canonical"]'),
    hasOpenGraph: !!document.querySelector('meta[property^="og:"]'),
    hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
    imageCount: document.querySelectorAll('img').length,
    imagesWithAlt: document.querySelectorAll('img[alt]').length,
    internalLinks: document.querySelectorAll('a[href^="/"]').length,
    externalLinks: document.querySelectorAll('a[href^="http"]:not([href*="yamo.lovable.app"])').length
  };

  return metrics;
};

export const validateSEO = () => {
  const issues: string[] = [];
  
  if (!document.querySelector('meta[name="description"]')) {
    issues.push('Missing meta description');
  }
  
  if (!document.querySelector('h1')) {
    issues.push('Missing H1 tag');
  }
  
  if (!document.querySelector('link[rel="canonical"]')) {
    issues.push('Missing canonical URL');
  }
  
  const images = document.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    issues.push(`${images.length} images missing alt text`);
  }
  
  const title = document.querySelector('title')?.textContent || '';
  if (title.length < 30 || title.length > 60) {
    issues.push('Title length not optimal (30-60 characters)');
  }
  
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  if (description.length < 120 || description.length > 160) {
    issues.push('Meta description length not optimal (120-160 characters)');
  }
  
  return issues;
};