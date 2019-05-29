import CurrentWorld from '../data/CurrentWorld';
import Phaser from 'phaser';
import EventDispatcher from './events/event-dispatcher';
import MODULE from './events/module-enum';
import EVENT from './events/status-enum';

let _symbol = {
  eventDispatcher: Symbol()
};

class BaseSprite extends Phaser.Sprite {
  constructor(parent) {
    super(CurrentWorld.game);
    this.removeAllListener = BaseSprite.eventDispatcher.removeAllListener;
    if (parent) {
      parent.addChild(this);
    }
  }

  create(x, y, key, frame, index) {
    let child = new Phaser.Sprite(this.game, x, y, key, frame);
    if (index) {
      this.addChildAt(child, index);
    } else {
      this.addChild(child);
    }
    return child;
  }

  getFilter(name) {
    return this.game.add.filter(name);
  }

  onlyCreate(x, y, key, frame) {
    return new Phaser.Sprite(this.game, x, y, key, frame);
  }

  getTexture(key) {
    return new Phaser.Sprite(this.game, 0, 0, key, 0).texture;
  }

  static set game(game) {
    CurrentWorld.game = game;
  }

  addListener(listener, event, callback, target, ...param) {
    BaseSprite.eventDispatcher.addListener(listener, event, callback, target || this, ...param);
  }

  removeListener(listener, event, callback, target) {
    BaseSprite.eventDispatcher.removeListener(listener, event, callback, target || this);
  }

  dispatchEvent(listener, event) {
    if (!this) {
      return;
    }
    BaseSprite.eventDispatcher.dispatchEvent(listener, event);
  }

  static get eventDispatcher() {
    return BaseSprite[_symbol.eventDispatcher];
  }

  static  addEventDispatcher(val) {
    BaseSprite[_symbol.eventDispatcher] = val;
  }

  get json() {
    return this.game.json;
  }

  dispatchEventAfterAudio(sound, listener = undefined, event = undefined, stopCurrentAudio = false) {
    this.game.playMultiPromise(sound, { stopCurrentAudio: stopCurrentAudio }).then(() => {
      if (listener && event) {
        this.dispatchEvent(listener, event);
      }
    });
  }

  dispatchEventAfterVideo(url, option, module, event) {
    this.game.createVideoPlay(url, option || {}, () => {
      this.dispatchEvent(module || MODULE.VIDEO_PLAYER, event || EVENT.VIDEO_COMPLETE);
    });
  }

  dispatchEventConfigToolbar(sound, replayData, exit, module, event) {
    let data = {};
    if (sound) {
      data.soundData = sound;
      data.soundData.callback = () => {
        this.dispatchEvent(module || MODULE.TOOLBAR, event || EVENT.SOUND_COMPLETE);
      };
    }
    if (replayData) {
      data.replayData = () => {
        this.dispatchEvent(MODULE.TOOLBAR, EVENT.CLICK_NEXT);
      };
    }
    if (exit) {
      data.exitData = () => {};
    }
    this.game.createToolbar(data);
  }
}

BaseSprite[_symbol.eventDispatcher] = new EventDispatcher();
export default BaseSprite;