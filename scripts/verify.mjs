import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const html = await readFile(path.join(publicDir, 'index.html'), 'utf8');
const required = ['styles.css','v12.css','premium.css','cloud.css','firebase-config.js','cloud.js','app.js','map.js','display.js','assets/logo-itivaro-original.png'];
for (const relative of required) {
  const target = path.resolve(publicDir, relative);
  assert.equal((await stat(target)).isFile(), true, `${relative} doit être un fichier`);
  assert(html.includes(relative), `${relative} doit être référencé dans index.html`);
}
const firebase = JSON.parse(await readFile(path.join(root,'firebase.json'),'utf8'));
assert.equal(firebase.hosting.public, 'public', 'Firebase Hosting doit servir le dossier public');
const rules = await readFile(path.join(root,'firestore.rules'),'utf8');
assert(rules.includes('isOwner(userId)') && rules.includes('request.resource.data.revision == resource.data.revision + 1') && rules.includes('allow read, write: if false;'), 'V1.5 : droits privés et révisions monotones requis');
const js = await readFile(path.join(publicDir,'app.js'),'utf8');
assert(js.includes('localStorage') && js.includes('ITIVARO_CLOUD') && js.includes('ITIVARO_BRIDGE'), 'V1.5 : migration locale et pont cloud requis');
assert(js.includes('renderCarte') && js.includes('data-map-step'), 'La vue Carte voyage doit être présente');
const map = await readFile(path.join(publicDir, 'map.js'), 'utf8');
assert(!map.includes('bindTooltip(s.name'), 'Leaflet doit afficher le texte des noms sans interprétation HTML');
const cloud = await readFile(path.join(publicDir, 'cloud.js'), 'utf8');
assert(cloud.includes('onAuthStateChanged') && cloud.includes('runTransaction') && cloud.includes('signInWithPopup'), 'Authentification et synchronisation requises');
const config = await readFile(path.join(publicDir, 'firebase-config.js'), 'utf8');
assert(config.includes('itivaro.firebaseapp.com') && !config.includes('private_key'), 'Config Firebase Web et absence de clé de service');
console.log('OK : ITIVARO V1.5, Auth + Google + Firestore privé + carte sûre + migration conservée.');
