const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const now = new Date();
const dailyKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
const launchDay = Date.UTC(2026, 9, 12);
const dailyNumber = Math.max(0, Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - launchDay) / 86400000));
const ruleDefinitions = {
  shift: { name: "Letter shift", icon: "+N", description: "Move every letter", parameter: true },
  mirror: { name: "Mirror alphabet", icon: "AZ", description: "A↔Z, B↔Y", parameter: false },
  reverse: { name: "Reverse words", icon: "↶", description: "Read each word back", parameter: false },
  pairs: { name: "Swap neighbours", icon: "⇄", description: "Choose where pairing starts", parameter: false },
  alternate: { name: "Alternating shift", icon: "±", description: "Tune size and starting direction", parameter: true },
  rotate: { name: "Rotate words", icon: "↻N", description: "Turn letters within words", parameter: true },
  vowels: { name: "Cycle vowels", icon: "AE", description: "Move through A E I O U", parameter: true },
  wordOrder: { name: "Reverse word order", icon: "W↔", description: "Last word becomes first", parameter: false },
  wordLength: { name: "Word-length shift", icon: "LEN", description: "Choose forward or backward", parameter: false },
  position: { name: "Position ladder", icon: "123", description: "Choose direction and counting scope", parameter: false },
  spaceShift: { name: "Space shift", icon: "␠N", description: "Move every word break", parameter: true }
};

const phraseBank = window.RulebreakerPhraseBank;

