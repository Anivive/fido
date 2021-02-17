/**
 * TODO:
 * Replace shader with code from this paper:
 * https://hal.inria.fr/hal-00907326/PDF/paper.pdf
 */

varying vec2 lineU; // x = pos, y = total length

uniform vec3 diffuse;
uniform float opacity;
uniform vec3 dash; // x = dash,  y = gap, z = offset
uniform vec3 trim; // x = start, y = end, z = offset

void main() {
  float opacityMod = 1.0;
  float offset = trim.z;
  
  // Dash
  if(dash.x > 0.0 && dash.y > 0.0) {
    offset = (dash.z * 0.5) - (trim.z * lineU.y);
    float dashEnd = dash.x + dash.y;
    float lineUMod = mod(lineU.x + offset, dashEnd);
    opacityMod = 1.0 - smoothstep(dash.x, dash.x + 0.01, lineUMod);
  }
  
  // Trim
  if(trim.x > 0.0 || trim.y < 1.0) {
    offset = trim.z;
    float per = lineU.x / lineU.y;
    float start = min(trim.x, trim.y) + offset;
    float end = max(trim.x, trim.y) + offset;
    
    if(start == end) {
      opacityMod = 0.0;
    } else if(end > 1.0) {
      if(per > end - 1.0 && per < start) {
        opacityMod = 0.0;
      }
    } else if(start < 0.0) {
      if(per > end && per < start + 1.0) {
        opacityMod = 0.0;
      }
    } else if(per < start || per > end) {
      opacityMod = 0.0;
    }
  }
  
  if(opacityMod == 0.0) {
    discard;
  }
  gl_FragColor = vec4(diffuse, opacity * opacityMod);
}
