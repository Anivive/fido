import Layer from './Layer';
import { fileName } from '../utils';

/**
 * A video element.
 */
export default class LayerVideo extends Layer {
  constructor(json: any, assets: any) {
    super(json, assets);

    this.fileID = fileName(json.content.source);
    this.file = assets.videos[this.fileID] as HTMLVideoElement;
    if (!json.content.audioEnabled) {
      this.file.setAttribute('muted', 'true');
      this.file.muted = false;
      this.file.volume = 0;
    }
  }

  dispose() {
    this.file.pause();
  }
}
