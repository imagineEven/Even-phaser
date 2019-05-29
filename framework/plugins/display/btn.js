import BaseSprite from '../../core/BaseSprite';

let _symbol = {
  status: Symbol(),
  normal: Symbol(),
  enable: Symbol(),
  disable: Symbol(),
  enableFilter: Symbol(),
  disableFilter: Symbol(),
  normalFilter: Symbol(),
  show: Symbol(),
  filter: Symbol(),
  birthPoint: Symbol(),
  lock: Symbol()
};

class Btn extends BaseSprite {
  constructor() {
    super();
    this.status = 'normal';
    this.lock = false;
  }

  get status() {
    return this[_symbol.status];
  }

  set status(status) {
    if (this.lock) {
      return;
    }
    if (this[_symbol.show]) {
      this.removeChild(this[_symbol.show]);
    }
    this[_symbol.show] = this[_symbol[status]] ? this[_symbol[status]] : this[_symbol.normal];
    if (this[_symbol.show]) {
      this.addChild(this[_symbol.show]);
      if (this[_symbol.show].filters) {
        this[_symbol.show].filters = undefined;
      }
      this[_symbol.filter] = this[_symbol[`${status}Filter`]] ? this[_symbol[`${status}Filter`]] : this[_symbol.normalFilter];

      if (this[_symbol.filter]) {
        this[_symbol.show].filters = [this[_symbol.filter]];
      }
    }
    this[_symbol.status] = status;
    this.inputEnabled = this.status === 'enable';
  }

  set enable(texture) {
    this[_symbol.enable] = texture;
    this.status = this[_symbol.status];
  }

  set disable(texture) {
    this[_symbol.disable] = texture;
    this.status = this[_symbol.status];
  }

  get normal() {
    return this[_symbol.normal];
  }

  get enable() {
    return this[_symbol.enable];
  }

  get disable() {
    return this[_symbol.disable];
  }

  set normal(texture) {
    this[_symbol.normal] = texture;
    this.status = this[_symbol.status];
  }


  set enableFilter(filter) {
    this[_symbol.enableFilter] = filter;
    this.status = this[_symbol.status];
  }

  set disableFilter(filter) {
    this[_symbol.disableFilter] = filter;
    this.status = this[_symbol.status];
  }

  set normalFilter(filter) {
    this[_symbol.normalFilter] = filter;
    this.status = this[_symbol.status];
  }

  set birthLocation(point) {
    this[_symbol.birthPoint] = point;
    this.x = point.x;
    this.y = point.y;
  }

  get birthLocation() {
    return this[_symbol.birthPoint];
  }

  set lock(bl) {
    this[_symbol.lock] = bl;
  }

  get lock() {
    return this[_symbol.lock];
  }
}

export default Btn;