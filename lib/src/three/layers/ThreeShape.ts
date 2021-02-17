import {
  Color,
  DoubleSide,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Shape,
  ShapeGeometry,
} from 'three';
import {
  HALF_PI,
  TWO_PI
} from '../../math';
import {
  setBlendAdd,
  setBlendMultiply,
  setBlendScreen
} from '../utils';
import Timeline from '../../Timeline';
import ThreeLayer from './ThreeLayer';
import ThreeLineGeometry from '../geometry/ThreeLineGeometry';
import StrokeMaterial from '../materials/StrokeMaterial';

function organizeList(list: Array<any>) {
  const order = ['stroke', 'fill', 'transform', 'trim', 'repeater'];
  const total = order.length;
  const nTotal = list.length;
  const listOrder: Array<string> = [];
  for (let i = 0; i < total; ++i) {
    const orderName = order[i];
    for (let n = 0; n < nTotal; ++n) {
      const listName = list[n].type;
      if (orderName === listName) {
        listOrder.push(list[n]);
        break;
      }
    }
  }
  return listOrder;
}

export default class ThreeShape extends ThreeLayer {
  constructor(json: any, assets: any, timeline: Timeline) {
    super(json, assets, timeline);

    this.mesh = new Object3D();
    this.item.add(this.mesh);

    // Create shape
    const s = window.devicePixelRatio;
    let parent = this.mesh;

    function createShape(content: Array<any>) {
      const totalC = content.length - 1;
      for (let i = totalC; i > -1; --i) {
        const cLayer = content[i];
        const isShape = cLayer.paths !== undefined && cLayer.paths.length > 0;
        if (isShape) {
          // Cycle through the content to find fill, stroke, and transform
          let geometry;
          let mesh;
          let fill;
          let stroke;
          let trim;
          let repeater;
          let closed = true;
          let transform = {
            opacity: 1,
            anchor: [0, 0, 0],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            timeline: []
          };
          let nTotal = cLayer.content.length;
          const data = organizeList(cLayer.content);
          for (let n = 0; n < nTotal; ++n) {
            const nLayer = data[n] as any;
            switch (nLayer.type) {
              case 'fill':
                fill = {
                  alpha: nLayer.value.opacity,
                  blend: nLayer.value.blend,
                  color: nLayer.value.color,
                  timeline: nLayer.timeline[0]
                };
                break;

              case 'stroke':
                stroke = {
                  alpha: nLayer.value.opacity,
                  blend: nLayer.value.blend,
                  color: nLayer.value.color,
                  width: nLayer.value.width * s,
                  dashes: nLayer.value.dashes,
                  // timeline: nLayer.timeline[0]
                  timeline: nLayer.timeline
                };
                break;

              default:
              case 'transform':
                // @ts-ignore
                transform = nLayer;
                break;

              case 'trim':
                trim = nLayer;
                break;

              case 'repeater':
                repeater = nLayer;
                break;
            }
          }

          /**
           * Create Material / material effectors
           */

          /**
           * Draw Shapes
           */

          const shape = new Shape();

          // Draw paths
          nTotal = cLayer.paths.length;
          for (let n = 0; n < nTotal; ++n) {
            let x;
            let y;
            let w;
            let h;
            let t;
            let u;
            let angle;
            let curved;
            let totalPoints;
            const path = cLayer.paths[n];
            closed = true;
            switch (path.type) {
              case 'ellipse':
                x = path.x * s;
                y = path.y * s;
                w = (path.width / 2) * s;
                h = (path.height / 2) * s;
                shape.ellipse(x, y, w, h, 0, TWO_PI, true, Math.PI / 2);
                break;

              default:
              case 'rectangle':
                x = (path.x - (path.width / 2)) * s;
                y = (-path.y - (path.height / 2)) * s;
                w = path.width * s;
                h = path.height * s;
                shape.moveTo(x + w, y + h);
                shape.lineTo(x + w, y);
                shape.lineTo(x, y);
                shape.lineTo(x, y + h);
                break;

              case 'polygon':
                totalPoints = path.points;
                w = path.radius * s;
                angle = HALF_PI; // 90 degrees
                shape.moveTo(
                  Math.cos(angle) * w,
                  Math.sin(angle) * w
                );
                for (t = 1; t < path.points + 1; ++t) {
                  angle = -(t / totalPoints) * TWO_PI + HALF_PI; // 90 degrees
                  shape.lineTo(
                    Math.cos(angle) * w,
                    Math.sin(angle) * w
                  );
                }
                break;

              case 'polystar':
                totalPoints = path.points * 2;
                w = path.outRadius * s;
                h = path.inRadius * s;
                angle = MathUtils.degToRad(path.rotation) + HALF_PI; // 90 degrees
                shape.moveTo(
                  Math.cos(angle) * w,
                  Math.sin(angle) * w
                );

                angle = (1 / totalPoints) * TWO_PI + MathUtils.degToRad(path.rotation) + HALF_PI; // 90 degrees
                shape.lineTo(
                  Math.cos(angle) * h,
                  Math.sin(angle) * h
                );

                for (t = 1; t < path.points; ++t) {
                  angle = ((t * 2) / totalPoints) * TWO_PI
                    + MathUtils.degToRad(path.rotation) + HALF_PI; // 90 degrees
                  shape.lineTo(
                    Math.cos(angle) * w,
                    Math.sin(angle) * w
                  );

                  angle = ((t * 2 + 1) / totalPoints) * TWO_PI
                    + MathUtils.degToRad(path.rotation) + HALF_PI; // 90 degrees
                  shape.lineTo(
                    Math.cos(angle) * h,
                    Math.sin(angle) * h
                  );
                }
                break;

              case 'shape':
                totalPoints = path.vertices.length;
                curved = false;
                closed = path.closed;
                shape.moveTo(path.vertices[0][0] * s, path.vertices[0][1] * -s);
                for (u = 0; u < totalPoints; ++u) {
                  if (path.inTangents[u][0] !== 0
                    || path.inTangents[u][1] !== 0
                    || path.outTangents[u][0] !== 0
                    || path.outTangents[u][1] !== 0) {
                    curved = true;
                    break;
                  }
                }

                if (curved) {
                  for (u = 0; u < totalPoints; ++u) {
                    t = u + 1;
                    if (path.closed) t %= totalPoints;
                    else if (t >= totalPoints) break;
                    shape.bezierCurveTo(
                      (path.vertices[u][0] + path.outTangents[u][0]) * s,
                      (path.vertices[u][1] + path.outTangents[u][1]) * -s,
                      (path.vertices[t][0] + path.inTangents[t][0]) * s,
                      (path.vertices[t][1] + path.inTangents[t][1]) * -s,
                      (path.vertices[t][0]) * s,
                      path.vertices[t][1] * -s
                    );
                  }
                } else {
                  for (u = 0; u < totalPoints; ++u) {
                    t = u + 1;
                    if (path.closed) t %= totalPoints;
                    else if (t >= totalPoints) {
                      break;
                    }
                    shape.lineTo(
                      path.vertices[t][0] * s,
                      path.vertices[t][1] * -s
                    );
                  }
                }
                ThreeLayer.morph(shape, path, timeline, curved);
                break;
            }
          }

          /**
           * Create Mesh for shape
           */

          const container = new Object3D();
          parent.add(container);

          if (fill !== undefined) {
            const fillColor = new Color(fill.color[0], fill.color[1], fill.color[2]);
            const fillMaterial = new MeshBasicMaterial({
              color: fillColor,
              opacity: fill.alpha,
              side: DoubleSide,
              transparent: true,
              depthTest: false
            });
            geometry = new ShapeGeometry(shape);
            mesh = new Mesh(geometry, fillMaterial);
            ThreeLayer.transform(container, mesh, transform, timeline);
            container.add(mesh);

            if (fill.blend === 'screen') {
              setBlendScreen(fillMaterial);
            } else if (fill.blend === 'linearDodge') {
              setBlendAdd(fillMaterial);
            } else if (fill.blend === 'multiply') {
              setBlendMultiply(fillMaterial);
            }

            fillMaterial.opacity = fill.alpha;

            if (fill.timeline !== undefined) {
              const aniFill = {
                color: [fillColor.r, fillColor.g, fillColor.b, 1],
                onUpdate: () => {
                  fillMaterial.color.r = aniFill.color[0];
                  fillMaterial.color.g = aniFill.color[1];
                  fillMaterial.color.b = aniFill.color[2];
                }
              };
              ThreeLayer.animate(aniFill, 'color', timeline, fill.timeline, 1, {
                onUpdate: aniFill.onUpdate
              });
            }
          }

          if (stroke !== undefined) {
            const strokeColor = new Color(stroke.color[0], stroke.color[1], stroke.color[2]);
            const strokeMaterial = new StrokeMaterial({
              diffuse: strokeColor.getHex(),
              opacity: stroke.alpha,
              thickness: stroke.width
            });

            /**
             * Animate multiple properties
             */
            if (stroke.timeline !== undefined) {
              stroke.timeline.forEach((strokeTimeline: any) => {
                if (strokeTimeline.name === 'stroke') {
                  const aniStroke = {
                    color: [strokeColor.r, strokeColor.g, strokeColor.b, 1],
                    onUpdate: () => {
                      strokeMaterial.uniforms.diffuse.value.r = aniStroke.color[0];
                      strokeMaterial.uniforms.diffuse.value.g = aniStroke.color[1];
                      strokeMaterial.uniforms.diffuse.value.b = aniStroke.color[2];
                    }
                  };
                  ThreeLayer.animate(aniStroke, 'color', timeline, strokeTimeline, 1, {
                    onUpdate: aniStroke.onUpdate
                  });
                } else if (strokeTimeline.name === 'opacity') {
                  ThreeLayer.animate(strokeMaterial.uniforms.opacity, 'value', timeline, strokeTimeline, 1);
                } else if (strokeTimeline.name === 'width') {
                  ThreeLayer.animate(strokeMaterial.uniforms.thickness, 'value', timeline, strokeTimeline, s);
                }
              });
            }

            /**
             * Dashes
             */
            if (stroke.dashes !== undefined) {
              strokeMaterial.uniforms.dash.value.x = stroke.dashes.dash * s;
              strokeMaterial.uniforms.dash.value.y = stroke.dashes.gap * s;
              strokeMaterial.uniforms.dash.value.z = stroke.dashes.offset * s;

              // Animation
              if (stroke.dashes.timeline !== undefined) {
                nTotal = stroke.dashes.timeline.length;
                for (let n = 0; n < nTotal; ++n) {
                  switch (stroke.dashes.timeline[n].name) {
                    default:
                    case 'dash':
                      ThreeLayer.animate(
                        strokeMaterial.uniforms.dash.value,
                        'x',
                        timeline,
                        stroke.dashes.timeline[n],
                        s
                      );
                      break;
                    case 'gap':
                      ThreeLayer.animate(
                        strokeMaterial.uniforms.dash.value,
                        'y',
                        timeline,
                        stroke.dashes.timeline[n],
                        s
                      );
                      break;
                    case 'offset':
                      ThreeLayer.animate(
                        strokeMaterial.uniforms.dash.value,
                        'z',
                        timeline,
                        stroke.dashes.timeline[n],
                        s
                      );
                      break;
                  }
                }
              }
            }

            /**
             * Trim
             */
            if (trim !== undefined) {
              strokeMaterial.uniforms.trim.value.x = trim.value.start;
              strokeMaterial.uniforms.trim.value.y = trim.value.end;
              strokeMaterial.uniforms.trim.value.z = trim.value.offset;

              // Animation
              nTotal = trim.timeline.length;
              for (let n = 0; n < nTotal; ++n) {
                switch (trim.timeline[n].name) {
                  default:
                  case 'start':
                    ThreeLayer.animate(strokeMaterial.uniforms.trim.value, 'x', timeline, trim.timeline[n]);
                    break;
                  case 'end':
                    ThreeLayer.animate(strokeMaterial.uniforms.trim.value, 'y', timeline, trim.timeline[n]);
                    break;
                  case 'offset':
                    ThreeLayer.animate(strokeMaterial.uniforms.trim.value, 'z', timeline, trim.timeline[n]);
                    break;
                }
              }
            }

            const geomPoints = shape.getPoints(36);
            const pts = ThreeLineGeometry.createPath(geomPoints, false);
            geometry = new ThreeLineGeometry(pts, {
              closed: closed,
              // distances: stroke.dashes !== undefined || trim !== undefined
              distances: true
            });

            mesh = new Mesh(geometry, strokeMaterial);
            ThreeLayer.transform(container, mesh, transform, timeline);
            container.add(mesh);
          }
        } else {
          const group = new Object3D();
          group.name = cLayer.name;
          parent.add(group);
          parent = group;
          if (cLayer.content !== undefined) {
            createShape(cLayer.content);
          }
        }
      }
    }

    createShape(json.content);
    ThreeLayer.transform(this.item, this.mesh, json.transform, timeline);
  }
}
