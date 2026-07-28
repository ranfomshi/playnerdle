const VALID_STATUSES = new Set(['exact', 'present', 'absent']);

export function firstGuessProperties(guess, statuses, gameMode) {
  const firstGuess = String(guess || '').trim().toLowerCase();
  if (!/^[a-z]{5}$/.test(firstGuess) || !Array.isArray(statuses) || statuses.length !== 5) return null;
  if (statuses.some(status => !VALID_STATUSES.has(status))) return null;

  const count = status => statuses.filter(value => value === status).length;
  const uniqueLetterCount = new Set(firstGuess).size;

  return {
    first_guess: firstGuess,
    exact_letters: count('exact'),
    present_letters: count('present'),
    absent_letters: count('absent'),
    vowel_count: [...firstGuess].filter(letter => 'aeiou'.includes(letter)).length,
    unique_letter_count: uniqueLetterCount,
    has_repeated_letter: uniqueLetterCount < firstGuess.length,
    game_mode: gameMode === 'practice' ? 'practice' : 'daily',
  };
}
