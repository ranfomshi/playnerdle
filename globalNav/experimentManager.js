(function () {
  'use strict';

  if (window.BludleExperiments) return;

  const FLAG_KEYS = Object.freeze({
    homepageWerdleFocus: 'homepage_werdle_focus_v_1',
    postGameContinuation: 'post-game-continuation-v-1'
  });
  const QA_PARAMS = Object.freeze({
    [FLAG_KEYS.homepageWerdleFocus]: 'exp_home',
    [FLAG_KEYS.postGameContinuation]: 'exp_post_game'
  });
  const VALID_VARIANTS = new Set(['control', 'treatment']);
  const pending = new Map();

  function qaOverride(key) {
    if (!window.__bludleAnalyticsDisabled) return null;
    const value = new URLSearchParams(window.location.search).get(QA_PARAMS[key]);
    return VALID_VARIANTS.has(value) ? value : null;
  }

  function waitForAnalytics(timeoutMs = 10000) {
    if (window.__bludleAnalyticsConsent === true && window.mixpanel?.flags?.get_variant_value) {
      return Promise.resolve(true);
    }

    return new Promise(resolve => {
      const startedAt = Date.now();
      let timer;

      const finish = ready => {
        window.removeEventListener('bludle:analytics-consent', check);
        window.clearInterval(timer);
        resolve(ready);
      };
      const check = () => {
        if (window.__bludleAnalyticsConsent === true && window.mixpanel?.flags?.get_variant_value) finish(true);
        else if (Date.now() - startedAt >= timeoutMs) finish(false);
      };

      window.addEventListener('bludle:analytics-consent', check);
      timer = window.setInterval(check, 100);
      check();
    });
  }

  async function getVariant(key, fallback = 'control') {
    if (!Object.values(FLAG_KEYS).includes(key)) return fallback;

    const override = qaOverride(key);
    if (override) return override;
    if (window.__bludleAnalyticsDisabled) return fallback;
    if (pending.has(key)) return pending.get(key);

    const request = (async () => {
      const ready = await waitForAnalytics();
      if (!ready) return fallback;
      try {
        const value = await window.mixpanel.flags.get_variant_value(key, fallback);
        return VALID_VARIANTS.has(value) ? value : fallback;
      } catch {
        return fallback;
      }
    })();
    pending.set(key, request);
    return request;
  }

  window.BludleExperiments = Object.freeze({ FLAG_KEYS, getVariant });
  window.dispatchEvent(new CustomEvent('bludle:experiments-ready'));
})();
