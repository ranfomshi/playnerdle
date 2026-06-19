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
};

function sendEvent(eventName, params) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params);
  }

  if (window.mixpanel && typeof window.mixpanel.track === 'function') {
    window.mixpanel.track(eventName, params);
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

function injectRelatedGames() {
  const pageKey = getPageKey();
  const meta = gameMeta[pageKey];

  if (!meta) {
    return;
  }

  const related = Object.entries(gameMeta)
    .filter(([href]) => href !== pageKey)
    .slice(0, 3);

  const wrapper = document.createElement('aside');
  wrapper.setAttribute('aria-label', 'Related games');
  wrapper.style.cssText = 'max-width:760px;margin:24px auto;padding:14px 16px;border-radius:12px;background:#ffffff0f;border:1px solid #ffffff2a;font-family:Arial,sans-serif;color:#fff;';
  wrapper.innerHTML = `
    <p style="margin:0 0 8px 0;font-weight:700;">If you like ${meta.name}, try next:</p>
    <ul style="margin:0;padding-left:18px;display:grid;gap:6px;">
      ${related.map(([href, item]) => `<li><a style="color:#9ad8ff" href="${href}/">${item.name}</a> <span style="opacity:.75">(${item.category})</span></li>`).join('')}
    </ul>
    <div style="margin-top:12px;padding:10px 12px;border-radius:10px;border:1px solid #ffffff2a;background:#0f172acc;">
      <p style="margin:0 0 8px;font-size:.95rem;">Enjoying Bludle? Keep games free and ad-light for everyone.</p>
      <a href="https://www.buymeacoffee.com/stuart1510K" target="_blank" rel="noopener" data-support-cta="related_games" style="display:inline-block;background:#fde047;color:#111827;padding:7px 12px;border-radius:999px;text-decoration:none;font-weight:700;">Support Bludle</a>
    </div>
  `;

  wrapper.querySelectorAll('a[href]').forEach((link) => {
    const isSupportLink = link.dataset.supportCta;
    link.addEventListener('click', () => {
      if (isSupportLink) {
        sendEvent('support_cta_click', {
          source_page: pageKey,
          placement: isSupportLink,
        });
        return;
      }

      sendEvent('play_next_click', {
        source_game: meta.name,
        destination: link.getAttribute('href'),
      });
    });
  });

  document.body.appendChild(wrapper);
  sendEvent('support_cta_view', {
    source_page: pageKey,
    placement: 'related_games',
  });
}

function injectShareButton() {
  const pageKey = getPageKey();
  const meta = gameMeta[pageKey];

  if (!meta) {
    return;
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Share this game';
  btn.style.cssText = 'position:fixed;bottom:16px;right:16px;padding:10px 14px;border-radius:999px;border:0;background:#111;color:#fff;z-index:9998;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.35);';

  btn.addEventListener('click', async () => {
    const shareData = {
      title: `${meta.name} on Bludle`,
      text: `Play ${meta.name} on Bludle`,
      url: `https://www.bludle.com${pageKey}/?ref=share`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        btn.textContent = 'Link copied!';
        setTimeout(() => {
          btn.textContent = 'Share this game';
        }, 1800);
      }
      sendEvent('gameShare', { game_name: meta.name, page_path: pageKey });
    } catch (error) {
      // no-op: user may cancel share dialog
    }
  });

  document.body.appendChild(btn);
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
  injectRelatedGames();
  injectShareButton();

  const key = 'bludle_session_started';
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1');
    sendEvent('session_start', {
      source_page: getPageKey() || '/',
      device_type: window.matchMedia('(max-width: 700px)').matches ? 'mobile' : 'desktop',
    });
  }
});
