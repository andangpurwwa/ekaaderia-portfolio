const header = document.querySelector('.site-header');
const progress = document.getElementById('scrollProgress');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let ticking = false;
function updateScrollUI() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 18);

  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const ratio = max ? Math.min(Math.max(y / max, 0), 1) : 0;
  progress.style.transform = `scaleX(${ratio})`;

  let current = 'home';
  sections.forEach(section => {
    if (y >= section.offsetTop - 180) current = section.id;
  });
  navLinks.forEach(link => {
    const active = link.getAttribute('href') === `#${current}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  ticking = false;
}

function requestScrollUpdate() {
  if (!ticking) {
    requestAnimationFrame(updateScrollUI);
    ticking = true;
  }
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate, { passive: true });
updateScrollUI();

function closeMenu() {
  navMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navLinks.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});
document.addEventListener('click', event => {
  if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) closeMenu();
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -25px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || '';

    if (prefersReducedMotion) {
      el.textContent = `${target}${suffix}`;
      counterObserver.unobserve(el);
      return;
    }

    const duration = 950;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = `${Math.floor(target * eased)}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: .45 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

const filterBtns = [...document.querySelectorAll('.filter-btn')];
const timelineItems = [...document.querySelectorAll('.timeline-item')];
const showMoreBtn = document.getElementById('showMoreBtn');
let expanded = false;
let currentFilter = 'all';

function applyTimelineFilter() {
  timelineItems.forEach(item => {
    const categoryMatch = currentFilter === 'all' || item.dataset.category === currentFilter;
    const extraAllowed = expanded || !item.classList.contains('hidden-extra');
    item.style.display = categoryMatch && extraAllowed ? 'grid' : 'none';
  });
}

filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  applyTimelineFilter();
}));

if (showMoreBtn) {
  showMoreBtn.addEventListener('click', () => {
    expanded = !expanded;
    showMoreBtn.textContent = expanded ? 'Show fewer activities' : 'Show all activities';
    applyTimelineFilter();
  });
}

applyTimelineFilter();

// Interactive spotlight effect for interactive cards
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const interactiveCards = document.querySelectorAll('.experience-card, .project-card, .skill-panel, .contact-card, .education-card, .cert-card');
  interactiveCards.forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });

  // Very subtle hero depth movement for a more polished landing experience.
  const hero = document.querySelector('.hero');
  const profileCard = document.querySelector('.profile-card');
  const glowOne = document.querySelector('.hero-glow-1');
  const glowTwo = document.querySelector('.hero-glow-2');

  if (hero && profileCard && !prefersReducedMotion) {
    hero.addEventListener('pointermove', event => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      profileCard.style.setProperty('--tilt-y', `${x * 4.5}deg`);
      profileCard.style.setProperty('--tilt-x', `${y * -3.5}deg`);
      if (glowOne) glowOne.style.transform = `translate3d(${x * 18}px, ${y * 14}px, 0)`;
      if (glowTwo) glowTwo.style.transform = `translate3d(${x * -12}px, ${y * -10}px, 0)`;
    });

    hero.addEventListener('pointerleave', () => {
      profileCard.style.setProperty('--tilt-y', '0deg');
      profileCard.style.setProperty('--tilt-x', '0deg');
      if (glowOne) glowOne.style.transform = '';
      if (glowTwo) glowTwo.style.transform = '';
    });
  }
}

// Certificate Filtering & Direct High-Res Preview
const certFilterBtns = [...document.querySelectorAll('.cert-filter-btn')];
const certCards = [...document.querySelectorAll('.cert-card')];

// Filter tabs
certFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    certFilterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.certFilter;
    certCards.forEach(card => {
      const match = filter === 'all' || card.dataset.certCat === filter;
      card.style.display = match ? 'flex' : 'none';
    });
  });
});

// Click certificate card to open high-res image directly in a new tab
certCards.forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const imgSrc = card.dataset.certImg;
    if (imgSrc) {
      window.open(imgSrc, '_blank', 'noopener,noreferrer');
    }
  });
});
