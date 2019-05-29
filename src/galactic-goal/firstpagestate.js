import Phaser from 'phaser';
import { PlusVideoPlayer } from './../../framework/plugins/PlusVideoPlayer.js';
class FirstPageState extends Phaser.State {
  constructor(data, staticRes) {
    super();
    this.data = data;
    this.staticRes = staticRes;
  }

  create() {
    let toolBar = this.game.createToolbar({
      soundData: {},
      onlyShowPauseBtn: false,
      autoMoveIn: false
    });
    toolBar.showPauseBtnOnlyInstant();
    let video = new PlusVideoPlayer(this.game, 0, 0, this.staticRes.startVideo.video);
    video.isIos = this.game.isIos;
    video.events.onStop.add(() => {
      video.destroy();
      this.game.state.start('questionState');
    });
  }

  update() {
    this.game.logicLoop.update();
  }
}

export {
  FirstPageState
};