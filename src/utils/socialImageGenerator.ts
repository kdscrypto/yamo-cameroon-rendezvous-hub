interface SocialImageProps {
  title: string;
  category?: string;
  location?: string;
  price?: string;
  isAd?: boolean;
}

const generateSocialImageURL = ({
  title,
  category = '',
  location = '',
  price = '',
  isAd = false
}: SocialImageProps): string => {
  // In a real implementation, this would call an image generation service
  // For now, we'll create a URL that could be used with services like:
  // - Vercel OG Image Generation
  // - Cloudinary Dynamic Image Generation
  // - Custom image generation API

  const baseURL = 'https://yamo.lovable.app/api/social-image';
  const params = new URLSearchParams({
    title: title.slice(0, 60), // Limit title length
    category: category,
    location: location,
    price: price,
    type: isAd ? 'ad' : 'page',
    template: isAd ? 'ad-template' : 'page-template'
  });

  return `${baseURL}?${params.toString()}`;
};

// Generate social images for different content types
export const generateAdSocialImage = (ad: any): string => {
  return generateSocialImageURL({
    title: ad.title || 'Nouvelle annonce',
    category: ad.category || '',
    location: ad.location || 'Cameroun',
    price: ad.price ? `${ad.price} FCFA` : '',
    isAd: true
  });
};

export const generateCategorySocialImage = (category: string, count: number): string => {
  const categoryNames: Record<string, string> = {
    'rencontres': 'Rencontres',
    'massages': 'Massages',
    'produits': 'Produits',
    'evenements': 'Événements'
  };

  return generateSocialImageURL({
    title: `${count} ${categoryNames[category] || category} disponibles`,
    category: categoryNames[category] || category,
    location: 'Cameroun',
    isAd: false
  });
};

export const generateSearchSocialImage = (query: string, results: number): string => {
  return generateSocialImageURL({
    title: `${results} résultats pour "${query}"`,
    category: 'Recherche',
    location: 'Cameroun',
    isAd: false
  });
};

// Fallback social image generator using Canvas API (client-side)
export const generateFallbackSocialImage = async (props: SocialImageProps): Promise<string> => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '/lovable-uploads/69763ec0-e661-4629-ba0e-0bfe2a747829.png';

    // Set canvas size for social media (1200x630 for OpenGraph)
    canvas.width = 1200;
    canvas.height = 630;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(1, '#3B82F6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    
    // Word wrap for title
    const words = props.title.split(' ');
    let line = '';
    let y = 280;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > 1000 && n > 0) {
        ctx.fillText(line, 600, y);
        line = words[n] + ' ';
        y += 60;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 600, y);

    // Category and location
    if (props.category || props.location) {
      ctx.font = '32px Arial, sans-serif';
      ctx.fillStyle = '#E2E8F0';
      const subtext = [props.category, props.location].filter(Boolean).join(' • ');
      ctx.fillText(subtext, 600, y + 80);
    }

    // Yamo logo/brand
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText('Yamo', 1150, 580);

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating social image:', error);
    return '/lovable-uploads/69763ec0-e661-4629-ba0e-0bfe2a747829.png';
  }
};

export default generateSocialImageURL;