const state = {
  score: 0,
  level: 1,
  streak: 0,
  lives: 3,
  round: 1,
  angle: 0,
  running: false,
  timerId: null,
  roundSeconds: 14,
  target: null,
};

const HIGH_SCORE_KEY = "bludle_trigtrek_high_score";

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const livesEl = document.getElementById("lives");
const bestScoreEl = document.getElementById("bestScore");
const roundTypeEl = document.getElementById("roundType");
const promptEl = document.getElementById("prompt");
const toleranceEl = document.getElementById("tolerance");
const timerBar = document.getElementById("timerBar");
const angleInput = document.getElementById("angleInput");
const angleValue = document.getElementById("angleValue");
const resultText = document.getElementById("resultText");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const submitGuessBtn = document.getElementById("submitGuess");
const nudgeLeftBtn = document.getElementById("nudgeLeft");
const nudgeRightBtn = document.getElementById("nudgeRight");
const canvas = document.getElementById("circleCanvas");
const ctx = canvas.getContext("2d");

function getHighScore() {
  return Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
}

function setHighScore(score) {
  localStorage.setItem(HIGH_SCORE_KEY, String(score));
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function currentTolerance() {
  return clamp(0.18 - (state.level - 1) * 0.01, 0.05, 0.18);
}

function functionPool() {
  if (state.level <= 3) return ["sin", "cos"];
  return ["sin", "cos", "tan"];
}

function randomTarget() {
  const funcs = functionPool();
  const fn = funcs[Math.floor(Math.random() * funcs.length)];

  if (fn === "tan") {
    const raw = (Math.random() * 3.4 - 1.7);
    return { fn, value: Number(raw.toFixed(3)) };
  }

  const raw = (Math.random() * 2 - 1);
  return { fn, value: Number(raw.toFixed(3)) };
}

function evaluate(angleDeg, fn) {
  const r = toRadians(angleDeg);
  if (fn === "sin") return Math.sin(r);
  if (fn === "cos") return Math.cos(r);
  return Math.tan(r);
}

function updateHud() {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
  streakEl.textContent = state.streak;
  livesEl.textContent = state.lives;
  bestScoreEl.textContent = getHighScore();
}

function drawCircle() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 150;
  const rad = toRadians(state.angle);
  const x = centerX + radius * Math.cos(rad);
  const y = centerY - radius * Math.sin(rad);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - radius - 18, centerY);
  ctx.lineTo(centerX + radius + 18, centerY);
  ctx.moveTo(centerX, centerY - radius - 18);
  ctx.lineTo(centerX, centerY + radius + 18);
  ctx.stroke();

  ctx.strokeStyle = "#4cc9f0";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.fillStyle = "#80ed99";
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "16px sans-serif";
  ctx.fillText(`θ = ${state.angle}°`, 20, 30);
  ctx.fillText(`sinθ ${Math.sin(rad).toFixed(3)}`, 20, 52);
  ctx.fillText(`cosθ ${Math.cos(rad).toFixed(3)}`, 20, 74);
  ctx.fillText(`tanθ ${Math.tan(rad).toFixed(3)}`, 20, 96);
}

function nextRound() {
  state.target = randomTarget();
  const tolerance = currentTolerance();
  roundTypeEl.textContent = `Round ${state.round}`;
  promptEl.textContent = `Match ${state.target.fn}(θ) = ${state.target.value.toFixed(3)}`;
  toleranceEl.textContent = `Tolerance: ±${tolerance.toFixed(3)}`;
  resultText.textContent = "";

  startTimer();
}

function scoreGuess(distance, timedOut = false) {
  const tolerance = currentTolerance();

  if (timedOut) {
    state.streak = 0;
    state.lives -= 1;
    resultText.textContent = "⏱️ Time ran out! You lost a life.";
    return;
  }

  if (distance <= tolerance) {
    const accuracyBonus = Math.round((tolerance - distance) * 1200);
    const streakBonus = state.streak * 10;
    const basePoints = 100 + state.level * 12;
    state.score += basePoints + Math.max(0, accuracyBonus) + streakBonus;
    state.streak += 1;
    resultText.textContent = `✅ Great shot! Off by ${distance.toFixed(3)}. +${basePoints + Math.max(0, accuracyBonus) + streakBonus} points.`;
  } else {
    state.streak = 0;
    state.lives -= 1;
    resultText.textContent = `❌ Off by ${distance.toFixed(3)}. That's outside tolerance.`;
  }
}

function maybeLevelUp() {
  if (state.round % 4 === 0) {
    state.level += 1;
    state.roundSeconds = clamp(state.roundSeconds - 0.6, 7, 14);
    resultText.textContent += ` Level up! Level ${state.level}.`;
  }
}

function finishRound(timedOut = false) {
  clearInterval(state.timerId);
  const guess = evaluate(state.angle, state.target.fn);
  const distance = Math.abs(guess - state.target.value);
  if (timedOut) {
    scoreGuess(distance, true);
  } else {
    scoreGuess(distance, false);
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
  maybeLevelUp();
  setTimeout(nextRound, 900);
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
      finishRound(true);
    }
  }, 100);
}

function startGame() {
  state.score = 0;
  state.level = 1;
  state.streak = 0;
  state.lives = 3;
  state.round = 1;
  state.roundSeconds = 14;
  state.running = true;
  startBtn.hidden = true;
  restartBtn.hidden = true;
  resultText.textContent = "Find the best angle and lock it in.";
  updateHud();
  nextRound();
}

function endGame() {
  state.running = false;
  clearInterval(state.timerId);
  promptEl.textContent = "Run complete!";
  toleranceEl.textContent = `Final score: ${state.score}`;
  resultText.textContent = `🏁 Game over. You reached level ${state.level} with a best score of ${getHighScore()}.`;
  restartBtn.hidden = false;
}

function updateAngle(newAngle) {
  state.angle = ((newAngle % 360) + 360) % 360;
  angleInput.value = state.angle;
  angleValue.textContent = `${state.angle}°`;
  drawCircle();
}

angleInput.addEventListener("input", (event) => {
  updateAngle(Number(event.target.value));
});

submitGuessBtn.addEventListener("click", () => {
  if (!state.running) return;
  finishRound(false);
});

nudgeLeftBtn.addEventListener("click", () => updateAngle(state.angle - 5));
nudgeRightBtn.addEventListener("click", () => updateAngle(state.angle + 5));

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") updateAngle(state.angle - 1);
  if (event.key === "ArrowRight") updateAngle(state.angle + 1);
  if (event.key === "Enter" && state.running) finishRound(false);
});

updateHud();
updateAngle(0);
resultText.textContent = "Beat the timer, protect your 3 lives, and build a streak for combo bonuses.";
