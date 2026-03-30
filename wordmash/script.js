const MAX_ATTEMPTS = 6;
const DAY_MS = 24 * 60 * 60 * 1000;
const EPOCH_UTC = Date.UTC(2024, 0, 1);
const HOWTO_DISMISSED_KEY = "wordmash-howto-dismissed";

const PUZZLES = [
  // {
  //   clue1: "A glowing object in the night sky",
  //   answer1: "star",
  //   clue2: "Someone who creates paintings or music",
  //   answer2: "artist"
  // },

  // {
  //   clue1: "Material used to write on",
  //   answer1: "paper",
  //   clue2: "A human being",
  //   answer2: "person"
  // },
  // {
  //   clue1: "A mythical fire-breathing creature",
  //   answer1: "dragon",
  //   clue2: "Still happening",
  //   answer2: "ongoing"
  // },
  // {
  //   clue1: "A shiny precious metal",
  //   answer1: "silver",
  //   clue2: "A jury's decision",
  //   answer2: "verdict"
  // },
  // {
  //   clue1: "The coldest season",
  //   answer1: "winter",
  //   clue2: "A station where trains arrive",
  //   answer2: "terminal"
  // },
  // {
  //   clue1: "The blooming part of a plant",
  //   answer1: "flower",
  //   clue2: "Rubber used to remove pencil marks",
  //   answer2: "eraser"
  // },
  {
    clue1: "Loud sound during a storm",
    answer1: "thunder",
    clue2: "Skin layer beneath the epidermis",
    answer2: "dermis"
  },
  {
    clue1: "A body of land surrounded by water",
    answer1: "island",
    clue2: "The area where an event takes place",
    answer2: "landscape"
  },
  {
    clue1: "Frozen water",
    answer1: "ice",
    clue2: "A cool room used for storage",
    answer2: "cellar"
  },
  {
    clue1: "A high card in many games",
    answer1: "ace",
    clue2: "Pottery",
    answer2: "ceramic"
  },
  {
    clue1: "A hand-held source of light",
    answer1: "torch",
    clue2: "Length of connected links",
    answer2: "chain"
  },
  {
    clue1: "A huge ocean wave",
    answer1: "tsunami",
    clue2: "Imitating or copying someone",
    answer2: "mimic"
  },
  {
    clue1: "A place to watch films",
    answer1: "cinema",
    clue2: "A mechacanical device",
    answer2: "machine"
  },
  {
    clue1: "A stage performance with songs",
    answer1: "musical",
    clue2: "A tool to do math/s",
    answer2: "calculator"
  },
  {
    clue1: "Chinese grain dish",
    answer1: "egg fried rice",
    clue2: "a frozen treat on a stick",
    answer2: "ice lolly"
  },
  {
    clue1: "A panda's snack",
    answer1: "bamboo",
    clue2: "Aussie throwing returning stick",
    answer2: "boomerang"
  },
  {
    clue1: "Traditional Australian Instrument",
    answer1: "didgeridoo",
    clue2: "Prophesised end of the world",
    answer2: "doomsday"
  },
  {
    clue1: "poultry",
    answer1: "chicken",
    clue2: "state of USA",
    answer2: "Kentucky"
  },
  {
    clue1: "demon from the Queen song",
    answer1: "beelzebub",
    clue2: "frothy relaxing soak",
    answer2: "bubble bath",
  },
  {
    clue1: "jumping marsupial",
    answer1: "kangaroo",
    clue2: "autonomous vacuum cleaner",
    answer2: "roomba",
  },
  {
    clue1: "1000 years",
    answer1: "millennium",
    clue2: "keeps Rhianna dry",
    answer2: "umbrella",
  },
  {
    clue1: "animated sitcom starring Peter Griffin",
    answer1: "family guy",
    clue2: "Madonna's film director ex-partner",
    answer2: "guy richie",
  }, {
    clue1: "a great ape",
    answer1: "gorilla",
    clue2: "milky coffee",
    answer2: "latte",
  }, {
    clue1: "windy reptile",
    answer1: "snake",
    clue2: "used for electronic typing",
    answer2: "keyboard",
  }, {
    clue1: "make believe",
    answer1: "pretend",
    clue2: "camera down the throat",
    answer2: "endoscopy",
  }, {
    clue1: "japanese card game",
    answer1: "pokemon",
    clue2: "family board game",
    answer2: "monopoly",
  },
  {
    clue1: "arctic bird",
    answer1: "puffin",
    clue2: "builds igloos",
    answer2: "inuit",
  },
  {
    clue1: "make believe",
    answer1: "pretend",
    clue2: "camera down the throat",
    answer2: "endoscopy",
  },
  {
    clue1: "arachnid superhero",
    answer1: "spiderman",
    clue2: "aardvark",
    answer2: "anteater",
  },
  {
    clue1: "accompanies lightning",
    answer1: "thunder",
    clue2: "prepares burials",
    answer2: "undertaker",
  },
  {
    clue1: "Puts out fires",
    answer1: "extinguisher",
    clue2: "it's elementary",
    answer2: "Sherlock",
  },
  {
    clue1: "golden retriever",
    answer1: "labrador",
    clue2: "communal sleeping room",
    answer2: "dormitory",
  },
  {
    clue1: "mobile home",
    answer1: "caravan",
    clue2: "destroying property",
    answer2: "vandalism",
  },
  {
    clue1: "Spanish lager",
    answer1: "san miguel",
    clue2: "trunked animal",
    answer2: "elephant",
  },
  {
    clue1: "folable computer",
    answer1: "laptop",
    clue2: "game of one-upmanship",
    answer2: "top trumps",
  },
  {
    clue1: "of the cat family",
    answer1: "feline",
    clue2: "american dancing",
    answer2: "line dancing",
  },
  {
    clue1: "American lift",
    answer1: "elevator",
    clue2: "blue UK politics",
    answer2: "tories",
  },
  {
    clue1: "popular Amazon home assistant",
    answer1: "Alexa",
    clue2: "formal proficiency tests",
    answer2: "exams",
  },
  {
    clue1: "upholds the law",
    answer1: "police officer",
    clue2: "mythical greek dog",
    answer2: "cerberus",
  },
  {
    clue1: "South African prisoner",
    answer1: "Nelson Mandela",
    clue2: "to give further detail",
    answer2: "elaborate",
  },
  {
    clue1: "2nd on the moon",
    answer1: "Buzz Aldrin",
    clue2: "A film within a film",
    answer2: "inception",
  },
  {
    clue1: "South African Monster Actress",
    answer1: "Charlize Theron",
    clue2: "R9",
    answer2: "Ronaldo",
  },
  {
    clue1: "Shakespeare's wife",
    answer1: "Anne Hathaway",
    clue2: "Christmas Hymn/carol",
    answer2: "away in a manger",
  },
  {
    clue1: "Officiates a sporting event",
    answer1: "referee",
    clue2: "blond lawyer",
    answer2: "reece witherspoon",
  },
  {
    clue1: "Ulrika's ex",
    answer1: "stan collymore",
    clue2: "there or there abouts",
    answer2: "more or less",
  },
  {
    clue1: "Capital of Hungary",
    answer1: "Budapest",
    clue2: "destroys insects",
    answer2: "pesticide",
  },
  {
    clue1: "legendary sword",
    answer1: "excallibur",
    clue2: "Dolly's crush",
    answer2: "Burt Reynolds",
  },
  {
    clue1: "auditory creepy crawly",
    answer1: "earwig",
    clue2: "Saturday night",
    answer2: "wigfield",
  },
  {
    clue1: "large flat fish",
    answer1: "stingray",
    clue2: "gangster actor",
    answer2: "ray winston",
  },


];

