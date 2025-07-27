export interface AdsterraBannerConfig {
  key: string;
  width: number;
  height: number;
  format: 'banner' | 'iframe';
}

export interface AdsterraAdProps {
  adKey: string;
  width: number;
  height: number;
  format?: 'banner' | 'iframe';
  className?: string;
  style?: React.CSSProperties;
}

export interface AdsterraPlacement {
  placement: 'header' | 'footer' | 'sidebar' | 'content' | 'mobile';
  className?: string;
}

export {};