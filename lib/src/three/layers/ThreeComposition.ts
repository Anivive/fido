import {
  Clock,
  MathUtils,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import Composition from '../../layers/Composition';
import Ease from '../../Ease';
import Keyframe from '../../Keyframe';
import Layer from '../../layers/Layer';
import ThreeImage from './ThreeImage';
import ThreeShape from './ThreeShape';
import ThreeText from './ThreeText';
import ThreeVideo from './ThreeVideo';
import { dispose } from '../utils';

export default class ThreeComposition extends Composition {
  /**
   * The ThreeJS Renderer
   */
  renderer: WebGLRenderer;

  /**
   * The ThreeJS Scene
   */
  scene: Scene = new Scene();

  /**
   * The ThreeJS Camera (defaults to a PerspectiveCamera)
   */
  camera: PerspectiveCamera = new PerspectiveCamera(60, 1920 / 1080, 1, 2000);

  /**
   * A ThreeJS Clock
   */
  clock: Clock = new Clock();

  /**
   * If the camera should adjust the FOV to keep items at 0 z-position in focus.
   */
  autoFOV: boolean = false;

  /**
   * Maps effect names to the effect for easy updating.
   */
  effects = new Map();

  constructor(renderer: WebGLRenderer, json: any, assets: any) {
    super(json, assets);
    this.renderer = renderer;
    this.resize(window.innerWidth, window.innerHeight);
  }

  dispose() {
    dispose(this.scene);
    super.dispose();
  }

  play() {
    super.play();
    this.clock.start();
  }

  pause() {
    this.clock.stop();
    super.pause();
  }

  buildCamera(item: any) {
    this.camera.name = item.name;
    this.camera.fov = item.content.fov;
    this.camera.updateProjectionMatrix();

    const scale = window.devicePixelRatio;
    const t = item.transform;
    const p = (t.position.length > 2) ? t.position : [t.position[0], t.position[1], 0];
    const r = (t.rotation.length > 2) ? t.rotation : [t.rotation[0], t.rotation[1], 0];

    this.camera.position.set(p[0] * scale, -p[1] * scale, -p[2] * scale);
    this.camera.rotation.set(MathUtils.degToRad(r[0]), -MathUtils.degToRad(r[1]), -MathUtils.degToRad(r[2]));

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
          case 'positionX':
            keyframe = new Keyframe(this.camera.position, {
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
            keyframe = new Keyframe(this.camera.position, {
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
            keyframe = new Keyframe(this.camera.position, {
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
            keyframe = new Keyframe(this.camera.rotation, {
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
            keyframe = new Keyframe(this.camera.rotation, {
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
            keyframe = new Keyframe(this.camera.rotation, {
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
            this.timeline.pushKeyframe(startKeyframe);
          } else if (n === lastN && keyframe.endTime < this.timeline.duration) {
            const endKeyframe = new Keyframe(keyframe.object, {
              type: Ease.HOLD,
              delay: keyframe.endTime,
              duration: this.timeline.duration - keyframe.endTime
            });
            endKeyframe.props = keyframe.props;
            endKeyframe.startValues = keyframe.endValues;
            endKeyframe.endValues = keyframe.endValues;
            this.timeline.pushKeyframe(endKeyframe);
          }
          this.timeline.pushKeyframe(keyframe);
        }
      }
    }
  }

  buildLayerImage(json: any, item: any, assets: any): Layer {
    const layer = new ThreeImage(item, assets, this.timeline);
    this.scene.add(layer.item);
    return layer;
  }

  buildLayerShape(json: any, item: any, assets: any) {
    const layer = new ThreeShape(item, assets, this.timeline);
    this.scene.add(layer.item);
    return layer;
  }

  buildLayerText(json: any, item: any, assets: any): Layer {
    const layer = new ThreeText(item, assets, this.timeline);
    this.scene.add(layer.item);
    return layer;
  }

  buildLayerVideo(json: any, item: any, assets: any): Layer {
    const layer = new ThreeVideo(item, assets, this.timeline);
    this.scene.add(layer.item);
    return layer;
  }

  buildPost(json: any) {
    //
  }

  update(time?: number, duration?: number) {
    super.update(time, duration);

    if (this.autoFOV) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;
      const dist = this.camera.position.z;
      const fov = 2 * Math.atan(width / aspect / (2 * dist)) * (180 / Math.PI);
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  updateLayers(time: number, duration: number) {
    const total = this.layers.length;
    for (let i = 0; i < total; ++i) {
      const l = this.layers[i];
      const visible = l.showable(time);
      if (visible) {
        if (l instanceof Composition) {
          if (!l.showing) {
            l.play();
          }
          l.update(time, duration);
        } else {
          l.update(time, duration);
        }
      } else if (l.showing && l instanceof Composition) {
        if (l.timeline.playing && l.timeline.seconds > 0) {
          l.timeline.seconds = l.timeline.duration;

          if (l.timeline.speed < 0) {
            l.timeline.seconds = 0;
          }
        }
      }
      l.showing = visible;
      if (l.item !== undefined) {
        l.item.visible = visible;
      }
    }
  }

  draw() {
    super.draw();
    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number) {
    super.resize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
