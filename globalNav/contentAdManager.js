(function () {
  'use strict';

  if (window.__bludleContentAdsLoaded) return;
  window.__bludleContentAdsLoaded = true;

  const clientId = 'ca-pub-5140172230633441';
  const defaultSlot = '4572198603';
  const readyTimeoutMs = 5000;
  const responseTimeoutMs = 7000;

  function contentGroup() {
    const path = window.location.pathname.toLowerCase();
    if (path === '/' || path === '/index.html') return 'home';
    if (path.startsWith('/blogs/')) return 'editorial';
    if (path === '/werdle/' || path === '/werdle') return 'flagship_game';
    return 'discovery_guide';
  }

  function track(eventName, properties = {}) {
    const params = {
      page_path: window.location.pathname,
      inventory_type: 'content',
      content_group: contentGroup(),
      ...properties
    };
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    if (window.mixpanel && typeof window.mixpanel.track === 'function') {
      window.mixpanel.track(eventName, params);
    }
  }

  function houseAd() {
    const link = document.createElement('a');
    link.className = 'bludle-house-ad';
    link.href = 'https://keyzee.co.uk';
    link.target = '_blank';
    link.rel = 'noopener noreferrer sponsored';
    link.hidden = true;
    link.dataset.houseAdFallback = '';
    link.setAttribute('aria-label', 'Visit Keyzee, the free way to sell your home');
    link.innerHTML = `
      <span class="bludle-house-ad__brand">keyzee</span>
      <span class="bludle-house-ad__copy"><strong>Sell your home for free.</strong><small>List for free. Pay 0% commission.</small></span>
      <span class="bludle-house-ad__cta">Visit Keyzee <span aria-hidden="true">&rarr;</span></span>`;
    return link;
  }

  function hydratePlaceholders() {
    document.querySelectorAll('[data-bludle-content-ad]').forEach(placement => {
      if (placement.querySelector('ins.adsbygoogle')) return;
      const label = document.createElement('p');
      label.className = 'ad-label';
      label.textContent = 'Sponsored';
      const unit = document.createElement('ins');
      unit.className = 'adsbygoogle';
      unit.style.display = 'block';
      unit.dataset.adClient = clientId;
      unit.dataset.adSlot = placement.dataset.adSlot || defaultSlot;
      unit.dataset.adFormat = placement.dataset.adFormat || 'horizontal';
      unit.dataset.fullWidthResponsive = 'true';
      unit.dataset.adPlacement = placement.dataset.adPlacement || 'content';
      placement.append(label, unit, houseAd());
    });
  }

  function placementFor(unit) {
    return unit.dataset.adPlacement
      || unit.closest('[data-ad-placement]')?.dataset.adPlacement
      || (window.location.pathname.startsWith('/blogs/') ? 'blog_article' : 'content_page');
  }

  function manage(unit) {
    if (unit.closest('#bludle-result-ad') || unit.dataset.bludleContentManaged) return;
    unit.dataset.bludleContentManaged = 'true';

    const wrapper = unit.closest('[data-bludle-content-ad], .home-ad-unit, .blog-ad-unit, .blog-monetization, .ad-panel, section, aside') || unit.parentElement;
    const placement = placementFor(unit);
    let fallback = wrapper?.querySelector('[data-house-ad-fallback]');
    if (!fallback && wrapper) {
      fallback = houseAd();
      wrapper.append(fallback);
    }

    let requested = false;
    let settled = false;
    let responseTimer;
    let readyTimer;
    let viewTimer;
    let observer;

    const clearTimers = () => {
      window.clearTimeout(responseTimer);
      window.clearTimeout(readyTimer);
      window.clearTimeout(viewTimer);
    };

    const showHouseFallback = reason => {
      if (settled) return;
      settled = true;
      clearTimers();
      fillObserver.disconnect();
      unit.hidden = true;
      if (!fallback) return;
      fallback.hidden = false;
      wrapper?.classList.add('has-house-ad');
      track('house_ad_fallback_view', { advertiser: 'keyzee', placement, reason });
    };

    const fillObserver = new MutationObserver(() => {
      if (settled) {
        fillObserver.disconnect();
        return;
      }
      const fillState = unit.dataset.adStatus;
      if (fillState === 'filled') {
        settled = true;
        clearTimers();
        track('ad_slot_filled', { placement });
        fillObserver.disconnect();
      } else if (fillState === 'unfilled') {
        track('ad_slot_unfilled', { placement });
        fillObserver.disconnect();
        showHouseFallback('unfilled');
      }
    });
    fillObserver.observe(unit, { attributes: true, attributeFilter: ['data-ad-status'] });

    fallback?.addEventListener('click', () => {
      track('house_ad_fallback_click', { advertiser: 'keyzee', placement });
    });

    const submit = () => {
      if (settled) return;
      window.clearTimeout(readyTimer);
      window.removeEventListener('bludle:ads-ready', submit);
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        track('ad_slot_requested', { placement, visibility_gate: '50_percent_for_1000ms' });
        responseTimer = window.setTimeout(() => showHouseFallback('no_response'), responseTimeoutMs);
      } catch {
        showHouseFallback('request_error');
      }
    };

    const request = () => {
      if (requested || settled) return;
      requested = true;
      track('ad_eligible_view', { placement, visibility_gate: '50_percent_for_1000ms' });
      if (window.__bludleAdsReady) submit();
      else {
        window.addEventListener('bludle:ads-ready', submit, { once: true });
        readyTimer = window.setTimeout(() => {
          window.removeEventListener('bludle:ads-ready', submit);
          showHouseFallback('ads_unavailable');
        }, readyTimeoutMs);
      }
    };

    if (!('IntersectionObserver' in window)) {
      window.setTimeout(request, 1000);
      return;
    }

    observer = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5);
      window.clearTimeout(viewTimer);
      if (!visible) return;
      viewTimer = window.setTimeout(() => {
        observer.disconnect();
        request();
      }, 1000);
    }, { threshold: [0, 0.5, 1] });
    observer.observe(wrapper || unit);
  }

  hydratePlaceholders();
  document.querySelectorAll('ins.adsbygoogle').forEach(manage);
}());
