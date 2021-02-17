uniform float thickness;
attribute float lineMiter;
attribute vec2 lineNormal;
attribute vec2 lineDistance; // x = pos, y = total length
varying vec2 lineU;

void main() {
  lineU = lineDistance;
  vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );
}