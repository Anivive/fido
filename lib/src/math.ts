export const TWO_PI: number = Math.PI * 2;
export const HALF_PI: number = Math.PI / 2;

export function between(min: number, max: number, value: number) {
  return value >= min && value <= max;
}

export function normalize(min: number, max: number, value: number) {
  return (value - min) / (max - min);
}

export function mix(min: number, max: number, value: number) {
  return min * (1 - value) + max * value;
}

export function map(min1: number, max1: number, min2: number, max2: number, value: number) {
  return mix(min2, max2, normalize(min1, max1, value));
}

export function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundTo(value: number, digits: number = 1): number {
  return Number(value.toFixed(digits));
}

export function distance(x: number, y: number): number {
  const d = x - y;
  return Math.sqrt(d * d);
}

export function distance2(x1: number, y1: number, x2: number, y2: number): number {
  const d1 = x1 - x2;
  const d2 = y1 - y2;
  return Math.sqrt(d1 * d1 + d2 * d2);
}

export function distance3(
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number
): number {
  const d1 = x1 - x2;
  const d2 = y1 - y2;
  const d3 = z1 - z2;
  return Math.sqrt(d1 * d1 + d2 * d2 + d3 * d3);
}

export function random(min: number, max: number) {
  return mix(min, max, Math.random());
}

// Bezier

function isLinear(x0: number, y0: number, x1: number, y1: number): boolean {
  return x0 === y0 && x1 === y1;
}

function slopeFromT(t: number, A: number, B: number, C: number): number {
  return 1.0 / (3.0 * A * t * t + 2.0 * B * t + C);
}

function xFromT(t: number, A: number, B: number, C: number, D: number): number {
  return A * (t * t * t) + B * (t * t) + C * t + D;
}

function yFromT(t: number, E: number, F: number, G: number, H: number): number {
  const tt = t * t;
  return E * (tt * t) + F * tt + G * t + H;
}

export function cubicBezier(percent: number, x0: number, y0: number, x1: number, y1: number): number {
  if (percent <= 0) return 0;
  if (percent >= 1) return 1;
  if (isLinear(x0, y0, x1, y1)) return percent; // linear

  const x0a = 0; // initial x
  const y0a = 0; // initial y
  const x1a = x0; // 1st influence x
  const y1a = y0; // 1st influence y
  const x2a = x1; // 2nd influence x
  const y2a = y1; // 2nd influence y
  const x3a = 1; // final x
  const y3a = 1; // final y

  const A = x3a - 3.0 * x2a + 3.0 * x1a - x0a;
  const B = 3.0 * x2a - 6.0 * x1a + 3.0 * x0a;
  const C = 3.0 * x1a - 3.0 * x0a;
  const D = x0a;

  const E = y3a - 3.0 * y2a + 3.0 * y1a - y0a;
  const F = 3.0 * y2a - 6.0 * y1a + 3.0 * y0a;
  const G = 3.0 * y1a - 3.0 * y0a;
  const H = y0a;

  let current = percent;
  for (let i = 0; i < 5; i++) {
    const currentx = xFromT(current, A, B, C, D);
    let currentslope = slopeFromT(current, A, B, C);
    if (currentslope === Infinity) currentslope = percent;
    current -= (currentx - percent) * (currentslope);
    current = Math.min(Math.max(current, 0.0), 1.0);
  }

  return yFromT(current, E, F, G, H);
}

/**
 * Animates a set of keyframe values
 * @param  {Number} time Ranging from 0 - 1
 * @param  {Array} keyframes Set of key values, ie: [ 0, 50, 25, 50, 100 ]
 * @return {Number} The linearly interpolated value between keyframes,
 * ie: tween(0.25, [ 0, 50, 25, 50, 100 ]) returns 50
 */
export function tween(value: number, keyframes: Array<number>) {
  const totalKeys = keyframes.length - 1;
  if (totalKeys === 0) return keyframes[0];
  const delim = 1 / totalKeys;
  const startKey = Math.min(Math.floor(value * totalKeys), totalKeys - 1);
  const endKey = startKey + 1;
  const startTime = startKey * delim;
  const endTime = endKey * delim;
  const adjusted = normalize(startTime, endTime, value);
  return mix(keyframes[startKey], keyframes[endKey], adjusted);
}

/**
 * Tweens between 2 sets of arrays
 */
export function mixArrays(start: Array<number>, end: Array<number>, value: number): Array<number> {
  const result: Array<number> = [];
  const total = start.length;
  for (let i = 0; i < total; ++i) {
    result.push(mix(start[i], end[i], value));
  }
  return result;
}
