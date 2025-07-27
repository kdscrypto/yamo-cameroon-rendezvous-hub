export interface AdsterraBannerConfig {
  key: string;
  width: number;
  height: number;
  format: 'banner';
}

export interface AdsterraAdProps {
  adKey: string;
  width: number;
  height: number;
  format?: 'banner';
  className?: string;
  style?: React.CSSProperties;
}

export interface AdsterraPlacement {
  placement: 'header' | 'footer' | 'sidebar' | 'content' | 'mobile';
  className?: string;
}

export {};