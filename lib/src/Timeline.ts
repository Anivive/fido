import { between } from './math';
import Keyframe from './Keyframe';
import Marker from './Marker';
import PlayMode from './PlayMode';

/**
 * Based on the After Effects Timeline and inspired by Flash's, the Timeline
 * can animate multiple objects with time-scaling.
 */
export default class Timeline {
  /**
   * The amount of time in seconds.
   */
  duration: number = 0;

  /**
   * A list of the Keyframes.
   */
  keyframes: Array<Keyframe> = [];

  /**
   * A list of the Markers.
   */
  markers: Array<Marker> = [];

  /**
   * How the Timeline should play.
   */
  mode: PlayMode = PlayMode.Loop;

  /**
   * If the Timeline is playing.
   */
  playing: boolean = true;

  /**
   * How quickly the time should be multiplied. Default = 1.
   */
  speed: number = 1;

  /**
   * An object to manage time.
   */
  time = {
    seconds: 0,
    prevSeconds: 0,
    lastUpdate: 0
  };

  /**
   * Creates a Timeline with optional paramaeters.
   * @param opts Params include `duration`, `mode`, `playing`, `speed`.
   */
  constructor(opts?: any) {
    if (opts !== undefined) {
      if (opts.mode !== undefined) this.mode = opts.mode;
      if (opts.duration !== undefined) this.duration = opts.duration;
      if (opts.playing !== undefined) this.playing = opts.playing;
      if (opts.speed !== undefined) this.speed = opts.speed;
    }
  }

  /**
   * Clears the Keyframes and Markers.
   */
  dispose() {
    this.keyframes = [];
    this.markers = [];
  }

  /**
   * Creates a Keyframe.
   * @param obj The object to reference.
   * @param opts The Keyframe paramaeters.
   */
  addKeyframe(obj: any, opts: any) {
    this.keyframes.push(new Keyframe(obj, opts));
  }

  /**
   * Creates a Marker.
   * @param name The Marker name.
   * @param time The Marker time.
   */
  addMarker(name: string = '', time: number = 0) {
    this.markers.push(new Marker(name, time));
  }

  /**
   * Pushes a Keyframe to the array.
   * @param keyframe A precreated Keyframe.
   */
  pushKeyframe(keyframe: Keyframe) {
    this.keyframes.push(keyframe);
  }

  /**
   * Retrieves the Marker by name.
   * @param name The name of the Marker.
   */
  getMarker(name: string): Marker | undefined {
    const total = this.markers.length;
    for (let i = 0; i < total; ++i) {
      const marker = this.markers[i];
      if (marker.name === name) {
        return marker;
      }
    }
    return undefined;
  }

  /**
   * Changes the Timeline to the Marker time.
   * @param name The name of the Marker.
   */
  goToMarker(name: string) {
    const marker = this.getMarker(name);
    if (marker !== undefined) {
      this.seconds = marker.time;
      if (marker.callback !== undefined) {
        marker.callback();
      }
    }
  }

  /**
   * Plays the Timeline.
   */
  play() {
    this.playing = true;
    this.resetTime();
  }

  /**
   * Pauses the Timeline.
   */
  pause() {
    this.playing = false;
  }

  /**
   * Updates the Timeline animation.
   * @param time Sets the time of the Timeline.
   */
  update(time?: number) {
    if (!this.playing) return;
    if (time !== undefined) this.time.seconds = time;
    this.updateKeyframes();
    this.updateTime();
    this.updateMarkers();
  }

  /**
   * Updates the Keyframes individually.
   */
  updateKeyframes() {
    this.keyframes.forEach((keyframe: Keyframe) => {
      if (keyframe.isActive(this.seconds)) {
        keyframe.update(this.seconds);
      }
    });
  }

  /**
   * Updates the Markers individually.
   */
  updateMarkers() {
    const total = this.markers.length;
    for (let i = 0; i < total; ++i) {
      const marker = this.markers[i];
      const isActive = between(this.time.prevSeconds, this.time.seconds, marker.time);
      if (isActive) {
        if (marker.callback !== undefined) {
          marker.callback();
        }
        if (marker.name.search('-stop') > 0) {
          this.pause();
          this.seconds = marker.time;
        }
        return;
      }
    }
  }

  /**
   * Updates the time based on the `playMode`.
   */
  updateTime() {
    const { now } = this;
    const delta = (now - this.time.lastUpdate) / 1000;
    const nextTime = this.time.seconds + (delta * this.speed);
    this.time.lastUpdate = now;
    this.time.prevSeconds = this.time.seconds;
    this.time.seconds = nextTime;

    if (this.duration > 0 && this.time.seconds >= this.duration) {
      switch (this.mode) {
        default:
        case PlayMode.Loop:
          this.time.seconds = 0;
          break;
        case PlayMode.Once:
          this.time.seconds = this.duration;
          this.playing = false;
          break;
        case PlayMode.PingPong:
          this.time.seconds = this.duration - delta;
          this.speed = -Math.abs(this.speed);
          break;
      }
    }

    // Reverse Ping-Pong to play forward
    if (this.time.seconds < 0 && this.mode === PlayMode.PingPong) {
      this.time.seconds = 0;
      this.speed = Math.abs(this.speed);
    }
  }

  /**
   * Resets the time so there isn't a big time-jump.
   */
  resetTime() {
    this.time.lastUpdate = this.now;
  }

  get now(): number {
    return (performance || Date).now();
  }

  get seconds(): number {
    return this.time.seconds;
  }

  set seconds(value: number) {
    this.time.seconds = value;
  }
}
