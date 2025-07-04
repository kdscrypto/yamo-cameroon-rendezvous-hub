
# Guide de déploiement sur Netlify

## Préparation

Votre application est maintenant prête pour le déploiement sur Netlify. Voici les étapes à suivre :

## 1. Configuration des variables d'environnement

Assurez-vous que les variables suivantes sont configurées dans Netlify :

### Variables Supabase (déjà configurées dans le code)
- `VITE_SUPABASE_URL`: https://lusovklxvtzhluekrhwvu.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c292a2x4dnR6aGx1ZWtod3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDIyOTQsImV4cCI6MjA2NTUxODI5NH0.u4cFSTWFbC0ar9Fie1YZW26P-g1a_3iyDHscEWPLZcc

## 2. Configuration Netlify

### Paramètres de build
- **Build command**: `npx vite build`
- **Publish directory**: `dist`
- **Node version**: 18

### Redirections et headers
Les fichiers `netlify.toml` et `_redirects` sont déjà configurés pour :
- Routage SPA (Single Page Application)
- Headers de sécurité
- Cache optimisé pour les assets statiques
- Support du Service Worker

## 3. Configuration Supabase après déploiement

Une fois votre site déployé, vous devrez configurer Supabase :

1. Aller dans votre projet Supabase
2. Navigation : Authentication > URL Configuration
3. Ajouter l'URL de votre site Netlify comme :
   - **Site URL**: https://votre-site.netlify.app
   - **Redirect URL**: https://votre-site.netlify.app

## 4. Vérifications post-déploiement

Après le déploiement, vérifiez :
- ✅ La navigation fonctionne (pas d'erreur 404)
- ✅ L'authentification fonctionne
- ✅ Le Service Worker est actif
- ✅ Les images se chargent correctement
- ✅ Les formulaires fonctionnent

## 5. Commandes utiles

### Build local pour test
```bash
npx vite build
```

### Preview local du build
```bash
npx vite preview
```

### Test du Service Worker
Ouvrir les DevTools > Application > Service Workers

## 6. Optimisations incluses

- **Performance** : Compression et minification automatique
- **SEO** : Meta tags optimisés et sitemap
- **Sécurité** : Headers de sécurité configurés
- **Cache** : Stratégie de cache optimisée
- **PWA** : Service Worker pour le cache offline

## 7. Dépannage

### Erreur 404 sur les routes
- Vérifiez que le fichier `_redirects` est présent dans `dist`
- Vérifiez la configuration dans `netlify.toml`

### Problèmes d'authentification
- Vérifiez les URL de redirection dans Supabase
- Vérifiez que les variables d'environnement sont correctes

### Service Worker ne fonctionne pas
- Vérifiez que `sw.js` est accessible à la racine
- Vérifiez les headers dans la configuration Netlify

## 8. Déploiement sur Netlify

1. Connectez votre repository GitHub à Netlify
2. Configurez les paramètres de build comme indiqué ci-dessus
3. Déployez votre site
4. Une fois déployé, configurez les URL de redirection Supabase

Votre application devrait maintenant être fonctionnelle sur Netlify !
