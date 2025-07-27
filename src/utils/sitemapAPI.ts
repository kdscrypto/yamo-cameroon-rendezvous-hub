import { generateDynamicSitemap } from '@/utils/dynamicSEO';

// API endpoint to generate and serve sitemap
export const generateSitemapAPI = async () => {
  try {
    const sitemap = await generateDynamicSitemap();
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};

// Hook to update sitemap periodically
export const useSitemapUpdater = () => {
  const updateSitemap = async () => {
    try {
      const sitemap = await generateDynamicSitemap();
      // In a real implementation, this would update the sitemap file
      console.log('Sitemap updated:', sitemap.length, 'characters');
      return sitemap;
    } catch (error) {
      console.error('Failed to update sitemap:', error);
      return null;
    }
  };

  return { updateSitemap };
};