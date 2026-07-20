(() => {
  "use strict";

  const ROUND_MS = 4000;
  const STORAGE_KEY = "guessHueStatsV2";
  const TIERS = [
    { min: 0, name: "Warm-up", gap: 18 },
    { min: 4, name: "Focus", gap: 13 },
    { min: 8, name: "Fine", gap: 9 },
    { min: 12, name: "Expert", gap: 6 },
    { min: 18, name: "Master", gap: 4 }
  ];

  const els = {
    startPanel: document.querySelector("#start-panel"),
    roundPanel: document.querySelector("#round-panel"),
    startButton: document.querySelector("#start-button"),
    restartButton: document.querySelector("#restart-button"),
    shareButton: document.querySelector("#share-button"),
    helpButton: document.querySelector("#help-button"),
    statsButton: document.querySelector("#stats-button"),
    helpDialog: document.querySelector("#help-dialog"),
    statsDialog: document.querySelector("#stats-dialog"),
    resultDialog: document.querySelector("#result-dialog"),
    grid: document.querySelector("#hue-grid"),
    streak: document.querySelector("#streak-value"),
    level: document.querySelector("#level-value"),
    best: document.querySelector("#best-value"),
    introBest: document.querySelector("#intro-best"),
    roundKicker: document.querySelector("#round-kicker"),
    roundStatus: document.querySelector("#round-status"),
    timerFill: document.querySelector("#timer-fill"),
    timerNumber: document.querySelector("#timer-number"),
    resultMark: document.querySelector("#result-mark"),
    resultKicker: document.querySelector("#result-kicker"),
    resultTitle: document.querySelector("#result-title"),
    resultNote: document.querySelector("#result-note"),
    fieldSwatch: document.querySelector("#field-swatch"),
    oddSwatch: document.querySelector("#odd-swatch"),
    hueGap: document.querySelector("#hue-gap"),
    resultStreak: document.querySelector("#result-streak"),
    resultAverage: document.querySelector("#result-average"),
    resultBest: document.querySelector("#result-best"),
    statBest: document.querySelector("#stat-best"),
    statPlays: document.querySelector("#stat-plays"),
    statCorrect: document.querySelector("#stat-correct"),
    statAverage: document.querySelector("#stat-average"),
    recentRuns: document.querySelector("#recent-runs"),
    snackbar: document.querySelector("#snackbar")
  };

  const defaultStats = { best: 0, plays: 0, totalCorrect: 0, history: [] };
  let stats = loadStats();
  let state = freshState();
  let snackbarTimer;

  function freshState() {
    return {
      streak: 0,
      responses: [],
      oddIndex: -1,
      baseColour: "hsl(210 70% 55%)",
      oddColour: "hsl(228 70% 55%)",
      gap: 18,
      deadline: 0,
      remaining: ROUND_MS,
      frame: 0,
      playing: false,
      roundActive: false,
      paused: false,
      resultSaved: false
    };
  }

  function loadStats() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Number.isFinite(saved.best)) {
        return { ...defaultStats, ...saved, history: Array.isArray(saved.history) ? saved.history.slice(-12) : [] };
      }
    } catch (_) {}

    const legacyBest = Number(localStorage.getItem("highScore"));
    return { ...defaultStats, best: Number.isFinite(legacyBest) ? legacyBest : 0 };
  }

  function saveStats() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  function tierFor(streak) {
    return [...TIERS].reverse().find((tier) => streak >= tier.min) || TIERS[0];
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function buildColours(gap) {
    const hue = randomBetween(0, 359);
    const saturation = randomBetween(58, 76);
    const lightness = randomBetween(44, 64);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const oddHue = (hue + direction * gap + 360) % 360;
    return {
      base: `hsl(${hue} ${saturation}% ${lightness}%)`,
      odd: `hsl(${oddHue} ${saturation}% ${lightness}%)`
    };
  }

  function updateHeader() {
    const tier = tierFor(state.streak);
    els.streak.textContent = state.streak;
    els.level.textContent = tier.name;
    els.best.textContent = stats.best;
    els.introBest.textContent = stats.best;
  }

  function startRun() {
    cancelAnimationFrame(state.frame);
    state = freshState();
    state.playing = true;
    els.startPanel.hidden = true;
    els.roundPanel.hidden = false;
    updateHeader();
    beginRound();
  }

  function beginRound() {
    const tier = tierFor(state.streak);
    const colours = buildColours(tier.gap);
    state.oddIndex = randomBetween(0, 8);
    state.baseColour = colours.base;
    state.oddColour = colours.odd;
    state.gap = tier.gap;
    state.remaining = ROUND_MS;
    state.deadline = performance.now() + ROUND_MS;
    state.roundActive = true;
    state.paused = false;

    els.roundKicker.textContent = `Round ${state.streak + 1} · ${tier.name} lens`;
    els.roundStatus.textContent = `Hue gap: ${tier.gap}°. Choose the odd tile.`;
    els.grid.innerHTML = "";

    for (let index = 0; index < 9; index += 1) {
      const tile = document.createElement("button");
      tile.className = "hue-tile";
      tile.type = "button";
      tile.setAttribute("aria-label", `Colour tile ${index + 1}`);
      tile.style.setProperty("--tile-colour", index === state.oddIndex ? state.oddColour : state.baseColour);
      tile.addEventListener("click", () => chooseTile(index, tile));
      els.grid.appendChild(tile);
    }

    updateHeader();
    cancelAnimationFrame(state.frame);
    state.frame = requestAnimationFrame(updateTimer);
  }

  function updateTimer(now) {
    if (!state.roundActive || state.paused) return;
    state.remaining = Math.max(0, state.deadline - now);
    const ratio = state.remaining / ROUND_MS;
    els.timerFill.style.transform = `scaleX(${ratio})`;
    els.timerFill.classList.toggle("urgent", ratio <= 0.25);
    els.timerNumber.textContent = (state.remaining / 1000).toFixed(1);

    if (state.remaining <= 0) {
      endRun("timeout");
      return;
    }
    state.frame = requestAnimationFrame(updateTimer);
  }

  function chooseTile(index, tile) {
    if (!state.roundActive || state.paused) return;
    state.roundActive = false;
    cancelAnimationFrame(state.frame);
    const response = Math.min(ROUND_MS, ROUND_MS - state.remaining);

    if (index === state.oddIndex) {
      tile.classList.add("correct");
      state.responses.push(response);
      state.streak += 1;
      els.roundStatus.textContent = `${(response / 1000).toFixed(2)}s · correct. Sharpening the next hue…`;
      updateHeader();
      window.setTimeout(beginRound, 260);
      return;
    }

    tile.classList.add("wrong");
    revealOddTile();
    els.roundStatus.textContent = "That tile matched the field. The odd hue is outlined.";
    window.setTimeout(() => endRun("wrong"), 520);
  }

  function revealOddTile() {
    const tiles = els.grid.querySelectorAll(".hue-tile");
    if (tiles[state.oddIndex]) tiles[state.oddIndex].classList.add("reveal");
  }

  function endRun(reason) {
    if (!state.playing) return;
    state.playing = false;
    state.roundActive = false;
    cancelAnimationFrame(state.frame);
    revealOddTile();

    const wasPersonalBest = state.streak > stats.best;
    if (!state.resultSaved) {
      stats.plays += 1;
      stats.totalCorrect += state.streak;
      stats.best = Math.max(stats.best, state.streak);
      stats.history = [...stats.history, state.streak].slice(-12);
      saveStats();
      state.resultSaved = true;
    }

    const average = state.responses.length
      ? `${(state.responses.reduce((sum, time) => sum + time, 0) / state.responses.length / 1000).toFixed(2)}s`
      : "—";

    els.resultMark.textContent = state.streak;
    els.resultKicker.textContent = wasPersonalBest ? "Personal best" : "Run complete";
    els.resultTitle.textContent = state.streak === 1 ? "You found 1 odd hue." : `You found ${state.streak} odd hues.`;
    els.resultNote.textContent = reason === "timeout" ? "The four-second timer reached zero." : "Your last choice matched the main field.";
    els.fieldSwatch.style.background = state.baseColour;
    els.oddSwatch.style.background = state.oddColour;
    els.hueGap.textContent = `Δ ${state.gap}°`;
    els.resultStreak.textContent = state.streak;
    els.resultAverage.textContent = average;
    els.resultBest.textContent = stats.best;
    updateHeader();
    window.setTimeout(() => els.resultDialog.showModal(), reason === "timeout" ? 80 : 0);
  }

  function pauseRound() {
    if (!state.playing || !state.roundActive || state.paused) return false;
    state.remaining = Math.max(0, state.deadline - performance.now());
    state.paused = true;
    cancelAnimationFrame(state.frame);
    els.roundStatus.textContent = "Round paused while the guide is open.";
    return true;
  }

  function resumeRound() {
    if (!state.playing || !state.roundActive || !state.paused) return;
    state.paused = false;
    state.deadline = performance.now() + state.remaining;
    els.roundStatus.textContent = `Hue gap: ${state.gap}°. Choose the odd tile.`;
    state.frame = requestAnimationFrame(updateTimer);
  }

  function showStats() {
    els.statsDialog.dataset.resume = pauseRound() ? "true" : "false";
    els.statBest.textContent = stats.best;
    els.statPlays.textContent = stats.plays;
    els.statCorrect.textContent = stats.totalCorrect;
    els.statAverage.textContent = stats.plays ? (stats.totalCorrect / stats.plays).toFixed(1) : "0";
    els.recentRuns.innerHTML = stats.history.length
      ? stats.history.map((score) => `<span>${score}</span>`).join("")
      : "<p>No completed runs yet.</p>";
    els.statsDialog.showModal();
  }

  async function shareResult() {
    const tier = tierFor(state.streak);
    const text = `Guess Hue 🎨\nStreak: ${state.streak}\nLens: ${tier.name}\nhttps://bludle.com/guesshue/`;
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar("Result copied to clipboard");
    } catch (_) {
      showSnackbar("Share text is ready: Guess Hue streak " + state.streak);
    }
  }

  function showSnackbar(message) {
    window.clearTimeout(snackbarTimer);
    els.snackbar.textContent = message;
    els.snackbar.classList.add("show");
    snackbarTimer = window.setTimeout(() => els.snackbar.classList.remove("show"), 2400);
  }

  els.startButton.addEventListener("click", startRun);
  els.restartButton.addEventListener("click", () => {
    els.resultDialog.close();
    startRun();
  });
  els.shareButton.addEventListener("click", shareResult);
  els.statsButton.addEventListener("click", showStats);
  els.helpButton.addEventListener("click", () => {
    els.helpDialog.dataset.resume = pauseRound() ? "true" : "false";
    els.helpDialog.showModal();
  });

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });

  els.helpDialog.addEventListener("close", () => {
    if (els.helpDialog.dataset.resume === "true") resumeRound();
    els.helpDialog.dataset.resume = "false";
  });

  els.statsDialog.addEventListener("close", () => {
    if (els.statsDialog.dataset.resume === "true") resumeRound();
    els.statsDialog.dataset.resume = "false";
  });

  els.resultDialog.addEventListener("cancel", (event) => event.preventDefault());

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (pauseRound()) document.body.dataset.visibilityPaused = "true";
    } else if (document.body.dataset.visibilityPaused === "true") {
      document.body.dataset.visibilityPaused = "false";
      resumeRound();
    }
  });

  updateHeader();
})();
