(function () {
  'use strict';

  if (window.BludleMotion) return;

  const libraries = {
    core: {
      id: 'bludle-gsap-core',
      src: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js',
      integrity: 'sha384-XmJ9SoHtVOHoQUcKvFAzVXwdkKo1Ie3bhmSoIAkcdsHGaIrVJIkmozyq0FJeb/Ly',
      available: () => Boolean(window.gsap),
    },
    flip: {
      id: 'bludle-gsap-flip',
      src: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Flip.min.js',
      integrity: 'sha384-LY8cG/IUULu4u3V3AhwWBt01HIuO/hlekjkqgBx0DOJ/oquEL0Qk2L6qy+1QeRZM',
      available: () => Boolean(window.Flip),
    },
  };
  const pending = new Map();
  let warned = false;

  function reduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function fetchLibrary(name) {
    const library = libraries[name];
    if (library.available()) return Promise.resolve();
    if (pending.has(name)) return pending.get(name);

    const promise = new Promise((resolve, reject) => {
      const existing = document.getElementById(library.id);
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = library.id;
      script.src = library.src;
      script.integrity = library.integrity;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.append(script);
    });

    pending.set(name, promise);
    return promise;
  }

  function current({ flip = false } = {}) {
    if (reduced() || !window.gsap || (flip && !window.Flip)) return null;
    if (flip) window.gsap.registerPlugin(window.Flip);
    return { gsap: window.gsap, Flip: flip ? window.Flip : null };
  }

  async function load({ flip = false } = {}) {
    if (reduced()) return null;
    try {
      await fetchLibrary('core');
      if (flip) await fetchLibrary('flip');
      return current({ flip });
    } catch (error) {
      if (!warned) {
        warned = true;
        console.warn('Optional Bludle motion could not be loaded.', error);
      }
      return null;
    }
  }

  window.BludleMotion = Object.freeze({ current, load, reduced });
  window.dispatchEvent(new CustomEvent('bludle:motion-ready'));
}());
