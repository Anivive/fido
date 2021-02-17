import {
  Color,
  DoubleSide,
  ShaderMaterial,
  Vector3
} from 'three';
import vertex from '../glsl/layers/stroke.vert';
import fragment from '../glsl/layers/stroke.frag';

export default class StrokeMaterial extends ShaderMaterial {
  constructor(opt: any = {}) {
    // @ts-ignore
    const thickness = opt.thickness !== undefined ? opt.thickness : 4.0;
    // @ts-ignore
    const opacity = opt.opacity !== undefined ? opt.opacity : 1.0;
    // @ts-ignore
    const color = opt.diffuse !== undefined ? opt.diffuse : 0xffffff;
    // @ts-ignore
    const dash = opt.dash !== undefined ? opt.dash : new Vector3(0, 10, 0);
    // @ts-ignore
    const trim = opt.trim !== undefined ? opt.trim : new Vector3(0, 1, 0);
    super({
      uniforms: {
        thickness: {
          // @ts-ignore
          type: 'f',
          value: thickness
        },
        opacity: {
          // @ts-ignore
          type: 'f',
          value: opacity
        },
        diffuse: {
          // @ts-ignore
          type: 'c',
          value: new Color(color)
        },
        dash: {
          // @ts-ignore
          type: 'f',
          value: dash
        },
        trim: {
          // @ts-ignore
          type: 'f',
          value: trim
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      // @ts-ignore
      side: opt.side !== undefined ? opt.side : DoubleSide,
      // @ts-ignore
      transparent: opt.transparent !== undefined ? opt.transparent : true
    });
  }
}
