import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const html = await readFile(path.join(publicDir, 'index.html'), 'utf8');
const required = ['styles.css','v12.css','premium.css','app.js','map.js','display.js','assets/logo-itivaro-original.png'];
for (const relative of required) {
  const target = path.resolve(publicDir, relative);
  assert.equal((await stat(target)).isFile(), true, `${relative} doit être un fichier`);
  assert(html.includes(relative), `${relative} doit être référencé dans index.html`);
}
const firebase = JSON.parse(await readFile(path.join(root,'firebase.json'),'utf8'));
assert.equal(firebase.hosting.public, 'public', 'Firebase Hosting doit servir le dossier public');
const rules = await readFile(path.join(root,'firestore.rules'),'utf8');
assert(rules.includes('allow read, write: if false;'), 'V1.2 : Firestore doit rester entièrement fermé');
const js = await readFile(path.join(publicDir,'app.js'),'utf8');
assert(js.includes('localStorage'), 'V1.4 : les sauvegardes sont locales');
assert(js.includes('renderCarte') && js.includes('data-map-step'), 'La vue Carte voyage doit être présente');
console.log('OK : ITIVARO V1.4, carte voyage, sauvegarde locale et règles Firestore fermées.');
