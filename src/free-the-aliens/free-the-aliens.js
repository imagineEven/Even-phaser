import { Courseware } from '../../framework/core/Courseware';
import LoadAsset from './LoadAsset';
import AssetJson from './AssetJson';
import CurrentWorld from '../../framework/data/CurrentWorld';
import SpaceShip from './SpaceShip';
import CountTime from './CountTime';
import Stars from './Stars';
import StartEndAnimation from './StartEndAnimation';
import { CONSTANT } from '../../framework/core/Constant';
import MODULE from '../../framework/core/events/module-enum';
import EVENT from '../../framework/core/events/status-enum';
import BaseSprite from '../../framework/core/BaseSprite';
import FreeTheAliensPointer from './free-the-aliens-pointer';
import FreeTheAliensLights from './free-the-aliens-lights';
import FreeTheAliensSprites from './free-the-aliens-sprites';
import ALIEN_MODULE from './free-the-aliens-module';
import EventDispatcher from '../../framework/core/events/event-dispatcher';
let FreeTheAliens = (function() {
  let _symbol = {
    name: Symbol(),
    stars: Symbol(),
    startAnimationBox: Symbol(),
    startEndAnimation: Symbol(),
    spaceShip: Symbol(),
    spaceShipGroup: Symbol(),
    time: Symbol(),
    type: Symbol(),
    bar: Symbol(),
    sprite: Symbol(),
    aliens: Symbol(),
    timeEvent: Symbol(),
    pointer: Symbol(),
    countGame: Symbol()
  };

  class FreeTheAliens extends Courseware {
    constructor(_data) {
      EventDispatcher.removeAllListener();
      BaseSprite.addEventDispatcher(new EventDispatcher());
      AssetJson.privateData = _data;
      let preload = () => {
        CurrentWorld.game = this;
        LoadAsset.loading();
      };
      super({}, preload, () => {
        this.randerPage();
      });
      this[_symbol.bar] = null;
      this[_symbol.name] = 'class FreeTheAliens';
      this[_symbol.countGame] = 0;
    }

    get startAnimationBox() {
      return this[_symbol.startAnimationBox];
    }

    get starEndAnimation() {
      return this[_symbol.startEndAnimation];
    }

    get spaceShip() {
      return this[_symbol.spaceShip];
    }

    get spaceShipGroup() {
      return this[_symbol.spaceShipGroup];
    }

    get stars() {
      return this[_symbol.stars];
    }

    get type() {
      return this[_symbol.type];
    }

    set type(_type) {
      this[_symbol.type] = _type;
      switch (_type) {
        case CONSTANT.START:
          this.starEndAnimation.start();
          this.spaceShipGroup.visible = false;
          this.startAnimationBox.visible = true;
          break;
        case CONSTANT.OVER:
          this.spaceShipGroup.visible = false;
          this.startAnimationBox.visible = true;
          this[_symbol.sprite].dispatchEventAfterAudio([AssetJson.base.sound.terrific, AssetJson.privateData.letter.sound], ALIEN_MODULE.SPACESHIP_OVER_GAME, EVENT.SOUND_COMPLETE);
          this[_symbol.sprite].addListener(ALIEN_MODULE.SPACESHIP_OVER_GAME, EVENT.SOUND_COMPLETE, this.overSoundComplete, this);
          break;
        default:
          //TODO 后期可能扩展
          break;
      }
    }

    overSoundComplete() {
      this[_symbol.sprite].removeListener(ALIEN_MODULE.SPACESHIP_OVER_GAME, EVENT.SOUND_COMPLETE, this.overSoundComplete, this);
      this[_symbol.aliens].reShow();
      this[_symbol.timeEvent] = this.time.events.add(200, this.spaceShipBack, this);
    }

    spaceShipBack() {
      this.time.events.remove(this[_symbol.timeEvent]);
      this.starEndAnimation.end();
      this[_symbol.timeEvent] = this.time.events.add(5000, this.hideMonster, this);
    }

    hideMonster() {
      this[_symbol.aliens].clear();
    }

    randerPage() {
      this.add.sprite(0, 0, AssetJson.base.image.bg);
      this[_symbol.sprite] = new BaseSprite();
      this[_symbol.startAnimationBox] = this.add.group();
      this[_symbol.startEndAnimation] = new StartEndAnimation(this.startAnimationBox, this, 'animationComplete');
      this[_symbol.aliens] = new FreeTheAliensSprites();
      this.world.addChild(this[_symbol.aliens]);
      this[_symbol.spaceShipGroup] = this.add.group();
      this.spaceShipGroup.visible = false;
      this[_symbol.spaceShip] = new SpaceShip(this.spaceShipGroup, this, 'moduleCallback');
      this.add.sprite(0, 0, AssetJson.base.image.ui);
      this.add.sprite(0.115 * this.width, 0.858 * this.height, AssetJson.base.image.timebg);
      let blackTmp = this.add.sprite(this.width / 2, 0.91 * this.height, AssetJson.base.image.black);
      blackTmp.anchor.set(0.5);
      this[_symbol.time] = new CountTime(this.add.group(), this, 'moduleCallback');
      let starsBox = this.add.group();
      this[_symbol.stars] = new Stars(starsBox, this, 'moduleCallback');
      let pointer = new FreeTheAliensPointer();
      this.world.addChild(pointer);
      this[_symbol.pointer] = pointer;
      this.type = CONSTANT.START;
      this.startAnimationBox.visible = false;
      this[_symbol.sprite].dispatchEventAfterAudio([AssetJson.base.sound.warning, AssetJson.base.sound.free], MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE);
      this[_symbol.sprite].dispatchEventAfterAudio([AssetJson.base.sound.start]);
      this[_symbol.sprite].addListener(MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE, this.firstSoundsComplete, this);
      let light = new FreeTheAliensLights();
      this.world.addChild(light);
    }

    firstSoundsComplete() {
      this[_symbol.sprite].removeListener(MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE, this.firstSoundsComplete, this);
      let sound = {};
      sound.autoPlay = true;
      sound.sound = [AssetJson.base.sound.justClick, AssetJson.privateData.letter.sound];
      this[_symbol.sprite].dispatchEventConfigToolbar(sound, false, false);
      this[_symbol.sprite].addListener(MODULE.TOOLBAR, EVENT.SOUND_COMPLETE, this.readyStart, this);
    }

    readyStart() {
      this[_symbol.sprite].removeListener(MODULE.TOOLBAR, EVENT.SOUND_COMPLETE, this.readyStart, this);
      this[_symbol.sprite].dispatchEventAfterAudio([AssetJson.base.sound.hurryBeforeTimerStop], MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE);
      this[_symbol.sprite].addListener(MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE, this.startSound, this);
      this[_symbol.time].playFlash();
    }

    startSound() {
      this[_symbol.time].stopFlash();
      this[_symbol.sprite].removeListener(MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE, this.startSound, this);
      this[_symbol.sprite].dispatchEventAfterAudio([AssetJson.base.sound.thereIsNoMuchTime], MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE);
      this[_symbol.sprite].addListener(MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE, this.startGame, this);
    }

    startGame() {
      this[_symbol.sprite].removeListener(MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE, this.startGame, this);
      this.playMultiPromise([AssetJson.base.sound.thereIsNoMuchTime, AssetJson.base.sound.justClick, AssetJson.privateData.letter.sound])
        .then(() => {
          this.spaceShip.startGame();
          this[_symbol.time].start();
          this.audio = this.playSoundLoop(AssetJson.base.sound.background);
        });
    }

    spaceShipStartComplete() {
      this.startAnimationBox.visible = false;
    }

    animationComplete(_type) {
      let sound = {};
      switch (_type) {
        case CONSTANT.START:
          this.spaceShipGroup.visible = true;
          break;
        case CONSTANT.END:
          this[_symbol.countGame]++;
          sound.autoPlay = true;
          if (this[_symbol.countGame] < 3) {
            sound.sound = [AssetJson.base.sound.reStart, AssetJson.base.sound.clickLetsGo];
            this[_symbol.sprite].dispatchEventConfigToolbar(sound, true, true);
          } else {
            sound.sound = [AssetJson.base.sound.clickLetsGo];
            this[_symbol.sprite].dispatchEventConfigToolbar(sound, false, true);
          }
          this[_symbol.sprite].addListener(MODULE.TOOLBAR, EVENT.CLICK_NEXT, this.reStartGame, this);
          break;
        default:
          break;
      }
    }

    reStartGame() {
      this[_symbol.time].reset();
      this.stars.clear();
      this.buriedPointData.qusitionList = [];
      this[_symbol.spaceShip].initCap();
      this[_symbol.pointer].init();
      this[_symbol.sprite].dispatchEventAfterAudio([AssetJson.base.sound.warning, AssetJson.base.sound.free], MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE);
      this[_symbol.sprite].dispatchEventAfterAudio([AssetJson.base.sound.start]);
      this[_symbol.sprite].addListener(MODULE.SOUND_PLAYER, EVENT.SOUND_COMPLETE, this.firstSoundsComplete, this);
      this.type = CONSTANT.START;
    }

    moduleCallback(_type) {
      switch (_type) {
        case CONSTANT.ADD_SCORE:
          this.stars.add();
          break;
        case CONSTANT.FULL_SCORE:
          this.spaceShip.stopGame();
          this[_symbol.time].stop();
          break;
        case CONSTANT.TIME_OUT:
          this.spaceShip.stopGame();
          break;
        case 'spaceShipOverComplete':
          this.type = CONSTANT.OVER;
          break;
        default:
          break;
      }
    }
  }

  return FreeTheAliens;
})();
export { FreeTheAliens };