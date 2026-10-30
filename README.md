# ITIVARO V1.5 — Firebase Auth + Firestore personnel

> **Installation :** Lire d'abord [`docs/INSTALLATION_FIREBASE_V15.md`](docs/INSTALLATION_FIREBASE_V15.md).
> GitHub Pages : https://stoxor-web.github.io/ITIVARO/
> **Sécurité :** publier les règles Firestore dans Firebase Console AVANT de mettre en ligne le code connecté.
> **Configuration :** remplacer la clé Web `apiKey` dans `public/firebase-config.js` par la valeur exacte fournie dans Firebase.
> **Fonctionnalités :** inscription e-mail, connexion Google, mot de passe oublié, voyages privés synchronisés, export/import JSON, transfert volontaire des voyages locaux.
> **Limite :** V1.5 = un espace privé par utilisateur, pas encore de partage entre comptes ni d'itinéraires routiers réels.

---

# ITIVARO — Journey Studio Premium · V1.4

Prototype fonctionnel local (sans backend) d’**ITIVARO**. Interface premium responsive, carte voyage interactive, parcours, budget, préparatifs et réglages d’accessibilité.

> **Important :** cette version n'a **pas de compte utilisateur**, de base de données distante ni de partage entre proches. Les voyages sont conservés **uniquement dans le navigateur** avec `localStorage`. Ne pas saisir de documents, mots de passe, informations de réservation sensibles ou autres données privées dans une démonstration publiée.

## Tester en local

**Option rapide :** ouvrir `public/index.html` pour un aperçu, mais le serveur local est recommandé : certaines fonctions et ressources cartographiques se comportent différemment avec `file://`.

**Option recommandée :** avec Node.js 20+ installé, ouvrir un terminal à la racine du dépôt :

```bash
npm run dev
```

Puis ouvrir **http://localhost:8000**. Aucune installation de paquet n'est nécessaire.

Alternative sans Node :

```bash
python -m http.server 8000 -d public
```

Pour vérifier l'intégrité des fichiers :

```bash
npm run check
```

## Fonctions incluses

