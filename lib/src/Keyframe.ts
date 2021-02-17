import {
  between,
  clamp,
  cubicBezier,
  mix,
  normalize
} from './math';
import { guid } from './utils';
import Ease from './Ease';

/**
 * An object that tweens from 1 value to another with Cubic-Bezier easing.
 */
export default class Keyframe {
  name: string = guid();

  /**
   * The start time (in seconds).
   */
  time: number = 0;

  /**
   * The duration of the animation (in seconds).
   */
  duration: number = 0;

  /**
   * Based on Cubic-Bezier
   */
  ease: Array<number> = Ease.none;

  /**
   * One of these 3:
   * ```typescript
   * Ease.LINEAR
   * Ease.BEZIER
   * Ease.HOLD
   * ```
   */
  easeType: string = Ease.BEZIER;

  // Object

  /**
   * The object to animate.
   */
  object: any;

  /**
   * The name of the variables that are animating.
   */
  props: Array<string> = [];

  /**
   * Where things start.
   */
  startValues: Array<any> = [];

  /**
   * Where things end.
   */
  endValues: Array<any> = [];

  /**
   * An optional callback
   */
  onUpdate?: (progress: number) => void = undefined;

  /**
   * Creates a Keyframe
   * @param obj The object to animate
   * @param opts An object containing animation variables
   */
  constructor(obj: any, opts: any) {
    this.object = obj;

    const originalEaseType = this.easeType;
    Object.keys(opts).forEach((key: string) => {
      const value = opts[key];
      if (key === 'name') {
        this.name = value;
      } else if (key === 'delay') {
        this.time = value;
      } else if (key === 'duration') {
        this.duration = value;
      } else if (key === 'ease') {
        this.ease = value;
      } else if (key === 'type') {
        this.easeType = value;
      } else if (key === 'onUpdate') {
        this.onUpdate = value;
      } else if (key !== 'start') {
        let start = this.object[key];
        if (opts.start !== undefined) {
          start = opts.start[key];
        }
        this.props.push(key);
        this.startValues.push(start);
        this.endValues.push(value);
      }
    });

    const linearEase = this.ease[0] === this.ease[1] && this.ease[2] === this.ease[3];
    const sameEaseType = originalEaseType === this.easeType;
    if (linearEase && sameEaseType) {
      this.easeType = Ease.LINEAR;
    }
  }

  /**
   * Updates our object based on the time
   * @param time Clamps the value between your start and end times.
   */
  update(time: number): void {
    const startTime = this.time;
    const { endTime } = this;
    const percent = normalize(startTime, endTime, clamp(startTime, endTime, time));
    const progress = clamp(0, 1, this.getCurve(percent));

    this.props.forEach((prop: string, index: number) => {
      const start = this.startValues[index];
      const target = this.endValues[index];
      if (Array.isArray(start)) {
        const total = start.length;
        const values: Array<number> = [];
        for (let i = 0; i < total; ++i) {
          values.push(mix(start[i], target[i], progress));
        }
        this.object[prop] = values;
      } else if (typeof start === 'string' || typeof start === 'boolean') {
        this.object[prop] = progress < 1 ? start : target;
      } else {
        this.object[prop] = mix(start, target, progress);
      }
    });

    if (this.onUpdate !== undefined) this.onUpdate(progress);
  }

  /**
   * Converts a linear percentage to your eased value.
   * @param percent Ranging from 0 to 1.
   */
  getCurve(percent: number): number {
    if (this.easeType === Ease.BEZIER) {
      return cubicBezier(percent, this.ease[0], this.ease[1], this.ease[2], this.ease[3]);
      // eslint-disable-next-line
    } else if (this.easeType === Ease.HOLD) {
      return percent < 1 ? 0 : 1;
    }
    return percent;
  }

  /**
   * If the Keyframe is active during the given time
   * @param time Usually the time given from the Timeline
   */
  isActive(time: number): boolean {
    return between(this.time, this.time + this.duration, time);
  }

  get startTime() {
    return this.time;
  }

  get endTime() {
    return this.time + this.duration;
  }
}
