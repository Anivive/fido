#version 300 es
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision highp float;
uniform float opacity;
uniform vec3 color;
uniform sampler2D map;
in vec2 vUv;
out vec4 fragColor;

#define alphaTest 1.0 / 255.0

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  vec3 img = texture(map, vUv).rgb;
  float sigDist = median(img.r, img.g, img.b) - 0.5;
  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
  fragColor = vec4(color.xyz, alpha * opacity);
  if (fragColor.a < alphaTest) discard;
}
