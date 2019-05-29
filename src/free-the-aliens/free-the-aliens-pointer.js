import BaseSprite from '../../framework/core/BaseSprite';
import {SilPlayer} from '../../framework/plugins/SilPlayer';
import AssetJson from './AssetJson';
import MODULE from '../../framework/core/events/module-enum';
import EVENT from '../../framework/core/events/status-enum';

const levels = [2, 2, 2, 2, 3];
let _symbol = {
  pointer: Symbol(),
  level: Symbol(),
  even: Symbol()
};


class FreeTheAliensPointer extends BaseSprite {
  constructor() {
    super();
    this[_symbol.pointer] = new SilPlayer(this.game, AssetJson.base.json.pointer, {
      x: 0.72 * this.game.width,
      y: 0.855 * this.game.height
    });
    this.init();
  }

  gameOver() {
    this.removeListener(MODULE.GAME, EVENT.ANSWER_RIGHT, this.right, this);
    this.removeListener(MODULE.GAME, EVENT.ANSWER_WRONG, this.wrong, this);
    this.removeListener(MODULE.GAME, EVENT.GAME_OVER, this.gameOver, this);
  }

  gotoAndStop(index) {
    this[_symbol.pointer].drawFrameById(index);
  }

  init() {
    this.gotoAndStop(0);
    this.addListener(MODULE.GAME, EVENT.ANSWER_RIGHT, this.right, this);
    this.addListener(MODULE.GAME, EVENT.ANSWER_WRONG, this.wrong, this);
    this.addListener(MODULE.GAME, EVENT.GAME_OVER, this.gameOver, this);
    this[_symbol.level] = 0;
    this[_symbol.even] = 0;
  }

  right() {
    this[_symbol.even]++;
    //等级晋升,改变指针位置，连对计数清零
    if (this[_symbol.even] >= levels[this[_symbol.level]]) {
      this[_symbol.level]++;
      if (this[_symbol.level] > levels.length) {
        this[_symbol.level] = levels.length;
      } else {
        this.dispatchEventAfterAudio([AssetJson.base.sound.dropDownOne]);
      }
      this.gotoAndStop(this[_symbol.level]);
      this[_symbol.even] = 0;
    }
    this.dispatchEventAfterAudio([AssetJson.base.sound.dropDownTwo]);
  }

  wrong() {
    this[_symbol.even] = 0;
    this[_symbol.level]--;
    if (this[_symbol.level] < 0) {
      this[_symbol.level] = 0;
    }
    this.gotoAndStop(this[_symbol.level]);
  }

  get level() {
    return this[_symbol.level];
  }
}

export default FreeTheAliensPointer;