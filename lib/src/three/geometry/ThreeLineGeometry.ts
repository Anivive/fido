import {
  BufferAttribute,
  BufferGeometry
} from 'three';
import getNormals from 'polyline-normals';
import { distance2 } from '../../math';

export default class ThreeLineGeometry extends BufferGeometry {
  pathLength: number = 0;

  constructor(path: Array<number>[], opt: any = {}) {
    super();

    this.setAttribute('position', new BufferAttribute(new Float32Array(), 3));
    this.setAttribute('lineNormal', new BufferAttribute(new Float32Array(), 2));
    this.setAttribute('lineMiter', new BufferAttribute(new Float32Array(), 1));
    this.setIndex(new BufferAttribute(new Float32Array(), 1));
    if (opt.distances) {
      this.setAttribute('lineDistance', new BufferAttribute(new Float32Array(), 2));
    }

    this.update(path, opt.closed);
  }

  update(path: Array<number>[], closed: boolean) {
    const normals = getNormals(path, closed);

    if (closed) {
      path = path.slice();
      path.push(path[0]);
      normals.push(normals[0]);
    }

    const attrDistance = this.getAttribute('lineDistance');

    let pathLength = 0;
    let lastPt;

    // Determine path length
    path.forEach((point: Array<number>) => {
      if (lastPt !== undefined) {
        // @ts-ignore
        pathLength += distance2(point[0], point[1], lastPt[0], lastPt[1]);
      }
      // @ts-ignore
      lastPt = point;
    });

    this.pathLength = pathLength;

    // Determine normalized position of each vertice along path
    lastPt = undefined;
    let pos = 0;
    let per = 0;
    const indexArray: Array<number> = [];
    const positionArray: Array<number> = [];
    const distanceArray: Array<number> = [];

    const total = path.length;
    const iTotal = total - 1;
    let index = 0;
    for (let i = 0; i < total; ++i) {
      const point = path[i];
      if (i < iTotal) {
        indexArray[i * 6 + 0] = index + 0;
        indexArray[i * 6 + 1] = index + 1;
        indexArray[i * 6 + 2] = index + 2;
        indexArray[i * 6 + 3] = index + 2;
        indexArray[i * 6 + 4] = index + 1;
        indexArray[i * 6 + 5] = index + 3;
        index += 2;
      }

      let dist = 0;
      if (lastPt !== undefined) {
        // @ts-ignore
        dist = distance2(point[0], point[1], lastPt[0], lastPt[1]);
      }
      // @ts-ignore
      lastPt = point;

      positionArray.push(point[0], point[1], 0);
      positionArray.push(point[0], point[1], 0);

      if (attrDistance) {
        pos += dist;
        per += dist / pathLength;
        distanceArray.push(pos, pathLength);
        distanceArray.push(pos, pathLength);
      }
    };
    this.setIndex(indexArray);
    this.setAttribute('position', new BufferAttribute(new Float32Array(positionArray), 3));

    if (attrDistance) {
      this.setAttribute('lineDistance', new BufferAttribute(new Float32Array(distanceArray), 2));
    }

    const normalArray: Array<number> = [];
    const miterArray: Array<number> = [];
    normals.forEach((n: Array<number>) => {
      const norm = n[0];
      const miter = n[1];
      normalArray.push(norm[0], norm[1]);
      normalArray.push(norm[0], norm[1]);
      miterArray.push(-miter, miter);
    });

    this.setAttribute('lineNormal', new BufferAttribute(new Float32Array(normalArray), 2));
    this.setAttribute('lineMiter', new BufferAttribute(new Float32Array(miterArray), 1));
  }

  static createPath(geometry: any, scalar: boolean): Array<number>[] {
    const s = scalar ? window.devicePixelRatio : 1;
    const path: Array<number>[] = [];
    const total = geometry.length;
    for (let i = 0; i < total; ++i) {
      path.push([geometry[i].x * s, geometry[i].y * s]);
    }
    return path;
  }
}
