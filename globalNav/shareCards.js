const GAME_URL = 'https://bludle.com';

export function resultShareUrl(slug) {
  const url = new URL(`${GAME_URL}/${slug}/`);
  url.searchParams.set('utm_source', 'player_share');
  url.searchParams.set('utm_medium', 'game_share');
  url.searchParams.set('utm_campaign', `${slug}_result`);
  return url.toString();
}

export function wordBridgeShareCard({ number, left, right, attempts, won }) {
  const score = won ? attempts.length : 'X';
  const path = attempts.map(correct => correct ? '🟩' : '🟫').join('');
  return `Word Bridge #${number} ${score}/3\n\n${left.toUpperCase()} + ?  ·  ? + ${right.toUpperCase()}\n${path}\n\nCan you find the word that connects both sides?`;
}

export function afterimageShareCard({ date, accuracy, rounds }) {
  const best = Math.max(...rounds);
  const bestRound = rounds.indexOf(best) + 1;
  const trail = rounds.map(value => `${value}%`).join(' → ');
  return `Afterimage ${date} · ${accuracy}% accuracy\n\nMemory trail: ${trail}\nSharpest recall: colour ${bestRound} (${best}%).\n\nFive colours from memory. How much would you remember?`;
}

export function secondSightShareCard({ date, answers, score, bestStreak }) {
  const correct = answers.filter(answer => answer.correct).length;
  const blocks = answers.map(answer => answer.correct ? '🟦' : '⬜').join('');
  const byType = (types) => {
    const matches = answers.filter(answer => types.includes(answer.dimension));
    return `${matches.filter(answer => answer.correct).length}/${matches.length}`;
  };
  return `Second Sight ${date} · ${correct}/${answers.length}\n${blocks}\n\nBrightness ${byType(['lightness'])} · Intensity ${byType(['chroma'])} · Hue ${byType(['redGreen', 'yellowBlue'])}\nBest streak: ${bestStreak} · ${score.toLocaleString('en-GB')} points\n\nWhich colour changes would you spot?`;
}
