import { navLinks } from './navLinks.js';

const gameMeta = {
  '/werdle': { name: 'Werdle', category: 'Word Game' },
  '/reaction': { name: 'Reaction', category: 'Speed Game' },
  '/shiftyfades': { name: 'Shifty Fades', category: 'Colour Game' },
  '/colourmatch': { name: 'Colour Match', category: 'Colour Game' },
  '/bludle': { name: 'Bludle', category: 'Word Game' },
  '/heardle': { name: 'Heardle', category: 'Audio Game' },
  '/codle': { name: 'Codle', category: 'Word Game' },
  '/hunt': { name: 'XY Marks the Spot', category: 'Logic Game' },
  '/guesshue': { name: 'Guess Hue', category: 'Colour Game' },
  '/alternate': { name: 'Alternate', category: 'Speed Game' },
  '/trak': { name: 'Trak', category: 'Speed Game' },
  '/tintuition': { name: 'Tintuition', category: 'Colour Game' },
  '/connex': { name: 'Connex', category: 'Word Game' },
  '/seequence': { name: 'Seequence', category: 'Memory Game' },
  '/wordmash': { name: 'Word Mash', category: 'Word Game' },
  '/snoules': { name: 'Snoules', category: 'Arcade Game' },
};

function sendEvent(eventName, params) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params);
  }
}

function createNavbarHTML() {
  const nav = document.createElement('nav');
  nav.className = 'globalNav';

  const brand = document.createElement('div');
  brand.className = 'brand';

  const brandLink = document.createElement('a');
  brandLink.className = 'brand-link';
  brandLink.href = '/';
  brandLink.textContent = 'Bludle';
  brandLink.addEventListener('click', () => {
    sendEvent('navSelection', { interaction_type: 'click', item_name: 'home' });
  });

  const brandLogo = document.createElement('img');
  brandLogo.src = '/images/icon.png';
  brandLogo.alt = 'Bludle logo';

  brand.appendChild(brandLink);
  brand.appendChild(brandLogo);
  nav.appendChild(brand);

  const dropdownToggle = document.createElement('button');
  dropdownToggle.className = 'menu-toggle';
  dropdownToggle.id = 'dropdown-toggle';
  dropdownToggle.type = 'button';
  dropdownToggle.setAttribute('aria-expanded', 'false');
  dropdownToggle.setAttribute('aria-controls', 'dropdown-menu');
  dropdownToggle.textContent = 'Menu ☰';
  nav.appendChild(dropdownToggle);

  const dropdownMenu = document.createElement('ul');
  dropdownMenu.className = 'dropdown-menu';
  dropdownMenu.id = 'dropdown-menu';

  navLinks.forEach((link) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.name;
    a.addEventListener('click', () => {
      sendEvent('navSelection', { interaction_type: 'click', item_name: link.name });
      dropdownMenu.classList.remove('active');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    });
    li.appendChild(a);
    dropdownMenu.appendChild(li);
  });

  nav.appendChild(dropdownMenu);
  return nav;
}

function syncNavMetrics(nav) {
  if (!nav) {
    return;
  }

  const root = document.documentElement;
  const navHeight = Math.ceil(nav.getBoundingClientRect().height);
  root.style.setProperty('--global-nav-height', `${navHeight}px`);
  root.style.setProperty('--global-toast-top', `calc(${navHeight}px + var(--global-ui-gap))`);
}

function getPageKey() {
  return window.location.pathname.replace(/\/$/, '').toLowerCase();
}

function injectBreadcrumbSchema() {
  const pageKey = getPageKey();
  const meta = gameMeta[pageKey];

  if (!meta) {
    return;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bludle', item: 'https://www.bludle.com/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: meta.name,
        item: `https://www.bludle.com${pageKey}/`,
      },
    ],
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('navbar-container');
  if (!container) {
    return;
  }

  const nav = createNavbarHTML();
  container.appendChild(nav);

  const toggle = document.getElementById('dropdown-toggle');
  const dropdown = document.getElementById('dropdown-menu');

  syncNavMetrics(nav);

  toggle.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(isOpen));
    syncNavMetrics(nav);
  });

  document.addEventListener('click', (event) => {
    if (!toggle.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('resize', () => syncNavMetrics(nav));

  injectBreadcrumbSchema();
});
