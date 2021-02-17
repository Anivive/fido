import {
  Object3D,
  Mesh,
  ShaderChunk,
  Material,
  Matrix4,
  Geometry,
  BufferGeometry,
  NormalBlending,
  CustomBlending,
  AddEquation,
  SrcAlphaFactor,
  OneFactor,
  OneMinusDstColorFactor,
  OneMinusSrcAlphaFactor,
  DstColorFactor,
} from 'three';

export function dispose(object: Object3D | Mesh) {
  while (object.children.length > 0) {
    dispose(object.children[0]);
  }

  if (object.parent) object.parent.remove(object);
  // @ts-ignore
  if (object.geometry) object.geometry.dispose();
  // @ts-ignore
  if (object.material) {
    // @ts-ignore
    if (object.material.map) {
      // @ts-ignore
      object.material.map.dispose();
    }
    // @ts-ignore
    object.material.dispose();
  }
}

export function parseShader(shader: string, defines: Array<string>, options: Array<string>) {
  let output = shader;
  const definitions = `// defines\n${defines.join('\n')}`;
  const opts = `// options\n${options.join('\n')}`;
  output = output.replace('/** DEFINES */', definitions);
  output = output.replace('/** OPTIONS */', opts);

  // example:
  // #include <common>
  // eslint-disable-next-line
  const includes = output.match(/\#include\s?\<\s?(\w+)\s?\>/gm);
  if (includes) {
    const total = includes.length;
    for (let i = 0; i < total; ++i) {
      const n = includes[i];
      const o = n.substr(10, n.length - 11);
      const chunk = `// ${o}\n${ShaderChunk[o]}`;
      output = output.replace(n, chunk);
    }
  }

  return output;
}

export function anchorGeometry(
  geometry: Geometry | BufferGeometry,
  x: number,
  y: number,
  z: number
) {
  geometry.applyMatrix4(new Matrix4().makeTranslation(x, -y, -z));
}

export function anchorGeometryTL(geometry: Geometry | BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  // @ts-ignore
  const x = (box.max.x - box.min.x) / 2;
  // @ts-ignore
  const y = (box.max.y - box.min.y) / 2;
  anchorGeometry(geometry, x, y, 0);
}

export function setBlendNormal(material: Material) {
  material.blending = NormalBlending;
  material.blendEquation = AddEquation;
  material.blendSrc = SrcAlphaFactor;
  material.blendDst = OneMinusSrcAlphaFactor;
  material.needsUpdate = true;
}

export function setBlendAdd(material: Material) {
  material.blending = CustomBlending;
  material.blendEquation = AddEquation;
  material.blendSrc = SrcAlphaFactor;
  material.blendDst = OneFactor;
  material.needsUpdate = true;
}

export function setBlendMultiply(material: Material) {
  material.blending = CustomBlending;
  material.blendEquation = AddEquation;
  material.blendSrc = DstColorFactor;
  material.blendDst = OneMinusSrcAlphaFactor;
  material.needsUpdate = true;
}

export function setBlendScreen(material: Material) {
  material.blending = CustomBlending;
  material.blendEquation = AddEquation;
  material.blendSrc = OneMinusDstColorFactor;
  material.blendDst = OneFactor;
  material.needsUpdate = true;
}
