(function () {
  'use strict';

  const clientId = 'ca-pub-5140172230633441';
  const engagedFooterSlot = '7551359942';
  const slotByGame = new Map([
    ['/werdle', '3900592841']
  ]);
  const gamePaths = new Set([
    '/afterimage', '/alternate', '/bludle', '/borrowedletters', '/chromalock',
    '/codle', '/colormatch', '/connex', '/deadcentre', '/glyph', '/guesshue',
    '/heardle', '/hunt', '/reaction', '/seequence', '/shiftyfades', '/tintuition',
    '/trak', '/werdle', '/wordmash'
  ]);

  const currentPath = window.location.pathname
    .toLowerCase()
    .replace(/\/index\.html$/, '')
    .replace(/\/$/, '') || '/';

  if (!gamePaths.has(currentPath)) return;

  const main = document.querySelector('main');
  if (!main) return;

  const placement = document.createElement('aside');
  placement.className = 'pn-ad pn-ad--post-game';
  placement.dataset.bludleAdPlacement = 'post-game-engaged';
  placement.dataset.adState = 'waiting';
  placement.hidden = true;
  placement.setAttribute('aria-label', 'Advertisement');
  placement.innerHTML = `
    <span class="pn-ad__label">Advertisement</span>
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="${clientId}"
      data-ad-slot="${slotByGame.get(currentPath) || engagedFooterSlot}"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>`;
  const gameSurface = main.querySelector(':scope > .game-card, :scope > .game-shell, :scope > [class*="game-card"], :scope > [class*="game-shell"]') || main.firstElementChild;
  if (gameSurface) gameSurface.insertAdjacentElement('afterend', placement);
  else main.append(placement);

  let requested = false;
  let observer;
  let viewTimer;

  function track(eventName, properties = {}) {
    const params = { placement: 'post_game_engaged', game: currentPath.slice(1), ...properties };
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    if (window.mixpanel && typeof window.mixpanel.track === 'function') {
      window.mixpanel.track(eventName, params);
    }
  }

  function trackRequest() {
    track('ad_slot_requested', { visibility_gate: '50_percent_for_750ms' });
  }

  function requestAd() {
    if (requested) return;
    requested = true;
    const unit = placement.querySelector('ins.adsbygoogle');

    const fillObserver = new MutationObserver(() => {
      const fillState = unit.dataset.adStatus;
      if (fillState === 'filled') {
        placement.dataset.adState = 'filled';
        fillObserver.disconnect();
      } else if (fillState === 'unfilled') {
        placement.dataset.adState = 'unavailable';
        track('ad_slot_unfilled');
        fillObserver.disconnect();
      }
    });
    fillObserver.observe(unit, { attributes: true, attributeFilter: ['data-ad-status'] });

    if (!document.querySelector(`script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.dataset.bludleAdsense = '';
      document.head.append(script);
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      trackRequest();
    } catch (error) {
      placement.dataset.adState = 'unavailable';
    }
  }

  function watchForViewability() {
    if (!('IntersectionObserver' in window)) {
      window.setTimeout(requestAd, 1000);
      return;
    }

    observer = new IntersectionObserver(entries => {
      const sufficientlyVisible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5);
      window.clearTimeout(viewTimer);
      if (!sufficientlyVisible) return;
      viewTimer = window.setTimeout(() => {
        observer.disconnect();
        requestAd();
      }, 750);
    }, { threshold: [0, 0.5, 1] });
    observer.observe(placement);
  }

  window.addEventListener('bludle:game-complete', event => {
    if (!placement.hidden) return;
    placement.hidden = false;
    placement.dataset.adState = 'eligible';
    track('ad_slot_eligible', { outcome: event.detail?.outcome });
    watchForViewability();
  }, { once: true });
})();
