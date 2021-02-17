/**
 * Promise-based loader
 * @author Colin Duffy
 */

import {
  Texture,
  TextureLoader,
  CubeTexture,
  CubeTextureLoader,
  VideoTexture
} from 'three';

import {
  GLTF,
  GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader';

const supportsBlob = false;
/*
try {
  supportsBlob = !!new Blob();
} catch (e) {
  //
}
*/

export const files = {
  audio: {},
  images: {},
  textures: {},
  cubeTextures: {},
  gltf: {},
  json: {},
  videos: {}
};

class LoadHelper {
  fileID(path: string): string {
    const slash = path.lastIndexOf('/') + 1;
    const period = path.lastIndexOf('.');
    return path.substring(slash, period);
  }

  /**
   * Loads items through a XMLHttpRequest
   * @param path The URL of the file
   * @param responseType The type of the request
   * @param onProgress The progress callback
   */
  async loadXHR(
    path: string,
    responseType: XMLHttpRequestResponseType,
    onProgress: (progress: number) => void
  ): Promise<XMLHttpRequest> {
    return new Promise<XMLHttpRequest>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', path, true);
      request.responseType = responseType;
      request.addEventListener('progress', (event: ProgressEvent) => {
        const progress = event.loaded / event.total;
        onProgress(progress);
      }, false);
      request.addEventListener('load', () => {
        resolve(request);
      }, false);
      request.addEventListener('error', () => {
        reject();
      }, false);
      request.send();
    });
  }

  /**
   * Loads an XHR Image
   * @param path
   * @param onProgress
   */
  async loadImageBlob(
    path: string,
    onProgress: (progress: number) => void
  ): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      this.loadXHR(path, 'blob', onProgress)
        .then((request: XMLHttpRequest) => {
          const image = new Image();
          window.URL.revokeObjectURL(request.response);
          image.src = window.URL.createObjectURL(request.response);

          resolve(image);
        })
        .catch(reject);
    });
  }

  /**
   * Loads an HTML Image Element
   * @param path The URL of the image
   * @returns A Promise with the image as a param
   */
  async loadImageElement(
    path: string
  ): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const request = new Image();
      request.addEventListener('error', () => {
        reject();
      }, false);
      request.addEventListener('load', () => {
        resolve(request);
      }, false);
      request.src = path;
    });
  }

  /**
   * Loads a set of images
   * @param baseURL
   * @param images
   * @param onProgress
   */
  async loadImages(
    baseURL: string,
    images: Array<string>,
    onProgress: (progress: number) => void
  ): Promise<HTMLImageElement[]> {
    // All the Promises
    const promises: Promise<HTMLImageElement>[] = [];
    if (supportsBlob) {
      // On Progress Update
      const progression = {};
      const onProgressUpdate = () => {
        let total = 0;
        let count = 0;
        Object.keys(progression).forEach((i) => {
          count++;
          total += progression[i];
        });

        const progress = total / count;
        onProgress(progress);
      };
      images.forEach((image: string) => {
        progression[image] = 0;
        promises.push(this.loadImageBlob(baseURL + image, (progress: number) => {
          progression[image] = progress;
          onProgressUpdate();
        }));
      });
    } else {
      let loaded = 0;
      const total = images.length;
      images.forEach((image: string) => {
        promises.push(new Promise((resolve, reject) => {
          this.loadImageElement(baseURL + image)
            .then((imageElement: HTMLImageElement) => {
              ++loaded;
              const progress = loaded / total;
              onProgress(progress);
              resolve(imageElement);
            }).catch(reject);
        }));
      });
    }

    return Promise.all(promises);
  }

  /**
   * Loads a GLTF file
   * @param path
   * @param onProgress
   */
  async loadGLTF(
    path: string,
    onProgress: (progress: number) => void
  ): Promise<GLTF> {
    return new Promise<GLTF>((resolve, reject) => {
      const modelLoader = new GLTFLoader();
      modelLoader.load(
        path,
        (gltf: GLTF) => {
          resolve(gltf);
        },
        (event: ProgressEvent) => {
          const progress = event.loaded / event.total;
          onProgress(progress);
        },
        () => {
          reject();
        }
      );
    });
  }

  /**
   * Loads a JSON file
   * @param path
   * @param onProgress
   */
  async loadJSON(
    path: string,
    onProgress: (progress: number) => void
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.loadXHR(path, 'json', onProgress)
        .then((request: XMLHttpRequest) => {
          let json = request.response;
          if (typeof json === 'string') {
            json = JSON.parse(json);
          }
          resolve(json);
        })
        .catch(reject);
    });
  }

  /**
   * Loads an HTML Audio Element
   * @param path The URL of the audio
   * @returns A Promise with the audio as a param
   */
  async loadAudioElement(
    path: string
  ): Promise<HTMLAudioElement> {
    return new Promise<HTMLAudioElement>((resolve, reject) => {
      const request = document.createElement('audio') as HTMLAudioElement;
      request.autoplay = false;
      request.src = path;
      request.addEventListener('error', () => {
        reject();
      }, false);
      request.addEventListener('canplaythrough', () => {
        resolve(request);
      }, false);
      request.load();
    });
  }

  /**
   * Loads an HTML Video Element
   * @param path The URL of the video
   * @returns A Promise with the video as a param
   */
  async loadVideoElement(
    path: string
  ): Promise<HTMLVideoElement> {
    return new Promise<HTMLVideoElement>((resolve, reject) => {
      const request = document.createElement('video') as HTMLVideoElement;
      request.autoplay = false;
      request.src = path;
      request.addEventListener('error', () => {
        reject();
      }, false);
      request.addEventListener('canplaythrough', () => {
        resolve(request);
      }, false);
      request.load();
    });
  }

  /**
   * Loads a Texture through Three
   * @param path
   * @param onProgress
   */
  async loadTexture(
    path: string,
    onProgress: (progress: number) => void
  ): Promise<Texture> {
    return new Promise<Texture>((resolve, reject) => {
      const loader = new TextureLoader();
      loader.load(
        path,
        (texture: Texture) => {
          texture.name = this.fileID(path);
          resolve(texture);
        },
        (event: ProgressEvent) => {
          const progress = event.loaded / event.total;
          onProgress(progress);
        },
        () => {
          reject();
        }
      );
    });
  }

  /**
   * Loads an HTML Video Element
   * @param path The URL of the video
   * @returns A Promise with the video as a param
   */
  async loadVideoTexture(
    path: string
  ): Promise<VideoTexture> {
    return new Promise<VideoTexture>((resolve, reject) => {
      this.loadVideoElement(path).then((video: HTMLVideoElement) => {
        const texture = new VideoTexture(video);
        texture.name = this.fileID(path);
        resolve(texture);
      }).catch(reject);
    });
  }

  /**
   * Loads a Cube Texture through Three
   * @param path
   * @param onProgress
   */
  async loadCubeTexture(
    path: string,
    assets: any,
    onProgress: (progress: number) => void
  ): Promise<CubeTexture> {
    return new Promise<CubeTexture>((resolve, reject) => {
      const loader = new CubeTextureLoader();
      loader.setPath(path);
      loader.load(
        assets,
        (texture: CubeTexture) => {
          resolve(texture);
        },
        (event: ProgressEvent) => {
          const progress = event.loaded / event.total;
          onProgress(progress);
        },
        () => {
          reject();
        }
      );
    });
  }

  async loadAssets(
    items: Array<any>,
    onProgress: (progress: number) => void
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let loaded = 0;
      const total = items.length;

      if (total < 1) {
        onProgress(1);
        resolve(files);
        return;
      }

      let timer: any = setInterval(() => {
        const progress = loaded / (total - 1);
        onProgress(Number.isNaN(progress) ? 0 : progress);
      }, 1000 / 30);

      const killTimer = () => {
        clearInterval(timer);
        timer = undefined;
      };

      const onLoad = () => {
        ++loaded;
        if (loaded >= total) {
          onProgress(1);
          killTimer();
          resolve(files);
        }
      };

      items.forEach((item: any) => {
        // @ts-ignore
        const { type } = item;
        // @ts-ignore
        const { file } = item;
        switch (type) {
          default:
          case 'image':
            this.loadImageElement(file).then((image: HTMLImageElement) => {
              const fileID = this.fileID(file);
              files.images[fileID] = image;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'audio':
            this.loadAudioElement(file).then((audio: HTMLAudioElement) => {
              const fileID = this.fileID(file);
              files.audio[fileID] = audio;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'video':
            this.loadVideoElement(file).then((image: HTMLVideoElement) => {
              const fileID = this.fileID(file);
              files.videos[fileID] = image;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'texture':
            this.loadTexture(file, () => { }).then((texture: Texture) => {
              const fileID = this.fileID(file);
              files.textures[fileID] = texture;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'cubeTexture':
            // eslint-disable-next-line
            const { path } = item;
            this.loadCubeTexture(path, file, () => { }).then((texture: CubeTexture) => {
              // @ts-ignore
              const fileID = item.name;
              texture.name = fileID;
              files.cubeTextures[fileID] = texture;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'videoTexture':
            this.loadVideoTexture(file).then((texture: Texture) => {
              const fileID = this.fileID(file);
              files.textures[fileID] = texture;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'gltf':
            this.loadGLTF(file, () => { }).then((gltf: GLTF) => {
              const fileID = this.fileID(file);
              files.gltf[fileID] = gltf;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
          case 'json':
            this.loadJSON(file, () => { }).then((json: any) => {
              const fileID = this.fileID(file);
              files.json[fileID] = json;
              onLoad();
            }).catch(() => {
              killTimer();
              // eslint-disable-next-line
              reject(`Error loading: ${file}`);
            });
            break;
        }
      });
    });
  }
}

export const loader = new LoadHelper();
