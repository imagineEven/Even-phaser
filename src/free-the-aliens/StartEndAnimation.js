import AssetJson from './AssetJson';
import BaseSprite from '../../framework/core/BaseSprite';
import { CONSTANT } from '../../framework/core/Constant';
import EVENT from '../../framework/core/events/status-enum';
import ALIEN_MODULE from './free-the-aliens-module';

let _symbol = {
  spaceShip: Symbol(),
  tween: Symbol(),
  tweenType: Symbol(),
  parent: Symbol(),
  callback: Symbol()
};

class StartEndAnimation extends BaseSprite {
  constructor(_parent, _target, _callback) {
    super(_parent);
    this[_symbol.parent] = _target;
    this[_symbol.callback] = _callback;
    this[_symbol.spaceShip] = this.game.add.sprite(0, 0, AssetJson.base.image.allClose);
    this[_symbol.spaceShip].y = -this.game.height;
    this[_symbol.tween] = this.game.add.tween(this[_symbol.spaceShip]);
    this[_symbol.tween].onComplete.add(this.complete, this);
  }

  start() {
    this[_symbol.tweenType] = CONSTANT.START;
    this[_symbol.tween].stop();
    this[_symbol.tween].timeline = [];
    this[_symbol.tween].to({ y: 0 }, null, null, true);
  }

  end() {
    this[_symbol.tweenType] = CONSTANT.END;
    this[_symbol.tween].stop();
    this[_symbol.tween].to({ y: -this.game.height }, null, null, true);
  }

  complete() {
    this[_symbol.parent][this[_symbol.callback]](this.type);
    this.dispatchEvent(ALIEN_MODULE.SPACESHIP_ANIMATION, EVENT.MOVE_COMPLETE);
  }

  get type() {
    return this[_symbol.tweenType];
  }
}

export default StartEndAnimation;