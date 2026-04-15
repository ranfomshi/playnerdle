function sendEvent(category, action, label) {
  if ('ga' in window) {
    const tracker = ga.getAll()[0];
    if (tracker) {
      tracker.send('event', category, action, label);
    }
  }
}

const trackClick = (gameName) => {
  sendEvent('homeSelection', 'Click', gameName);
};

const tileHandlers = {
  bludle: () => trackClick('bludle'),
  werdle: () => trackClick('werdle'),
  reaction: () => trackClick('reaction'),
  shiftyFades: () => trackClick('shiftyFades'),
  colourMatch: () => trackClick('colourMatch'),
  codle: () => trackClick('codle'),
  alternate: () => trackClick('alternate'),
  tintuition: () => trackClick('tintuition'),
  hunt: () => trackClick('hunt'),
  guesshue: () => trackClick('guesshue'),
  trak: () => trackClick('trak'),
  connex: () => trackClick('connex'),
  wordmash: () => trackClick('wordmash'),
  snoules: () => trackClick('snoules'),
  heardle: () => trackClick('heardle'),
  seequence: () => trackClick('seequence'),
  coffee: () => trackClick('coffee'),
};

window.addEventListener('DOMContentLoaded', () => {
  Object.entries(tileHandlers).forEach(([id, handler]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', handler);
    }
  });
});
