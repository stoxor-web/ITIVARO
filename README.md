# ITIVARO — Application de voyage · V1.2

Prototype fonctionnel local (sans backend) de l'application de voyage **ITIVARO**. Interface premium responsive, monogramme de marque choisi, micro-animations et réglages de lisibilité.

> **Important :** cette version n'a **pas de compte utilisateur**, de base de données distante ni de partage entre proches. Les voyages sont conservés **uniquement dans le navigateur** avec `localStorage`. Ne pas saisir de documents, mots de passe, informations de réservation sensibles ou autres données privées dans une démonstration publiée.

## Tester en local

**Option rapide :** télécharger la version autonome HTML séparément ou ouvrir `public/index.html` (certaines fonctions des navigateurs se comportent différemment en mode `file://`).

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
- Interface ordinateur / mobile ; animations réduites si demandé par le système
- Mode confort de lecture, mode concentration et raccourcis clavier

**Non inclus dans la V1.2 :** authentification Firebase, Firestore connecté, véritable carte géographique, partage de voyages et invitations, PDF final.

## Structure

```text
public/                       # Site statique hébergeable
  index.html
  app.js
  styles.css
  v12.css
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
git init
git branch -M main
git add .
git commit -m "Initialisation ITIVARO V1.2"
git remote add origin https://github.com/UTILISATEUR/NOM-DU-DEPOT.git
git push -u origin main
```

Si le dépôt distant possède déjà des fichiers / un historique, **ne pas remplacer aveuglément** le contenu. Cloner le dépôt d'abord et copier les fichiers dans le clone, puis créer un commit. Remplacer `UTILISATEUR/NOM-DU-DEPOT` par la véritable adresse de votre dépôt.

## Hébergement (facultatif)

- **GitHub Pages :** une action manuelle de déploiement est prévue dans `.github/workflows/pages.yml`. Dans le dépôt, choisir **Settings → Pages → Build and deployment: GitHub Actions**, puis déclencher l'action **Actions → Publier la démo ITIVARO sur GitHub Pages → Run workflow**. GitHub Pages **publie un site accessible au public** : ne pas y exposer des données privées.
- **Firebase Hosting :** le fichier `firebase.json` pointe déjà vers `public/`. Après installation de Firebase CLI, connexion et sélection de votre propre projet Firebase, exécuter `firebase deploy --only hosting` dans le dossier racine. **Cela publie également le site** ; aucune authentification n'est ajoutée par le simple hébergement.

## Sauvegarder / migrer des données

Avant toute mise à jour, utiliser **Sauvegarder** dans l'application pour télécharger une copie JSON. Éviter d'envoyer ce JSON dans un dépôt GitHub : il peut contenir des informations privées. Les données dans `localStorage` dépendent du navigateur et de l'origine du site (`file://`, `localhost` ou domaine web).

## Sécurité, limites et statut

- Aucune clé API ou mot de passe n'est nécessaire et aucune clé privée n'est incluse.
- Les règles Firestore présentes dans le dépôt interdisent **toutes** les lectures et écritures tant qu'un backend réellement sécurisé n'est pas développé.
- Les droits par voyage, l'authentification, le consentement éventuel aux traceurs, la politique de confidentialité et les mentions légales restent à traiter avant une vraie mise en service.
- Le nom de marque et les domaines restent soumis aux vérifications juridiques avant utilisation publique.

Voir [docs/PROCHAINES_ETAPES.md](docs/PROCHAINES_ETAPES.md) pour la feuille de route technique.
