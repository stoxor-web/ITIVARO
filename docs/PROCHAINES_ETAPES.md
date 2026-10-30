# ITIVARO — Suite du développement

## V1.2 (livrée)

- [x] Interface responsive, monogramme original, animations discrètes
- [x] Voyages / étapes / budget / checklists en stockage navigateur
- [x] Import et export JSON des voyages et contrôle statique du dépôt

## V1.4 — Journey Studio Premium et carte (livrée dans cette archive)

- [x] Habillage premium bleu ardoise / ivoire / vert sauge
- [x] Navigation « Carte voyage » desktop / mobile synchronisée avec les étapes
- [x] Marqueurs et lignes indicatives des étapes connues sur fond OpenStreetMap via Leaflet
- [x] Recherche de lieux sur action explicite (Nominatim), avec cache local
- [x] Schéma SVG de secours si les bibliothèques externes ne sont pas accessibles
- [x] Réduction des animations lorsque `prefers-reduced-motion` est activé
- [ ] Vérifier les tuiles et la recherche Nominatim sur l'hébergement final avec une connexion Internet (non vérifiables hors réseau)

## V1.5 — Authentification et données synchronisées

- [ ] Décider du backend : Firebase Authentication + Firestore envisagés
- [ ] Définir les droits de chaque voyage et règles Firestore sécurisées (actuellement tout est refusé)
- [ ] Prévoir une migration contrôlée des sauvegardes JSON locales
- [ ] Tests multi-utilisateurs, erreurs, conflits et sauvegardes

## V1.6 — Cartographie avancée et collaboration

- [ ] Fournisseur de tuiles professionnel adapté au trafic, conditions et quotas confirmés
- [ ] Géocodage robuste pour tous les lieux et correction manuelle de la position
- [ ] Vrai calcul d'itinéraires (train, voiture, marche), avec durées et coûts selon un fournisseur dédié
- [ ] Inviter propriétaires/éditeurs/lecteurs avec permissions contrôlées

## V1.7 — Carnet hors connexion

- [ ] Export PDF imprimable et cartes sélectionnées intégrées sous licence adaptée
- [ ] Informations pratiques réellement consultables sans réseau
- [ ] Export complet et export partageable sans données privées
