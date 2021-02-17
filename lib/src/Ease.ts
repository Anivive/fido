/**
 * An object containing constants of CSS3 eases & ease-types.
 * Reference [Ceaser](https://matthewlein.com/tools/ceaser) for CSS3 easing
 */
export default {
  LINEAR: 'linear',
  BEZIER: 'bezier',
  HOLD: 'hold',

  none: [0.250, 0.250, 0.750, 0.750],

  /// In
  inQuad: [0.550, 0.085, 0.680, 0.530],
  inCubic: [0.550, 0.055, 0.675, 0.190],
  inQuart: [0.895, 0.030, 0.685, 0.220],
  inQuint: [0.755, 0.050, 0.855, 0.060],
  inSine: [0.470, 0.000, 0.745, 0.715],
  inExpo: [0.950, 0.050, 0.795, 0.035],
  inCirc: [0.600, 0.040, 0.980, 0.335],
  inBack: [0.600, 0.000, 0.735, 0.045],

  /// Out
  outQuad: [0.250, 0.460, 0.450, 0.940],
  outCubic: [0.215, 0.610, 0.355, 1.000],
  outQuart: [0.165, 0.840, 0.440, 1.000],
  outQuint: [0.230, 1.000, 0.320, 1.000],
  outSine: [0.390, 0.575, 0.565, 1.000],
  outExpo: [0.190, 1.000, 0.220, 1.000],
  outCirc: [0.075, 0.820, 0.165, 1.000],
  outBack: [0.175, 0.885, 0.320, 1.000],

  /// In Out
  inOutQuad: [0.455, 0.030, 0.515, 0.955],
  inOutCubic: [0.645, 0.045, 0.355, 1.000],
  inOutQuart: [0.770, 0.000, 0.175, 1.000],
  inOutQuint: [0.860, 0.000, 0.070, 1.000],
  inOutSine: [0.445, 0.050, 0.550, 0.950],
  inOutExpo: [1.000, 0.000, 0.000, 1.000],
  inOutCirc: [0.785, 0.135, 0.150, 0.860],
  inOutBack: [0.680, 0.000, 0.265, 1.000]
};
