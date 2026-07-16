(function () {
  'use strict';

  const games = [
    { name: 'Werdle', href: '/werdle/', category: 'Word' },
    { name: 'Bludle', href: '/bludle/', category: 'Word' },
    { name: 'Codle', href: '/codle/', category: 'Word' },
    { name: 'Connex', href: '/connex/', category: 'Word' },
    { name: 'Word Mash', href: '/wordmash/', category: 'Word' },
    { name: 'Shifty Fades', href: '/shiftyfades/', category: 'Colour' },
    { name: 'Colour Match', href: '/colourmatch/', category: 'Colour' },
    { name: 'Chroma Lock', href: '/chromalock/', category: 'Colour' },
    { name: 'Guess Hue', href: '/guesshue/', category: 'Colour' },
    { name: 'Tintuition', href: '/tintuition/', category: 'Colour' },
    { name: 'XY', href: '/hunt/', category: 'Logic' },
    { name: 'Seequence', href: '/seequence/', category: 'Logic' },
    { name: 'Heardle', href: '/heardle/', category: 'Audio' },
    { name: 'Reaction', href: '/reaction/', category: 'Speed' },
    { name: 'Alternate', href: '/alternate/', category: 'Speed' },
    { name: 'Trak', href: '/trak/', category: 'Speed' }
  ];

  const categories = [
    { name: 'Word', label: 'Word games', mark: 'Aa' },
    { name: 'Colour', label: 'Colour games', mark: '◒' },
    { name: 'Logic', label: 'Logic & memory', mark: '◇' },
    { name: 'Speed', label: 'Speed games', mark: '↯' },
    { name: 'Audio', label: 'Audio games', mark: '♪' }
  ];

  const normalizePath = path => {
    const normalized = path.toLowerCase().replace(/\/index\.html$/, '').replace(/\/$/, '');
    return normalized || '/';
  };

  const currentPath = () => normalizePath(window.location.pathname);

  function track(eventName, params) {
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    if (window.mixpanel && typeof window.mixpanel.track === 'function') window.mixpanel.track(eventName, params);
  }

  function ensureStyles() {
    if (document.querySelector('link[href*="globalNav.css"]')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/globalNav/globalNav.css';
    stylesheet.dataset.pnNavStyles = '';
    document.head.append(stylesheet);
  }

  function icon(name) {
    const paths = {
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      chevron: '<path d="m8 10 4 4 4-4"/>',
      arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
  }

  function gameGroups() {
    return categories.map(category => {
      const links = games.filter(game => game.category === category.name).map(game => {
        const active = currentPath() === normalizePath(game.href);
        return `<li><a class="pn-nav__game${active ? ' is-current' : ''}" href="${game.href}"${active ? ' aria-current="page"' : ''}><span>${game.name}</span>${icon('arrow')}</a></li>`;
      }).join('');
      return `<section class="pn-nav__group" aria-labelledby="pn-group-${category.name.toLowerCase()}"><h2 id="pn-group-${category.name.toLowerCase()}"><span aria-hidden="true">${category.mark}</span>${category.label}</h2><ul>${links}</ul></section>`;
    }).join('');
  }

  function createNav() {
    const wrapper = document.createElement('div');
    wrapper.className = 'pn-nav';
    wrapper.innerHTML = `
      <a class="pn-nav__skip" href="#main-content">Skip to content</a>
      <nav class="pn-nav__bar" aria-label="Primary navigation">
        <div class="pn-nav__inner">
          <a class="pn-nav__brand" href="/" aria-label="Bludle home">
            <span class="pn-nav__brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
            <span>BLUDLE<span class="pn-nav__brand-dot">.</span></span>
          </a>
          <div class="pn-nav__desktop-links">
            <a href="/"${currentPath() === '/' ? ' aria-current="page"' : ''}>Home</a>
            <button class="pn-nav__games-button" type="button" aria-expanded="false" aria-controls="pn-nav-panel">Games ${icon('chevron')}</button>
            <a href="/blogs/"${currentPath() === '/blogs' ? ' aria-current="page"' : ''}>Journal</a>
            <a href="/about/"${currentPath() === '/about' ? ' aria-current="page"' : ''}>About</a>
          </div>
          <a class="pn-nav__surprise" href="${games[Math.floor(Math.random() * games.length)].href}">Surprise me <span aria-hidden="true">↗</span></a>
          <button class="pn-nav__mobile-button" type="button" aria-expanded="false" aria-controls="pn-nav-panel" aria-label="Open games menu">${icon('menu')}</button>
        </div>
      </nav>
      <div class="pn-nav__backdrop" aria-hidden="true"></div>
      <div class="pn-nav__panel" id="pn-nav-panel" aria-hidden="true">
        <div class="pn-nav__panel-head">
          <div><p>Game library</p><strong>Pick your next challenge.</strong></div>
          <button class="pn-nav__close" type="button" aria-label="Close games menu">${icon('close')}</button>
        </div>
        <div class="pn-nav__groups">${gameGroups()}</div>
        <div class="pn-nav__panel-foot">
          <a href="/">Browse all games ${icon('arrow')}</a>
          <div><a href="/blogs/">Journal</a><a href="/about/">About</a></div>
        </div>
      </div>`;
    return wrapper;
  }

  function enhanceMainLandmark() {
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main && !main.id) main.id = 'main-content';
    const skip = document.querySelector('.pn-nav__skip');
    if (skip && !document.getElementById('main-content')) skip.remove();
  }

  function setupInteractions(nav) {
    const panel = nav.querySelector('.pn-nav__panel');
    const backdrop = nav.querySelector('.pn-nav__backdrop');
    const triggers = [...nav.querySelectorAll('[aria-controls="pn-nav-panel"]')];
    const closeButton = nav.querySelector('.pn-nav__close');
    let returnFocus = null;

    const setOpen = open => {
      nav.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', String(!open));
      triggers.forEach(trigger => trigger.setAttribute('aria-expanded', String(open)));
      nav.querySelector('.pn-nav__mobile-button').setAttribute('aria-label', open ? 'Close games menu' : 'Open games menu');
      document.documentElement.classList.toggle('pn-nav-lock', open && window.innerWidth < 760);
      if (open) {
        returnFocus = document.activeElement;
        window.requestAnimationFrame(() => panel.querySelector('a, button')?.focus());
      } else if (returnFocus && nav.contains(returnFocus)) returnFocus.focus();
    };

    triggers.forEach(trigger => trigger.addEventListener('click', () => setOpen(!nav.classList.contains('is-open'))));
    closeButton.addEventListener('click', () => setOpen(false));
    backdrop.addEventListener('click', () => setOpen(false));
    panel.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', event => {
      if (!nav.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...panel.querySelectorAll('a[href], button:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    window.addEventListener('resize', () => { if (nav.classList.contains('is-open')) setOpen(false); }, { passive: true });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => track('navSelection', {
      interaction_type: 'click', item_name: link.textContent.trim(), destination: link.getAttribute('href')
    })));
  }

  function syncMetrics(nav) {
    const bar = nav.querySelector('.pn-nav__bar');
    const update = () => document.documentElement.style.setProperty('--global-nav-height', `${Math.ceil(bar.getBoundingClientRect().height)}px`);
    update();
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(bar);
    else window.addEventListener('resize', update, { passive: true });
  }

  function addBreadcrumbSchema() {
    const game = games.find(item => normalizePath(item.href) === currentPath());
    if (!game || document.querySelector('script[data-pn-breadcrumb]')) return;
    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.pnBreadcrumb = '';
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bludle', item: 'https://www.bludle.com/' },
      { '@type': 'ListItem', position: 2, name: game.name, item: `https://www.bludle.com${game.href}` }
    ] });
    document.head.append(schema);
  }

  function init() {
    const container = document.getElementById('navbar-container');
    if (!container || container.dataset.pnReady) return;
    container.dataset.pnReady = 'true';
    ensureStyles();
    const nav = createNav();
    container.replaceChildren(nav);
    enhanceMainLandmark();
    setupInteractions(nav);
    syncMetrics(nav);
    addBreadcrumbSchema();
    if (!sessionStorage.getItem('bludle_session_started')) {
      sessionStorage.setItem('bludle_session_started', '1');
      track('session_start', { source_page: currentPath(), device_type: matchMedia('(max-width: 759px)').matches ? 'mobile' : 'desktop' });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
