export const SHARE_VARIANTS = Object.freeze({ control: 'control', challenge: 'challenge' });

export function chooseShareVariant(random = Math.random) {
  return random() < 0.5 ? SHARE_VARIANTS.control : SHARE_VARIANTS.challenge;
}

export function shareUrl(variant) {
  const url = new URL('https://bludle.com/werdle/');
  url.searchParams.set('utm_source', 'player_share');
  url.searchParams.set('utm_medium', 'game_share');
  url.searchParams.set('utm_campaign', 'werdle_result');
  url.searchParams.set('utm_content', variant === SHARE_VARIANTS.challenge ? SHARE_VARIANTS.challenge : SHARE_VARIANTS.control);
  return url.toString();
}

export function shareText({ mode, date, status, guessCount, maxAttempts, rows, variant }) {
  const score = status === 'won' ? guessCount : 'X';
  const result = `Werdle ${mode === 'daily' ? date : 'Practice'} ${score}/${maxAttempts}\n\n${rows}`;
  if (mode !== 'daily' || variant !== SHARE_VARIANTS.challenge) return result;
  return `${result}\n\nCan you crack today's word?`;
}
