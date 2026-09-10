document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLogoToy();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

function initLogoToy() {
  const toy = document.getElementById('logo-toy');
  if (!toy) return;

  const REVIVE_MS = 2400;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  toy.querySelectorAll('.blk').forEach(blk => {
    blk.addEventListener('click', () => {
      if (blk.classList.contains('gone') || blk.classList.contains('reviving')) return;

      splash(toy, blk);
      blk.classList.add('gone');

      setTimeout(() => {
        blk.classList.remove('gone');
        blk.classList.add('reviving');
        blk.addEventListener('animationend', function done() {
          blk.classList.remove('reviving');
          blk.removeEventListener('animationend', done);
        });
      }, REVIVE_MS);
    });
  });

  function splash(container, blk) {
    if (reduceMotion.matches) return;
    const c = container.getBoundingClientRect();
    const b = blk.getBoundingClientRect();
    const cx = b.left - c.left + b.width / 2;
    const cy = b.top - c.top + b.height / 2;
    const drops = 6;

    for (let i = 0; i < drops; i++) {
      const drop = document.createElement('span');
      drop.className = 'droplet';
      const angle = (Math.PI * 2 * i) / drops + (Math.random() - 0.5) * 0.7;
      const dist = b.width * (0.55 + Math.random() * 0.6);
      drop.style.left = cx + 'px';
      drop.style.top = cy + 'px';
      drop.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      drop.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      drop.style.setProperty('--sz', (b.width * (0.14 + Math.random() * 0.16)).toFixed(1) + 'px');
      drop.addEventListener('animationend', () => drop.remove());
      container.appendChild(drop);
    }
  }
}

function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  let stored = null;
  try {
    stored = localStorage.getItem('theme');
  } catch (e) { /* storage unavailable */ }

  if (stored === 'light' || stored === 'dark') {
    root.setAttribute('data-theme', stored);
  }

  toggle.addEventListener('click', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) { /* storage unavailable */ }
  });
}
