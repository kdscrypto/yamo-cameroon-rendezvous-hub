// src/components/AdsterraBanner.tsx
import React, { useEffect, useRef } from 'react';

type AdsterraBannerProps = {
  adKey: string;
  width: number;
  height: number;
};

const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ adKey, width, height }) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current || bannerRef.current.children.length > 0) {
      // Si le conteneur n'existe pas ou si la pub est déjà chargée, on ne fait rien.
      return;
    }

    // Création du script de configuration
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

    // Création du script d'invocation
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    invokeScript.async = true;

    // Ajout des scripts au conteneur
    bannerRef.current.appendChild(configScript);
    bannerRef.current.appendChild(invokeScript);

  }, [adKey, width, height]);

  return <div ref={bannerRef} style={{ width: `${width}px`, height: `${height}px` }} />;
};

export default AdsterraBanner;