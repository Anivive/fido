import Layer from './Layer';
import { fileName } from '../utils';

/**
 * An image elment.
 */
export default class LayerImage extends Layer {
  constructor(json: any, assets: any) {
    super(json, assets);

    this.fileID = fileName(json.content.source);
    this.file = assets.images[this.fileID] as HTMLImageElement;
  }
}
