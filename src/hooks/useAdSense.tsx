
import { useEffect, useState } from 'react';

export const useAdSense = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if AdSense script is already loaded
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    // Load AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX'; // Replace with your actual publisher ID
    
    script.onload = () => {
      setIsLoaded(true);
      console.log('AdSense script loaded successfully');
    };
    
    script.onerror = () => {
      setError('Failed to load AdSense script');
      console.error('Failed to load AdSense script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const scriptToRemove = document.querySelector('script[src*="adsbygoogle.js"]');
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  return { isLoaded, error };
};
