# Guide de Configuration Adsterra pour Production

## 🚀 Résumé des corrections automatiques

Le système Adsterra a été optimisé avec les corrections suivantes :

### ✅ Corrections appliquées automatiquement

1. **Configuration des clés séparées par environnement**
   - Clés de développement distinctes pour les tests
   - Clés de production configurées séparément
   - Validation automatique des clés selon l'environnement

2. **Test de connectivité optimisé**
   - Méthodes de test multiples avec fallback
   - Timeout optimisé (5 secondes maximum)
   - Gestion spéciale pour l'environnement de développement

3. **Performance système améliorée**
   - Seuils de performance ajustés
   - Détection et signalement des performances critiques
   - Optimisations de cache et timeout

4. **Système de correction automatique**
   - Nouveau composant `AdsterraAutoFix` 
   - Diagnostic et correction en temps réel
   - Interface utilisateur pour les corrections manuelles

## 🔧 Actions requises pour la production

### 1. Remplacer les clés Adsterra (CRITIQUE)

**Fichier :** `src/utils/adsterraProductionConfig.ts`

```typescript
const PRODUCTION_KEYS: AdsterraProductionKeys = {
  HEADER_BANNER: 'VOTRE_VRAIE_CLE_HEADER',        // ← Remplacer
  SIDEBAR_RECTANGLE: 'VOTRE_VRAIE_CLE_SIDEBAR',   // ← Remplacer
  CONTENT_RECTANGLE: 'VOTRE_VRAIE_CLE_CONTENT',   // ← Remplacer
  FOOTER_BANNER: 'VOTRE_VRAIE_CLE_FOOTER',        // ← Remplacer
  MOBILE_BANNER: 'VOTRE_VRAIE_CLE_MOBILE'         // ← Remplacer
};
```

**Comment obtenir les clés :**
1. Connectez-vous à [Adsterra Publisher](https://publisher.adsterra.com/)
2. Créez des emplacements pour chaque format :
   - 728x90 (Header Banner)
   - 300x250 (Rectangle banners)
   - 320x50 (Mobile Banner)
3. Copiez les clés générées dans le fichier

### 2. Configurer le domaine de production (CRITIQUE)

**Fichier :** `src/utils/adsterraProductionConfig.ts`

```typescript
export const ADSTERRA_ALLOWED_DOMAINS = [
  'localhost',                    // Développement
  '127.0.0.1',                   // Développement local
  'yamo.lovable.app',            // Staging
  'votre-domaine-production.com', // ← Ajouter votre domaine
];
```

**Actions Adsterra requises :**
1. Dans votre dashboard Adsterra, ajoutez votre domaine de production
2. Attendez l'approbation (24-48h généralement)
3. Testez que les publicités s'affichent correctement

### 3. Configurer les en-têtes CSP (RECOMMANDÉ)

**Pour Netlify/Vercel :** Créer `_headers` ou `vercel.json`
**Pour Apache :** Modifier `.htaccess`
**Pour Nginx :** Modifier la configuration

```
Content-Security-Policy: script-src 'self' 'unsafe-inline' https://www.highperformanceformat.com https://a.rfihub.com; frame-src 'self' https://www.highperformanceformat.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.highperformanceformat.com https://a.rfihub.com;
```

## 📊 Vérification post-déploiement

### Utiliser l'outil de diagnostic

1. Accédez à `/adsterra-test` sur votre site de production
2. Utilisez l'onglet "Correction automatique" pour un diagnostic complet
3. Vérifiez que tous les indicateurs sont verts

### Points de contrôle manuels

- [ ] Les publicités s'affichent correctement
- [ ] Aucune erreur dans la console du navigateur
- [ ] Test sur différents navigateurs (Chrome, Firefox, Safari)
- [ ] Test sur mobile et desktop
- [ ] Vérification en navigation privée (détection ad-blocker)

## 🔍 Résolution des problèmes courants

### "Clés placeholder détectées"
- **Cause :** Les clés de production n'ont pas été configurées
- **Solution :** Remplacer les clés dans `adsterraProductionConfig.ts`

### "Impossible d'accéder à highperformanceformat.com"
- **Cause :** Problème de connectivité ou restriction réseau
- **Solutions :**
  1. Vérifier la connexion internet
  2. Vérifier les paramètres firewall
  3. Contacter le support Adsterra si persistant

### "Domaine non autorisé"
- **Cause :** Le domaine n'est pas approuvé dans Adsterra
- **Solution :** Ajouter et faire approuver le domaine dans le dashboard Adsterra

### "Performance système critique"
- **Cause :** Temps de chargement trop lent
- **Solutions :**
  1. Optimiser la vitesse du serveur
  2. Utiliser un CDN
  3. Vérifier les ressources réseau

## 📈 Monitoring et optimisation

### Métriques à surveiller

1. **Taux de remplissage** - Pourcentage de publicités affichées
2. **CTR (Click-Through Rate)** - Taux de clic sur les publicités
3. **RPM (Revenue Per Mille)** - Revenus pour 1000 impressions
4. **Temps de chargement** - Performance de chargement des publicités

### Outils de monitoring

- Dashboard Adsterra pour les revenus
- Google Analytics pour le trafic
- Console de développement pour les erreurs techniques
- Outil de diagnostic `/adsterra-test` pour la santé système

## 🆘 Support et contacts

- **Support Adsterra :** [support@adsterra.com](mailto:support@adsterra.com)
- **Documentation :** [Adsterra Publisher Help](https://adsterra.com/publisher-help/)
- **Status du service :** Vérifier sur le dashboard Adsterra

---

## ✅ Checklist de déploiement

Avant de déployer en production, vérifiez :

- [ ] Clés Adsterra de production configurées
- [ ] Domaine ajouté et approuvé dans Adsterra
- [ ] En-têtes CSP configurés (si nécessaire)
- [ ] Test de connectivité réussi
- [ ] Performance système optimale
- [ ] Diagnostic `/adsterra-test` entièrement vert

**Une fois ces étapes complétées, votre système Adsterra sera pleinement opérationnel en production !**