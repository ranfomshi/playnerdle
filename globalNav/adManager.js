(function () {
  'use strict';

  const clientId = 'ca-pub-5140172230633441';
  const resultSummarySlot = '7551359942';
  const slotByGame = new Map([
    ['/werdle', '3900592841']
  ]);
  const levelSummaryGames = new Set(['/tintuition', '/seequence']);
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
  placement.id = 'bludle-result-ad';
  placement.className = 'pn-ad pn-ad--result-summary';
  placement.dataset.bludleAdPlacement = 'result-summary';
  placement.dataset.adState = 'waiting';
  placement.hidden = true;
  placement.setAttribute('aria-label', 'Advertisement');
  placement.innerHTML = `
    <span class="pn-ad__label">Advertisement</span>
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="${clientId}"
      data-ad-slot="${slotByGame.get(currentPath) || resultSummarySlot}"
      data-ad-format="horizontal"
      data-full-width-responsive="true"></ins>
    <a class="pn-house-ad" href="https://keyzee.co.uk" target="_blank" rel="noopener noreferrer sponsored"
      data-house-ad-fallback hidden aria-label="Visit Keyzee, the free way to sell your home">
      <span class="pn-house-ad__brand">keyzee</span>
      <span class="pn-house-ad__copy"><strong>Sell your home for free.</strong><small>List for free. Pay 0% commission.</small></span>
      <span class="pn-house-ad__cta">Visit Keyzee <span aria-hidden="true">&rarr;</span></span>
    </a>`;

  const gameSurface = main.querySelector(':scope > .game-card, :scope > .game-shell, :scope > [class*="game-card"], :scope > [class*="game-shell"]') || main.firstElementChild;
  if (gameSurface) gameSurface.insertAdjacentElement('afterend', placement);
  else main.append(placement);

  let requested = false;
  let eligibleTracked = false;
  let watching = false;
  let observer;
  let viewTimer;

  function track(eventName, properties = {}) {
    const params = { placement: 'result_summary', game: currentPath.slice(1), ...properties };
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    if (window.mixpanel && typeof window.mixpanel.track === 'function') {
      window.mixpanel.track(eventName, params);
    }
  }

  function moveIntoResultSummary() {
    const recommendation = document.getElementById('bludle-engagement-host');
    if (!recommendation?.parentElement) return false;
    recommendation.insertAdjacentElement('beforebegin', placement);
    placement.dataset.summaryPlacement = 'true';
    return true;
  }

  function moveIntoLevelSummary(surface) {
    if (!levelSummaryGames.has(currentPath) || !surface?.append) return false;
    if (requested && placement.parentElement !== surface) return false;
    if (placement.parentElement !== surface) surface.append(placement);
    placement.dataset.summaryPlacement = 'true';
    return true;
  }

  function presentPlacement({ summaryType, surface, outcome, level }) {
    const moved = summaryType === 'level'
      ? moveIntoLevelSummary(surface)
      : !requested && moveIntoResultSummary();
    if (!moved && (placement.hidden || (summaryType === 'complete' && requested))) return;

    placement.hidden = false;
    placement.dataset.adState = requested ? placement.dataset.adState : 'eligible';
    placement.dataset.summaryType = summaryType;
    if (!eligibleTracked) {
      eligibleTracked = true;
      track('ad_eligible_view', {
        outcome,
        level,
        summary_type: summaryType,
        summary_placement: placement.dataset.summaryPlacement === 'true'
      });
    }
    watchForViewability();
  }

  function trackRequest() {
    track('ad_slot_requested', { visibility_gate: '50_percent_for_1000ms' });
  }

  function showHouseFallback(reason) {
    const unit = placement.querySelector('ins.adsbygoogle');
    const fallback = placement.querySelector('[data-house-ad-fallback]');
    unit.hidden = true;
    fallback.hidden = false;
    placement.dataset.adState = 'house';
    placement.querySelector('.pn-ad__label').textContent = 'Sponsored';
    if (!fallback.dataset.viewTracked) {
      fallback.dataset.viewTracked = 'true';
      track('house_ad_fallback_view', { advertiser: 'keyzee', reason });
    }
  }

  function requestAd() {
    if (requested) return;
    requested = true;
    watching = false;
    const unit = placement.querySelector('ins.adsbygoogle');

    const fillObserver = new MutationObserver(() => {
      const fillState = unit.dataset.adStatus;
      if (fillState === 'filled') {
        placement.dataset.adState = 'filled';
        track('ad_slot_filled');
        fillObserver.disconnect();
      } else if (fillState === 'unfilled') {
        track('ad_slot_unfilled');
        showHouseFallback('unfilled');
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
      showHouseFallback('request_error');
    }
  }

  function watchForViewability() {
    if (requested || watching) return;
    watching = true;
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
      }, 1000);
    }, { threshold: [0, 0.5, 1] });
    observer.observe(placement);
  }

  window.addEventListener('bludle:game-complete', event => {
    presentPlacement({
      summaryType: 'complete',
      outcome: event.detail?.outcome
    });
  }, { once: true });

  window.addEventListener('bludle:level-summary', event => {
    presentPlacement({
      summaryType: 'level',
      surface: event.detail?.surface,
      outcome: event.detail?.outcome,
      level: event.detail?.level
    });
  });

  placement.querySelector('[data-house-ad-fallback]').addEventListener('click', () => {
    track('house_ad_fallback_click', { advertiser: 'keyzee' });
  });
}());
