import BaseSprite from '../../framework/core/BaseSprite';

let _symbol = {
  data: Symbol(),
  open: Symbol(),
  close: Symbol(),
  openAnimations: Symbol(),
  closeAnimations: Symbol(),
  stop: Symbol(),
  containerId: Symbol(),
  point: Symbol(),
  complete: Symbol(),
  completeParam: Symbol(),
  callTarget: Symbol()
};

class Cap extends BaseSprite {
  constructor(_data) {
    super();
    this[_symbol.data] = _data;
    this[_symbol.containerId] = null;
    this[_symbol.point] = { x: 0, y: 0 };
    this.view(_data);
  }

  view(_data) {

    this[_symbol.point].x = _data.x * this.game.width;
    this[_symbol.point].y = _data.y * this.game.height;
    let open = this.create(this.point.x, this.point.y, _data.openJson, 0);
    open.anchor.x = 0.5;
    open.anchor.y = 0.5;
    let close = this.create(_data.x * this.game.width, _data.y * this.game.height, _data.closeJson, 3);
    close.anchor.x = 0.5;
    close.anchor.y = 0.5;
    open.visible = false;
    close.visible = true;
    this[_symbol.open] = open;
    this[_symbol.close] = close;
    this[_symbol.openAnimations] = open.animations.add('open', [1, 2, 3, 0]);
    this[_symbol.closeAnimations] = close.animations.add('close', [0, 1, 2, 3]);
    this[_symbol.openAnimations].onComplete.add(this.complete, this);
    this[_symbol.closeAnimations].onComplete.add(this.complete, this);
    this.addChild(open);
    this.addChild(close);
  }

  stop() {
    this[_symbol.openAnimations].stop('open', true);
    this[_symbol.closeAnimations].stop('close', true);
  }

  close(_callback, _target, _param) {
    this.stop();
    this[_symbol.open].visible = false;
    this[_symbol.close].visible = true;
    this[_symbol.closeAnimations].play(15, false);
    this[_symbol.complete] = _callback;
    this[_symbol.completeParam] = _param;
    this[_symbol.callTarget] = _target;
  }

  stopGame() {
    this[_symbol.open].visible = false;
    this[_symbol.close].visible = true;
    this[_symbol.closeAnimations].play(15, false);
    this[_symbol.openAnimations].onComplete.remove(this.complete, this);
    this[_symbol.closeAnimations].onComplete.remove(this.complete, this);
  }

  open(_callback, _target, _param) {
    this.stop();
    this[_symbol.open].visible = true;
    this[_symbol.close].visible = false;
    this[_symbol.openAnimations].play(15, false);
    this[_symbol.complete] = _callback;
    this[_symbol.completeParam] = _param;
    this[_symbol.callTarget] = _target;
  }

  get containerId() {
    return this[_symbol.containerId];
  }

  get point() {
    return this[_symbol.point];
  }

  set containerId(_value) {
    this[_symbol.containerId] = _value;
  }

  complete() {
    if (this[_symbol.complete]) {
      this[_symbol.callTarget][this[_symbol.complete]](this[_symbol.completeParam]);
    }
    this[_symbol.complete] = null;
    this[_symbol.completeParam] = null;
    this[_symbol.callTarget] = null;
  }
}

export default Cap;