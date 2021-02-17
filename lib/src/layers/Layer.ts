import Timeline from '../Timeline';

/**
 * An After Effects layer.
 */
export default class Layer {
  /**
   * The name of the layer (should be unique).
   */
  name: string = '';

  /**
   * The time the layer begins.
   */
  start: number = 0;

  /**
   * The duration the layer exists on the Timeline.
   */
  duration: number = 0;

  /**
   * If the layer is currently visible (in time).
   */
  showing: boolean = true;

  /**
   * An object used when extending this class.
   */
  item: any = undefined;

  /**
   * If the layer has a file associated to it (audio/image/video/etc),
   * this should be the file name.
   */
  fileID: string = ''; // to reclaim from loader

  /**
   * If the layer has a file associated to it (audio/image/video/etc),
   * this should be the file.
   */
  file: any = undefined; // actual loaded asset

  /**
   * Creates a new layer based on the JSON data.
   * @param json The JSON data of the layer.
   * @param assets The loaded assets.
   */
  constructor(json: any, assets: any) {
    this.name = json.name !== undefined ? json.name : '';
    this.start = json.start !== undefined ? json.start : 0; // start time
    this.duration = json.duration !== undefined ? json.duration : 0; // duration the layer is in comp
    this.showing = json.showing !== undefined ? json.showing : true;
  }

  /**
   * Clears all memory of the layer.
   */
  dispose() {
    //
  }

  /**
   * Updates the item and any other animation paramaters needed.
   * @param time The time of the composition.
   * @param duration The duration of the composition.
   */
  update(time?: number, duration?: number) {
    if (this.item !== undefined && this.item.update !== undefined) {
      this.item.update(time, duration !== undefined ? duration : this.duration);
    }
  }

  /**
   * Renders the layer.
   */
  draw() {
    if (this.item !== undefined && this.item.draw !== undefined) {
      this.item.draw();
    }
  }

  /**
   * Resizes the layer to the size of the composition.
   * @param width The composition width.
   * @param height The composition height.
   */
  resize(width: number, height: number) {
    if (this.item !== undefined && this.item.resize !== undefined) {
      this.item.resize(width, height);
    }
  }

  /**
   * Animates unique variables, like shape data.
   * @param json The JSON data.
   * @param timeline The composition timeline.
   */
  animate(json: any, timeline: Timeline) {
    if (this.item !== undefined && this.item.animate !== undefined) {
      this.item.animate(json, timeline);
    }
  }

  /**
   * Animates the transform object.
   * @param json The JSON data
   * @param timeline The composition timeline.
   */
  transform(json: any, timeline: Timeline) {
    if (this.item !== undefined && this.item.transform !== undefined) {
      this.item.transform(json, timeline);
    }
  }

  /**
   * Checks if the layer is currently viewable based on the given time.
   * @param time The time of the composition.
   */
  showable(time: number): boolean {
    const endTime = this.start + this.duration;
    return (this.duration > 0) ? (time >= this.start && time <= endTime) : true;
  }
}
