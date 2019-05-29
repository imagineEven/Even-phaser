import { PLAYERSTATE } from './constinfo';
import { SilPlayer } from './../../framework/plugins/SilPlayer';
import Phaser from 'phaser';
class Player {
  constructor(game, x, y, silArr, offsetY, ballLaunchCallBack, moveCallBack, hitCallBack, playerPosition = 0) {
    this.game = game;
    this.offsetY = offsetY;
    this.playerPosition = playerPosition;
    this.ballLaunchCallBack = ballLaunchCallBack;
    this.moveCallBack = moveCallBack;
    this.hitCallBack = hitCallBack;
    this.StartXy = { x: x, y: y };
    this.silArr = silArr;
    this.player = this.getPlayerSil(silArr[0].json, () => {
      this.playerStartBallState.drawFrameById(0);
    }, true, true);
    this.playerState = PLAYERSTATE.DEFAULT;
    this.playerStartBallState = this.getPlayerSil(silArr[1].json, () => {
      this.playerStartBallState.drawFrameById(0);
    }, false, true);

    this.playerStartBallState.visible = false;

    this.playerEndBallState = this.getPlayerSil(silArr[2].json, () => {

      if (this.playerState === PLAYERSTATE.ENDBALL) {
        if (this.ballLaunchCallBack) {
          this.ballLaunchCallBack();
        }
        this.changePlaerState(PLAYERSTATE.BALLGO);
        this.playerEndBallState.drawFrameById(0);
      }
    });

    this.playerEndBallState.visible = false;
    this.playerBallGoState = this.getPlayerSil(silArr[3].json, () => {
      if (this.playerState === PLAYERSTATE.BALLGO) {
        this.changePlaerState(PLAYERSTATE.DEFAULT);

        this.playerBallGoState.drawFrameById(0);
      }
    });
    this.playerBallGoState.visible = false;
    this.playerHitState = this.getPlayerSil(silArr[4].json, () => {
      if (this.playerState === PLAYERSTATE.HIT) {
        this.changePlaerState(PLAYERSTATE.BALLGO);
        this.playerHitState.drawFrameById(0);
      }
    });
    this.playerHitState.visible = false;

    this.playerArr = [this.player, this.playerStartBallState, this.playerEndBallState, this.playerBallGoState, this.playerHitState];
  }

  move() {
    let pro = new Promise((resolve) => {
      let currentY = this.playerPosition * this.offsetY + this.StartXy.y;
      if (this.player.y === currentY) {
        resolve();
      }
      else {
        if (this.moveCallBack && this.playerState === PLAYERSTATE.STARTBALL) {
          this.moveCallBack();
        }
        let time = 300 * (Math.abs(currentY - this.player.y) / this.offsetY);
        let tween = this.game.add.tween(this.player);
        tween.to({ y: currentY }, time, Phaser.Easing.Linear.None);
        tween.onComplete.add(() => {
          resolve();
        });
        tween.start();
      }
    });
    return pro;
  }

  changePlaerState(playerState) {
    let pro = Promise.resolve();
    pro.then(() => {
      if (this.isGameOver) {
        this.playerState = PLAYERSTATE.DEFAULT;
      }
      this.playerState = playerState;
      if (playerState === PLAYERSTATE.STARTBALL || playerState === PLAYERSTATE.DEFAULT) {
        this.playerArr[playerState].y = this.player.y;
        this.player = this.playerArr[playerState];
      }
      else if (playerState === PLAYERSTATE.HIT) {
        if (this.hitCallBack) {
          this.hitCallBack();
        }
      }
      this.playerArr.forEach((item, index) => {
        if (index === playerState) {
          item.y = this.player.y;
          item.visible = true;
          item.start();
        }
        else {
          item.visible = false;
        }
      });
      return this.move();
    });
    return pro;
  }

  getPlayerSil(json, onStop, autoPlay = false, isLoop = false) {
    return new SilPlayer(this.game, json, {
      x: this.StartXy.x,
      y: this.StartXy.y + this.playerPosition * this.offsetY,
      playSpeed: 3,
      autoPlay: autoPlay,
      isLoop: isLoop,
      onStop: () => {
        onStop();
      }
    });
  }
}

export {
  Player
};