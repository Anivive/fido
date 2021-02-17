import {
  MathUtils,
  Mesh,
  Object3D,
  Shape
} from 'three';
import Ease from '../../Ease';
import Layer from '../../layers/Layer';
import Keyframe from '../../Keyframe';
import Timeline from '../../Timeline';
import { dispose } from '../utils';

export default class ThreeLayer extends Layer {
  mesh: Mesh | Object3D | undefined;

  constructor(json: any, assets: any, timeline: Timeline) {
    super(json, assets);
    this.item = new Object3D();
    this.item.name = `${json.name}Container`;
  }

  dispose() {
    dispose(this.item);
  }

  /**
   * Animates additional paramaters of the object.
   * @param object The object to animate.
   * @param key The key to animate.
   * @param timeline The Timeline associated to the animation.
   * @param animation The JSON data.
   * @param deviceRatio DPR given by the JSON.
   * @param opt Additional param to add an onUpdate call to.
   */
  static animate(
    object: any,
    key: string,
    timeline: Timeline,
    animation: any,
    deviceRatio?: number,
    opt = {}
  ) {
    const scale = deviceRatio !== undefined ? deviceRatio : 1;
    const total = animation.keys.length;
    for (let i = 0; i < total; ++i) {
      const frame = animation.keys[i];
      const from = frame.value;
      const isArr = Array.isArray(from);
      const isStr = (typeof from) === 'string';
      const noScale = isArr || isStr;
      const target = noScale ? frame.target : frame.target * scale;
      const keyframe = new Keyframe(object, {
        delay: frame.start,
        duration: frame.duration,
        ease: [frame.x0, frame.y0, frame.x1, frame.y1],
        type: frame.type,
        // @ts-ignore
        onUpdate: opt.onUpdate
      });
      keyframe.props.push(key);
      keyframe.startValues.push(noScale ? from : from * scale);
      keyframe.endValues.push(target);
      timeline.pushKeyframe(keyframe);
    }
  }

