# ITIVARO — Suite du développement

## V1.2 (livrée)

- [x] Interface responsive premium, monogramme original, animations discrètes
- [x] Voyages / étapes / budget / checklists en stockage navigateur
- [x] Import et export JSON des voyages
- [x] Contrôles statiques de fichiers et CI GitHub

## V1.3 — Fiabilité et comptes

- [ ] Décider du backend : Firebase Authentication + Firestore envisagés
- [ ] Définir le schéma de données versionné et les migrations depuis les sauvegardes JSON
- [ ] Connexion / déconnexion / récupération de compte
- [ ] Autorisations côté base pour chaque voyage et refus d'accès par défaut
- [ ] Tests avec au moins deux comptes vérifiant l'absence de fuite entre voyages
- [ ] Gestion des états hors ligne, erreurs et conflits de synchronisation

## V1.4 — Collaboration et carte

- [ ] Invitations à durée et permissions contrôlées (propriétaire / éditeur / lecteur)
- [ ] Carte MapLibre avec fournisseur de tuiles et quotas vérifiés
- [ ] Ajout / déplacement de points et synchronisation des étapes
- [ ] Réservations, documents non sensibles et tests sur mobile

## V1.5 — Carnet hors connexion

- [ ] PDF imprimable en respectant la charte ITIVARO
- [ ] Cartes intégrées et informations pratiques réellement consultables hors ligne
- [ ] Export complet vs export partageable sans données privées

## Critères de qualité

- Préférences `prefers-reduced-motion` et contraste vérifiés
- Fonctionnalités testées, données persistées correctement, erreurs visibles
- Aucune clé secrète dans le frontend / dépôt
- Pas de publication publique non validée, ni d'ajout de services facturables par surprise
