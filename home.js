function sendEvent(category, action, label) {
    if ("ga" in window) {
        const tracker = ga.getAll()[0];
        if (tracker) {
            tracker.send("event", category, action, label);
        }
    }
}

const trackClick = (gameName) => {
    sendEvent('homeSelection', 'Click', gameName);
};

const tileHandlers = {
    nerdle: () => trackClick('nerdle'),
    reaction: () => trackClick('reaction'),
    colourMatch: () => trackClick('colourMatch'),
    bludle: () => trackClick('bludle'),
    codle: () => trackClick('codle'),
    hunt: () => trackClick('hunt'),
    guesshue: () => trackClick('guesshue'),
    alternate: () => trackClick('alternate'),
    connex: () => trackClick('connex'),
    heardle: () => trackClick('heardle'),
};

window.addEventListener("DOMContentLoaded", () => {
    Object.entries(tileHandlers).forEach(([id, handler]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", handler);
    });
});
