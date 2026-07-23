(function () {
  'use strict';

  const clientId = 'ca-pub-5140172230633441';
  const engagedFooterSlot = '7551359942';
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
  if (document.querySelector('ins.adsbygoogle')) return;

  const main = document.querySelector('main');
  if (!main) return;

  const placement = document.createElement('aside');
  placement.className = 'pn-ad pn-ad--engaged-footer';
  placement.dataset.bludleAdPlacement = 'game-footer-engaged';
  placement.setAttribute('aria-label', 'Advertisement');
  placement.innerHTML = `
    <span class="pn-ad__label">Advertisement</span>
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="${clientId}"
      data-ad-slot="${engagedFooterSlot}"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>`;
  main.insertAdjacentElement('afterend', placement);

  let requested = false;

  function trackRequest() {
    const params = { placement: 'game_footer_engaged', game: currentPath.slice(1) };
    if (typeof window.gtag === 'function') window.gtag('event', 'ad_slot_requested', params);
    if (window.mixpanel && typeof window.mixpanel.track === 'function') {
      window.mixpanel.track('ad_slot_requested', params);
    }
  }

  function requestAd() {
    if (requested) return;
    requested = true;

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

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      requestAd();
    }, { rootMargin: '320px 0px' });
    observer.observe(placement);
  } else {
    window.setTimeout(requestAd, 1500);
  }
})();