- Création / modification / suppression de voyages et configuration des dates
- Organisation des étapes d'itinéraire
- Budget et dépenses
- Checklists
- Export / import de sauvegardes JSON (à conserver à l'abri)
- Interface ordinateur / mobile avec habillage Premium V1.4 ; animations réduites si demandé par le système
- Nouvelle vue **Carte voyage** : marqueurs, liens indicatifs à vol d’oiseau, sélection synchronisée des étapes et recentrage
- Fond géographique **OpenStreetMap** via Leaflet (connexion Internet), localisation manuelle via Nominatim ; schéma SVG hors ligne en cas d’échec
- Mode confort de lecture, mode concentration et raccourcis clavier

**Non inclus dans la V1.4 :** authentification Firebase, Firestore connecté, calcul d’itinéraires routiers, partage de voyages et invitations, PDF final.

## Structure

```text
public/                       # Site statique hébergeable
  index.html
  app.js
  styles.css
  v12.css
  premium.css              # Nouvelle direction artistique V1.4
  map.js                  # Carte, fallback hors ligne et géocodage manuel
  display.js
  assets/logo-itivaro-original.png
scripts/
  dev-server.mjs             # Serveur local sans dépendance
  verify.mjs                 # Vérification statique du dépôt
.github/workflows/
  verify.yml                 # Contrôle à chaque push / PR
  pages.yml                  # Publication GitHub Pages MANUELLE
firebase.json               # Configuration Firebase Hosting (optionnel)
firestore.rules             # Accès Firestore entièrement refusé
README.md
.gitignore
```

## Installer les fichiers sur GitHub

1. Créer ou ouvrir le dépôt ITIVARO sur GitHub.
2. **Décompresser l'archive ZIP avant l'envoi**. GitHub n'extrait pas automatiquement un ZIP déposé avec « Upload files ».
3. Dans le dépôt, sélectionner **Add file → Upload files**, puis envoyer **le contenu extrait du dossier**, en conservant les sous-dossiers `public/`, `scripts/`, `.github/`.
4. Valider avec **Commit changes**. Vérifier que `README.md`, `firebase.json` et `public/` sont bien à la racine du dépôt.

> Attention : selon la méthode d'envoi et votre système, les fichiers cachés `.gitignore` et le dossier `.github/` peuvent être omis. Une méthode `git add` depuis un terminal est plus fiable pour l'ensemble des fichiers.

### Méthode Git (recommandée pour les mises à jour futures)

Dans le dossier décompressé :

```bash
git clone https://github.com/stoxor-web/ITIVARO.git
cd ITIVARO
# Copier ici le contenu décompressé du patch V1.4
npm run check
git add .
git commit -m "ITIVARO V1.4 — Journey Studio Premium et carte"
git push origin main
```

Sur un dépôt déjà existant, travailler dans un clone pour préserver son historique et contrôler les changements avant le commit. Ne pas importer de sauvegardes privées dans GitHub.

## Hébergement (facultatif)

- **GitHub Pages :** une action manuelle de déploiement est prévue dans `.github/workflows/pages.yml`. Dans le dépôt, choisir **Settings → Pages → Build and deployment: GitHub Actions**, puis déclencher l'action **Actions → Publier la démo ITIVARO sur GitHub Pages → Run workflow**. GitHub Pages **publie un site accessible au public** : ne pas y exposer des données privées.
- **Firebase Hosting :** le fichier `firebase.json` pointe déjà vers `public/`. Après installation de Firebase CLI, connexion et sélection de votre propre projet Firebase, exécuter `firebase deploy --only hosting` dans le dossier racine. **Cela publie également le site** ; aucune authentification n'est ajoutée par le simple hébergement.

## Sauvegarder / migrer des données

Avant toute mise à jour, utiliser **Sauvegarder** dans l'application pour télécharger une copie JSON. Éviter d'envoyer ce JSON dans un dépôt GitHub : il peut contenir des informations privées. Les données dans `localStorage` dépendent du navigateur et de l'origine du site (`file://`, `localhost` ou domaine web).

## Sécurité, limites et statut

- Aucune clé API ou mot de passe n’est nécessaire et aucune clé privée n’est incluse.
- Les règles Firestore présentes dans le dépôt interdisent **toutes** les lectures et écritures tant qu'un backend réellement sécurisé n'est pas développé.
- Les droits par voyage, l'authentification, le consentement éventuel aux traceurs, la politique de confidentialité et les mentions légales restent à traiter avant une vraie mise en service.
- Le nom de marque et les domaines restent soumis aux vérifications juridiques avant utilisation publique.

### Carte et confidentialité

- La carte réelle est chargée **uniquement lorsque la vue Carte voyage est ouverte**. Elle utilise Leaflet 1.9.4 (CDN unpkg) et des tuiles OpenStreetMap (requêtes externes). Les utilisateurs doivent être informés de ces connexions. En production, choisir un fournisseur de tuiles avec une offre adaptée à l’usage prévu et afficher l’attribution.
- Les marqueurs des villes connues sont disponibles sans connexion. Le schéma hors ligne place les étapes à partir de leurs coordonnées mais n'affiche **pas** de fond cartographique authentique.
- Le bouton **Localiser** déclenche une recherche Nominatim **uniquement sur demande** et envoie le nom de la ville et la destination au service tiers. Les coordonnées trouvées sont conservées dans un cache local distinct (`itivaro-map-locations-v14`). Pour une application à fort trafic, utiliser une API de géocodage disposant d'une politique d'usage appropriée.
- Les segments sont des **lignes droites de repérage**, pas des routes ni un calcul de temps de transport. Aucun itinéraire calculé n'est présenté.
- Aucune donnée des voyages n'est automatiquement envoyée à Firebase. Le navigateur conserve la même clé `itivaro-v11-trips` et le même format de sauvegarde JSON V1.2.

**Installer V1.4 :** voir [docs/INSTALLATION_PREMIUM_V14.txt](docs/INSTALLATION_PREMIUM_V14.txt).

Voir [docs/PROCHAINES_ETAPES.md](docs/PROCHAINES_ETAPES.md) pour la feuille de route technique.
