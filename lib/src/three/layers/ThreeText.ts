import {
  Texture,
  Vector3,
} from 'three';
import Timeline from '../../Timeline';
import ThreeLayer from './ThreeLayer';
import TextMesh from '../mesh/TextMesh';

export default class ThreeText extends ThreeLayer {
  constructor(json: any, assets: any, timeline: Timeline) {
    super(json, assets, timeline);

    const { content } = json;
    const { font } = content;
    const txtJSON = assets.json[font];
    const txtTexture = assets.textures[font] as Texture;
    const fontSize = content.fontSize * window.devicePixelRatio;
    const txt = new TextMesh();
    txt.name = `${this.name}Mesh`;
    txt.color.set(content.color[0], content.color[1], content.color[2]);
    txt.map = txtTexture;
    txt.update({
      align: content.align,
      font: txtJSON,
      fontSize: fontSize,
      text: content.text,
      letterSpacing: content.spacing
    });
    this.mesh = txt;
    this.item.add(this.mesh);

    ThreeLayer.transform(this.item, this.mesh, json.transform, timeline);

    json.content.timeline.forEach((ani: any) => {
      if (ani.name === 'text') {
        ThreeLayer.animate(this, 'text', timeline, ani);
      } else if (ani.name === 'color') {
        ThreeLayer.animate(this, 'color', timeline, ani);
      }
    });
  }

  update(time?: number, duration?: number) {
    // Update material's uniforms
    const mesh = this.mesh as TextMesh;
    mesh.material.uniforms.opacity.value = mesh.material.opacity;

    super.update(time, duration);
  }

  // Getters

  get color(): Vector3 {
    const mesh = this.mesh as TextMesh;
    return mesh.color;
  }

  get text(): string {
    const mesh = this.mesh as TextMesh;
    return mesh.text;
  }

  // Setters

  set color(value: Vector3) {
    const mesh = this.mesh as TextMesh;
    mesh.color = value;
  }

  set text(value: string) {
    const mesh = this.mesh as TextMesh;
    mesh.text = value;
  }
}
