// src/components/OptimizedAdsterraBanner.tsx
import React from 'react';
import { AdSlotType } from '@/config/adsterra';
import AdsterraBanner from './AdsterraBanner';

type OptimizedAdsterraBannerProps = {
  slot: AdSlotType;
  className?: string;
};

/**
 * Version optimisée du banner Adsterra sans wrapper complexe
 * Utilise directement AdsterraBanner pour éviter les conflits de style
 */
const OptimizedAdsterraBanner: React.FC<OptimizedAdsterraBannerProps> = ({ slot, className }) => {
  return (
    <div className={className}>
      <AdsterraBanner slot={slot} />
    </div>
  );
};

export default OptimizedAdsterraBanner;