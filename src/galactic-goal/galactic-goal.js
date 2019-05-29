import { Courseware } from './../../framework/core/Courseware';
import StaticRes from './static-resource.json';
import { FirstPageState } from './firstpagestate.js';
import { QuestionPageState } from './questionpagestate.js';
import { LastPageState } from './lastpagestate.js';
import { GamePageState } from './gamepagestate.js';
import { Device } from './../../framework/device/Device';
import { TextureFlasher } from './../../framework/plugins/TextureFlasher';

class GalacticGoal extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = StaticRes;
      this.loadPageResources(this.data, StaticRes);
      let videos = [];
      this.data.pages.forEach(page => {
        videos.push(page.vedio);
      });
      this.loadAudioArr([...[this.staticRes.startVideo.video], ...videos]);
      this.loadVideoArr([...[this.staticRes.startVideo.video], ...videos], '', !window.plus);
    };

    super({}, preload, () => {
      this.createUI();
    });
  }

  createUI() {
    this.indicatorBntData = [];
    let device = new Device();
    this.isMobile = (device.checkPlatform().toString() !== device.deviceType.win.toString());
    this.defaultTime = 20; //默认游戏时间
    this.state.add('firstState', new FirstPageState(this.data, this.staticRes), true);

    this.state.add('questionState', new QuestionPageState(this.data, this.staticRes), false);

    this.state.add('gameState', new GamePageState(this.data, this.staticRes), false);

    this.state.add('lastPage', new LastPageState(this.data, this.staticRes), false);
    this.state.start('firstState');
  }

  stopToolbarWarning() {
    if (this.toolbarWarning) {
      this.toolbarWarning.stop();
    }
  }

  //退出游戏
  toolBarShowExitGame(sound = this.staticRes.clickLetsGo.sound) {
    this.stopToolbarWarning();
    let toolBar = this.createToolbarWithWarning({
      soundData: {
        sound: sound,
        autoPlay: true,
        startCallback: () => {
          if (this.exitFlash) {
            this.exitFlash.start();
          }
        },
        callback: () => {
          if (this.exitFlash) {
            this.exitFlash.stop();
          }
        }
      },
      autoMoveIn: true,
      stopCurrentAudio: true,
      exitData: () => {
        //TODO:待退出方法完善
      }
    }, 15, 2);
    let letsGo = toolBar.group.getChildAt(3);
    let defaultKey = letsGo.key;
    this.exitFlash = new TextureFlasher(this, letsGo, [defaultKey, 'toolbarIconExitFlasher'], { duration: 300, times: 0 });
    this.exitFlash.start();
    toolBar.showPauseBtnOnlyInstant();
    toolBar.moveIn();
  }

  createSpriteForObj(Obj, imageIndex = -1) {
    let imageKey = imageIndex !== -1 ? Obj.images[imageIndex] : Obj.image;
    return this.createSprite(Obj.x, Obj.y, imageKey);
  }

  getGameTimeText() {
    let minute = Math.floor(this.defaultTime / 60) + '';
    let secend = this.defaultTime % 60 + '';
    return minute.padStart(2, '0') + ':' + secend.padStart(2, '0');
  }

}

export {
  GalacticGoal
};