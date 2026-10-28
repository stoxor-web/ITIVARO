(() => {
  'use strict';
  const KEY = 'itivaro-display-v12';
  const root = document.documentElement;
  const reading = document.getElementById('readingToggle');
  const focus = document.getElementById('focusToggle');
  let prefs = {comfortable: false, focus: false};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (typeof saved.comfortable === 'boolean') prefs.comfortable = saved.comfortable;
    if (typeof saved.focus === 'boolean') prefs.focus = saved.focus;
  } catch (_) { /* Les réglages sont optionnels et n'affectent jamais les voyages. */ }
  function apply() {
    root.classList.toggle('readable-mode', prefs.comfortable);
    root.classList.toggle('focus-mode', prefs.focus);
    reading.setAttribute('aria-pressed', String(prefs.comfortable));
    focus.setAttribute('aria-pressed', String(prefs.focus));
    reading.setAttribute('aria-label', prefs.comfortable ? 'Désactiver le confort de lecture' : 'Activer le confort de lecture');
    focus.setAttribute('aria-label', prefs.focus ? 'Afficher le panneau latéral' : 'Masquer le panneau latéral');
    focus.title = prefs.focus ? 'Afficher le panneau latéral' : 'Masquer le panneau latéral';
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (_) { /* mode privé */ }
  }
  reading.addEventListener('click', () => { prefs.comfortable = !prefs.comfortable; apply(); });
  focus.addEventListener('click', () => { prefs.focus = !prefs.focus; apply(); });
  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    const isTyping = active && (['INPUT','TEXTAREA','SELECT'].includes(active.tagName) || active.isContentEditable);
    const dialogOpen = !!document.querySelector('dialog[open]');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialogOpen) return;
      const nav = document.querySelector('.nav-link[data-view="voyages"]');
      if (!document.getElementById('search')) nav?.click();
      requestAnimationFrame(() => document.getElementById('search')?.focus());
    }
    if (!isTyping && !dialogOpen && e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      document.getElementById('newTrip')?.click();
    }
  });
  apply();
})();
