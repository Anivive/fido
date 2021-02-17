import './scss/main.scss';
// eslint-disable-next-line
import assets from './scripts/assets';
// eslint-disable-next-line
import debug from './scripts/utils/debug'
// eslint-disable-next-line
import { loader } from './scripts/utils/loader'
// eslint-disable-next-line
import ThreeApp from './scripts/apps/ThreeApp';

let app: ThreeApp;

function changeApp(name: string) {
  if (app === undefined) {
    app = new ThreeApp();
  } else {
    app.disposeComp();
  }
  app.createComp(name);
  app.start();
}

window.onload = () => {
  const loaderEl = document.getElementById('loader') as HTMLElement;
  const loaderProgressEl = document.getElementById('loadProgress') as HTMLElement;
  const startBtn = document.getElementById('start') as HTMLButtonElement;

  const onLoad = (files: any) => {
    loaderEl.parentElement?.removeChild(loaderEl);

    // Set Video sizes
    const json = files.json.animation;
    json.assets.video.forEach((video: any) => {
      const source = video.source;
      const slash = source.lastIndexOf('/');
      const period = source.lastIndexOf('.');
      const fileName = source.slice(slash + 1, period);
      if (files.textures[fileName] !== undefined) {
        const texture = files.textures[fileName];
        texture.image.setAttribute('width', video.width.toString());
        texture.image.setAttribute('height', video.height.toString());
        texture.needsUpdate = true;
      }
    });

    startBtn.classList.remove('hidden');
    startBtn.addEventListener('click', () => {
      startBtn.parentElement?.removeChild(startBtn);

      const compositions: Array<string> = ['None'];
      const compJson = files.json.animation.compositions;
      Object.keys(compJson).forEach((i: string) => {
        compositions.push(i);
      });
      debug.addOptions(
        undefined,
        'Composition',
        compositions,
        (value: string) => {
          changeApp(value);
        }
      );
    }, false);
  };

  loader.loadAssets(assets, (progress: number) => {
    loaderProgressEl.style.width = `${progress * 100}%`;
  }).then(onLoad).catch((reason: string) => {
    // console.log(`Load issue: ${reason}`);
  });
};
