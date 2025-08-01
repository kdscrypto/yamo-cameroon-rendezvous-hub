
import React from 'react';
import { Card } from '@/components/ui/card';

interface AdContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'subtle' | 'bordered' | 'transparent' | 'premium' | 'sidebar';
}

const AdContainer: React.FC<AdContainerProps> = ({ 
  children, 
  title = 'Publicité', 
  className = '',
  variant = 'subtle'
}) => {
  const getContainerStyles = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-border/30 bg-card/50 p-4 rounded-lg';
      case 'transparent':
        return 'bg-transparent';
      case 'premium':
        return 'bg-gradient-to-br from-primary/5 to-accent/10 p-4 rounded-xl border border-primary/20 shadow-sm';
      case 'sidebar':
        return 'bg-card/60 py-3 px-5 rounded-lg border border-border/20 shadow-sm backdrop-blur-sm';
      case 'subtle':
      default:
        return 'bg-muted/20 p-3 rounded-md border border-border/20';
    }
  };

  const compactClass = variant === 'sidebar' ? 'ad-wrapper--compact' : '';
  
  return (
    <div className={`ad-wrapper ${getContainerStyles()} ${compactClass} ${className}`}>
      {title && (
        <div className="text-xs text-muted-foreground mb-2 text-center opacity-60">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export default AdContainer;
