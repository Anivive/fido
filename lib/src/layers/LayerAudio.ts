import Layer from './Layer';
import { between } from '../math';
import { fileName } from '../utils';

/**
 * An audio object.
 */
export default class LayerAudio extends Layer {
  constructor(json: any, assets: any) {
    super(json, assets);

    this.fileID = fileName(json.content.value.source);
    this.file = assets.audio[this.fileID] as HTMLAudioElement;
  }

  dispose() {
    this.file.pause();
  }

  update(time: number, duration: number) {
    const startTime = this.start;
    const endTime = this.start + this.file.duration;
    const active = between(startTime, endTime, time);
    if (this.file.paused && active) {
      this.file.play();
    }
  }
}