function sanitize(input) {
  return input.toLowerCase().replace(/[^a-z]/g, "");
}

function overlapLength(first, second) {
  const max = Math.min(first.length, second.length);
  for (let size = max; size > 0; size--) {
    if (first.slice(-size) === second.slice(0, size)) {
      return size;
    }
  }
  return 0;
}

function mashWord(first, second) {
  const overlap = overlapLength(first, second);
  return first + second.slice(overlap);
}

function scoreAnswerParts(guess, first, second) {
  const overlap = overlapLength(first, second);
  const secondSuffix = second.slice(overlap);

  return {
    firstCorrect: guess.startsWith(first),
    secondCorrect: guess.endsWith(secondSuffix)
  };
}

function todayUtcKey() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function puzzleIndexForToday() {
  const todayStart = new Date();
  const dayNumber = Math.floor(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), todayStart.getUTCDate()) - EPOCH_UTC) / DAY_MS;
  return ((dayNumber % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
}

function getStateKey(dayKey) {
  return `wordmash-state-${dayKey}`;
}

function loadState(dayKey) {
  const raw = localStorage.getItem(getStateKey(dayKey));
  if (!raw) {
    return { attempts: [], solved: false };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      solved: Boolean(parsed.solved)
    };
  } catch {
    return { attempts: [], solved: false };
  }
}

