const HIGH_SCORE_KEY = "bludle_trigtrek_high_score";

const state = {
  score: 0,
  level: 1,
  streak: 0,
  shotsLeft: 5,
  canFire: true,
  wonLevel: false,
  projectile: null,
  target: null,
  obstacles: [],
  lastTime: 0,
  fireUnlocked: false,
  challenge: null,
};

const gravity = 98;
const POWER_SCALE = 2.7;

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const bestScoreEl = document.getElementById("bestScore");
const shotsEl = document.getElementById("shots");
const angleInput = document.getElementById("angleInput");
const powerInput = document.getElementById("powerInput");
const angleValue = document.getElementById("angleValue");
const powerValue = document.getElementById("powerValue");
const fireBtn = document.getElementById("fireBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const messageEl = document.getElementById("message");
const formulaReadout = document.getElementById("formulaReadout");
const trajectoryReadout = document.getElementById("trajectoryReadout");
const formulaChallengeEl = document.getElementById("formulaChallenge");
const formulaInput = document.getElementById("formulaInput");
const unlockBtn = document.getElementById("unlockBtn");
const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");

function highScore() {
  return Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
}

function saveHighScore() {
  if (state.score > highScore()) {
    localStorage.setItem(HIGH_SCORE_KEY, String(state.score));
  }
}



function currentShotPhysics() {
  const angle = Number(angleInput.value);
  const power = Number(powerInput.value);
  const rad = degToRad(angle);
  const scaledPower = power * POWER_SCALE;
  const vx = scaledPower * Math.cos(rad);
  const vy = scaledPower * Math.sin(rad);
  return { angle, power, rad, scaledPower, vx, vy };
}

function createFormulaChallenge() {
  const { angle, power, vx, vy } = currentShotPhysics();
  const types = [
    {
      key: "vx",
      prompt: `Unlock Fire: with θ=${angle}° and power=${power}, calculate vx = (power×${POWER_SCALE.toFixed(1)})×cos(θ).`,
      expected: vx,
    },
    {
      key: "vy",
      prompt: `Unlock Fire: with θ=${angle}° and power=${power}, calculate vy = (power×${POWER_SCALE.toFixed(1)})×sin(θ).`,
      expected: vy,
    },
  ];

  state.challenge = types[Math.floor(Math.random() * types.length)];
  state.fireUnlocked = false;
  formulaChallengeEl.textContent = state.challenge.prompt;
  formulaInput.value = "";
}

function unlockFireIfCorrect() {
  if (!state.canFire || state.wonLevel || state.shotsLeft <= 0) return;

  const userValue = Number(formulaInput.value);
  if (!Number.isFinite(userValue)) {
    messageEl.textContent = "Enter a number to unlock fire.";
    return;
  }

  const tolerance = Math.max(1, Math.abs(state.challenge.expected) * 0.03);
  if (Math.abs(userValue - state.challenge.expected) <= tolerance) {
    state.fireUnlocked = true;
    messageEl.textContent = "✅ Formula solved. Fire unlocked for this shot.";
  } else {
    state.fireUnlocked = false;
    messageEl.textContent = `❌ Not quite. Try again (within ±${tolerance.toFixed(1)}).`;
  }
}

function updateHud() {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
  streakEl.textContent = state.streak;
  shotsEl.textContent = state.shotsLeft;
  bestScoreEl.textContent = highScore();
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function setReadout() {
  const { angle, power, scaledPower, vx, vy } = currentShotPhysics();
  const flightTime = (2 * vy) / gravity;
  const range = Math.max(0, vx * flightTime);
  const peakHeight = (vy ** 2) / (2 * gravity);

  angleValue.textContent = `${angle}°`;
  powerValue.textContent = `${power}`;
  formulaReadout.textContent = `vx=${vx.toFixed(1)} (power·cosθ), vy=${vy.toFixed(1)} (power·sinθ)`;
  trajectoryReadout.textContent = `Predicted range: ${range.toFixed(0)} px | Peak height: ${peakHeight.toFixed(0)} px`;

  if (state.canFire && !state.wonLevel && !state.projectile) {
    createFormulaChallenge();
  }
}

function resetLevel(fullReset = false) {
  if (fullReset) {
    state.score = 0;
    state.level = 1;
    state.streak = 0;
  }

  state.shotsLeft = 5;
  state.canFire = true;
  state.wonLevel = false;
  state.projectile = null;
  nextBtn.hidden = true;
  fireBtn.hidden = false;
  restartBtn.hidden = true;

  const targetRadius = Math.max(13, 20 - state.level * 1.2);
  state.target = {
    x: 670 + Math.random() * 220,
    y: 220 - Math.random() * 120,
    r: targetRadius,
    dir: Math.random() > 0.5 ? 1 : -1,
    speed: 32 + state.level * 5,
  };

  state.obstacles = [];
  const obstacleCount = Math.min(1 + Math.floor(state.level / 2), 3);
  for (let i = 0; i < obstacleCount; i += 1) {
    state.obstacles.push({
      x: 360 + i * 130 + Math.random() * 40,
      y: 250 - Math.random() * 110,
      w: 26,
      h: 110 + Math.random() * 70,
    });
  }

  const targetDx = state.target.x - 70;
  const targetDy = 330 - state.target.y;
  messageEl.textContent = `Level ${state.level}: target is ~${targetDx.toFixed(0)}px away and ${targetDy.toFixed(0)}px high. ${state.shotsLeft} shots.`;
  createFormulaChallenge();
  updateHud();
}

function circleRectCollision(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return (dx * dx + dy * dy) < (circle.r * circle.r);
}

function launch() {
  if (!state.canFire || state.shotsLeft <= 0) return;
  if (!state.fireUnlocked) {
    messageEl.textContent = "Solve the formula challenge before firing.";
    return;
  }

  const angle = Number(angleInput.value);
  const power = Number(powerInput.value);
  const rad = degToRad(angle);

  state.projectile = {
    x0: 70,
    y0: 330,
    x: 70,
    y: 330,
    r: 8,
    vx: power * POWER_SCALE * Math.cos(rad),
    vy: power * POWER_SCALE * Math.sin(rad),
    t: 0,
    active: true,
  };

  state.canFire = false;
  state.fireUnlocked = false;
  state.shotsLeft -= 1;
  updateHud();
}

function onMiss(reason) {
  state.projectile = null;
  if (state.shotsLeft > 0) {
    state.canFire = true;
    createFormulaChallenge();
    messageEl.textContent = `${reason} Shots left: ${state.shotsLeft}. Solve formula to fire again.`;
  } else {
    state.streak = 0;
    messageEl.textContent = `Out of shots! Run over. Final score ${state.score}.`;
    restartBtn.hidden = false;
    fireBtn.hidden = true;
  }
  updateHud();
}

function onHit() {
  state.wonLevel = true;
  state.canFire = false;
  state.projectile = null;
  fireBtn.hidden = true;
  nextBtn.hidden = false;

  const points = 200 + state.level * 60 + state.shotsLeft * 35 + state.streak * 25;
  state.score += points;
  state.streak += 1;
  saveHighScore();
  updateHud();

  messageEl.textContent = `🎯 Bullseye! +${points} points. Click Next Level.`;
  formulaChallengeEl.textContent = "Level cleared!";
}

function update(dt) {
  if (!state.wonLevel) {
    state.target.x += state.target.dir * state.target.speed * dt;
    if (state.target.x > canvas.width - state.target.r - 20) state.target.dir = -1;
    if (state.target.x < 540) state.target.dir = 1;
  }

  if (!state.projectile || !state.projectile.active) return;

  state.projectile.t += dt;
  const t = state.projectile.t;
  state.projectile.x = state.projectile.x0 + state.projectile.vx * t;
  state.projectile.y = state.projectile.y0 - (state.projectile.vy * t - 0.5 * gravity * t * t);

  if (
    state.projectile.x < -20 ||
    state.projectile.x > canvas.width + 20 ||
    state.projectile.y > 360 ||
    state.projectile.y < -20
  ) {
    onMiss("Missed target.");
    return;
  }

  const dx = state.projectile.x - state.target.x;
  const dy = state.projectile.y - state.target.y;
  if (Math.sqrt(dx * dx + dy * dy) <= state.projectile.r + state.target.r) {
    onHit();
    return;
  }

  for (const obstacle of state.obstacles) {
    if (circleRectCollision(state.projectile, obstacle)) {
      onMiss("Blocked by wall.");
      return;
    }
  }
}

function drawLauncher() {
  const angle = degToRad(Number(angleInput.value));
  const length = 46;
  const baseX = 70;
  const baseY = 330;

  ctx.fillStyle = "#2b2d42";
  ctx.fillRect(baseX - 14, baseY - 10, 28, 20);

  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + Math.cos(angle) * length, baseY - Math.sin(angle) * length);
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  for (const obstacle of state.obstacles) {
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
  }

  ctx.fillStyle = "#ff595e";
  ctx.beginPath();
  ctx.arc(state.target.x, state.target.y, state.target.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(state.target.x, state.target.y, state.target.r * 0.55, 0, Math.PI * 2);
  ctx.stroke();

  drawLauncher();

  if (state.projectile) {
    ctx.fillStyle = "#90e0ef";
    ctx.beginPath();
    ctx.arc(state.projectile.x, state.projectile.y, state.projectile.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function tick(ts) {
  if (!state.lastTime) state.lastTime = ts;
  const dt = Math.min((ts - state.lastTime) / 1000, 0.033);
  state.lastTime = ts;

  update(dt);
  draw();
  requestAnimationFrame(tick);
}

fireBtn.addEventListener("click", launch);
unlockBtn.addEventListener("click", unlockFireIfCorrect);
nextBtn.addEventListener("click", () => {
  state.level += 1;
  resetLevel(false);
});
restartBtn.addEventListener("click", () => {
  resetLevel(true);
});

angleInput.addEventListener("input", setReadout);
powerInput.addEventListener("input", setReadout);
formulaInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    unlockFireIfCorrect();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    event.preventDefault();
    launch();
  }
});

setReadout();
updateHud();
resetLevel(true);
requestAnimationFrame(tick);
