// ---------- HERO PARALLAX (solo existe en index.html) ----------
const heroBg = document.getElementById('heroBg');
if (heroBg) {
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 24;
    const y = (e.clientY / window.innerHeight - 0.5) * 24;
    heroBg.querySelector('svg').style.transform = 'translate(' + x + 'px,' + y + 'px)';
  });
}

// ---------- SCROLL REVEAL ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('in'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---------- PESTAÑAS (accesibles, con enlace directo por #id) ----------
document.querySelectorAll('[data-tabs]').forEach((list) => {
  const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
  const panelOf = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

  function select(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      const p = panelOf(t);
      if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      select(tab, false);
      const id = tab.getAttribute('aria-controls');
      if (id && history.replaceState) history.replaceState(null, '', '#' + id);
    });
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });

  // Estado inicial: la pestaña indicada por el hash, o la que está marcada
  const fromHash = tabs.find((t) => '#' + t.getAttribute('aria-controls') === location.hash);
  const initial = fromHash || tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
  select(initial, false);
  if (fromHash) {
    const p = panelOf(fromHash);
    if (p) setTimeout(() => p.scrollIntoView({ block: 'start' }), 60);
  }
});

// ---------- LÍNEA DE TIEMPO DINÁMICA ----------
document.querySelectorAll('[data-timeline]').forEach((box) => {
  const btns = Array.from(box.querySelectorAll('.tl-btn'));
  const detail = box.querySelector('.tl-detail');
  const show = (btn, focus) => {
    btns.forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
    detail.replaceChildren();
    const d = document.createElement('div'); d.className = 'd'; d.textContent = btn.dataset.date;
    const h = document.createElement('h4'); h.textContent = btn.dataset.title;
    const p = document.createElement('p'); p.textContent = btn.dataset.body;
    detail.append(d, h, p);
    if (focus) btn.focus();
  };
  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => show(btn, false));
    btn.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = btns[(i + 1) % btns.length];
      if (e.key === 'ArrowLeft') next = btns[(i - 1 + btns.length) % btns.length];
      if (next) { e.preventDefault(); show(next, true); }
    });
  });
  if (btns.length) show(btns[0], false);
});

// ---------- VISOR DE IMÁGENES (clic para ampliar) ----------
(function () {
  const imgs = Array.from(document.querySelectorAll('.fig img, .exp-media img'));
  if (!imgs.length) return;
  let lastFocus = null, box = null;

  function close() {
    if (!box) return;
    box.remove(); box = null;
    document.removeEventListener('keydown', onKey);
    if (lastFocus) lastFocus.focus();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  function open(img) {
    lastFocus = img;
    const fig = img.closest('figure, .exp-media');
    const capEl = fig && fig.querySelector('figcaption, .cap');
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', img.alt || 'Imagen ampliada');
    const x = document.createElement('button');
    x.className = 'lb-close'; x.type = 'button'; x.setAttribute('aria-label', 'Cerrar'); x.textContent = '×';
    const big = document.createElement('img');
    big.src = img.currentSrc || img.src; big.alt = img.alt;
    box.append(x, big);
    if (capEl) { const c = document.createElement('div'); c.className = 'lb-cap'; c.textContent = capEl.textContent; box.append(c); }
    box.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(box);
    x.focus();
  }

  imgs.forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); } });
  });
})();

// ---------- BUSCADOR DE TÉRMINOS ----------
const gsearch = document.getElementById('gsearch');
if (gsearch) {
  const terms = Array.from(document.querySelectorAll('#gterm-grid .gterm'));
  const empty = document.getElementById('gempty');
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  gsearch.addEventListener('input', () => {
    const q = norm(gsearch.value.trim());
    let shown = 0;
    terms.forEach((t) => {
      const match = !q || norm(t.textContent).includes(q);
      t.hidden = !match;
      if (match) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  });
}

// ---------- BARRA DE LECTURA (solo en páginas de expediente) ----------
if (document.querySelector('.exp-head')) {
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