function saveState(dayKey, state) {
  localStorage.setItem(getStateKey(dayKey), JSON.stringify(state));
}

function getStreak() {
  return Number(localStorage.getItem("wordmash-streak") || 0);
}

function setStreak(value) {
  localStorage.setItem("wordmash-streak", String(value));
}

function updateStreak(dayKey, solved) {
  if (!solved) {
    return getStreak();
  }

  const previousWin = localStorage.getItem("wordmash-last-win");
  if (previousWin === dayKey) {
    return getStreak();
  }

  const prevDate = previousWin ? Date.parse(`${previousWin}T00:00:00Z`) : null;
  const currDate = Date.parse(`${dayKey}T00:00:00Z`);

  let streak = getStreak();
  if (prevDate && currDate - prevDate === DAY_MS) {
    streak += 1;
  } else {
    streak = 1;
  }

  setStreak(streak);
  localStorage.setItem("wordmash-last-win", dayKey);
  return streak;
}

function createShareText(dayKey, attempts, solved) {
  const rows = attempts.map(attempt => (attempt.correct ? "🟩" : "⬜")).join("");
  const score = solved ? attempts.length : "X";
  return `Word Mash ${dayKey} ${score}/${MAX_ATTEMPTS}\n${rows}\nNo spoilers. Can you beat me?\nhttps://www.bludle.com/wordmash/`;
}

function initialiseHowToModal() {
  const overlay = document.getElementById("howto-overlay");
  const dismissBtn = document.getElementById("dismiss-howto");
  const openBtn = document.getElementById("open-howto");

  const openModal = () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    localStorage.setItem(HOWTO_DISMISSED_KEY, "true");
  };

  if (localStorage.getItem(HOWTO_DISMISSED_KEY) !== "true") {
    openModal();
  }

  dismissBtn.addEventListener("click", closeModal);
  openBtn.addEventListener("click", openModal);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeModal();
    }
  });
}

