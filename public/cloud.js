/** ITIVARO V1.5 — Auth + synchronisation personnelle (pas de collaboration). */
const config = window.ITIVARO_FIREBASE_CONFIG;
if (config?.apiKey?.startsWith('AIza') && config.projectId === 'itivaro' && config.appId) {
  const $ = id => document.getElementById(id);
  const app = window.ITIVARO_BRIDGE;
  const gate = $('cloudGate');
  const gateTitle = $('authTitle');
  const gateHint = $('authHint');
  const gateError = $('authError');
  const gateSubmit = $('authSubmit');
  const cloudBar = $('cloudBar');
  const cloudWarning = $('cloudWarning');
  const cloudWarningText = $('cloudWarningText');
  let authMode = 'signin';
  let firebaseAuth, firestore;
  let sdk;
  let currentUser = null;
  let currentRef = null;
  let revision = 0;
  let saving = false;
  let pending = null;
  let conflict = false;
  let unsub = null;
  let timer = null;
  let session = 0;
  let retryCount = 0;
  let migrationDismissed = false;

  const storageKey = uid => `itivaro-cloud-pending-${uid}`;
  const status = text => { $('saveState').textContent = text; };
  const feedback = (text = '', isError = false) => {
    gateError.textContent = text;
    gateError.hidden = !text;
    gateError.classList.toggle('is-error', isError);
  };
  const warning = (text = '') => {
    cloudWarning.hidden = !text;
    cloudWarningText.textContent = text;
  };
  const authError = error => {
    const code = error?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Adresse e-mail ou mot de passe incorrect.';
    if (code === 'auth/email-already-in-use') return 'Cette adresse e-mail possède déjà un compte.';
    if (code === 'auth/weak-password') return 'Choisissez un mot de passe plus long.';
    if (code === 'auth/invalid-email') return 'Adresse e-mail invalide.';
    if (code === 'auth/too-many-requests') return 'Trop de tentatives. Réessayez plus tard.';
    if (code === 'auth/popup-closed-by-user') return 'Fenêtre de connexion Google fermée.';
    if (code === 'auth/unauthorized-domain') return 'Domaine non autorisé : ajoutez stoxor-web.github.io dans Firebase Authentication.';
    if (code === 'auth/popup-blocked') return 'Pop-up Google bloquée par le navigateur. Autorisez-la et recommencez.';
    if (code === 'permission-denied') return 'Accès refusé par Firestore. Vérifiez les règles et le projet Firebase.';
    if (code === 'unavailable' || code === 'auth/network-request-failed') return 'Connexion au service indisponible. Vérifiez votre accès Internet.';
    return 'Opération impossible. Consultez la console du navigateur ou réessayez.';
  };
  const renderAuth = () => {
    const signup = authMode === 'signup';
    gateTitle.textContent = signup ? 'Créer un compte' : 'Retrouvez vos voyages.';
    gateHint.textContent = signup ? 'Un espace privé pour préparer vos prochaines destinations.' : 'Connectez-vous pour retrouver vos voyages sur vos appareils.';
    gateSubmit.textContent = signup ? 'Créer mon compte' : 'Se connecter';
    $('authSwitch').textContent = signup ? 'J’ai déjà un compte' : 'Créer un compte';
    $('authSwitch').hidden = !config.allowSignup && !signup;
    feedback();
  };
  const byteLength = trips => new TextEncoder().encode(JSON.stringify(trips)).byteLength;
  const canAccept = trips => {
    if (!currentUser || !window.ITIVARO_CLOUD.ready || conflict) {
      warning('Vos modifications sont bloquées : reconnectez-vous ou résolvez le conflit de synchronisation.');
      return false;
    }
    if (trips.length > 100 || byteLength(trips) > 500000) {
      warning('Limite de taille atteinte pour cette première version. Exportez vos voyages puis réduisez les données avant de recommencer.');
      return false;
    }
    return true;
  };
  const showMigration = () => {
    const el = $('legacyMigration');
    if (!el) return;
    const legacy = app.legacyTrips();
    el.hidden = migrationDismissed || !currentUser || !legacy?.length;
  };
  const writePending = (trips, baseRevision) => {
    try {
      localStorage.setItem(storageKey(currentUser.uid), JSON.stringify({trips, baseRevision, savedAt: new Date().toISOString()}));
    } catch (_) { warning('Sauvegarde locale de secours impossible. Exportez vos voyages au format JSON.'); }
  };
  const flush = async () => {
    if (!currentUser || !pending || saving || conflict) return;
    const userUid = currentUser.uid;
    const batch = pending;
    const expected = revision;
    pending = null;
    saving = true;
    status('Synchronisation…');
    try {
      const {runTransaction, serverTimestamp} = sdk.firestore;
      const newRevision = await runTransaction(firestore, async tx => {
        const snapshot = await tx.get(currentRef);
        const remoteRevision = snapshot.exists() ? snapshot.data().revision : 0;
        if (remoteRevision !== expected) throw new Error('REVISION_CONFLICT');
        tx.set(currentRef, {schemaVersion: 1, revision: remoteRevision + 1, trips: batch, updatedAt: serverTimestamp()});
        return remoteRevision + 1;
      });
      if (!currentUser || currentUser.uid !== userUid) return;
      revision = newRevision;
      retryCount = 0;
      if (pending) writePending(pending, revision);
      if (!pending) {
        try { localStorage.removeItem(storageKey(userUid)); } catch (_) {}
        status('Enregistré dans le cloud');
        warning();
      }
    } catch (e) {
      if (!currentUser || currentUser.uid !== userUid) return;
      pending = pending || batch;
      if (e.message === 'REVISION_CONFLICT') {
        conflict = true;
        window.ITIVARO_CLOUD.ready = false;
        status('Conflit : données non synchronisées');
        warning('Le voyage a changé sur un autre appareil. Exportez votre copie JSON avant de recharger la version cloud.');
      } else {
        status('Non synchronisé — réessayer');
        warning('La sauvegarde cloud a échoué. Une copie de secours locale est conservée lorsque possible. Réessayez avant de quitter.');
      }
      retryCount = Math.min(8, retryCount + 1);
      console.error('[ITIVARO] Sync error', e);
    } finally {
      saving = false;
      if (pending && !conflict && currentUser?.uid === userUid) {
        clearTimeout(timer);
        timer = setTimeout(flush, Math.min(45000, 950 * Math.pow(2, retryCount))); 
      }
    }
  };
  window.ITIVARO_CLOUD = {
    ready: false,
    canAccept,
    queue(trips) {
      const snapshot = JSON.parse(JSON.stringify(trips));
      pending = snapshot;
      writePending(snapshot, revision);
      status('Modifications en attente…');
      clearTimeout(timer);
      timer = setTimeout(flush, 350);
    }
  };
  async function loadAccount(user) {
    const mySession = ++session;
    if (unsub) {unsub(); unsub = null;}
    clearTimeout(timer);
    currentUser = user;
    pending = null;
    conflict = false;
    window.ITIVARO_CLOUD.ready = false;
    document.documentElement.classList.remove('cloud-authenticated');
    gate.hidden = false;
    gateTitle.textContent = 'Chargement de vos voyages…';
    gateHint.textContent = 'Connexion sécurisée à votre espace personnel.';
    feedback();
    status('Chargement…');
    try {
      const {doc,getDoc,onSnapshot} = sdk.firestore;
      currentRef = doc(firestore, 'users', user.uid, 'state', 'current');
      const remote = await getDoc(currentRef);
      if (mySession !== session) return;
      const remoteData = remote.exists() ? remote.data() : null;
      const list = remoteData ? remoteData.trips : [];
      if (!app.replaceTrips(list)) throw Error('CLOUD_INVALID');
      revision = remoteData ? remoteData.revision : 0;
      window.ITIVARO_CLOUD.ready = true;
      $('cloudUserEmail').textContent = user.email || 'Compte connecté';
      cloudBar.hidden = false;
      $('authSignOut').hidden = true;
      gate.hidden = true;
      showMigration();
      document.documentElement.classList.add('cloud-authenticated');
      status('Enregistré dans le cloud');
      warning();
      // Une sauvegarde interrompue doit être récupérée explicitement, jamais silencieusement.
      let backup = null;
      try { backup = JSON.parse(localStorage.getItem(storageKey(user.uid)) || 'null'); } catch (_) {}
      if (backup?.trips && app.isValidTrips(backup.trips)) {
        warning('Une sauvegarde locale non synchronisée a été trouvée. Restaurez-la ou exportez-la avant de continuer.');
        const restore = window.confirm('Des changements non synchronisés existent sur cet appareil. Voulez-vous tenter de les restaurer ?');
        if (restore && backup.baseRevision === revision) {
          app.replaceTrips(backup.trips);
          window.ITIVARO_CLOUD.queue(backup.trips);
        } else if (restore) {
          conflict = true;
          window.ITIVARO_CLOUD.ready = false;
          status('Conflit — copie locale conservée');
          app.replaceTrips(backup.trips);
          warning('Les données distantes ont changé. Exportez votre copie locale avant de recharger les données du cloud.');
        }
      }
      unsub = onSnapshot(currentRef, snap => {
        if (mySession !== session || !snap.exists() || saving || pending || conflict) return;
        const d = snap.data();
        if (d.revision > revision && app.replaceTrips(d.trips)) {
          revision = d.revision;
          status('Mis à jour depuis le cloud');
        }
      }, e => {
        console.warn('[ITIVARO] Listener error', e);
        warning('La synchronisation en direct a été interrompue. Actualisez votre page pour vérifier les dernières modifications.');
      });
    } catch (e) {
      console.error('[ITIVARO] Loading error', e);
      if (mySession !== session) return;
      gate.hidden = false;
      gateTitle.textContent = 'Connexion impossible';
      $('authSignOut').hidden = false;
      gateHint.textContent = 'Le compte est reconnu, mais ses voyages ne peuvent pas être chargés.';
      feedback(e.message === 'CLOUD_INVALID' ? 'Données cloud invalides. Ne modifiez rien et contactez l’administrateur.' : authError(e), true);
      status('Connexion indisponible');
      cloudBar.hidden = false;
    }
  }
  async function logout() {
    if (pending || saving) {
      if (!window.confirm('Des changements sont encore en attente de synchronisation. Une copie locale de secours est conservée lorsque possible. Se déconnecter ?')) return;
    }
    await sdk.auth.signOut(firebaseAuth);
  }
  async function reloadCloud() {
    if (!currentUser) return;
    if ((pending || conflict) && !window.confirm('Avant de recharger le cloud, exportez votre copie JSON si nécessaire. Continuer ?')) return;
    const uid = currentUser.uid;
    try { localStorage.removeItem(storageKey(uid)); } catch (_) {}
    await loadAccount(currentUser);
  }
  $('importLocalTrips').addEventListener('click', () => {
    const legacy = app.legacyTrips();
    if (!legacy?.length || !app.isValidTrips(legacy)) {warning('Aucun voyage local compatible trouvé. Utilisez l’importation JSON si vous avez une sauvegarde.');return}
    if (!window.ITIVARO_CLOUD.ready) {warning('Attendez la fin de la connexion cloud.');return}
    const haveCloud = app.getTrips().length;
    const msg = haveCloud
      ? 'ATTENTION : les voyages actuels de ce compte seront REMPLACÉS par ceux stockés sur cet appareil. Exportez une sauvegarde JSON avant de confirmer. Continuer ?'
      : 'Importer vos voyages enregistrés localement vers ce compte ? Ils resteront aussi sur cet appareil.';
    if (!window.confirm(msg)) return;
    if (!window.ITIVARO_CLOUD.canAccept(legacy)) return;
    app.replaceTrips(legacy);
    window.ITIVARO_CLOUD.queue(legacy);
    migrationDismissed = true;
    $('legacyMigration').hidden = true;
  });
  $('dismissLegacy').addEventListener('click',()=>{migrationDismissed=true;$('legacyMigration').hidden=true});
  $('googleSignIn').addEventListener('click', async () => {
    feedback();
    try {
      if (!firebaseAuth || !sdk) throw Error('FIREBASE_NOT_READY');
      await sdk.auth.signInWithPopup(firebaseAuth, new sdk.auth.GoogleAuthProvider());
    } catch (e) { feedback(e.message === 'FIREBASE_NOT_READY'?'Initialisation en cours, réessayez.':authError(e),true); }
  });
  window.addEventListener('online', () => { if (pending && !saving && !conflict) { clearTimeout(timer); timer=setTimeout(flush,250); } });
  $('authSwitch').addEventListener('click', () => { authMode = authMode === 'signin' ? 'signup' : 'signin'; renderAuth(); });
  $('forgotPassword').addEventListener('click', async () => {
    const email = $('authEmail').value.trim();
    if (!email) { feedback('Indiquez votre adresse e-mail avant de demander un nouveau mot de passe.', true); return; }
    try {
      await sdk.auth.sendPasswordResetEmail(firebaseAuth, email);
      feedback('Si le compte existe, un e-mail de réinitialisation a été demandé.');
    } catch (e) { feedback(authError(e), true); }
  });
  $('authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('authEmail').value.trim();
    const password = $('authPassword').value;
    gateSubmit.disabled = true;
    feedback();
    try {
      if (authMode === 'signup' && config.allowSignup) await sdk.auth.createUserWithEmailAndPassword(firebaseAuth,email,password);
      else await sdk.auth.signInWithEmailAndPassword(firebaseAuth,email,password);
      $('authPassword').value = '';
    } catch (error) { feedback(authError(error), true); }
    finally { gateSubmit.disabled = false; }
  });
  $('cloudSignOut').addEventListener('click', logout);
  $('authSignOut').addEventListener('click', logout);
  $('cloudRetry').addEventListener('click', () => {
    if (conflict) reloadCloud();
    else if (pending) flush();
    else if (currentUser) loadAccount(currentUser);
  });
  gate.hidden = false;
  renderAuth();
  (async () => {
    try {
      const [appSdk, authSdk, firestoreSdk] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
      ]);
      sdk = {auth:authSdk,firestore:firestoreSdk};
      const firebase = appSdk.initializeApp(config);
      firebaseAuth = authSdk.getAuth(firebase);
      firestore = firestoreSdk.getFirestore(firebase);
      authSdk.onAuthStateChanged(firebaseAuth, user => {
        if (user) loadAccount(user);
        else {
          ++session;
          if (unsub) {unsub(); unsub=null;}
          clearTimeout(timer);
          currentUser = null; pending = null; saving = false; conflict = false;
          window.ITIVARO_CLOUD.ready = false;
          app.replaceTrips([]);
          cloudBar.hidden = true;
          $('legacyMigration').hidden = true;
          document.documentElement.classList.remove('cloud-authenticated');
          gate.hidden = false;
          $('authSignOut').hidden = true;
          renderAuth();
          status('Connexion requise');
          warning();
        }
      }, error => feedback(authError(error), true));
    } catch (error) {
      console.error('[ITIVARO] Firebase initialization failed',error);
      gateTitle.textContent = 'Connexion indisponible';
      gateHint.textContent = 'Firebase ne peut pas être chargé. Vérifiez la configuration et votre connexion Internet.';
      feedback('La connexion Firebase a échoué. Rechargez la page après vérification.', true);
    }
  })();
}