function hashText(value) {
  return [...value].reduce((hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261);
}

function solutionLabel(rule) {
  const name = ruleDefinitions[rule.type].name;
  if (["shift", "rotate", "vowels", "spaceShift"].includes(rule.type)) return `${name} ${rule.amount >= 0 ? "+" : ""}${rule.amount}`;
  if (rule.type === "alternate") return `${name} ${rule.polarity > 0 ? "+" : "−"}${Math.abs(rule.amount)} first`;
  if (rule.type === "pairs") return `${name} from ${rule.phase === 1 ? "position 2" : "position 1"}`;
  if (rule.type === "wordLength") return `${name} ${rule.direction > 0 ? "forward" : "backward"}`;
  if (rule.type === "position") return `${name} ${rule.direction > 0 ? "forward" : "backward"}, ${rule.scope === "phrase" ? "whole phrase" : "each word"}`;
  return name;
}

function buildDailyPuzzle() {
  const seed = hashText(dailyKey);
  const direction = seed % 2 === 0 ? 1 : -1;
  const phase = seed % 2;
  const polarity = seed % 2 === 0 ? 1 : -1;
  const scope = seed % 3 === 0 ? "phrase" : "word";
  const variants = [
    [{ type: "alternate", amount: (seed % 3) + 1, polarity }, { type: "reverse" }],
    [{ type: "wordLength", direction }, { type: "mirror" }],
    [{ type: "position", direction, scope }, { type: "pairs", phase }],
    [{ type: "pairs", phase }, { type: "rotate", amount: (seed % 3) + 1 }],
    [{ type: "vowels", amount: -1 }, { type: "wordOrder" }, { type: "shift", amount: direction * ((seed % 4) + 2) }],
    [{ type: "wordLength", direction }, { type: "reverse" }, { type: "alternate", amount: (seed % 3) + 1, polarity }],
    [{ type: "spaceShift", amount: direction * ((seed % 2) + 1) }, { type: "mirror" }]
  ];
  const solution = variants[seed % variants.length].map(rule => ({ ...rule }));
  const ruleNames = solution.map(rule => ruleDefinitions[rule.type].name);
  return {
    label: `Daily #${dailyNumber + 1}`,
    message: phraseBank[dailyNumber % phraseBank.length],
    solution,
    brief: `${solution.length} modules · daily key ${dailyKey}`,
    hints: [
      `The decoded phrase contains ${phraseBank[dailyNumber % phraseBank.length].split(" ").length} words and needs ${solution.length} modules.`,
      `${ruleNames[0]} is the first module in today's chain.`,
      `Today's tuned chain is ${solution.map(solutionLabel).join(" → ")}.`
    ]
  };
}

const puzzles = [
  {
    label: "Training",
    message: "MEET ME AT NOON",
    solution: [{ type: "shift", amount: -3 }],
    starter: [{ type: "shift", amount: 0 }],
    brief: "1 module · numerical rule",
    hints: ["Letters have moved, but their order has not.", "The Letter shift module is already in the correct position.", "Move the shift backwards through the alphabet."]
  },
  buildDailyPuzzle(),
  {
    label: "Transmission 01",
    message: "THE SECRET HIDES IN PLAIN SIGHT",
    solution: [{ type: "mirror" }, { type: "shift", amount: -2 }],
    brief: "2 modules · both change letters",
    hints: ["One module flips the alphabet end-to-end.", "Mirror alphabet comes before the numerical module.", "The final shift moves backwards by two."]
  },
  {
    label: "Transmission 02",
    message: "EVERY MACHINE LEAVES A PATTERN",
    solution: [{ type: "pairs" }, { type: "shift", amount: 3 }, { type: "reverse" }],
    brief: "3 modules · order and letters change",
    hints: ["The first module swaps neighbouring characters.", "A numerical module sits in the middle.", "Finish by reversing each word."]
  },
  {
    label: "Transmission 03",
    message: "ORDER CHANGES EVERYTHING",
    solution: [{ type: "alternate", amount: 2 }, { type: "reverse" }, { type: "shift", amount: -4 }],
    brief: "3 modules · two numerical rules",
    hints: ["Start with the rule that treats alternating letters differently.", "Reverse words is the middle module.", "The final shift moves backwards by four."]
  },
  {
    label: "Transmission 04",
    message: "THE WRONG RULE CAN LOOK ALMOST RIGHT",
    solution: [{ type: "shift", amount: 5 }, { type: "pairs" }, { type: "mirror" }],
    brief: "3 modules · one numerical rule",
    hints: ["The numerical rule comes first.", "Swap neighbouring characters before using the alphabet mirror.", "The opening shift moves forward by five."]
  },
  {
    label: "Transmission 05",
    message: "SMALL CLUES REVEAL BIG SYSTEMS",
    solution: [{ type: "vowels", amount: -1 }, { type: "rotate", amount: 2 }],
    brief: "2 modules · letters move inside words",
    hints: ["Only vowels change in the first module.", "The second module rotates whole words internally.", "Cycle vowels backwards once, then rotate words forward twice."]
  },
  {
    label: "Transmission 06",
    message: "READ THE EDGES BEFORE THE CENTRE",
    solution: [{ type: "wordOrder" }, { type: "mirror" }, { type: "rotate", amount: -1 }],
    brief: "3 modules · words and letters move",
    hints: ["Begin by reversing the order of the words.", "Mirror the alphabet in the middle.", "Finish by rotating each word backwards once."]
  }
];

const els = {
  ciphertext: document.querySelector("#ciphertext"),
  output: document.querySelector("#output"),
  palette: document.querySelector("#rule-palette"),
  pipeline: document.querySelector("#pipeline"),
  feedback: document.querySelector("#feedback"),
  meter: document.querySelector("#signal-meter-fill"),
  signalLabel: document.querySelector("#signal-label"),
  moduleLabel: document.querySelector("#module-count-label"),
  puzzleNumber: document.querySelector("#puzzle-number"),
  missionBrief: document.querySelector("#mission-brief"),
  hintButton: document.querySelector("#hint-button"),
  hintText: document.querySelector("#hint-text"),
  lock: document.querySelector("#lock-button"),
  clear: document.querySelector("#clear-button"),
  help: document.querySelector("#help-dialog"),
  result: document.querySelector("#result-dialog"),
  share: document.querySelector("#share-button")
};

const stateKey = `rulebreaker:${dailyKey}`;
let puzzleIndex = localStorage.getItem("rulebreaker_training_complete") === "1" ? 1 : 0;
let puzzle;
let ciphertext = "";
let pipeline = [];
let edits = 0;
let attempts = 0;
let hintsUsed = 0;
let resultAction = "share";

function startTracking(trigger = "first_edit") {
  window.BludleEngagement?.start({ trigger });
}

function readDailyState() {
  try { return JSON.parse(localStorage.getItem(stateKey) || "null"); } catch { return null; }
}

function saveDailyState(grade) {
  if (puzzleIndex !== 1) return;
  try { localStorage.setItem(stateKey, JSON.stringify({ finished: true, edits, attempts, hintsUsed, grade })); } catch { /* Storage is optional. */ }
}

function shiftLetter(character, amount) {
  const index = alphabet.indexOf(character);
  if (index < 0) return character;
  return alphabet[(index + amount + 260) % 26];
}

function shift(text, amount) {
  return [...text].map(character => shiftLetter(character, amount)).join("");
}

function mirror(text) {
  return [...text].map(character => {
    const index = alphabet.indexOf(character);
    return index < 0 ? character : alphabet[25 - index];
  }).join("");
}

function reverseWords(text) {
  return text.split(" ").map(word => [...word].reverse().join("")).join(" ");
}

function swapPairs(text, phase = 0) {
  return text.split(" ").map(word => {
    const letters = [...word];
    for (let index = phase; index < letters.length - 1; index += 2) {
      [letters[index], letters[index + 1]] = [letters[index + 1], letters[index]];
    }
    return letters.join("");
  }).join(" ");
}

function alternatingShift(text, amount, polarity = 1) {
  let letterIndex = 0;
  return [...text].map(character => {
    if (!alphabet.includes(character)) return character;
    const result = shiftLetter(character, letterIndex % 2 === 0 ? amount * polarity : -amount * polarity);
    letterIndex += 1;
    return result;
  }).join("");
}

function rotateWords(text, amount) {
  return text.split(" ").map(word => {
    if (!word.length) return word;
    const rotation = ((amount % word.length) + word.length) % word.length;
    return rotation === 0 ? word : word.slice(-rotation) + word.slice(0, -rotation);
  }).join(" ");
}

function cycleVowels(text, amount) {
  const vowels = "AEIOU";
  return [...text].map(character => {
    const index = vowels.indexOf(character);
    return index < 0 ? character : vowels[(index + amount + 50) % vowels.length];
  }).join("");
}

function reverseWordOrder(text) {
  return text.split(" ").reverse().join(" ");
}

function shiftByWordLength(text, direction = 1) {
  return text.split(" ").map(word => [...word].map(character => shiftLetter(character, word.length * direction)).join("")).join(" ");
}

function shiftSpaces(text, amount) {
  if (!text.length) return text;
  const characters = [...text];
  const letters = characters.filter(character => character !== " ");
  const shiftedSpaces = Array(characters.length).fill(false);
  const offset = ((amount % characters.length) + characters.length) % characters.length;
  characters.forEach((character, index) => {
    if (character === " ") shiftedSpaces[(index + offset) % characters.length] = true;
  });
  let letterIndex = 0;
  return shiftedSpaces.map(isSpace => isSpace ? " " : letters[letterIndex++]).join("");
}

function shiftByPosition(text, direction = 1, scope = "word") {
  let phraseIndex = 0;
  return text.split(" ").map(word => [...word].map((character, wordIndex) => {
    const position = scope === "phrase" ? ++phraseIndex : wordIndex + 1;
    return shiftLetter(character, position * direction);
  }).join("")).join(" ");
}

function applyRule(text, rule) {
  if (rule.type === "shift") return shift(text, rule.amount);
  if (rule.type === "mirror") return mirror(text);
  if (rule.type === "reverse") return reverseWords(text);
  if (rule.type === "pairs") return swapPairs(text, rule.phase || 0);
  if (rule.type === "alternate") return alternatingShift(text, rule.amount, rule.polarity || 1);
  if (rule.type === "rotate") return rotateWords(text, rule.amount);
  if (rule.type === "vowels") return cycleVowels(text, rule.amount);
  if (rule.type === "wordOrder") return reverseWordOrder(text);
  if (rule.type === "wordLength") return shiftByWordLength(text, rule.direction || 1);
  if (rule.type === "position") return shiftByPosition(text, rule.direction || 1, rule.scope || "word");
  if (rule.type === "spaceShift") return shiftSpaces(text, rule.amount);
  return text;
}

function inverseRule(rule) {
  if (["shift", "alternate", "rotate", "vowels", "spaceShift"].includes(rule.type)) return { ...rule, amount: -rule.amount };
  if (["wordLength", "position"].includes(rule.type)) return { ...rule, direction: -(rule.direction || 1) };
  return { ...rule };
}

function encrypt(message, decodeRules) {
  return [...decodeRules].reverse().map(inverseRule).reduce((text, rule) => applyRule(text, rule), message);
}

function runPipeline() {
  return pipeline.reduce((text, rule) => applyRule(text, rule), ciphertext);
}

function signalStrength(output) {
  const target = puzzle.message;
  if (output === target) return 100;
  const comparable = Math.max(target.length, output.length);
  let matches = 0;
  for (let index = 0; index < comparable; index += 1) if (target[index] === output[index]) matches += 1;
  const exact = matches / comparable;
  const fragments = [" THE ", " A ", " IN ", " IS ", "ING", "ER", "TH"].filter(part => ` ${output} `.includes(part)).length;
  return Math.min(100, Math.round(exact * 82 + fragments * 3));
}

function signalCopy(strength) {
  if (strength === 100) return ["Clear", "#168c65"];
  if (strength > 66) return ["Strong signal", "#168c65"];
  if (strength > 34) return ["Words emerging", "#2f6fed"];
  if (strength > 10) return ["Weak signal", "#e08a21"];
  return ["Static", "#ff765f"];
}

function renderOutput() {
  const output = runPipeline();
  els.output.classList.add("changing");
  requestAnimationFrame(() => {
    els.output.textContent = output;
    els.output.classList.remove("changing");
  });
  const strength = signalStrength(output);
  const [label, colour] = signalCopy(strength);
  els.signalLabel.textContent = label;
  els.signalLabel.style.color = colour;
  els.meter.style.width = `${Math.max(3, strength)}%`;
  els.meter.style.background = colour;
  els.moduleLabel.textContent = pipeline.length === 0 ? "NO MODULES" : `${pipeline.length} MODULE${pipeline.length === 1 ? "" : "S"}`;
}

function renderPalette() {
  els.palette.innerHTML = "";
  Object.entries(ruleDefinitions).forEach(([type, definition]) => {
    const active = pipeline.some(rule => rule.type === type);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `rule-choice${active ? " active" : ""}`;
    button.setAttribute("aria-pressed", String(active));
    button.innerHTML = `<span class="rule-icon">${definition.icon}</span><span><strong>${definition.name}</strong><small>${definition.description}${active ? " · active" : ""}</small></span>`;
    button.addEventListener("click", () => toggleRule(type));
    els.palette.append(button);
  });
}

function ruleDetail(rule) {
  if (rule.type === "shift") return `${rule.amount >= 0 ? "+" : ""}${rule.amount} across the alphabet`;
  if (rule.type === "pairs") return rule.phase === 1 ? "Leave first; swap 2–3, 4–5…" : "Swap 1–2, 3–4, 5–6…";
  if (rule.type === "alternate") {
    const first = rule.amount * (rule.polarity || 1);
    return `${first >= 0 ? "+" : ""}${first}, ${-first >= 0 ? "+" : ""}${-first}, repeat`;
  }
  if (rule.type === "rotate") return `${rule.amount >= 0 ? "+" : ""}${rule.amount} places inside each word`;
  if (rule.type === "vowels") return `${rule.amount >= 0 ? "+" : ""}${rule.amount} through A E I O U`;
  if (rule.type === "wordLength") return `${(rule.direction || 1) > 0 ? "Forward" : "Backward"} by each word's length`;
  if (rule.type === "position") return `${(rule.direction || 1) > 0 ? "+" : "−"}1, ${(rule.direction || 1) > 0 ? "+" : "−"}2… ${rule.scope === "phrase" ? "across the phrase" : "reset each word"}`;
  if (rule.type === "spaceShift") return `Move every gap ${Math.abs(rule.amount)} place${Math.abs(rule.amount) === 1 ? "" : "s"} ${rule.amount >= 0 ? "right" : "left"}`;
  return ruleDefinitions[rule.type].description;
}

function optionControls(rule) {
  const controls = [];
  if (ruleDefinitions[rule.type].parameter) {
    controls.push(`<span class="parameter"><button type="button" data-action="decrease" aria-label="Decrease value">−</button><output>${rule.amount >= 0 ? "+" : ""}${rule.amount}</output><button type="button" data-action="increase" aria-label="Increase value">+</button></span>`);
  }
  if (rule.type === "pairs") controls.push(`<button type="button" data-action="togglePhase">${rule.phase === 1 ? "START AT 2" : "START AT 1"}</button>`);
  if (rule.type === "alternate") controls.push(`<button type="button" data-action="togglePolarity">${(rule.polarity || 1) > 0 ? "+ FIRST" : "− FIRST"}</button>`);
  if (rule.type === "wordLength") controls.push(`<button type="button" data-action="toggleDirection">${(rule.direction || 1) > 0 ? "FORWARD" : "BACKWARD"}</button>`);
  if (rule.type === "position") {
    controls.push(`<button type="button" data-action="toggleDirection">${(rule.direction || 1) > 0 ? "FORWARD" : "BACKWARD"}</button>`);
    controls.push(`<button type="button" data-action="toggleScope">${rule.scope === "phrase" ? "WHOLE PHRASE" : "EACH WORD"}</button>`);
  }
  return controls.join("");
}

function renderPipeline() {
  els.pipeline.innerHTML = "";
  if (!pipeline.length) {
    els.pipeline.innerHTML = '<div class="pipeline-empty">The machine is empty.<br>Add a module above.</div>';
  } else {
    pipeline.forEach((rule, index) => {
      const module = document.createElement("div");
      module.className = "module";
      const options = optionControls(rule);
      module.innerHTML = `<div class="module-main"><span class="module-order">${String(index + 1).padStart(2, "0")}</span><span class="module-copy"><strong>${ruleDefinitions[rule.type].name}</strong><small>${ruleDetail(rule)}</small></span><span class="module-actions"><button type="button" data-action="up" aria-label="Move rule up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-action="down" aria-label="Move rule down" ${index === pipeline.length - 1 ? "disabled" : ""}>↓</button><button type="button" data-action="remove" aria-label="Remove rule">×</button></span></div>${options ? `<div class="module-options">${options}</div>` : ""}`;
      module.querySelectorAll("button").forEach(button => button.addEventListener("click", () => handleModuleAction(index, button.dataset.action)));
      els.pipeline.append(module);
    });
  }
  renderPalette();
  renderOutput();
}

function toggleRule(type) {
  startTracking();
  const activeIndex = pipeline.findIndex(rule => rule.type === type);
  const removing = activeIndex >= 0;
  if (removing) pipeline.splice(activeIndex, 1);
  else pipeline.push(defaultRule(type));
  edits += 1;
  els.feedback.className = "feedback";
  els.feedback.textContent = removing ? "Module removed. The shortened chain ran immediately." : "Module added. Watch how the live output changed.";
  renderPipeline();
}

function defaultRule(type) {
  const rule = { type };
  if (ruleDefinitions[type].parameter) rule.amount = 1;
  if (type === "pairs") rule.phase = 0;
  if (type === "alternate") rule.polarity = 1;
  if (["wordLength", "position"].includes(type)) rule.direction = 1;
  if (type === "position") rule.scope = "word";
  return rule;
}

function handleModuleAction(index, action) {
  startTracking();
  if (action === "remove") pipeline.splice(index, 1);
  if (action === "up" && index > 0) [pipeline[index - 1], pipeline[index]] = [pipeline[index], pipeline[index - 1]];
  if (action === "down" && index < pipeline.length - 1) [pipeline[index + 1], pipeline[index]] = [pipeline[index], pipeline[index + 1]];
  if (action === "decrease") pipeline[index].amount = Math.max(-8, pipeline[index].amount - 1);
  if (action === "increase") pipeline[index].amount = Math.min(8, pipeline[index].amount + 1);
  if (action === "togglePhase") pipeline[index].phase = pipeline[index].phase === 1 ? 0 : 1;
  if (action === "togglePolarity") pipeline[index].polarity = -(pipeline[index].polarity || 1);
  if (action === "toggleDirection") pipeline[index].direction = -(pipeline[index].direction || 1);
  if (action === "toggleScope") pipeline[index].scope = pipeline[index].scope === "phrase" ? "word" : "phrase";
  edits += 1;
  els.feedback.className = "feedback";
  els.feedback.textContent = "The machine reran with your new configuration.";
  renderPipeline();
}

function lockDecode() {
  startTracking("first_lock");
  attempts += 1;
  if (runPipeline() === puzzle.message) {
    const grade = edits <= puzzle.solution.length + 4 ? "A" : edits <= puzzle.solution.length + 10 ? "B" : "C";
    if (puzzle.label === "Training") localStorage.setItem("rulebreaker_training_complete", "1");
    saveDailyState(grade);
    document.querySelector("#result-message").textContent = puzzle.message;
    document.querySelector("#result-edits").textContent = edits;
    document.querySelector("#result-attempts").textContent = attempts;
    document.querySelector("#result-grade").textContent = grade;
    els.feedback.className = "feedback good";
    els.feedback.textContent = "Clean transmission. The message is fully restored.";
    els.result.dataset.outcome = "won";
    els.result.dataset.dailyComplete = String(puzzleIndex === 1);
    resultAction = puzzle.label === "Training" ? "daily" : "share";
    els.share.querySelector("span:first-child").textContent = resultAction === "daily" ? "Start today's transmission" : "Share result";
    els.result.showModal();
    if (puzzleIndex === 1) window.BludleEngagement?.complete({ surface: els.result, outcome: "won" });
  } else {
    const strength = signalStrength(runPipeline());
    els.feedback.className = "feedback error";
    els.feedback.textContent = diagnosticMessage(strength);
    els.lock.animate([{ transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "none" }], { duration: 220 });
  }
}

function diagnosticMessage(strength) {
  const expectedTypes = puzzle.solution.map(rule => rule.type);
  const actualTypes = pipeline.map(rule => rule.type);
  const correctTypeCount = actualTypes.filter(type => expectedTypes.includes(type)).length;
  const correctPositions = actualTypes.filter((type, index) => expectedTypes[index] === type).length;
  const sameModules = actualTypes.length === expectedTypes.length && [...actualTypes].sort().join("|") === [...expectedTypes].sort().join("|");
  const valuesCorrect = pipeline.every((rule, index) => !ruleDefinitions[rule.type].parameter || puzzle.solution[index]?.type !== rule.type || puzzle.solution[index].amount === rule.amount);

  if (sameModules && correctPositions < expectedTypes.length) return "You have the right modules, but at least one is in the wrong position.";
  if (sameModules && correctPositions === expectedTypes.length && !valuesCorrect) return "The modules and their order are correct. Tune the numerical value.";
  if (correctTypeCount > 0) return `${correctTypeCount} of ${expectedTypes.length} required module${expectedTypes.length === 1 ? "" : "s"} ${correctTypeCount === 1 ? "is" : "are"} in your chain.`;
  return strength > 65 ? "Very close—but at least one module, value or position is still wrong." : "None of the required modules are in the machine yet. Try a different rule family.";
}

function revealHint() {
  if (hintsUsed >= puzzle.hints.length) return;
  startTracking("first_hint");
  els.hintText.textContent = puzzle.hints[hintsUsed];
  hintsUsed += 1;
  els.hintButton.querySelector("span").textContent = `${hintsUsed}/${puzzle.hints.length}`;
  if (hintsUsed === puzzle.hints.length) {
    els.hintButton.firstChild.textContent = "All hints revealed ";
    els.hintButton.disabled = true;
  }
}

function loadPuzzle(index) {
  puzzleIndex = (index + puzzles.length) % puzzles.length;
  puzzle = puzzles[puzzleIndex];
  ciphertext = encrypt(puzzle.message, puzzle.solution);
  pipeline = (puzzle.starter || []).map(rule => ({ ...rule }));
  edits = 0;
  attempts = 0;
  hintsUsed = 0;
  els.ciphertext.textContent = ciphertext;
  els.puzzleNumber.textContent = puzzle.label.startsWith("Transmission") ? puzzle.label.replace("Transmission ", "") : puzzle.label.replace("Daily ", "").toUpperCase();
  els.missionBrief.textContent = puzzle.brief;
  els.hintText.textContent = "Hints become more specific each time.";
  els.hintButton.disabled = false;
  els.hintButton.firstChild.textContent = "Reveal a hint ";
  els.hintButton.querySelector("span").textContent = `0/${puzzle.hints.length}`;
  els.feedback.className = "feedback";
  els.feedback.textContent = puzzle.starter ? "The correct module is fitted. Tune its value until the message becomes clear." : "Start by adding a rule to the machine.";
  renderPipeline();

  const restored = puzzleIndex === 1 ? readDailyState() : null;
  if (restored?.finished) {
    pipeline = puzzle.solution.map(rule => ({ ...rule }));
    edits = restored.edits || 0;
    attempts = restored.attempts || 1;
    hintsUsed = restored.hintsUsed || 0;
    renderPipeline();
    document.querySelector("#result-message").textContent = puzzle.message;
    document.querySelector("#result-edits").textContent = edits;
    document.querySelector("#result-attempts").textContent = attempts;
    document.querySelector("#result-grade").textContent = restored.grade || "A";
    els.result.dataset.outcome = "won";
    els.result.dataset.dailyComplete = "true";
    resultAction = "share";
    requestAnimationFrame(() => els.result.showModal());
  }
}

async function shareResult() {
  if (resultAction === "daily") {
    els.result.close();
    loadPuzzle(1);
    return;
  }
  const copy = `Rulebreaker #${dailyNumber + 1} decoded\n${document.querySelector("#result-grade").textContent} grade · ${edits} rule edits\nhttps://bludle.com/rulebreaker/`;
  try {
    if (navigator.share) await navigator.share({ title: "Rulebreaker", text: copy });
    else {
      await navigator.clipboard.writeText(copy);
      els.share.querySelector("span:first-child").textContent = "Copied to clipboard";
    }
  } catch { /* Cancelling the share sheet is not an error. */ }
}

els.lock.addEventListener("click", lockDecode);
els.hintButton.addEventListener("click", revealHint);
els.clear.addEventListener("click", () => {
  if (!pipeline.length) return;
  startTracking();
  pipeline = [];
  edits += 1;
  els.feedback.className = "feedback";
  els.feedback.textContent = "Workbench cleared. Try a different theory.";
  renderPipeline();
});
document.querySelector("#help-button").addEventListener("click", () => els.help.showModal());
document.querySelectorAll(".dialog-close, .dialog-action").forEach(button => button.addEventListener("click", () => els.help.close()));
els.share.addEventListener("click", shareResult);
document.querySelector(".result-close").addEventListener("click", () => els.result.close());
document.addEventListener("keydown", event => { if (event.key === "Escape") { if (els.help.open) els.help.close(); if (els.result.open) els.result.close(); } });

loadPuzzle(puzzleIndex);