function initialise() {
  const dayKey = todayUtcKey();
  const puzzle = PUZZLES[puzzleIndexForToday()];
  const expected = mashWord(puzzle.answer1, puzzle.answer2);
  const state = loadState(dayKey);

  const clueOne = document.getElementById("clue-one");
  const clueTwo = document.getElementById("clue-two");
  const puzzleDate = document.getElementById("puzzle-date");
  const streakBadge = document.getElementById("streak-badge");
  const feedback = document.getElementById("feedback");
  const form = document.getElementById("guess-form");
  const guessInput = document.getElementById("guess-input");
  const submitBtn = document.getElementById("submit-btn");
  const attemptsEl = document.getElementById("attempts");
  const resultSection = document.getElementById("result");
  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");
  const shareBtn = document.getElementById("share-btn");

  clueOne.textContent = puzzle.clue1;
  clueTwo.textContent = puzzle.clue2;
  puzzleDate.textContent = `Puzzle ${dayKey}`;

  function renderAttempts() {
    attemptsEl.innerHTML = "";
    state.attempts.forEach((attempt, index) => {
      const li = document.createElement("li");
      li.className = attempt.correct ? "good" : "bad";
      li.innerHTML = `<span>${index + 1}. ${attempt.value}</span><span>${attempt.correct ? "Correct" : "Try again"}</span>`;
      attemptsEl.appendChild(li);
    });
  }

  function setLockedResult() {
    const lost = !state.solved && state.attempts.length >= MAX_ATTEMPTS;
    if (!state.solved && !lost) {
      return;
    }

    form.hidden = true;
    resultSection.hidden = false;

    if (state.solved) {
      const streak = updateStreak(dayKey, true);
      streakBadge.textContent = `Streak: ${streak}`;
      resultTitle.textContent = "You nailed it!";
      resultMessage.textContent = "Nice work. Share your result without spoilers and challenge a friend.";
      feedback.textContent = "Great solve. Come back tomorrow for a fresh mash.";
    } else {
      streakBadge.textContent = `Streak: ${getStreak()}`;
      resultTitle.textContent = "Out of guesses";
      resultMessage.textContent = "No worries. Share your run and challenge a friend to beat it.";
      feedback.textContent = "Good attempt. A new puzzle unlocks tomorrow.";
    }
  }

  renderAttempts();
  streakBadge.textContent = `Streak: ${getStreak()}`;
  setLockedResult();

  form.addEventListener("submit", event => {
    event.preventDefault();

    const value = sanitize(guessInput.value);
    if (!value) {
      feedback.textContent = "Type a word mash first.";
      return;
    }

    if (state.solved || state.attempts.length >= MAX_ATTEMPTS) {
      feedback.textContent = "Today's puzzle is complete. Come back tomorrow.";
      return;
    }

    const correct = value === expected;
    const partScore = scoreAnswerParts(value, puzzle.answer1, puzzle.answer2);
    state.attempts.push({ value, correct });
    if (correct) {
      state.solved = true;
    }

    saveState(dayKey, state);
    renderAttempts();

    if (correct) {
      feedback.textContent = "Perfect overlap!";
      setLockedResult();
      return;
    }

    const remaining = MAX_ATTEMPTS - state.attempts.length;
    if (remaining > 0) {
      if (partScore.firstCorrect && partScore.secondCorrect) {
        feedback.textContent = `So close — both clue answers are there. ${remaining} ${remaining === 1 ? "guess" : "guesses"} left.`;
      } else if (partScore.firstCorrect || partScore.secondCorrect) {
        feedback.textContent = `Nice — you've got one clue answer right. ${remaining} ${remaining === 1 ? "guess" : "guesses"} left.`;
      } else {
        feedback.textContent = `Not quite. ${remaining} ${remaining === 1 ? "guess" : "guesses"} left.`;
      }
    } else {
      feedback.textContent = "No guesses left.";
    }

    if (state.attempts.length >= MAX_ATTEMPTS) {
      setLockedResult();
    }

    guessInput.value = "";
    guessInput.focus();
  });

  shareBtn.addEventListener("click", async () => {
    const text = createShareText(dayKey, state.attempts, state.solved);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Word Mash",
          text
        });
        feedback.textContent = "Shared successfully.";
        return;
      }

      await navigator.clipboard.writeText(text);
      feedback.textContent = "Share text copied to clipboard.";
    } catch {
      feedback.textContent = "Could not auto-share. Copy this result manually:";
      prompt("Copy your result", text);
    }
  });

  submitBtn.disabled = state.solved || state.attempts.length >= MAX_ATTEMPTS;
  initialiseHowToModal();
}

window.addEventListener("DOMContentLoaded", initialise);
