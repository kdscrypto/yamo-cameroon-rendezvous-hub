// src/components/AdsterraBanner.tsx
import React, { useEffect, useRef } from 'react';
import { AdsterraAdSlots, AdSlotType } from '@/config/adsterra';

type AdsterraBannerProps = {
  slot: AdSlotType; // On passe maintenant un "slot" au lieu des détails
};

const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ slot }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const adDetails = AdsterraAdSlots[slot];

  useEffect(() => {
    // Vérification et nettoyage du container
    const container = bannerRef.current;
    if (!container || !adDetails) {
      console.warn(`AdsterraBanner: Container ou détails manquants pour ${slot}`);
      return;
    }

    // Nettoyer le container avant de charger une nouvelle pub
    container.innerHTML = '';

    // En mode développement, vérifier si les tests sont autorisés
    const isDev = process.env.NODE_ENV === 'development';
    const devTestEnabled = isDev && localStorage.getItem('adsterra-dev-test') === 'true';
    
    if (isDev && !devTestEnabled) {
      // Afficher un placeholder en développement
      container.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-family: Arial, sans-serif;
          font-size: 14px;
          text-align: center;
          border-radius: 4px;
        ">
          <div>
            <div style="font-weight: bold; margin-bottom: 4px;">Adsterra ${slot}</div>
            <div style="font-size: 12px; opacity: 0.8;">${adDetails.width}x${adDetails.height}</div>
            <div style="font-size: 10px; margin-top: 4px; opacity: 0.6;">Mode développement</div>
          </div>
        </div>
      `;
      return;
    }

    const { key: adKey, width, height } = adDetails;

    // Vérifier que la clé est valide
    if (!adKey || adKey.length < 10) {
      console.error(`AdsterraBanner: Clé invalide pour ${slot}: ${adKey}`);
      container.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: #ff4444;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-family: Arial, sans-serif;
          font-size: 12px;
          text-align: center;
        ">
          Erreur: Clé Adsterra invalide
        </div>
      `;
      return;
    }

    try {
      // Configuration de la bannière
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        atOptions = {
          'key': '${adKey}',
          'format': 'iframe',
          'height': ${height},
          'width': ${width},
          'params': {}
        };
      `;

      // Script d'invocation
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
      invokeScript.async = true;

      // Gestion des erreurs de chargement
      invokeScript.onerror = () => {
        console.error(`AdsterraBanner: Erreur de chargement du script pour ${slot}`);
        container.innerHTML = `
          <div style="
            width: 100%; 
            height: 100%; 
            background: #ff9800;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-family: Arial, sans-serif;
            font-size: 12px;
            text-align: center;
          ">
            <div>
              <div>Pub temporairement indisponible</div>
              <div style="font-size: 10px; margin-top: 4px; opacity: 0.8;">Rechargement automatique...</div>
            </div>
          </div>
        `;
        
        // Réessayer après 5 secondes
        setTimeout(() => {
          if (container.parentNode) {
            container.innerHTML = '';
            container.appendChild(configScript.cloneNode(true));
            container.appendChild(invokeScript.cloneNode(true));
          }
        }, 5000);
      };

      // Ajouter les scripts au container
      container.appendChild(configScript);
      container.appendChild(invokeScript);

      console.log(`AdsterraBanner: Bannière ${slot} initialisée avec la clé ${adKey}`);

    } catch (error) {
      console.error(`AdsterraBanner: Erreur lors de l'initialisation de ${slot}:`, error);
      container.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: #f44336;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-family: Arial, sans-serif;
          font-size: 12px;
          text-align: center;
        ">
          Erreur de chargement
        </div>
      `;
    }

  }, [slot, adDetails]);

  // Toujours afficher le container, même en cas d'erreur
  if (!adDetails) {
    console.error(`AdsterraBanner: Aucune configuration trouvée pour le slot ${slot}`);
    return (
      <div 
        className="adsterra-banner-container"
        style={{ 
          width: '300px', 
          height: '250px',
          background: '#f44336',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          textAlign: 'center'
        }}
      >
        Configuration manquante
      </div>
    );
  }
  
  return (
    <div 
      ref={bannerRef} 
      className="adsterra-banner-container"
      style={{ 
        width: `${adDetails.width}px`, 
        height: `${adDetails.height}px`, 
        minWidth: `${adDetails.width}px`,
        minHeight: `${adDetails.height}px`,
        maxWidth: `${adDetails.width}px`,
        maxHeight: `${adDetails.height}px`,
        display: 'block',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef'
      }}
      data-slot={slot}
      data-dimensions={`${adDetails.width}x${adDetails.height}`}
    />
  );
};

export default AdsterraBanner;