# Configuration Adsterra - Guide de mise en place

## 🎯 Statut actuel
✅ **Phase 1-4 terminées** - Infrastructure Adsterra complète et intégrée
⚠️ **Action requise** - Remplacer les clés placeholder par vos vraies clés Adsterra

## 📍 Emplacements des publicités

### Pages avec publicités intégrées :
- **Page d'accueil (Index)** - Bannière header, vérification Adsterra
- **Tableau de bord (Dashboard)** - Bannières sidebar et mobile
- **Navigation (Browse)** - Bannière header + sidebar avec rectangles
- **Détail d'annonce** - Support prévu selon configuration

### Types de bannières configurées :
- **HEADER_BANNER** : 728x90px (bannière en-tête)
- **SIDEBAR_RECTANGLE** : 300x250px (rectangle sidebar)
- **CONTENT_RECTANGLE** : 300x250px (rectangle contenu)
- **FOOTER_BANNER** : 728x90px (bannière pied de page)
- **MOBILE_BANNER** : 320x50px (bannière mobile)

## 🔧 Configuration des clés Adsterra

### 1. Obtenez vos clés Adsterra
1. Connectez-vous à votre [compte Adsterra](https://publishers.adsterra.com/)
2. Créez vos bannières pour chaque format requis
3. Récupérez les clés de bannière générées

### 2. Mettez à jour la configuration
Éditez le fichier `src/config/adsterraConfig.ts` :

```typescript
export const ADSTERRA_CONFIG = {
  BANNERS: {
    HEADER_BANNER: {
      key: 'ea16b4d4359bf41430e0c1ad103b76af', // ✅ Déjà configuré
      width: 728,
      height: 90,
      format: 'iframe'
    },
    SIDEBAR_RECTANGLE: {
      key: 'VOTRE_CLE_SIDEBAR_ICI', // ⚠️ À remplacer
      width: 300,
      height: 250,
      format: 'banner'
    },
    // ... autres bannières
  }
}
```

### 3. Test en développement
Pour tester les publicités en développement :
1. Ajoutez `VITE_ADSTERRA_TEST=true` à vos variables d'environnement
2. Les bannières s'afficheront même en mode développement
3. Le composant de vérification vous indiquera le statut

## 🚀 Fonctionnalités implémentées

### ✅ Intégration complète
- **Hook useAdsterra** - Gestion globale des scripts
- **Composant AdsterraAdUnit** - Unité publicitaire réutilisable
- **Composant AdBanner** - Bannières préconfigurées par emplacement
- **Composant AdContainer** - Container stylisé pour les publicités
- **Composant AdsterraVerification** - Diagnostics en temps réel

### ✅ Gestion intelligente
- **Mode développement** - Placeholders visuels avec informations
- **Validation des clés** - Détection automatique des clés placeholder
- **Chargement conditionnel** - Scripts chargés uniquement si nécessaire
- **Gestion d'erreurs** - Messages d'erreur informatifs

### ✅ Optimisations
- **Délai de chargement** configuré (1000ms)
- **Évitement des doublons** - Vérification des scripts existants
- **Performance** - Chargement asynchrone et conditionnel

## 🎛️ Configuration avancée

### Variables d'environnement
- `VITE_ADSTERRA_TEST=true` - Active les tests en développement

### Paramètres dans adsterraConfig.ts
```typescript
SETTINGS: {
  TEST_MODE: process.env.NODE_ENV === 'development',
  ALLOW_DEV_TESTING: true, // Permet les tests en dev
  LOAD_DELAY: 1000, // Délai avant chargement
  AUTO_REFRESH_ENABLED: false, // Rafraîchissement auto
}
```

## 🔍 Diagnostics

### Vérification du statut
Le composant `AdsterraVerification` affiche en développement :
- ✅ Configuration OK
- ✅ Environnement prêt
- 📊 Mode (Test/Production)
- 🧪 Test dev (Activé/Désactivé)
- 🔧 Nombre de scripts chargés
- 📺 Nombre de bannières présentes
- ⚠️ Nombre de clés invalides

### Console logs
Les composants loggent automatiquement :
- Chargement des scripts Adsterra
- Initialisation des bannières
- Erreurs de configuration
- Statut des emplacements

## 📋 Checklist de déploiement

### Avant mise en production :
- [ ] Remplacer toutes les clés placeholder
- [ ] Tester chaque emplacement de bannière
- [ ] Vérifier que `VITE_ADSTERRA_TEST` n'est pas en production
- [ ] Valider les formats de bannières sur Adsterra
- [ ] Tester la responsivité des emplacements

### Surveillance post-déploiement :
- [ ] Vérifier l'affichage des bannières
- [ ] Contrôler les logs de la console
- [ ] Analyser les métriques Adsterra
- [ ] Optimiser les emplacements selon les performances

## 🎯 Prochaines étapes recommandées

1. **Récupérer vos clés Adsterra** pour remplacer les placeholders
2. **Tester avec `VITE_ADSTERRA_TEST=true`** en développement
3. **Déployer en production** une fois les clés configurées
4. **Monitorer les performances** via le dashboard Adsterra
5. **Optimiser les emplacements** selon les statistiques

## 🆘 Dépannage

### Les bannières ne s'affichent pas
1. Vérifiez que les clés ne sont pas des placeholders
2. Contrôlez la console pour les erreurs de script
3. Validez que les formats correspondent à votre compte Adsterra
4. Testez avec `VITE_ADSTERRA_TEST=true`

### Erreurs de script
1. Vérifiez la validité des clés Adsterra
2. Contrôlez que le domaine est autorisé sur Adsterra
3. Vérifiez les politiques de contenu (CSP)

L'infrastructure est prête - il suffit maintenant de configurer vos vraies clés Adsterra ! 🚀