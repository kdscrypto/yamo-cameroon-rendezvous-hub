import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";
import { optimizeForProduction } from './utils/environmentUtils';
import { ProductionUtils } from './utils/productionMonitoring';

// Optimiser pour la production
optimizeForProduction();

// Démarrer le monitoring de production
ProductionUtils.startProductionMonitoring();

// Ensure we have a root element before rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Service worker registration avec gestion d'erreur améliorée
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Écouter les mises à jour du service worker
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Sitemap generation utilities (conservé pour compatibilité)
import { generateSitemap, generateRobotsTxt } from './utils/sitemapGenerator';

const sitemap = generateSitemap();
const robotsTxt = generateRobotsTxt();

// Expose sitemap utilities globally
(window as any).downloadSitemap = () => {
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

(window as any).downloadRobotsTxt = () => {
  const blob = new Blob([robotsTxt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'robots.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
