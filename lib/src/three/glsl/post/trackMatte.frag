uniform sampler2D tDiffuse;
uniform sampler2D tMatte;
uniform float uType;
uniform vec2 uAnchor;
uniform vec2 uPosition;
uniform vec4 uSize;
uniform vec2 uScale;
uniform float uRotation;
uniform float matteOpacity;

varying vec2 vUv;

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

mat2 rotate2d(float _angle){
  return mat2(cos(_angle),-sin(_angle), sin(_angle),cos(_angle));
}

mat2 scale2d(vec2 _scale) {
  return mat2(_scale.x, 0.0, 0.0, _scale.y);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // uType = 0 = No Track Matte
  // uType = 1 = Alpha Matte
  // uType = 2 = Alpha Inverted Matte
  // uType = 3 = Luma Matte
  // uType = 4 = Luma Inverted Matte
  if(uType > 0.0) {
    vec2 resolution = vec2(uSize.z, uSize.a);
    vec2 uv = vUv / (uSize.xy / resolution);
    
    uv += uAnchor / resolution;
    uv = rotate2d(radians(uRotation)) * uv;
    uv -= uPosition / resolution;
    uv = scale2d(uScale) * uv;
    
    uv.y += 1.0 - (resolution.y / uSize.y);
    
    vec4 matte = texture2D(tMatte, uv);
    if(uType == 1.0) {
      color.a *= matte.a;
    } else if(uType == 2.0) {
      color.a *= (1.0 - matte.a);
    } else if(uType == 3.0) {
      color.a *= luma(matte.xyz);
    } else if(uType == 4.0) {
      color.a *= 1.0 - luma(matte.xyz);
    }
    color.a *= matteOpacity;
  }
  gl_FragColor = color;
}