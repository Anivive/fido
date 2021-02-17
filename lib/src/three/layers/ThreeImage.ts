import {
  Texture,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  DoubleSide
} from 'three';
import Timeline from '../../Timeline';
import ThreeLayer from './ThreeLayer';
import { fileName } from '../../utils';
import { anchorGeometryTL } from '../utils';

export default class ThreeImage extends ThreeLayer {
  constructor(json: any, assets: any, timeline: Timeline) {
    super(json, assets, timeline);

    this.fileID = fileName(json.content.source);
    const imgWidth = json.content.width;
    const imgHeight = json.content.height;
    const texture = assets.textures[this.fileID] as Texture;

    const geometry = new PlaneBufferGeometry(imgWidth, imgHeight, 1, 1);
    anchorGeometryTL(geometry);

    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: DoubleSide
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.name = `${json.name}`;
    this.item.add(this.mesh);

    ThreeLayer.transform(this.item, this.mesh, json.transform, timeline);
  }
}
