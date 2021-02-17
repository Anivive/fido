import Layer from './Layer';
import Marker from '../Marker';
import PlayMode from '../PlayMode';
import Timeline from '../Timeline';
import LayerAudio from './LayerAudio';
import LayerImage from './LayerImage';
import LayerShape from './LayerShape';
import LayerText from './LayerText';
import LayerVideo from './LayerVideo';

/**
 * An After Effects composition.
 */
export default class Composition extends Layer {
  /**
   * The width of the composition.
   */
  width: number = 0;

  /**
   * The height of the composition.
   */
  height: number = 0;

  /**
   * The layers of the composition.
   */
  layers: Array<Layer> = [];

  /**
   * The Timeline to animate to.
   */
  timeline: Timeline = new Timeline({});

  /**
   * The Composition's camera, if it has one.
   */
  camera: any = undefined;

  /**
   * Creates a Composition & all the layers.
   * @param json The Composition JSON data.
   * @param assets The loaded assets.
   */
  constructor(json: any, assets: any) {
    super(json, assets);
    this.width = json.width;
    this.height = json.height;
    this.timeline.duration = json.duration;
    this.showing = this.start === 0;
  }

  /**
   * Disposes the Composition and all the layers.
   */
  dispose() {
    this.timeline.dispose();
    this.camera = undefined;
    this.layers.forEach((layer: Layer) => {
      layer.dispose();
    });
    this.layers = [];
  }

  /**
   * Adds a Layer to the end of the Layer stack.
   * @param layer Any type of Layer
   */
  addLayer(layer: Layer) {
    layer.showing = this.start === 0 && layer.start === 0;
    this.layers.push(layer);
  }

  /**
   * Animates the viewable Layers.
   * @param time The time of an optional parent Composition.
   * @param duration The duration of an optional parent Composition.
   */
  update(time?: number, duration?: number) {
    const d = duration !== undefined ? duration : this.timeline.duration;
    this.timeline.duration = d;
    this.timeline.update(time);
    this.updateLayers(this.timeline.seconds, d);
  }

