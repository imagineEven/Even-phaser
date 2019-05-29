import Phaser from 'phaser';
import {
  Options
} from './../core/Options';
import ExitUtil from './exitUtil';
import {
  PlusExitDialog
} from './PlusExitDialog';
import { ContinueBar } from './ContinueBar';
const addPauseGroup = Symbol();
const destroyGroup = Symbol();
const privateProperty = {
  groupBg: Symbol(),
  graphicBg: Symbol(),
  groupPause: Symbol()
};

class Toolbar {
  /**创建右下角工具条
   * courseware：Courseware 题目名称
   * 
   * */
  constructor(courseware) {
    this.courseware = courseware;
  }

  /** 
   * 	soundData:{
   * 		autoPlay:bool,是否自动播放声音
   * 		sound：声音id或声音id字符串数组，需要播放的声音
   * 		callback:声音播放完调用的函数
   * 		once：只在声音播放完后调用一次的函数，执行完就会销毁掉无法再调用
   *    startCallback:声音开始播放执行的事件,
   *    startCallbackOnce:声音开始播放执行一次事件
   * 	},
   * 	@param {Function} nextData: Function, 点击下一步按钮触发事件
   * 	@param {Function} replayData: Function, 点击重玩按钮触发事件
   * 	@param {Function} exitData: Function, 点击退出按钮触发事件
   *	@param {Boolean}onlyShowPauseBtn: true 是否一开始只显示暂停按钮，声音播放完才显示所有按钮，默认true,优先级比autoMoveIn高
   *  @param {Boolean}autoMoveIn: true 是否自动移动到页面里，默认true
   *  @param {Boolean}stopCurrentAudio:true 在播放传入声音之前，结束正在播放的声音。false，传入的声音和当前正在播放的声音同时播放。
   *  @param {Boolean}invokePendingPromise:true 只有stopCurrentAudio为true，invokePendingPromise才有效。true 在播放传入声音之前，
   *                                          结束正在播放的声音并立即执行当前正在播放声音的回调函数。false  不执行当前正在播放声音的回调函数
   * */
  createToolbar({
    soundData = undefined,
    nextData = undefined,
    replayData = undefined,
    exitData = undefined,
    onlyShowPauseBtn = true,
    autoMoveIn = true,
    stopCurrentAudio = true,
    invokePendingPromise = true,
    isGroupMoveIn = true
  } = {}) {
    if (this.group)
      this.group.destroy();
    this.group = new Phaser.Group(this.courseware, undefined, 'toolbar', true,
      false, 0);
    this.bgBar = this.group.create(0, 0, 'toolbarLeftHandle');
    this.group.scale.set(0.6);
    this.wholeWidth = 18;
    this.initPause();
    if (soundData && soundData.sound) {
      this.initSound(soundData, stopCurrentAudio, invokePendingPromise);
    }
    if (replayData) {
      this.initNormal(replayData, 'toolbarIconReplay', 'replayBtn');
    }
    if (nextData) {
      this.initNormal(nextData, 'toolbarIconNext', 'nextBtn');
      this.nextBtn.events.onInputDown.add(() => {
        this.nextBtn.inputEnabled = false;
      });
    }
    if (exitData) {
      this.initNormal(exitData, 'toolbarIconExit', 'exitBtn');
      this.exitBtn.inputEnabled = true;
      this.exitBtn.events.onInputDown.add(() => {
        ExitUtil.gameOver(this.courseware);
      });
    }
    this.group.position.set(isGroupMoveIn ? Options.renderOptions.width : Options.renderOptions.width - this.wholeWidth * 0.6, Options.renderOptions.height - this.group.height);
    if (onlyShowPauseBtn) {
      if (isGroupMoveIn) {
        this.showPauseBtnOnly();
      } else {
        this.group.position.set(Options.renderOptions.width - 64,
          Options.renderOptions.height - this.group.height);
      }
    } else if (autoMoveIn) {
      this.moveIn();
    } else {
      this.moveInInstant();
    }
  }

