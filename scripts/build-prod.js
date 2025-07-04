
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Début du build de production pour Netlify...');

try {
  // Nettoyer le dossier dist
  console.log('🧹 Nettoyage du dossier dist...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build de l'application avec Vite
  console.log('📦 Build de l\'application...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Copier les fichiers nécessaires
  console.log('📋 Copie des fichiers de configuration...');
  
  // Copier _redirects dans dist
  if (fs.existsSync('_redirects')) {
    fs.copyFileSync('_redirects', 'dist/_redirects');
    console.log('✅ Fichier _redirects copié');
  }

  // Vérifier que le service worker est présent
  const swPath = path.join('dist', 'sw.js');
  const publicSwPath = path.join('public', 'sw.js');
  
  if (fs.existsSync(publicSwPath) && !fs.existsSync(swPath)) {
    fs.copyFileSync(publicSwPath, swPath);
    console.log('✅ Service worker copié');
  }

  console.log('✅ Build de production terminé avec succès !');
  console.log('📁 Les fichiers sont prêts dans le dossier dist/');
  
} catch (error) {
  console.error('❌ Erreur pendant le build:', error.message);
  process.exit(1);
}