  /**
   * Checks if the Layers are viewable & updates them.
   * @param time The time of the Composition.
   * @param duration The duration of the Composition.
   */
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
    }
  }

  /**
   * Renders the viewable Layers.
   */
  draw() {
    const time = this.seconds;
    const total = this.layers.length;
    for (let i = 0; i < total; ++i) {
      const l = this.layers[i];
      const visible = l.showable(time);
      if (visible) l.draw();
    }
  }

  /**
   * Plays the Timeline.
   */
  play() {
    this.timeline.play();
    this.playLayers();
  }

  /**
   * Pauses the Timeline.
   */
  pause() {
    this.timeline.pause();
    this.pauseLayers();
  }

  /**
   * @ignore
   */
  playLayers() {
    const time = this.seconds;
    const total = this.layers.length;
    for (let i = 0; i < total; ++i) {
      const layer = this.layers[i];
      if (layer instanceof Composition && layer.showable(time)) {
        layer.play();
      }
    }
  }

  /**
   * @ignore
   */
  pauseLayers() {
    const total = this.layers.length;
    for (let i = 0; i < total; ++i) {
      const layer = this.layers[i];
      if (layer instanceof Composition && layer.playing) {
        layer.pause();
      }
    }
  }

  /**
   * Resizes all the Layers, but does not reset the size of the Composition.
   * @param width Generally the view width.
   * @param height Generally the view height.
   */
  resize(width: number, height: number) {
    this.layers.forEach((layer: Layer) => {
      layer.resize(width, height);
    });
  }

  // Build

  /**
   * Creates all the Layers based on the JSON data.
   * @param json The Composition JSON data.
   * @param assets The loaded assets.
   * @param parentComp An optional parent Composition to limit the timeline to.
   */
  build(json: any, assets: any, parentComp?: Composition) {
    this.name = json.name;
    this.width = json.width;
    this.height = json.height;
    if (parentComp !== undefined) {
      this.duration = Math.min(this.duration, parentComp.duration);
      this.timeline.duration = this.duration;
    }

    // Build markers
    let total = json.markers.length;
    for (let i = 0; i < total; ++i) {
      const m = json.markers[i];
      this.timeline.markers.push(new Marker(m.name, m.time));
    }

    // Build layers
    total = json.layers.length;
    for (let i = total - 1; i > -1; --i) {
      const layer = this.buildLayer(json, assets, json.layers[i]);
      if (layer !== undefined) this.layers.push(layer);
    }
  }

  /**
   * Checks the Layer type and creates a new Layer based on it.
   * @param json The Composition JSON data.
   * @param assets The loaded assets.
   * @param item The Layer JSON data.
   */
  buildLayer(json: any, assets: any, item: any): Layer | undefined {
    let layer: Layer | undefined;

    // Create layer...
    switch (item.type) {
      case 'adjustment':
        if (item.name === 'post') {
          this.buildPost(item);
        }
        break;
      case 'audio':
        layer = this.buildLayerAudio(json, item, assets);
        break;
      case 'camera':
        this.buildCamera(item);
        break;
      case 'composition':
        layer = this.buildLayerComposition(json, item, assets);
        break;
      default:
      case 'image':
        layer = this.buildLayerImage(json, item, assets);
        break;
      case 'shape':
        layer = this.buildLayerShape(json, item, assets);
        break;
      case 'text':
        layer = this.buildLayerText(json, item, assets);
        break;
      case 'video':
        layer = this.buildLayerVideo(json, item, assets);
        break;
    }

    if (layer !== undefined) {
      layer.duration = Math.min(this.timeline.duration, item.duration);
    }

    return layer;
  }

  /**
   * Creates an Audio-based Layer.
   * @param json The Composition JSON data.
   * @param item The Layer JSON data.
   * @param assets The loaded assets.
   */
  buildLayerAudio(json: any, item: any, assets: any) {
    const layer = new LayerAudio(item, assets);
    return layer;
  }

  /**
   * Creates a Camera object.
   * @param item The Layer JSON data.
   */
  buildCamera(item: any) {
    //
  }

  /**
   * Creates a Composition-based Layer.
   * @param json The Composition JSON data.
   * @param item The Layer JSON data.
   * @param assets The loaded assets.
   */
  buildLayerComposition(json: any, item: any, assets: any): Composition {
    const layer = new Composition(item, assets);
    layer.build(json, item, this);
    return layer;
  }

  /**
   * Creates an Image-based Layer.
   * @param json The Composition JSON data.
   * @param item The Layer JSON data.
   * @param assets The loaded assets.
   */
  buildLayerImage(json: any, item: any, assets: any): Layer {
    const layer = new LayerImage(item, assets);
    return layer;
  }

  /**
   * Creates a Shape-based Layer.
   * @param json The Composition JSON data.
   * @param item The Layer JSON data.
   * @param assets The loaded assets.
   */
  buildLayerShape(json: any, item: any, assets: any) {
    const layer = new LayerShape(item, assets);
    return layer;
  }

  /**
   * Creates a Text-based Layer.
   * @param json The Composition JSON data.
   * @param item The Layer JSON data.
   * @param assets The loaded assets.
   */
  buildLayerText(json: any, item: any, assets: any): Layer {
    const layer = new LayerText(item, assets);
    return layer;
  }

  /**
   * Creates a Video-based Layer.
   * @param json The Composition JSON data.
   * @param item The Layer JSON data.
   * @param assets The loaded assets.
   */
  buildLayerVideo(json: any, item: any, assets: any): Layer {
    const layer = new LayerVideo(item, assets);
    return layer;
  }

  /**
   * Applies Post-Effects to the Composition
   * @param json The Composition JSON data.
   */
  buildPost(json: any) {
    //
  }

  // Getters / Setters

  get playing() {
    return this.timeline.playing;
  }

  get playMode(): PlayMode {
    return this.timeline.mode;
  }

  get seconds() {
    return this.timeline.seconds;
  }

  set playMode(value: PlayMode) {
    this.timeline.mode = value;
  }

  set seconds(value: number) {
    this.timeline.seconds = value;
  }
}