  [destroyGroup]() {
    if (this[privateProperty.groupBg]) {
      this[privateProperty.groupBg].destroy();
      this[privateProperty.groupBg] = null;
    }
    if (this[privateProperty.groupPause]) {
      this[privateProperty.groupPause].destroy();
      this[privateProperty.groupPause] = null;
    }
  }
 
  [addPauseGroup]() {
    if(window.plus){
      new PlusExitDialog(this.courseware, () => {
        this.pauseBtn.inputEnabled = true;
      });
    }else{
      new ContinueBar(this.courseware, ()=>{
        this.pauseBtn.inputEnabled = true;
      });
    }
    return;
    this[privateProperty.groupBg] = new Phaser.Group(this.courseware, undefined, 'pauseBg', true,
      false, 0);
    let sprite = this.courseware.add.sprite(0, 0, 'toolbarBg');
    sprite.inputEnabled = true;
    this[privateProperty.groupBg].add(sprite);
    let groupFull = this.courseware.add.group();
    let graphicBig = this.courseware.add  .graphics();
    graphicBig.lineStyle(8, 0XCA2025);
    graphicBig.drawRect(0, 0, this.courseware.width, this.courseware.height);
    groupFull.add(graphicBig);

    let left = this.courseware.add.sprite(0, 0, 'pauseLeft');
    left.y = this.courseware.height - left.height - 3;
    groupFull.add(left);
    this[privateProperty.groupBg].add(groupFull);

    this[privateProperty.groupPause] = new Phaser.Group(this.courseware, undefined, 'pause', true,
      false, 0);
    let graphicPause = this.courseware.add.graphics();
    graphicPause.beginFill(0X0C2E3F, 0.8);
    graphicPause.drawRect(0, 0, this.courseware.width / 2, this.courseware.height);
    this[privateProperty.groupPause].add(graphicPause);
    let graphicLine = this.courseware.add.graphics(this.courseware.width / 2, 0);
    graphicLine.lineStyle(8, 0X0C2E3F);
    graphicLine.lineTo(0, this.courseware.height);
    this[privateProperty.groupPause].add(graphicLine);
    let right = this.courseware.add.sprite(this.courseware.width / 2 - 8 - left.width, left.y,
      'pauseRight');
    this[privateProperty.groupPause].add(right);

    let continueSprite = this.courseware.add.sprite(this.courseware.width / 9, 0, 'continueBtn');
    continueSprite.anchor.set(0, 1);
    continueSprite.y = this.courseware.height / 2 - 10 - continueSprite.height;
    continueSprite.inputEnabled = true;
    continueSprite.events.onInputDown.add(() => {
      this[destroyGroup]();
      this.pauseBtn.inputEnabled = true;
    }, this);

    let exitSprite = this.courseware.add.sprite(0, 0, 'exitBtn');
    exitSprite.anchor.set(0, 1);
    exitSprite.x = this.courseware.width / 9;
    exitSprite.y = this.courseware.height / 2 + 10 + continueSprite.height;
    exitSprite.inputEnabled = true;
    exitSprite.events.onInputDown.add(() => {
      ExitUtil.exitGame();
    });

    this[privateProperty.groupPause].add(continueSprite);
    this[privateProperty.groupPause].add(exitSprite);
    left.inputEnabled = true;
    groupFull.visible = false;
    left.events.onInputDown.add(() => {
      groupFull.visible = false;
      this[privateProperty.groupPause].visible = true;
    }, this);
    right.inputEnabled = true;
    right.events.onInputDown.add(() => {
      groupFull.visible = true;
      this[privateProperty.groupPause].visible = false;
    }, this);
  }

  resetToolbar(options) {
    this.group.destroy();
    this.createToolbar(options);
  }

