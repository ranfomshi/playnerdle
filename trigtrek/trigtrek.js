const state = {
  score: 0,
  level: 1,
  streak: 0,
  lives: 3,
  round: 1,
  running: false,
  timerId: null,
  roundSeconds: 16,
  challenge: null,
};

const HIGH_SCORE_KEY = "bludle_trigtrek_high_score";

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const livesEl = document.getElementById("lives");
const bestScoreEl = document.getElementById("bestScore");
const roundTypeEl = document.getElementById("roundType");
const promptEl = document.getElementById("prompt");
const problemLineEl = document.getElementById("problemLine");
const toleranceEl = document.getElementById("tolerance");
const formulaHintEl = document.getElementById("formulaHint");
const timerBar = document.getElementById("timerBar");
const answerInput = document.getElementById("answerInput");
const resultText = document.getElementById("resultText");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const submitGuessBtn = document.getElementById("submitGuess");
const hintBtn = document.getElementById("hintBtn");
const skipBtn = document.getElementById("skipBtn");
const canvas = document.getElementById("triangleCanvas");
const ctx = canvas.getContext("2d");

function getHighScore() {
  return Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
}

function setHighScore(score) {
  localStorage.setItem(HIGH_SCORE_KEY, String(score));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function precisionPercent() {
  return clamp(9 - state.level * 0.6, 3, 9);
}

function buildChallenge() {
  const theta = Math.round(randomBetween(20, 70));
  const thetaRad = toRadians(theta);
  const side = Number(randomBetween(4, 16).toFixed(1));

  const easySet = [
    { id: "sin-opp", formula: "sin", known: "hypotenuse", find: "opposite" },
    { id: "cos-adj", formula: "cos", known: "hypotenuse", find: "adjacent" },
    { id: "tan-opp", formula: "tan", known: "adjacent", find: "opposite" },
  ];

  const hardSet = [
    { id: "sin-hyp", formula: "sin", known: "opposite", find: "hypotenuse" },
    { id: "cos-hyp", formula: "cos", known: "adjacent", find: "hypotenuse" },
    { id: "tan-adj", formula: "tan", known: "opposite", find: "adjacent" },
  ];

  const pool = state.level <= 2 ? easySet.slice(0, 2) : state.level <= 4 ? easySet : easySet.concat(hardSet);
  const template = pool[Math.floor(Math.random() * pool.length)];

  let answer;

  if (template.id === "sin-opp") answer = side * Math.sin(thetaRad);
  if (template.id === "cos-adj") answer = side * Math.cos(thetaRad);
  if (template.id === "tan-opp") answer = side * Math.tan(thetaRad);
  if (template.id === "sin-hyp") answer = side / Math.sin(thetaRad);
  if (template.id === "cos-hyp") answer = side / Math.cos(thetaRad);
  if (template.id === "tan-adj") answer = side / Math.tan(thetaRad);

  return {
    theta,
    knownLabel: template.known,
    knownValue: side,
    findLabel: template.find,
    formula: template.formula,
    answer,
  };
}

function updateHud() {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
  streakEl.textContent = state.streak;
  livesEl.textContent = state.lives;
  bestScoreEl.textContent = getHighScore();
}

function drawTriangle(challenge) {
  const { theta, knownLabel, knownValue, findLabel } = challenge;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pA = { x: 90, y: 250 }; // angle theta
  const pB = { x: 390, y: 250 };
  const pC = { x: 390, y: 90 };

  ctx.strokeStyle = "#d6e4f4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pA.x, pA.y);
  ctx.lineTo(pB.x, pB.y);
  ctx.lineTo(pC.x, pC.y);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "#6fa8dc";
  ctx.lineWidth = 2;
  ctx.strokeRect(pB.x - 26, pB.y - 26, 24, 24);

  ctx.fillStyle = "#b4d2ff";
  ctx.font = "18px sans-serif";
  ctx.fillText(`θ = ${theta}°`, pA.x + 10, pA.y - 10);

  const labels = {
    adjacent: { text: "adjacent", x: 220, y: 275 },
    opposite: { text: "opposite", x: 403, y: 170 },
    hypotenuse: { text: "hypotenuse", x: 230, y: 155 },
  };

  for (const sideName of Object.keys(labels)) {
    const label = labels[sideName];
    const isKnown = sideName === knownLabel;
    const isTarget = sideName === findLabel;

    ctx.fillStyle = isKnown ? "#80ed99" : isTarget ? "#f7b267" : "#d6e4f4";

    let suffix = "";
    if (isKnown) suffix = ` = ${knownValue}`;
    if (isTarget) suffix = " = ?";

    ctx.fillText(`${label.text}${suffix}`, label.x, label.y);
  }
}

function hintText(formula) {
  if (formula === "sin") return "Use sin(θ) = opposite / hypotenuse";
  if (formula === "cos") return "Use cos(θ) = adjacent / hypotenuse";
  return "Use tan(θ) = opposite / adjacent";
}

function nextRound() {
  state.challenge = buildChallenge();
  roundTypeEl.textContent = `Round ${state.round}`;
  promptEl.textContent = `Find the ${state.challenge.findLabel} side.`;
  problemLineEl.textContent = `Given θ = ${state.challenge.theta}° and ${state.challenge.knownLabel} = ${state.challenge.knownValue}, find ${state.challenge.findLabel}.`;
  toleranceEl.textContent = `Target precision: ±${precisionPercent().toFixed(1)}%`;
  formulaHintEl.textContent = `Hint: ${hintText(state.challenge.formula)}`;
  answerInput.value = "";
  answerInput.focus();
  resultText.textContent = "";
  drawTriangle(state.challenge);
  startTimer();
}

function registerMiss(message) {
  state.streak = 0;
  state.lives -= 1;
  resultText.textContent = message;
}

function finishRound({ timedOut = false, skipped = false } = {}) {
  clearInterval(state.timerId);

  if (timedOut) {
    registerMiss("⏱️ Time ran out. You lost a life.");
  } else if (skipped) {
    registerMiss("⏭️ Skipped. You lost a life.");
  } else {
    const userValue = Number(answerInput.value);

    if (!Number.isFinite(userValue) || userValue <= 0) {
      registerMiss("⚠️ Enter a positive number to submit.");
    } else {
      const correct = state.challenge.answer;
      const relError = Math.abs(userValue - correct) / correct;
      const tolerance = precisionPercent() / 100;

      if (relError <= tolerance) {
        const accuracyBonus = Math.round((tolerance - relError) * 1300);
        const basePoints = 120 + state.level * 14;
        const streakBonus = state.streak * 12;
        const earned = basePoints + Math.max(0, accuracyBonus) + streakBonus;

        state.score += earned;
        state.streak += 1;
        resultText.textContent = `✅ Correct! Answer ≈ ${correct.toFixed(2)}. +${earned} points.`;
      } else {
        registerMiss(`❌ Close, but outside tolerance. Correct answer ≈ ${correct.toFixed(2)}.`);
      }
    }
  }

  if (state.score > getHighScore()) {
    setHighScore(state.score);
  }

  updateHud();

  if (state.lives <= 0) {
    endGame();
    return;
  }

  state.round += 1;

  if (state.round % 4 === 0) {
    state.level += 1;
    state.roundSeconds = clamp(state.roundSeconds - 0.8, 8, 16);
    resultText.textContent += ` Level up! Level ${state.level}.`;
  }

  setTimeout(nextRound, 1000);
}

function startTimer() {
  clearInterval(state.timerId);
  let remaining = state.roundSeconds;
  timerBar.value = 100;

  state.timerId = setInterval(() => {
    remaining -= 0.1;
    timerBar.value = (remaining / state.roundSeconds) * 100;

    if (remaining <= 0) {
      timerBar.value = 0;
      finishRound({ timedOut: true });
    }
  }, 100);
}

function startGame() {
  state.score = 0;
  state.level = 1;
  state.streak = 0;
  state.lives = 3;
  state.round = 1;
  state.roundSeconds = 16;
  state.running = true;
  startBtn.hidden = true;
  restartBtn.hidden = true;
  resultText.textContent = "Solve quickly and keep your streak alive.";
  updateHud();
  nextRound();
}

function endGame() {
  state.running = false;
  clearInterval(state.timerId);
  promptEl.textContent = "Run complete!";
  problemLineEl.textContent = "Great effort — keep sharpening your trig skills.";
  toleranceEl.textContent = `Final score: ${state.score}`;
  resultText.textContent = `🏁 Game over. You reached level ${state.level}. Best score: ${getHighScore()}.`;
  restartBtn.hidden = false;
}

submitGuessBtn.addEventListener("click", () => {
  if (!state.running) return;
  finishRound();
});

skipBtn.addEventListener("click", () => {
  if (!state.running) return;
  finishRound({ skipped: true });
});

hintBtn.addEventListener("click", () => {
  if (!state.challenge) return;
  resultText.textContent = `💡 ${hintText(state.challenge.formula)}`;
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && state.running) {
    finishRound();
  }
});

updateHud();
ctx.fillStyle = "#d6e4f4";
ctx.font = "20px sans-serif";
ctx.fillText("Press Start Run to begin", 130, 165);
