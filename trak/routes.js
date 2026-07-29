const triangle = (value) => {
  const wrapped = ((value % 2) + 2) % 2;
  return wrapped <= 1 ? wrapped : 2 - wrapped;
};

export const routes = Object.freeze([
  { name: 'Line', from: 1, targetPhase: .5, point: (phase) => ({ x: .5, y: .07 + .86 * triangle(phase) }) },
  { name: 'Arc', from: 4, targetPhase: .5, point: (phase) => { const t = triangle(phase); return { x: .15 + .7 * t, y: .86 - .8 * Math.sin(Math.PI * t) }; } },
  { name: 'Orbit', from: 7, targetPhase: .25, point: (phase) => ({ x: .5 + .38 * Math.cos(phase * Math.PI * 2 - Math.PI / 2), y: .5 + .42 * Math.sin(phase * Math.PI * 2 - Math.PI / 2) }) },
  { name: 'Eight', from: 10, targetPhase: .125, point: (phase) => ({ x: .5 + .36 * Math.sin(phase * Math.PI * 2), y: .5 + .38 * Math.sin(phase * Math.PI * 4) }) },
  { name: 'S-Curve', from: 13, targetPhase: .5, point: (phase) => { const t = triangle(phase); return { x: .5 - .3 * Math.sin((t - .5) * Math.PI * 2), y: .08 + .84 * t }; } },
]);

export function routePathData(route, samples = 160) {
  return Array.from({ length: samples + 1 }, (_, index) => {
    const point = route.point(index / samples);
    const command = index === 0 ? 'M' : 'L';
    return `${command}${(point.x * 100).toFixed(3)} ${(point.y * 100).toFixed(3)}`;
  }).join(' ');
}
