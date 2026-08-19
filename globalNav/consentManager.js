(function () {
  'use strict';

  if (window.__bludleConsentManagerLoaded) return;
  window.__bludleConsentManagerLoaded = true;

  const publisherId = 'pub-5140172230633441';
  const clientId = `ca-${publisherId}`;

  // Consent Mode must be denied before any Google product is allowed to load.
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 2000
  });
  window.gtag('set', 'ads_data_redaction', true);

  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

  function loadAdSense() {
    if (window.__bludleAdsReady) return;
    window.__bludleAdsReady = true;

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.dataset.bludleAdsense = '';
    document.head.append(script);
    window.dispatchEvent(new CustomEvent('bludle:ads-ready'));
  }

  // Google Funding Choices is a Google-certified CMP. AdSense is not requested
  // until its consent data is ready, including when no message is required.
  window.googlefc.callbackQueue.push({ CONSENT_DATA_READY: loadAdSense });

  const cmp = document.createElement('script');
  cmp.async = true;
  cmp.src = `https://fundingchoicesmessages.google.com/i/${publisherId}?ers=1`;
  cmp.dataset.bludleCmp = '';
  cmp.addEventListener('load', () => {
    if (typeof window.__tcfapi !== 'function') return;
    window.__tcfapi('addEventListener', 2, tcData => {
      const purposes = tcData?.purpose?.consents || {};
      const granted = tcData?.gdprApplies === false || (
        tcData?.gdprApplies === true && [1, 7, 8, 9, 10].every(id => purposes[id] === true)
      );
      window.__bludleAnalyticsConsent = granted;
      window.gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
      window.dispatchEvent(new CustomEvent('bludle:analytics-consent', { detail: { granted } }));
    });
  });
  document.head.append(cmp);

  window.BludlePrivacy = Object.freeze({
    openChoices() {
      if (typeof window.googlefc.showRevocationMessage === 'function') {
        window.googlefc.showRevocationMessage();
        return true;
      }
      return false;
    }
  });
}());
