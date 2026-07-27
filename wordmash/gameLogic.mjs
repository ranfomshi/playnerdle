export function normalizeAnswer(input) {
  return String(input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function overlapLength(first, second) {
  const left = normalizeAnswer(first);
  const right = normalizeAnswer(second);
  const max = Math.min(left.length, right.length);

  for (let size = max; size > 0; size -= 1) {
    if (left.slice(-size) === right.slice(0, size)) {
      return size;
    }
  }

  return 0;
}

export function mashWord(first, second) {
  const left = normalizeAnswer(first);
  const right = normalizeAnswer(second);
  return left + right.slice(overlapLength(left, right));
}

export function scoreAnswerParts(guess, first, second) {
  const value = normalizeAnswer(guess);
  const left = normalizeAnswer(first);
  const right = normalizeAnswer(second);
  const secondSuffix = right.slice(overlapLength(left, right));

  return {
    firstCorrect: value.startsWith(left),
    secondCorrect: value.endsWith(secondSuffix)
  };
}
