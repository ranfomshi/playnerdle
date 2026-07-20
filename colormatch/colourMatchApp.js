const dayNumber = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
const targetColour = window.colorList[dayNumber % window.colorList.length];
const targetChannels = targetColour.match(/\d+/g).map(Number);
const storage = {
  scores: "historicColourMatchScores",
  lastDay: "lastColourPlayDay",
  red: "redGuess",
  green: "greenGuess",
  blue: "blueGuess",
  intro: "colourMatchinstructionsSeen",
};

const els = {
  target: document.querySelector("#targetRepresentation"),
  guess: document.querySelector("#guessRepresentation"),
  mixValue: document.querySelector("#mixValue"),
  numbers: [document.querySelector("#guessValue1"), document.querySelector("#guessValue2"), document.querySelector("#guessValue3")],
  ranges: [document.querySelector("#redRange"), document.querySelector("#greenRange"), document.querySelector("#blueRange")],
  submit: document.querySelector("#submitBtn"),
  status: document.querySelector("#round-status"),
  help: document.querySelector("#help-dialog"),
  result: document.querySelector("#result-dialog"),
  stats: document.querySelector("#stats-dialog"),
  toast: document.querySelector("#snackbar"),
};

function clamp(value) { return Math.max(0, Math.min(255, Number(value) || 0)); }
function values() { return els.numbers.map(input => clamp(input.value)); }
function rgb(channels) { return `rgb(${channels.join(", ")})`; }

function updateMix(sourceIndex) {
  if (Number.isInteger(sourceIndex)) {
    const value = clamp(els.numbers[sourceIndex].value);
    els.numbers[sourceIndex].value = value;
    els.ranges[sourceIndex].value = value;
  }
  const channels = values();
  els.guess.style.background = rgb(channels);
  els.mixValue.textContent = rgb(channels);
}

function setInputs(channels) {
  channels.forEach((value, index) => {
    els.numbers[index].value = value;
    els.ranges[index].value = value;
  });
  updateMix();
}

function scores() {
  try { return JSON.parse(localStorage.getItem(storage.scores) || "[]"); }
  catch { return []; }
}

function renderStats() {
  const history = scores();
  const total = history.reduce((sum, value) => sum + value, 0);
  document.querySelector("#averageScore").textContent = history.length ? (total / history.length).toFixed(1) : "—";
  document.querySelector("#bestScore").textContent = history.length ? Math.min(...history) : "—";
  document.querySelector("#totalScore").textContent = total;
  document.querySelector("#gamesPlayed").textContent = history.length;
  document.querySelector("#score-history").innerHTML = history.slice(-12).reverse().map(value => `<span>${value}</span>`).join("");
}

function showResult(channels, openDialog = true) {
  const differences = channels.map((value, index) => Math.abs(targetChannels[index] - value));
  const total = differences.reduce((sum, value) => sum + value, 0);
  document.querySelector("#result-mark").textContent = total;
  document.querySelector("#result-title").textContent = total === 0 ? "Perfect match." : total <= 30 ? "Exceptionally close." : total <= 90 ? "Strong colour sense." : "A bold attempt.";
  document.querySelector("#result-target").style.background = targetColour;
  document.querySelector("#result-player").style.background = rgb(channels);
  document.querySelector("#result-target-rgb").textContent = rgb(targetChannels);
  document.querySelector("#result-player-rgb").textContent = rgb(channels);
  ["red", "green", "blue"].forEach((name, index) => { document.querySelector(`#result-${name}`).textContent = differences[index]; });
  els.status.textContent = `Submitted — total difference ${total}. Come back tomorrow for a new colour.`;
  if (openDialog && !els.result.open) els.result.showModal();
  return total;
}

function lockBoard() {
  [...els.numbers, ...els.ranges, els.submit].forEach(control => { control.disabled = true; });
}

function submit() {
  if (localStorage.getItem(storage.lastDay) === String(dayNumber)) return;
  const channels = values();
  const total = showResult(channels);
  localStorage.setItem(storage.scores, JSON.stringify([...scores(), total]));
  localStorage.setItem(storage.lastDay, String(dayNumber));
  [storage.red, storage.green, storage.blue].forEach((key, index) => localStorage.setItem(key, String(channels[index])));
  lockBoard();
  renderStats();
}

async function share() {
  const latest = scores().at(-1);
  const text = `Colour Match — today’s total difference: ${latest}\nCan you get closer?`;
  try {
    if (navigator.share) await navigator.share({ title: "Colour Match", text, url: location.href });
    else await navigator.clipboard.writeText(`${text}\n${location.href}`);
    toast(navigator.share ? "Share sheet opened" : "Result copied");
  } catch (error) { if (error.name !== "AbortError") toast("Couldn’t share this result"); }
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

els.target.style.background = targetColour;
els.ranges.forEach((range, index) => range.addEventListener("input", () => { els.numbers[index].value = range.value; updateMix(); }));
els.numbers.forEach((input, index) => input.addEventListener("input", () => updateMix(index)));
els.submit.addEventListener("click", submit);
document.querySelector("#help-button").addEventListener("click", () => els.help.showModal());
document.querySelector("#stats-button").addEventListener("click", () => { renderStats(); els.stats.showModal(); });
document.querySelector("#share-button").addEventListener("click", share);
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));

if (localStorage.getItem(storage.lastDay) === String(dayNumber)) {
  const saved = [storage.red, storage.green, storage.blue].map(key => clamp(localStorage.getItem(key)));
  setInputs(saved);
  showResult(saved, false);
  lockBoard();
} else {
  updateMix();
  if (!localStorage.getItem(storage.intro)) {
    els.help.showModal();
    localStorage.setItem(storage.intro, "true");
  }
}
renderStats();
