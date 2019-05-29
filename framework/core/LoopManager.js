import { Util } from './../util/Util';

class LoopManager {
  constructor() {
    let util = new Util();
    this.functionMap = new Map();
    this.add = (func, key) => {
      util.functionGuard(func);
      if (key) {
        this.functionMap.set(key, func);
      } else {
        throw new Error('You must give a key');
      }
    };
    this.remove = (funcOrKey) => {
      if (typeof funcOrKey !== 'function') {
        this.functionMap.delete(funcOrKey);
      } else {
        for (let i of this.functionMap.keys()) {
          if (this.functionMap.get(i) === funcOrKey) {
            this.functionMap.delete(i);
          }
        }
      }
    };
    this.pause = false;
  }

  update() {
    if (this.pause) {
      return;
    }
    for (let func of this.functionMap.values()) {
      func();
    }
  }
}

export {
  LoopManager
};