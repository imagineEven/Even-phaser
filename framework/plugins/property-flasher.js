import CurrentWorld from '../data/CurrentWorld';

let _symbol = {
  time: Symbol(),
  property: Symbol(),
  callback: Symbol(),
  callbackContext: Symbol(),
  arguments: Symbol(),
  onUpdate: Symbol(),
  isStart: Symbol(),
  isStop: Symbol(),
  isComplete: Symbol(),
  count: Symbol(),
  countDown: Symbol(),
  total: Symbol(),
  param: Symbol()
};

class PropertyFlasher {
  constructor(target, property, value, time, count) {
    this[_symbol.param] = {
      target: target,
      property: property,
      value: value,
      time: time,
      count: count
    };
  }

  play(callback, callbackContext, argument) {
    this.stop();
    this[_symbol.count] = 0;
    this[_symbol.callback] = callback;
    this[_symbol.callbackContext] = callbackContext;
    this[_symbol.arguments] = argument;
    let param = {
      target: this[_symbol.param].target,
      property: this[_symbol.param].property,
      oldValue: this[_symbol.param].target[this[_symbol.param].property],
      newValue: this[_symbol.param].value
    };
    this[_symbol.countDown] = this[_symbol.total] = this[_symbol.param].count ? this[_symbol.param].count : 0;
    this[_symbol.property] = CurrentWorld.game.time.events.loop(this[_symbol.param].time, this.propertyUpdate, this, param);
  }

  stop(isComplete) {
    if (this[_symbol.property]) {
      this.callback('isStop');
      if (isComplete) {
        this.callback('isComplete');
      }
      CurrentWorld.game.time.events.remove(this[_symbol.property]);
    }
  }

  propertyUpdate(param) {
    if (!param.target) {
      return;
    }
    if (!param.target.hasOwnProperty(param['property'])) {
      this.stop();
      return;
    }
    let old = param.target[param.property];
    param.target[param.property] = old === param.oldValue ? param.newValue : param.oldValue;

    this.callback('onUpdate');
    this[_symbol.count]++;
    this[_symbol.countDown]--;
    if (this[_symbol.total] > 0 && this[_symbol.count] >= this[_symbol.total]) {
      this.stop(true);
    }
  }

  get onUpdate() {
    return this[_symbol.onUpdate];
  }

  set onUpdate(bl) {
    return this[_symbol.onUpdate] = bl;
  }

  get isStart() {
    return this[_symbol.isStart];
  }

  set isStart(bl) {
    return this[_symbol.isStart] = bl;
  }

  get isStop() {
    return this[_symbol.isStop];
  }

  set isStop(bl) {
    return this[_symbol.isStop] = bl;
  }

  get isComplete() {
    return this[_symbol.isComplete];
  }

  set isComplete(bl) {
    return this[_symbol.isComplete] = bl;
  }

  destroy() {
    CurrentWorld.game.time.events.remove(this[_symbol.property]);
  }

  callback(type) {
    if (!this[type] || !this[_symbol.callback]) {
      return;
    }
    let e = {
      type: type,
      totalTime: this[_symbol.total],
      countDown: this[_symbol.countDown],
      countTime: this[_symbol.count],
      arguments: this[_symbol.arguments]
    };
    this[_symbol.callback].call(this[_symbol.callbackContext], e);
  }
}

export default PropertyFlasher;