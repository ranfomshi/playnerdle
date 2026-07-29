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
  });
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

function initializeAdUnits() {
  const adUnits = document.querySelectorAll('.adsbygoogle');
  adUnits.forEach((adUnit) => {
    const wrapper = adUnit.closest('.home-ad-unit');
    const fallback = wrapper?.querySelector('[data-house-ad-fallback]');

    if (fallback) {
      const syncFallback = () => {
        const isUnfilled = adUnit.dataset.adStatus === 'unfilled';
        fallback.hidden = !isUnfilled;
        wrapper.classList.toggle('has-house-ad', isUnfilled);

        if (isUnfilled && !fallback.dataset.viewTracked) {
          fallback.dataset.viewTracked = 'true';
          sendEvent('house_ad_fallback_view', {
            advertiser: 'keyzee',
            placement: adUnit.dataset.adPlacement || 'home_grid',
          });
        }
      };

      new MutationObserver(syncFallback).observe(adUnit, {
        attributes: true,
        attributeFilter: ['data-ad-status'],
      });
      fallback.addEventListener('click', () => sendEvent('house_ad_fallback_click', {
        advertiser: 'keyzee',
        placement: adUnit.dataset.adPlacement || 'home_grid',
      }));
      syncFallback();
    }

    (window.adsbygoogle = window.adsbygoogle || []).push({});
    sendEvent('ad_eligible_view', {
      placement: adUnit.dataset.adPlacement || 'home_grid',
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  trackSessionStart();

  const werdleHero = document.getElementById('werdleHero');
  if (werdleHero) {
    sendEvent('home_feature_view', {
      item_name: 'werdle',
      source_page: 'home',
      placement: 'hero',
    });
    werdleHero.addEventListener('click', () => trackClick('werdle', 'hero'));
  }

  Object.entries(tileHandlers).forEach(([id, handler]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', handler);
    }
  });

  setupGameFiltering();
  initializeAdUnits();
});
