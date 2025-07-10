
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Forçage de la mise à jour du déploiement...');

try {
  // Mettre à jour le timestamp dans netlify.toml
  const netlifyTomlPath = 'netlify.toml';
  let netlifyContent = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  const currentTime = new Date().toISOString();
  netlifyContent = netlifyContent.replace(
    /X-Deployment-Time = ".*"/,
    `X-Deployment-Time = "${currentTime}"`
  );
  
  fs.writeFileSync(netlifyTomlPath, netlifyContent);
  console.log('✅ Timestamp de déploiement mis à jour');

  // Mettre à jour le fichier health.json
  const healthPath = 'public/health.json';
  const healthData = {
    status: 'ok',
    timestamp: currentTime,
    version: '1.0.0'
  };
  
  fs.writeFileSync(healthPath, JSON.stringify(healthData, null, 2));
  console.log('✅ Health check mis à jour');

  // Nettoyer et reconstruire
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Build terminé avec succès');

  console.log('\n🎉 Mise à jour forcée terminée !');
  console.log('💡 Videz le cache de votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R)');
  
} catch (error) {
  console.error('❌ Erreur pendant la mise à jour forcée:', error.message);
  process.exit(1);
}
