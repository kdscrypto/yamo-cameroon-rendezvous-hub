// src/components/AdsterraWrapper.tsx
import React from 'react';
import AdsterraBanner from './AdsterraBanner';
import { AdSlotType, AdsterraAdSlots } from '@/config/adsterra';

type AdsterraWrapperProps = {
  slot: AdSlotType;
  className?: string;
};

const AdsterraWrapper: React.FC<AdsterraWrapperProps> = ({ slot, className }) => {
  const adDetails = AdsterraAdSlots[slot];

  if (!adDetails || adDetails.key.startsWith('REMPLACEZ_MOI')) {
    // Ne rien rendre si le slot n'est pas bien configuré
    return null;
  }

  const placeholderStyle: React.CSSProperties = {
    width: `${adDetails.width}px`,
    height: `${adDetails.height}px`,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Fond sombre très léger
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: '14px',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    ...placeholderStyle,
  };

  const bannerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  return (
    <div style={wrapperStyle} className={className}>
      <span>Publicité</span>
      <div style={bannerStyle}>
        <AdsterraBanner slot={slot} />
      </div>
    </div>
  );
};

export default AdsterraWrapper;