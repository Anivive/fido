import Marker from '../../../../lib/src/Marker';
import Timeline from '../../../../lib/src/Timeline';

export default class Button {
  element: HTMLElement;

  timeline: Timeline;

  frames = {
    show: 'show',
    hide: 'hide',
    over: 'over',
    out: 'out',
  };

  onClick?: () => void;

  private rollOverHandler: () => void;

  private rollOutHandler: () => void;

  private clickHandler: (evt: MouseEvent) => void;

  constructor(element: HTMLElement, timeline: Timeline) {
    this.element = element;
    this.timeline = timeline;

    this.rollOverHandler = this.rollOver.bind(this);
    this.rollOutHandler = this.rollOut.bind(this);
    this.clickHandler = this.click.bind(this);
  }

  enable() {
    this.element.addEventListener('mouseover', this.rollOverHandler, false);
    this.element.addEventListener('mouseout', this.rollOutHandler, false);
    this.element.addEventListener('click', this.clickHandler, false);
    this.element.style.cursor = 'pointer';
  }

  disable() {
    this.element.removeEventListener('mouseover', this.rollOverHandler);
    this.element.removeEventListener('mouseout', this.rollOutHandler);
    this.element.removeEventListener('click', this.clickHandler);
    this.element.style.cursor = 'default';
  }

  dispose() {
    this.disable();
    this.timeline.dispose();
  }

  show() {
    this.timeline.goToMarker(this.frames.show);
    this.timeline.play();
  }

  hide() {
    this.disable();
    this.timeline.goToMarker(this.frames.hide);
    this.timeline.play();
  }

  getMarker(name: string): Marker | undefined {
    return this.timeline.getMarker(name);
  }

  goTo(name: string) {
    this.timeline.goToMarker(name);
    this.timeline.play();
  }

  // Events

  rollOver() {
    this.timeline.goToMarker(this.frames.over);
    this.timeline.play();
  }

  rollOut() {
    this.timeline.goToMarker(this.frames.out);
    this.timeline.play();
  }

  click(evt: MouseEvent) {
    evt.preventDefault();
    if (this.onClick !== undefined) this.onClick();
  }
}
