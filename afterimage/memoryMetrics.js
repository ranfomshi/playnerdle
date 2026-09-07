function srgbToOklab([red, green, blue]) {
  const linear = channel => {
    const value = channel / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [red, green, blue].map(linear);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  const lightness = .2104542553 * l + .793617785 * m - .0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s;
  const labB = .0259040371 * l + .7827717662 * m - .808675766 * s;
  const chroma = Math.hypot(a, labB);
  const hue = (Math.atan2(labB, a) * 180 / Math.PI + 360) % 360;
  return { lightness, a, b: labB, chroma, hue };
}

function roundTo(value, places = 3) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function shortestHueDelta(memoryHue, targetHue) {
  return (memoryHue - targetHue + 540) % 360 - 180;
}

function hueBand(hue) {
  return ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'magenta'][Math.floor((hue + 22.5) % 360 / 45)];
}

export function buildMemoryMetrics({
  target, memory, differences, error, accuracy, roundNumber, studyMs, distractionMs,
}) {
  const targetLab = srgbToOklab(target);
  const memoryLab = srgbToOklab(memory);
  const hueComparisonAvailable = targetLab.chroma >= .01 && memoryLab.chroma >= .01;
  const lightness = value => roundTo(value * 100, 2);
  const chroma = value => roundTo(value, 4);
  return {
    round_number: roundNumber,
    study_ms: studyMs,
    distraction_ms: distractionMs,
    accuracy_percent: accuracy,
    target_red: target[0], target_green: target[1], target_blue: target[2],
    memory_red: memory[0], memory_green: memory[1], memory_blue: memory[2],
    memory_minus_target_red: memory[0] - target[0],
    memory_minus_target_green: memory[1] - target[1],
    memory_minus_target_blue: memory[2] - target[2],
    absolute_error_red: differences[0], absolute_error_green: differences[1], absolute_error_blue: differences[2],
    absolute_error_total: error,
    target_lightness: lightness(targetLab.lightness),
    memory_lightness: lightness(memoryLab.lightness),
    memory_minus_target_lightness: lightness(memoryLab.lightness - targetLab.lightness),
    target_chroma: chroma(targetLab.chroma),
    memory_chroma: chroma(memoryLab.chroma),
    memory_minus_target_chroma: chroma(memoryLab.chroma - targetLab.chroma),
    target_hue_degrees: roundTo(targetLab.hue, 1),
    memory_hue_degrees: hueComparisonAvailable ? roundTo(memoryLab.hue, 1) : null,
    memory_minus_target_hue_degrees: hueComparisonAvailable ? roundTo(shortestHueDelta(memoryLab.hue, targetLab.hue), 1) : null,
    hue_comparison_available: hueComparisonAvailable,
    perceptual_distance: roundTo(Math.hypot(
      memoryLab.lightness - targetLab.lightness,
      memoryLab.a - targetLab.a,
      memoryLab.b - targetLab.b,
    ) * 100, 2),
    target_hue_band: hueBand(targetLab.hue),
    target_lightness_band: targetLab.lightness < .5 ? 'dark' : targetLab.lightness < .72 ? 'mid' : 'light',
    target_chroma_band: targetLab.chroma < .08 ? 'muted' : targetLab.chroma < .16 ? 'medium' : 'vivid',
  };
}
