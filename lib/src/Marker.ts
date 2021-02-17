/**
 * A Marker object.
 * If the `name` param has `-stop` added, it'll trigger the
 * Timeline to stop when the Marker is first activated.
 */
export default class Marker {
  name: string = '';

  time: number = 0;

  callback?: () => void;

  constructor(name: string = '', time: number = 0) {
    this.name = name;
    this.time = time;
  }
}
