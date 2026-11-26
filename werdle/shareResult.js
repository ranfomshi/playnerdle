export const SHARE_VARIANTS = Object.freeze({ control: 'control', challenge: 'challenge' });

export function chooseShareVariant(random = Math.random) {
  return random() < 0.5 ? SHARE_VARIANTS.control : SHARE_VARIANTS.challenge;
}

const count = (row, status) => row.filter(value => value === status).length;
const letters = number => `${number} ${number === 1 ? 'letter' : 'letters'}`;

export function solveStory(scoredRows, outcome, maxAttempts) {
  if (!scoredRows.length || !['won', 'lost'].includes(outcome)) return null;
  const first = scoredRows[0];
  const exact = count(first, 'exact');
  const present = count(first, 'present');
  const found = exact + present;
  const opening = found === 0
    ? 'Your opening guess found no letters from the answer.'
    : exact === 0
      ? `Your opening guess found ${letters(present)}, all in the wrong places.`
      : present === 0
        ? `Your opening guess put ${letters(exact)} in the right place.`
        : `Your opening guess found ${letters(found)}; ${exact} ${exact === 1 ? 'was' : 'were'} already in place.`;

  let progress;
  if (outcome === 'won' && scoredRows.length === 1) {
    progress = 'You solved it on your first try.';
  } else if (outcome === 'won') {
    const beforeSolve = scoredRows.slice(0, -1).map(row => count(row, 'exact'));
    const bestPlaced = Math.max(...beforeSolve);
    if (bestPlaced >= 3) {
      const turn = beforeSolve.indexOf(bestPlaced) + 1;
      progress = `Guess ${turn} had ${letters(bestPlaced)} in place before the solve.`;
    } else if (scoredRows.length === maxAttempts) {
      progress = 'You cracked it on the final try.';
    } else {
      progress = `You solved it in ${scoredRows.length} guesses.`;
    }
  } else {
    const bestFound = Math.max(...scoredRows.map(row => count(row, 'exact') + count(row, 'present')));
    progress = bestFound === 0
      ? 'None of your guesses found a matching letter.'
      : `Your strongest clue found ${letters(bestFound)} from the answer.`;
  }
  return { opening, progress };
}

export function shareUrl(variant, { mode, date, status, guessCount } = {}) {
  const url = new URL('https://bludle.com/werdle/');
  url.searchParams.set('utm_source', 'player_share');
  url.searchParams.set('utm_medium', 'game_share');
  url.searchParams.set('utm_campaign', 'werdle_result');
  url.searchParams.set('utm_content', variant === SHARE_VARIANTS.challenge ? SHARE_VARIANTS.challenge : SHARE_VARIANTS.control);
  if (mode === 'daily' && /^\d{4}-\d{2}-\d{2}$/.test(date || '') && ['won', 'lost'].includes(status)) {
    url.searchParams.set('challenge_day', date);
    url.searchParams.set('challenge_score', status === 'won' ? String(guessCount) : 'X');
  }
  return url.toString();
}

export function readSharedChallenge(search, currentDay, maxAttempts) {
  const query = new URLSearchParams(search);
  if (query.get('utm_source') !== 'player_share' || query.get('utm_medium') !== 'game_share' ||
      query.get('utm_campaign') !== 'werdle_result' || !Object.values(SHARE_VARIANTS).includes(query.get('utm_content'))) return null;
  const day = query.get('challenge_day');
  const score = query.get('challenge_score');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '') ||
      (score !== 'X' && (!/^\d+$/.test(score || '') || Number(score) < 1 || Number(score) > maxAttempts))) return null;
  return { current: day === currentDay, score: score === 'X' ? null : Number(score) };
}

export function shareText({ mode, date, status, guessCount, maxAttempts, rows, variant, story }) {
  const score = status === 'won' ? guessCount : 'X';
  const insight = story ? `\n\n${story.opening}\n${story.progress}` : '';
  const result = `Werdle ${mode === 'daily' ? date : 'Practice'} ${score}/${maxAttempts}\n\n${rows}${insight}`;
  if (mode !== 'daily' || variant !== SHARE_VARIANTS.challenge) return result;
  return `${result}\n\nCan you crack today's word?`;
}