  initPause() {
    this.pauseBtn = this.group.create(this.wholeWidth, 7,
      'toolbarIconPause');
    this.wholeWidth += 87;
    //TODO: 先屏蔽暂停功能。
    this.pauseBtn.inputEnabled = true;
    this.pauseBtn.events.onInputUp.add(() => {
      this.pauseBtn.loadTexture('toolbarIconPause');
    });
    this.pauseBtn.events.onInputDown.add(() => {
      this.pauseBtn.loadTexture('toolbarIconPauseFlasher');
      this[destroyGroup]();
      this[addPauseGroup]();
      this.pauseBtn.inputEnabled = false;
      //    setTimeout(() => {
      //      this.courseware.gamePause();
      //    }, 200);
    }, this);
  }

  initSound(soundData, stopCurrentAudio, invokePendingPromise) {
    this.soundBtn = this.group.create(this.wholeWidth, 7,
      'toolbarIconVoice');
    this.wholeWidth += 87;
    this.soundBtn.inputEnabled = true;
    let playCallback = () => {
      if (typeof soundData.once === 'function') {
        soundData.once();
        soundData.once = undefined;
      }
      this.moveIn();
      if (typeof soundData.callback === 'function') {
        soundData.callback();
      }
    };
    if (!soundData.sound)
      return;
    this.sounds = [].concat(soundData.sound);
    this.soundBtn.events.onInputUp.add(() => {
      this.soundBtn.loadTexture('toolbarIconVoice');
    });
    this.soundBtn.events.onInputDown.add(() => {
      this.soundBtn.loadTexture('toolbarIconVoiceFlasher');
      this.courseware.util.safeInvoke(soundData.startCallback);
      if (typeof soundData.startCallbackOnce === 'function') {
        soundData.startCallbackOnce();
        soundData.startCallbackOnce = undefined;
      }
      this.courseware.playMultiPromise(this.sounds, {
        stopCurrentAudio: stopCurrentAudio,
        invokePendingPromise: invokePendingPromise
      }).then(() => {
        playCallback();
      });
    }, this);

    this.playSounds = () => {
      this.courseware.util.safeInvoke(soundData.startCallback);
      if (typeof soundData.startCallbackOnce === 'function') {
        soundData.startCallbackOnce();
        soundData.startCallbackOnce = undefined;
      }
      this.courseware.playMultiPromise(this.sounds).then(() => {
        playCallback();
      });
    };

    if (soundData.autoPlay) {
      this.playSounds();
    }
  }

  sendSocket() {

  }

  initNormal(func, icon, btnName) {
    this[btnName] = this.group.create(this.wholeWidth, 7, icon);
    this.wholeWidth += 87;
    this[btnName].inputEnabled = true;
    this[btnName].events.onInputDown.add(() => {
      this[btnName].loadTexture(icon + 'Flasher');
      this.courseware.util.safeInvoke(func);
    }, this);
    this[btnName].events.onInputUp.add(() => {
      this[btnName].loadTexture(icon);
    }, this);
  }

  destroy() {
    if (this.group)
      this.group.destroy();
  }

  moveIn(callback) {
    this.move(Options.renderOptions.width - this.wholeWidth * 0.6, callback);
  }

  moveInInstant() {
    this.group.position.x = Options.renderOptions.width - this.wholeWidth * 0.6;
  }

  moveOut(callback) {
    this.move(Options.renderOptions.width, callback);
  }

  moveOutInstant() {
    this.group.position.x = Options.renderOptions.width;
  }

  showPauseBtnOnly(callback) {
    this.move(Options.renderOptions.width - 64, callback);
  }

  showPauseBtnOnlyInstant() {
    this.group.position.x = Options.renderOptions.width - 64;
  }

  move(x, callback) {
    this.courseware.add.tween(this.group.position).to({
      x
    }, 800, Phaser.Easing.Bounce.Out, true).onComplete.add(() => {
      this.courseware.util.safeInvoke(callback);
    });
  }
}
export {
  Toolbar
};