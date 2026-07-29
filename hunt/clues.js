export function coordinateClue(scanX, scanY, treasureX, treasureY) {
  const xDistance = Math.abs(treasureX - scanX);
  const yDistance = Math.abs(treasureY - scanY);

  return {
    xDirection: Math.sign(treasureX - scanX),
    yDirection: Math.sign(treasureY - scanY),
    xDistance,
    yDistance,
    totalDistance: xDistance + yDistance,
    axisDifference: Math.abs(xDistance - yDistance)
  };
}

export function stepLabel(value) {
  return `${value} ${value === 1 ? 'step' : 'steps'}`;
}

export function clueSummary(direction, totalDistance, axisDifference) {
  return `${direction} · ${stepLabel(totalDistance)} total · X/Y difference ${axisDifference}`;
}

export function axisDifferenceCopy(axisDifference) {
  if (axisDifference === 0) {
    return 'The horizontal and vertical distances are equal.';
  }

  return `The horizontal and vertical distances differ by ${stepLabel(axisDifference)}.`;
}
