import {
  Object3D,
  Mesh,
  Texture,
  Vector3,
} from 'three';
// eslint-disable-next-line
import TextGeometry from '../geometry/TextGeometry';
// eslint-disable-next-line
import TextMaterial from '../materials/TextMaterial';
// eslint-disable-next-line
import { normalize } from '../../math';

export default class TextMesh extends Object3D {
  geometry: TextGeometry = new TextGeometry();

  material: TextMaterial = new TextMaterial(null);

  mesh: Mesh;

  container: Object3D = new Object3D();

  options: any = {
    align: 'left',
    flipY: true,
    font: undefined,
    fontSize: 42,
    text: '',
    letterSpacing: 0,
    width: undefined,
  };

  constructor() {
    super();

    this.add(this.container);

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.name = 'txtSprite';
    this.mesh.rotation.x = Math.PI;
    this.container.add(this.mesh);
  }

  update(options: any) {
    if (options.align !== undefined) this.options.align = options.align;
    if (options.flipY !== undefined) this.options.flipY = options.flipY;
    if (options.font !== undefined) this.options.font = options.font;
    if (options.fontSize !== undefined) this.fontSize = options.fontSize;
    if (options.text !== undefined) this.options.text = options.text;
    if (options.letterSpacing !== undefined) this.options.letterSpacing = options.letterSpacing;
    // this.options.width = options.width;
    if (options.width !== undefined) this.options.width = options.width;
    this.geometry.update(this.options);

    const { layout } = this.geometry;
    this.mesh.position.y = layout.lineHeight - layout.height - 5;

    if (this.options.align === 'center') {
      this.mesh.position.x = -layout.width / 2;
    } else if (this.options.align === 'right') {
      this.mesh.position.x = -layout.width;
    }
  }

  private checkToUpdate() {
    if (this.options.font !== undefined) {
      this.update(this.options);
    }
  }

  get align(): string {
    return this.options.align;
  }

  // @ts-ignore
  get color(): Vector3 {
    return this.material.color;
  }

  get fontSize(): number {
    return this.options.fontSize;
  }

  get map(): Texture | null {
    return this.material.map;
  }

  get letterSpacing(): number {
    return this.options.letterSpacing;
  }

  get text(): string {
    return this.options.text;
  }

  get width(): number | undefined {
    return this.options.width;
  }

  set align(value: string) {
    this.options.align = value;
    this.checkToUpdate();
  }

  // @ts-ignore
  set color(value: Vector3 | Array<number>) {
    if (Array.isArray(value)) {
      this.material.color = new Vector3(value[0], value[1], value[2]);
    } else {
      this.material.color = value;
    }
  }

  set fontSize(value: number) {
    this.options.fontSize = value;
    const scale = normalize(0, 42, value);
    this.container.scale.setScalar(scale);
  }

  set map(value: Texture | null) {
    this.material.map = value;
  }

  set letterSpacing(value: number) {
    this.options.letterSpacing = value;
    this.checkToUpdate();
  }

  set text(value: string) {
    this.options.text = value;
    this.checkToUpdate();
  }

  set width(value: number | undefined) {
    this.options.width = value;
    this.checkToUpdate();
  }
}
