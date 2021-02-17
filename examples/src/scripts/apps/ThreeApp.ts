import {
  WebGLRenderer
} from 'three';
import debug from '../utils/debug';
import { delay } from '../utils/dom';
import { files } from '../utils/loader';
import BaseApp from './BaseApp';
import ThreeComposition from '../../../../lib/src/three/layers/ThreeComposition';
import Button from '../views/Button';

let composition: ThreeComposition;
let btn: Button;
const ui = document.getElementById('ui')! as HTMLDivElement;

function clearUI() {
  ui.childNodes.forEach((node: ChildNode) => {
    node.parentElement!.removeChild(node);
  });

  if (btn !== undefined) {
    btn.dispose();
  }
}

export default class ThreeApp extends BaseApp {
  renderer: WebGLRenderer;

  constructor() {
    super();
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById('world') as HTMLCanvasElement
    });
    this.renderer.setClearColor(0x000000);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  createComp(name: string) {
    // @ts-ignore
    const json = files.json.animation.compositions[name];
    composition = new ThreeComposition(this.renderer, json, files);
    composition.build(json, files);
    composition.autoFOV = true;
    composition.play();

    clearUI();

    if (name === 'BtnEnter') {
      const btnEl = document.createElement('button');
      btnEl.classList.add('btnEnter');
      ui.appendChild(btnEl);

      btn = new Button(btnEl, composition?.timeline);
      const showComplete = btn.getMarker('show-stop');
      if (showComplete !== undefined) {
        showComplete.callback = () => {
          btn.enable();
        };
      }
      btn.onClick = () => {
        btn.hide();
        delay(2).then(() => {
          btn.show();
        });
      };
    } else if (name === 'BtnNext') {
      const btnEl = document.createElement('button');
      btnEl.classList.add('btnNext');
      ui.appendChild(btnEl);

      btn = new Button(btnEl, composition?.timeline);
      const showComplete = btn.getMarker('show-stop');
      if (showComplete !== undefined) {
        showComplete.callback = () => {
          btn.enable();
        };
      }
      btn.onClick = () => {
        btn.hide();
        delay(2).then(() => {
          btn.show();
        });
      };
    }
  }

  dispose() {
    super.dispose();
    this.disposeComp();
    this.renderer.dispose();
  }

  disposeComp() {
    composition.dispose();
    composition.pause();
  }

  update() {
    debug.begin();
    composition.update();
  }

  draw() {
    composition.draw();
    debug.end();
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    composition.resize(width, height);
  }
}
