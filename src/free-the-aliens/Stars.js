import AssetJson from './AssetJson';
import BaseSprite from '../../framework/core/BaseSprite';
import {CONSTANT} from '../../framework/core/Constant';

let _symbol = {
  count: Symbol(),
  parent: Symbol(),
  callback: Symbol(),
  stars: Symbol()
};

function clear(display) {
  display.destroy();
}

function seatPoint(value, max, column) {
  column = column || 0;
  let point = {
    row: value,
    column: column
  };
  if (value >= max) {
    point = seatPoint(value - max, max - 1, column + 1);
  }
  return point;
}

function starPoint(index, game) {
  let xList = [0.311, 0.327, 0.343];
  let yList = [0.854, 0.889, 0.924];
  let starsWidth = game.width * 0.0315;
  let point = seatPoint(index, 12);
  return {
    x: point.row * starsWidth + xList[point.column] * game.width,
    y: yList[point.column] * game.height
  };
}

class Stars extends BaseSprite {
  constructor(_parent, _target, _callback) {
    super(_parent);
    this[_symbol.count] = 0;
    this[_symbol.parent] = _target;
    this[_symbol.callback] = _callback;
    this[_symbol.stars] = [];
  }

  add() {
    let point = starPoint(this[_symbol.count], this.game);
    let star = this.game.add.sprite(point.x, point.y, AssetJson.base.image.star);
    this.addChild(star);
    this[_symbol.stars].push(star);
    if (this[_symbol.count] >= 32) {
      this[_symbol.parent][this[_symbol.callback]](CONSTANT.FULL_SCORE);
    }
    this[_symbol.count]++;
  }

  clear() {
    this[_symbol.count] = 0;
    this[_symbol.stars].forEach(clear, this);
  }

  complete() {
    if (this[_symbol.complete]) {
      this[_symbol.complete]();
    }
  }
}

export default Stars;