  /**
   * Animates the transform properties of the object
   * @param container The `item` object of the ThreeLayer.
   * @param mesh The `mesh` object of the ThreeLayer.
   * @param transform The JSON data.
   * @param timeline The Timeline associated to the animation.
   */
  static transform(container: Object3D, mesh: Mesh | Object3D | undefined, transform: any, timeline: Timeline) {
    const scale = window.devicePixelRatio;
    const t = transform;
    const a = (t.anchor.length > 2) ? t.anchor : [t.anchor[0], t.anchor[1], 0];
    const p = (t.position.length > 2) ? t.position : [t.position[0], t.position[1], 0];
    const r = (t.rotation.length > 2) ? t.rotation : [t.rotation[0], t.rotation[1], 0];
    const s = (t.scale.length > 2) ? t.scale : [t.scale[0], t.scale[1], 1];

    container.position.set(p[0] * scale, -p[1] * scale, -p[2] * scale);
    container.scale.set(s[0], s[1], s[2]);
    container.rotation.set(MathUtils.degToRad(r[0]), -MathUtils.degToRad(r[1]), -MathUtils.degToRad(r[2]));
    if (mesh !== undefined) {
      mesh.position.set(-a[0] * scale, a[1] * scale, a[2] * scale); // anchor
      // @ts-ignore
      if (mesh.material !== undefined) {
        // @ts-ignore
        mesh.material.opacity = t.opacity;
      }
    }

    if (t.timeline === undefined) return;

    const total = t.timeline.length;
    for (let i = 0; i < total; ++i) {
      const ani = t.timeline[i];
      const nTotal = ani.keys.length;
      const lastN = nTotal - 1;
      for (let n = 0; n < nTotal; ++n) {
        const key = ani.keys[n];
        const { target } = key;
        const { duration } = key;
        const { x0 } = key;
        const { y0 } = key;
        const { x1 } = key;
        const { y1 } = key;
        let keyframe: Keyframe | undefined;

        switch (ani.name) {
          case 'opacity':
            // @ts-ignore
            if (mesh !== undefined && mesh.material !== undefined) {
              // @ts-ignore
              keyframe = new Keyframe(mesh.material, {
                opacity: target,
                duration: duration,
                delay: key.start,
                ease: [x0, y0, x1, y1],
                type: key.type,
                start: {
                  opacity: key.value
                }
              });
            }
            break;

          case 'anchorX':
            if (mesh !== undefined) {
              keyframe = new Keyframe(mesh.position, {
                x: target * -scale,
                duration: duration,
                delay: key.start,
                ease: [x0, y0, x1, y1],
                type: key.type,
                start: {
                  x: key.value * -scale
                }
              });
            }
            break;
          case 'anchorY':
            if (mesh !== undefined) {
              keyframe = new Keyframe(mesh.position, {
                y: target * scale,
                duration: duration,
                delay: key.start,
                ease: [x0, y0, x1, y1],
                type: key.type,
                start: {
                  y: key.value * scale
                }
              });
            }
            break;

          case 'positionX':
            keyframe = new Keyframe(container.position, {
              x: target * scale,
              duration: duration,
              delay: key.start,
              ease: [x0, y0, x1, y1],
              type: key.type,
              start: {
                x: key.value * scale
              }
            });
            break;
          case 'positionY':
            keyframe = new Keyframe(container.position, {
              y: -target * scale,
              duration: duration,
              delay: key.start,
              ease: [x0, y0, x1, y1],
              type: key.type,
              start: {
                y: -key.value * scale
              }
            });
            break;
          case 'positionZ':
            keyframe = new Keyframe(container.position, {
              z: -target * scale,
              duration: duration,
              delay: key.start,
              ease: [x0, y0, x1, y1],
              type: key.type,
              start: {
                z: -key.value * scale
              }
            });
            break;

          case 'rotationX':
            keyframe = new Keyframe(container.rotation, {
              x: MathUtils.degToRad(target),
              duration: duration,
              delay: key.start,
              ease: [x0, y0, x1, y1],
              type: key.type,
              start: {
                x: MathUtils.degToRad(key.value)
              }
            });
            break;
          case 'rotationY':
            keyframe = new Keyframe(container.rotation, {
              y: MathUtils.degToRad(-target),
              duration: duration,
              delay: key.start,
              ease: [x0, y0, x1, y1],
              type: key.type,
              start: {
                y: MathUtils.degToRad(-key.value)
              }
            });
            break;
          case 'rotation':
          case 'rotationZ':
            keyframe = new Keyframe(container.rotation, {
              z: MathUtils.degToRad(-target),
              duration: duration,
              delay: key.start,
              ease: [x0, y0, x1, y1],
              type: key.type,
              start: {
                z: MathUtils.degToRad(-key.value)
              }
            });
            break;

          case 'scaleX':
            keyframe = new Keyframe(container.scale, {
              x: target,
              duration: duration,
              delay: key.start,
              ease: [x0, y0, x1, y1],
              type: key.type,
              start: {
                x: key.value
              }
            });
            break;
          case 'scaleY':
            keyframe = new Keyframe(container.scale, {
              y: target,
              duration: duration,
              delay: key.start,
              ease: [x0, y0, x1, y1],
              type: key.type,
              start: {
                y: key.value
              }
            });
            break;
          case 'scaleZ':
            keyframe = new Keyframe(container.scale, {
              z: target,
              duration: duration,
              delay: key.start,
              ease: [x0, y0, x1, y1],
              type: key.type,
              start: {
                z: key.value
              }
            });
            break;
          default:
            //
        }

        if (keyframe !== undefined) {
          // Add in-between frames to ensure properties are the correct values
          // incase the user skips around in time
          if (n === 0 && keyframe.startTime > 0) {
            const startKeyframe = new Keyframe(keyframe.object, {
              type: Ease.HOLD,
              duration: keyframe.startTime
            });
            startKeyframe.props = keyframe.props;
            startKeyframe.startValues = keyframe.startValues;
            startKeyframe.endValues = keyframe.endValues;
            timeline.pushKeyframe(startKeyframe);
          } else if (n === lastN && keyframe.endTime < timeline.duration) {
            const endKeyframe = new Keyframe(keyframe.object, {
              type: Ease.HOLD,
              delay: keyframe.endTime,
              duration: timeline.duration - keyframe.endTime
            });
            endKeyframe.props = keyframe.props;
            endKeyframe.startValues = keyframe.endValues;
            endKeyframe.endValues = keyframe.endValues;
            timeline.pushKeyframe(endKeyframe);
          }
          timeline.pushKeyframe(keyframe);
        }
      }
    }
  }

  /**
   * Morphs the Shape object
   * @param shape The shape associated to the morph.
   * @param path The path JSON data.
   * @param timeline The Timeline associated to the animation.
   * @param curved If the item is curved or not.
   */
  static morph(shape: Shape, path: any, timeline: Timeline, curved: boolean) {
  }
}
