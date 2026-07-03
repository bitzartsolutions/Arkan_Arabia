/* ============================================================
   Arkan Arabia – Main Script
   ============================================================ */

/* ── 1. Inject shared header & footer ──────────────────────── */
async function loadComponent(selector, url) {
  try {
    const res  = await fetch(url);
    let html   = await res.text();
    /* Replace {ROOT} tokens so component links are always correct */
    html = html.replaceAll('{ROOT}', rootPath());
    document.querySelector(selector).innerHTML = html;
  } catch (e) {
    console.warn(`Could not load component: ${url}`, e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadComponent('#site-header', rootPath() + 'components/header.html'),
    loadComponent('#site-footer', rootPath() + 'components/footer.html'),
  ]);

  initNav();
  initReveal();
  initCounters();
  highlightActiveNav();
});

/* Determine root path relative to current page depth */
function rootPath() {
  const depth = location.pathname.split('/').filter(Boolean).length;
  /* In a flat or root-served project depth is usually 0-1 */
  if (location.pathname.includes('/pages/')) return '../';
  return './';
}

/* ── 2. Sticky Navbar ───────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const inner = nav.querySelector('[data-nav-inner]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      nav.classList.add('nav-scrolled');
      nav.classList.remove('translate-y-8');
      if (inner) {
        inner.classList.remove('max-w-7xl');
        inner.classList.add('max-w-full');
      }
    } else {
      nav.classList.remove('nav-scrolled');
      nav.classList.add('translate-y-8');
      if (inner) {
        inner.classList.add('max-w-7xl');
        inner.classList.remove('max-w-full');
      }
    }
  }, { passive: true });

  /* Mobile menu toggle */
  const menuBtn  = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

/* ── 3. Scroll Reveal ───────────────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── 4. Animated Counters ───────────────────────────────────── */
function initCounters() {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      const suffix = el.getAttribute('data-suffix') || (target === 100 ? '%' : '+');
      let count    = 0;
      const step   = target / (2000 / 16);

      const tick = () => {
        count += step;
        if (count < target) {
          el.innerText = Math.ceil(count);
          requestAnimationFrame(tick);
        } else {
          el.innerText = target + suffix;
        }
      };
      tick();
      counterObserver.unobserve(el);
    });
  });

  document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));
}

/* ── 5. Highlight active nav link ───────────────────────────── */
function highlightActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === page) link.classList.add('active');
  });
}

/* ── 6. Fleet carousel buttons ─────────────────────────────── */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-fleet-prev], [data-fleet-next]');
  if (!btn) return;
  const rail = document.getElementById('fleet-rail');
  if (!rail) return;
  const card = rail.querySelector('.fleet-card');
  const cardW = card ? card.offsetWidth + 24 : 424;
  rail.scrollBy({ left: btn.dataset.fleetNext !== undefined ? cardW : -cardW, behavior: 'smooth' });
});
