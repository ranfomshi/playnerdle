function sendEvent(eventName, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }

  if (window.mixpanel && typeof window.mixpanel.track === 'function') {
    window.mixpanel.track(eventName, params);
  }
}

function trackClick(gameName) {
  sendEvent('homeSelection', {
    interaction_type: 'click',
    item_name: gameName,
    source_page: 'home',
  });
}

const tileHandlers = {
  bludle: () => trackClick('bludle'),
  werdle: () => trackClick('werdle'),
  reaction: () => trackClick('reaction'),
  shiftyFades: () => trackClick('shiftyfades'),
  colourMatch: () => trackClick('colourmatch'),
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

  const applyFilter = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    gameTiles.forEach((tile) => {
      const text = tile.textContent.toLowerCase();
      const visible = text.includes(query) && matchesCategory(tile, selectedFilter);
      tile.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    const emptyState = document.getElementById('filterEmptyState');
    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
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

  applyFilter();
}

window.addEventListener('DOMContentLoaded', () => {
  Object.entries(tileHandlers).forEach(([id, handler]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', handler);
    }
  });

  setupGameFiltering();
});
