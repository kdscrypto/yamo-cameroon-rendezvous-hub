
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface AdPlacement {
  placement: 'header' | 'footer' | 'sidebar' | 'content' | 'mobile';
  className?: string;
}

export {};
