import AssetJson from './AssetJson';
import BaseSprite from '../../framework/core/BaseSprite';
import {CONSTANT} from '../../framework/core/Constant';
import {SilPlayer} from '../../framework/plugins/SilPlayer';
import PropertyFlasher from '../../framework/plugins/property-flasher';

let _symbol = {
  countTime: Symbol(),
  start: Symbol(),
  stop: Symbol(),
  complete: Symbol(),
  parent: Symbol(),
  callback: Symbol(),
  time: Symbol(),
  timeEvent: Symbol(),
  flashUI: Symbol(),
  countFrame: Symbol()
};


class CountTime extends BaseSprite {
  constructor(_parent, _target, _callback) {
    super(_parent);
    this[_symbol.parent] = _target;
    this[_symbol.callback] = _callback;
    this[_symbol.countTime] = 0;
    this.create(0.115 * this.game.width, 0.858 * this.game.height, AssetJson.base.image.timebg);
    this.view();
  }

  view() {
    this[_symbol.time] = new SilPlayer(this.game, AssetJson.base.json.countTime, {
      x: 0.115 * this.game.width,
      y: 0.858 * this.game.height,
      isLoop: false
    });
    this.addChild(this[_symbol.time]);
    this[_symbol.flashUI] = this.create(0.114 * this.game.width, 0.858 * this.game.height, AssetJson.base.image.flashTime);
    this[_symbol.flashUI].width *= 1.03;
    this[_symbol.flashUI].height *= 1.04;
    this[_symbol.flashUI].visible = false;
    this[_symbol.flash] = new PropertyFlasher(this[_symbol.flashUI], 'visible', true, 310);
    this[_symbol.flash].isStop = true;
  }

  playFlash() {
    this[_symbol.flash].play(this.flashIsStop, this);
  }

  stopFlash() {
    this[_symbol.flash].stop();
  }

  flashIsStop() {
    this[_symbol.flashUI].visible = false;
  }

  start() {
    this.stopFlash();
    this[_symbol.timeEvent] = this.game.time.events.loop(AssetJson.privateData.gameTime / 25, this.nextFrame, this);
  }

  nextFrame() {
    this[_symbol.countTime]++;
    this.gotoAndStop(this[_symbol.countTime] * 24);
    this.dispatchEventAfterAudio([AssetJson.base.sound.clock]);
    if (this[_symbol.countTime] >= 25) {
      this.dispatchEventAfterAudio([AssetJson.base.sound.timeOver]);
      this.complete();
      this.stop();
    }
  }

  reset() {
    this.gotoAndStop(0);
    this[_symbol.countTime]=0;
  }

  gotoAndStop(index) {
    this[_symbol.time].drawFrameById(index);
  }

  stop() {
    this.game.time.events.remove(this[_symbol.timeEvent]);
    this[_symbol.countTime] = 0;
  }

  complete() {
    this[_symbol.parent][this[_symbol.callback]](CONSTANT.TIME_OUT);
  }
}

export default CountTime;