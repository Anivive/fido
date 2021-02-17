// @ts-ignore
import * as Stats from 'stats-js';
// @ts-ignore
import * as dat from 'dat.gui';

/**
 * Single Debugging object to house dat.gui & stats
 */
class DebugHelper {
  // enabled: boolean = document.location.href.search('debug') > -1;
  enabled: boolean = true;

  gui: dat.GUI;

  private stats: any;

  private folders: Object = {};

  constructor() {
    if (!this.enabled) return;

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.gui = new dat.GUI();
    this.gui.domElement.parentElement.style.zIndex = '10000';
  }

  /**
   * To be called before updating/rendering
   */
  begin() {
    if (!this.enabled) return;
    this.stats.begin();
  }

  /**
   * To be called after updating/rendering
   */
  end() {
    if (!this.enabled) return;
    this.stats.end();
  }

  /**
   * Retrieves or creates the GUI folder
   * @param name
   */
  folder(name: string, expanded: boolean = true) {
    // If a folder with the same name already exists, return that folder
    // @ts-ignore
    if (this.folders[name]) {
      // @ts-ignore
      return this.folders[name];
    }

    const folder = this.gui.addFolder(name);
    if (!expanded) {
      folder.close();
    } else {
      folder.open();
    }

    // @ts-ignore
    this.folders[name] = folder;

    // @ts-ignore
    return this.folders[name];
  }

  addButton(gui: dat.gui.GUI | undefined, label: string, callback: () => void): dat.gui.GUI {
    const props = { click: callback };
    const usedGUI = gui !== undefined ? gui : this.gui;
    return usedGUI.add(props, 'click').name(label);
  }

  addOptions(
    gui: dat.gui.GUI | undefined,
    label: string,
    options: Array<any>,
    callback: (value: any, index: number) => void
  ): dat.gui.GUI {
    const usedGUI = gui !== undefined ? gui : this.gui;
    const params = {
      // @ts-ignore
      value: options[0]
    };
    return usedGUI.add(params, 'value', options).onChange((value: any) => {
      // @ts-ignore
      const index = options.indexOf(value);
      callback(value, index);
    }).name(label);
  }

  addInput(
    gui: dat.gui.GUI | undefined,
    obj: any,
    value: string,
    props?: any
  ): dat.gui.GUI {
    const usedGUI = gui !== undefined ? gui : this.gui;
    let added: dat.gui.GUI = usedGUI;

    if (props !== undefined) {
      if (props.min !== undefined) {
        if (props.step !== undefined) {
          added = usedGUI.add(obj, value, props.min, props.max, props.step);
        } else {
          added = usedGUI.add(obj, value, props.min, props.max);
        }
      }
    } else {
      added = usedGUI.add(obj, value);
    }

    if (added !== undefined) {
      if (props !== undefined) {
        if (props.label !== undefined) added.name(props.label);
        if (props.onChange !== undefined) {
          added.onChange(() => {
            props.onChange();
          });
        }
      }
    }

    return added;
  }
}

export default new DebugHelper();
