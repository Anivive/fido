import {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  DoubleSide,
  VideoTexture
} from 'three';
import Timeline from '../../Timeline';
import ThreeLayer from './ThreeLayer';
import { fileName } from '../../utils';
import { anchorGeometryTL } from '../utils';

export default class ThreeVideo extends ThreeLayer {
  constructor(json: any, assets: any, timeline: Timeline) {
    super(json, assets, timeline);

    this.fileID = fileName(json.content.source);
    const imgWidth = json.content.width;
    const imgHeight = json.content.height;
    const texture = assets.textures[this.fileID] as VideoTexture;
    this.file = texture.image;
    if (!json.content.audioEnabled) {
      this.file.setAttribute('muted', 'true');
      this.file.muted = false;
      this.file.volume = 0;
    }

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

  dispose() {
    this.file.pause();
  }

  update(time: number, duration: number) {
    if (this.file.paused) {
      if (time !== undefined) this.file.currentTime = time;
      this.file.play();
    }
    // @ts-ignore
    this.mesh.material.map.needsUpdate = true;
  }
}
