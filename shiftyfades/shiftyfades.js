const state = { level: 1, lives: 3, streak: 0, target: null, settling: false };
const MAX_LIVES = 5;
const TOTAL_LEVELS = 50;
const OPTION_COUNT = 5;

const els = {
  level: document.querySelector("#level"), lives: document.querySelector("#lives"), best: document.querySelector("#highScore"),
  target: document.querySelector("#target"), options: document.querySelector("#options"), message: document.querySelector("#message"),
  bonus: document.querySelector("#bonusProgress"), bonusContainer: document.querySelector("#bonusContainer"), bonusLabel: document.querySelector("#bonusLabel"), bonusCopy: document.querySelector("#bonusCopy"), streakDots: document.querySelector("#streakDots"), dots: [...document.querySelectorAll("#streakDots i")],
  help: document.querySelector("#help-dialog"), gameOver: document.querySelector("#gameOverModal"), win: document.querySelector("#winModal"), toast: document.querySelector("#toast"),
};

function randomColour() {
  const min = 50;
  return { r: Math.floor(Math.random() * (256 - min)) + min, g: Math.floor(Math.random() * (256 - min)) + min, b: Math.floor(Math.random() * (256 - min)) + min };
}
function css(colour) { return `rgb(${colour.r}, ${colour.g}, ${colour.b})`; }
function similarColour(base) {
  const maxOffset = Math.max(60 - state.level * 1.5, 15);
  const tweak = value => Math.min(255, Math.max(0, value + Math.floor(Math.random() * (maxOffset * 2 + 1)) - maxOffset));
  return { r: tweak(base.r), g: tweak(base.g), b: tweak(base.b) };
}
function matches(a,b) { return a.r === b.r && a.g === b.g && a.b === b.b; }

function updateHud() {
  const cleared = state.level - 1;
  const storedBest = Number(localStorage.getItem("shiftyHighScore") || 0);
  const best = Math.max(storedBest, cleared);
  localStorage.setItem("shiftyHighScore", String(best));
  els.level.textContent = state.level;
  els.lives.textContent = Array.from({length:state.lives},()=>"●").join(" ");
  els.lives.setAttribute("aria-label", `${state.lives} lives`);
  els.best.textContent = best;
  const atMaxLives = state.lives >= MAX_LIVES;
  const progress = atMaxLives ? 5 : state.streak % 5;
  els.bonusContainer.classList.toggle("is-maxed", atMaxLives);
  els.bonus.style.width = `${progress * 20}%`;
  els.bonusLabel.textContent = atMaxLives ? "Maximum lives reached" : progress ? `${progress} of 5 matches` : "Build a five-match streak";
  els.bonusCopy.textContent = atMaxLives ? "You have all five. Keep matching to protect your streak." : "Earn an extra life after five correct answers.";
  els.dots.forEach((dot,index) => dot.classList.toggle("filled", index < progress));
  els.streakDots.setAttribute("aria-label", atMaxLives ? "Maximum lives reached: 5 lives" : `${progress} of 5 matches toward an extra life`);
}

function setMessage(text, tone = "") {
  els.message.textContent = text;
  els.message.className = tone;
}

function setupLevel() {
  state.settling = false;
  state.target = randomColour();
  els.target.style.background = css(state.target);
  els.options.innerHTML = "";
  setMessage("Take your time. There is one exact match.");
  const correctIndex = Math.floor(Math.random() * OPTION_COUNT);
  for (let index = 0; index < OPTION_COUNT; index += 1) {
    let colour = index === correctIndex ? state.target : similarColour(state.target);
    while (index !== correctIndex && matches(colour,state.target)) colour = similarColour(state.target);
    const button = document.createElement("button");
    button.className = "option";
    button.type = "button";
    button.style.background = css(colour);
    button.setAttribute("aria-label", `Colour option ${index + 1}`);
    button.addEventListener("click", () => choose(colour,button));
    els.options.append(button);
  }
  updateHud();
}

function choose(colour,button) {
  if (state.settling || button.disabled) return;
  if (matches(colour,state.target)) {
    state.settling = true;
    button.classList.add("correct");
    [...els.options.children].forEach(option => { option.disabled = true; });
    state.streak += 1;
    let message = "Exact match.";
    if (state.streak % 5 === 0) {
      if (state.lives < MAX_LIVES) { state.lives += 1; message += " You earned a life."; }
      else message += " You already have the maximum five lives.";
    }
    state.level += 1;
    setMessage(message,"good");
    updateHud();
    if (state.level > TOTAL_LEVELS) window.setTimeout(() => els.win.showModal(),650);
    else window.setTimeout(setupLevel,650);
  } else {
    button.disabled = true;
    button.classList.add("wrong");
    state.lives -= 1;
    state.streak = 0;
    updateHud();
    if (state.lives <= 0) {
      setMessage("No lives remaining.","bad");
      document.querySelector("#finalLevel").textContent = state.level;
      els.gameOver.showModal();
    } else setMessage("That colour shifted. Try another.","bad");
  }
}

function reset() {
  state.level = 1; state.lives = 3; state.streak = 0;
  [els.gameOver,els.win].forEach(dialog => { if (dialog.open) dialog.close(); });
  setupLevel();
}

async function share() {
  const text = `I reached level ${state.level} in Shifty Fades. Can you spot the exact match?`;
  try {
    if (navigator.share) await navigator.share({title:"Shifty Fades",text,url:location.href});
    else await navigator.clipboard.writeText(`${text}\n${location.href}`);
    showToast(navigator.share ? "Share sheet opened" : "Result copied");
  } catch (error) { if (error.name !== "AbortError") showToast("Couldn’t share this result"); }
}
function showToast(text) { els.toast.textContent=text; els.toast.classList.add("show"); setTimeout(()=>els.toast.classList.remove("show"),2200); }

document.querySelector("#help-button").addEventListener("click",()=>els.help.showModal());
document.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>button.closest("dialog").close()));
document.querySelector("#playAgain").addEventListener("click",reset);
document.querySelector("#playAgainWin").addEventListener("click",reset);
document.querySelector("#shareGame").addEventListener("click",share);
document.querySelector("#shareGameWin").addEventListener("click",share);
setupLevel();
if (!localStorage.getItem("shiftyIntroSeen")) { els.help.showModal(); localStorage.setItem("shiftyIntroSeen","true"); }
