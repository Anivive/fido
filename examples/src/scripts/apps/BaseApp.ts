let onRAF: any;
let onUpdate: any;
let onResize: any;

export default class BaseApp {
  playing: boolean = false;

  constructor() {
    onResize = this.resize.bind(this);
    onUpdate = () => {
      this.update();
      this.draw();
      onRAF = window.requestAnimationFrame(onUpdate);
    };
  }

  /**
   * Starts the App
   */
  start() {
    if (this.playing) return;
    this.playing = true;
    this.enable();
    this.resize();
    onUpdate();
  }

  /**
   * Stops the App
   */
  stop() {
    if (!this.playing) return;
    this.playing = false;
    window.cancelAnimationFrame(onRAF);
    onRAF = undefined;
  }

  /**
   * Stops playing & clears the memory.
   */
  dispose() {
    this.stop();
  }

  // IApp

  /**
   * Enables listeners
   */
  enable(): void {
    window.addEventListener('resize', onResize, false);
  }

  /**
   * Disables listeners
   */
  disable(): void {
    window.removeEventListener('resize', onResize, false);
  }

  /**
   * Updates animation
   */
  update(): void {
    //
  }

  /**
   * Renders the WebGL
   */
  draw(): void {
    //
  }

  /**
   * Resize the WebGLRenderer & update the Camera
   */
  resize(): void {
    //
  }
}
