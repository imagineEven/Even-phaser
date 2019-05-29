import Phaser from 'phaser';
class LastPageState extends Phaser.State {
  constructor(data, staticRes) {
    super();
    this.data = data;
    this.staticRes = staticRes;
  }

  create() {
    let toolBar = this.game.createToolbar({
      soundData: {
      },
      onlyShowPauseBtn: false,
      autoMoveIn: false
    });

    toolBar.showPauseBtnOnlyInstant();
    let nowPlay = undefined;
    if (this.game.redScore === this.game.blueScore) {
      nowPlay = this.staticRes.timeout;
      this.game.createSpriteForObj(this.staticRes.youTie);
    } else if (this.game.redScore > this.game.blueScore) {
      nowPlay = this.staticRes.redTeamWon;
      this.game.createSpriteForObj(this.staticRes.lastBg);
    } else {
      nowPlay = this.staticRes.blueTeamWon;
      this.game.createSpriteForObj(this.staticRes.youLose);
    }


    if (this.game.redScore < this.game.blueScore) {
      this.game.playMultiPromiseObject([nowPlay, this.staticRes.crowdCheering]).then(() => {
        this.game.toolBarShowExitGame();
      });
    }
    else {
      this.game.playMultiPromiseObject([nowPlay, this.staticRes.applause]).then(() => {
        this.game.toolBarShowExitGame();
      });
    }
  }

  update() {
    this.game.logicLoop.update();
  }
}

export {
  LastPageState
};