interface OptimizedImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  title, 
  className = '', 
  width, 
  height, 
  loading = 'lazy', 
  sizes,
  priority = false
}: OptimizedImageProps) => {
  // Generate responsive sizes if not provided
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  
  // Priority images should load eagerly
  const actualLoading = priority ? 'eager' : loading;
  
  // Generate WebP source if supported
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  return (
    <picture>
      {/* WebP format for modern browsers */}
      <source 
        srcSet={webpSrc} 
        type="image/webp" 
        sizes={defaultSizes}
      />
      
      {/* Fallback for older browsers */}
      <img
        src={src}
        alt={alt}
        title={title}
        className={className}
        width={width}
        height={height}
        loading={actualLoading}
        sizes={defaultSizes}
        decoding={priority ? 'sync' : 'async'}
        style={{ 
          maxWidth: '100%', 
          height: 'auto' 
        }}
        onError={(e) => {
          // Fallback to original image if WebP fails
          const target = e.target as HTMLImageElement;
          if (target.src === webpSrc) {
            target.src = src;
          }
        }}
      />
    </picture>
  );
};

export default OptimizedImage;