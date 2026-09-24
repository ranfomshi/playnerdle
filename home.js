function sendEvent(eventName, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }

  if (window.mixpanel && typeof window.mixpanel.track === 'function') {
    window.mixpanel.track(eventName, params);
  }
}

function getDeviceType() {
  return window.matchMedia('(max-width: 700px)').matches ? 'mobile' : 'desktop';
}

function trackSessionStart() {
  const key = 'bludle_session_started';
  if (sessionStorage.getItem(key)) {
    return;
  }

  sessionStorage.setItem(key, '1');
  sendEvent('session_start', {
    source_page: 'home',
    device_type: getDeviceType(),
  });
}

function trackClick(gameName, placement = 'game_grid') {
  sendEvent('homeSelection', {
    interaction_type: 'click',
    item_name: gameName,
    source_page: 'home',
    placement,
    experiment_variant: document.documentElement.dataset.homeExperiment || 'unassigned',
  });
}

async function applyHomepageExperiment() {
  const fallback = 'control';
  const managerReady = window.BludleExperiments
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener('bludle:experiments-ready', resolve, { once: true }));
  await Promise.race([managerReady, new Promise(resolve => window.setTimeout(resolve, 1500))]);

  const key = window.BludleExperiments?.FLAG_KEYS?.homepageWerdleFocus;
  const variant = key
    ? await window.BludleExperiments.getVariant(key, fallback)
    : fallback;
  document.documentElement.dataset.homeExperiment = variant;
  return variant;
}

const tileHandlers = {
  bludle: () => trackClick('bludle'),
  werdle: () => trackClick('werdle'),
  glyph: () => trackClick('glyph'),
  borrowedLetters: () => trackClick('borrowedletters'),
  reaction: () => trackClick('reaction'),
  shiftyFades: () => trackClick('shiftyfades'),
  colourMatch: () => trackClick('colourmatch'),
  afterimage: () => trackClick('afterimage'),
  secondSight: () => trackClick('secondsight'),
  chromaLock: () => trackClick('chromalock'),
  codle: () => trackClick('codle'),
  alternate: () => trackClick('alternate'),
  tintuition: () => trackClick('tintuition'),
  hunt: () => trackClick('hunt'),
  deadcentre: () => trackClick('deadcentre'),
  guesshue: () => trackClick('guesshue'),
  trak: () => trackClick('trak'),
  connex: () => trackClick('connex'),
  wordmash: () => trackClick('wordmash'),
  heardle: () => trackClick('heardle'),
  seequence: () => trackClick('seequence'),
  coffee: () => trackClick('coffee'),
};

function setupGameFiltering() {
  const searchInput = document.getElementById('gameSearch');
  const filterButtons = document.querySelectorAll('.filter-chip');
  const gameTiles = Array.from(document.querySelectorAll('.content .tile'));

  if (!searchInput || gameTiles.length === 0) {
    return;
  }

  let selectedFilter = 'all';

  const matchesCategory = (tile, filter) => {
    if (filter === 'all') {
      return true;
    }

    const category = tile.dataset.category || '';
    return category.split(' ').includes(filter);
  };

  const applyFilter = (animate = true) => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    const visibility = new Map();

    gameTiles.forEach((tile) => {
      const text = tile.textContent.toLowerCase();
      const visible = text.includes(query) && matchesCategory(tile, selectedFilter);
      visibility.set(tile, visible);
      if (visible) {
        visibleCount += 1;
      }
    });

    const emptyState = document.getElementById('filterEmptyState');
    const commit = () => {
      visibility.forEach((visible, tile) => { tile.hidden = !visible; });
      if (emptyState) emptyState.hidden = visibleCount > 0;
    };

    const motion = window.BludleMotion;
    if (!animate || !motion || motion.reduced()) {
      commit();
      return;
    }

    const runtime = motion.current({ flip: true });
    if (!runtime) {
      commit();
      motion.load({ flip: true });
      return;
    }

    runtime.Flip.killFlipsOf(gameTiles);
    const previous = runtime.Flip.getState(gameTiles);
    commit();
    runtime.Flip.from(previous, {
      absolute: true,
      duration: .38,
      ease: 'power2.inOut',
      prune: true,
      onEnter: elements => runtime.gsap.fromTo(elements, { autoAlpha: 0, scale: .97 }, { autoAlpha: 1, scale: 1, duration: .24, clearProps: 'opacity,visibility,transform' }),
      onLeave: elements => runtime.gsap.to(elements, { autoAlpha: 0, scale: .97, duration: .18 }),
    });
  };

  searchInput.addEventListener('input', applyFilter);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedFilter = button.dataset.filter;
      filterButtons.forEach((chip) => chip.classList.remove('active'));
      button.classList.add('active');

      sendEvent('homeFilterSelection', {
        filter: selectedFilter,
      });

      applyFilter();
    });
  });

  applyFilter(false);

  let motionIntent = false;
  const warmMotion = () => {
    motionIntent = true;
    window.BludleMotion?.load({ flip: true });
  };
  const discovery = searchInput.closest('.game-discovery');
  ['pointerenter', 'focusin', 'touchstart'].forEach(eventName => discovery?.addEventListener(eventName, warmMotion, { once: true, passive: true }));
  window.addEventListener('bludle:motion-ready', () => { if (motionIntent) warmMotion(); }, { once: true });
}

window.addEventListener('DOMContentLoaded', () => {
  trackSessionStart();

  const werdleHero = document.getElementById('werdleHero');
  if (werdleHero) {
    werdleHero.addEventListener('click', () => trackClick('werdle', 'hero'));
  }

  Object.entries(tileHandlers).forEach(([id, handler]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', handler);
    }
  });

  setupGameFiltering();

  const houseAdTile = document.querySelector('.ad-tile .ad-link');
  if (houseAdTile) {
    const tile = houseAdTile.closest('.ad-tile');
    const trackView = () => sendEvent('house_ad_fallback_view', {
      advertiser: 'keyzee',
      placement: 'home_grid_tile',
      reason: 'house_inventory',
    });
    if ('IntersectionObserver' in window && tile) {
      let timer;
      const observer = new IntersectionObserver(entries => {
        window.clearTimeout(timer);
        if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
        timer = window.setTimeout(() => {
          observer.disconnect();
          trackView();
        }, 1000);
      }, { threshold: [0, 0.5, 1] });
      observer.observe(tile);
    } else {
      trackView();
    }
    houseAdTile.addEventListener('click', () => sendEvent('house_ad_fallback_click', {
      advertiser: 'keyzee',
      placement: 'home_grid_tile',
    }));
  }

  applyHomepageExperiment().then(experimentVariant => {
    if (!werdleHero) return;
    sendEvent('home_feature_view', {
      item_name: 'werdle',
      source_page: 'home',
      placement: 'hero',
      experiment_variant: experimentVariant,
    });
  });
});
