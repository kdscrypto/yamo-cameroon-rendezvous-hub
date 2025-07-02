
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";

// Force dark theme immediately on load
(function() {
  document.documentElement.classList.add('dark');
  localStorage.setItem('yamo-theme', 'dark');
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

// Enregistrement du service worker pour optimiser les performances
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
      })
      .catch((error) => {
        console.log('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}

// Génération du sitemap dynamique
import { generateSitemap, generateRobotsTxt } from './utils/sitemapGenerator';

// Créer le sitemap et le robots.txt
const sitemap = generateSitemap();
const robotsTxt = generateRobotsTxt();

// Les exposer globalement pour les télécharger si nécessaire
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
