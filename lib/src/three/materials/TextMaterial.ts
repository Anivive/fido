import {
  DoubleSide,
  RawShaderMaterial,
  Texture,
  Vector3
} from 'three';
import vertex from '../glsl/layers/font.vert';
import fragment from '../glsl/layers/font.frag';

export default class TextMaterial extends RawShaderMaterial {
  constructor(texture: Texture | null) {
    super({
      uniforms: {
        opacity: {
          // @ts-ignore
          type: 'f',
          value: 1
        },
        color: {
          // @ts-ignore
          type: 'v3',
          value: new Vector3(1, 1, 1)
        },
        map: {
          // @ts-ignore
          type: 't',
          value: texture
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      side: DoubleSide,
    });
  }

  get color(): Vector3 {
    return this.uniforms.color.value;
  }

  get map(): Texture | null {
    return this.uniforms.map.value;
  }

  set color(value: Vector3) {
    this.uniforms.color.value = value;
  }

  set map(value: Texture | null) {
    this.uniforms.map.value = value;
  }
}
