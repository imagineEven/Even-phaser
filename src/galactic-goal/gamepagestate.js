import Phaser from 'phaser';
import { Player } from './Player';
import { KEYBORADSTATE, GAMEPOSITION, PLAYERSTATE } from './constinfo';
import { IndicatorBnt } from '../../framework/plugins/IndicatorBnt';
import _ from 'lodash';
class GamePageState extends Phaser.State {
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
    let bg = this.game.createSprite(0, 0, this.staticRes.quesitionBg);
    bg.scale.set(-1, 1);
    this.game.createSprite(0, 0, this.staticRes.quesitionBg2);
    this.timeBg = this.game.createSpriteForObj(this.staticRes.timeBg);
    this.timeBg.visible = true;
    this.timeColorArr = ['#02E342', '#ffffff'];
    this.timeBg.setDefault = () => {

      this.time.setText(this.game.getGameTimeText());
      this.timeBg.loadTexture(this.staticRes.timeBg.image);
      this.time.fill = this.timeColorArr[0];
    };
    this.timeBg.anchor.set(0.5);
    this.time = this.game.add.text(0, 0, '00:00', { fill: this.timeColorArr[0], fontSize: 24 });
    this.time.anchor.set(0.5);
    this.timeBg.addChild(this.time);
    this.timeBg.setDefault();
    this.bgSound = this.game.playSoundLoop(this.staticRes.danceMusic.sound);
    this.bgSound.play();

    this.redScoreBg = this.game.createSpriteForObj(this.staticRes.redScoreBg);
    this.redScoreText = this.game.add.text(80, 17, '0', { fill: '#ffffff', fontSize: 20 });
    this.redScoreText.anchor.set(1, 0.5);
    this.redScore = 0;
    this.redScoreBg.addChild(this.redScoreText);
    this.blueScoreBg = this.game.createSpriteForObj(this.staticRes.blueScoreBg);
    this.blueScoreText = this.game.add.text(12, 17, '0', { fill: '#ffffff', fontSize: 20 });
    this.blueScoreText.anchor.set(0, 0.5);
    this.blueScore = 0;
    this.blueScoreBg.addChild(this.blueScoreText);

    this.offsetY = 165;
    this.redballTargets = this.createBallIn(740, 180, this.staticRes.redbalkInBg, true);
    this.blueballTargets = this.createBallIn(60, 180, this.staticRes.bluebalkInBg, false);
    this.ball = this.game.createSprite(213, 175, this.staticRes.ball);
    this.ball.y += GAMEPOSITION.CENTER * this.offsetY;
    this.ball.startXy = { x: 213, y: 175 };
    this.ball.anchor.set(0.5);
    this.redHitFlag = true;
    this.ball.visible = false;
    this.redPeople = new Player(this.game, 100, 136, this.staticRes.redPeople, this.offsetY, () => {
      this.redPeople.sendPos = this.redPeople.playerPosition;
      this.ballLaunch(this.redPeople.playerPosition, 700, this.redPeople);
    }, () => {
      this.ball.y = this.ball.startXy.y + this.redPeople.playerPosition * this.offsetY;
    }, () => {
      this.redPeople.sendPos = _.take(_.shuffle([0, 1, 2]), 1)[0];
      this.ballLaunch(this.redPeople.sendPos, 700, this.redPeople);
    }, GAMEPOSITION.CENTER);
    this.redPeople.ballTargets = this.redballTargets;

    this.bluePeople = new Player(this.game, 560, 100, this.staticRes.bluePeople, this.offsetY, () => {
      this.ballLaunch(this.redPeople.playerPosition, 100, this.bluePeople);
    }, () => {
      this.ball.y = this.ball.startXy.y + this.bluePeople.playerPosition * this.offsetY;
    }, () => {
      this.ballLaunch(_.take(_.shuffle([0, 1, 2]), 1)[0], 100, this.bluePeople);
    }, GAMEPOSITION.DOWN);
    this.bluePeople.ballTargets = this.blueballTargets;

    this.bindInBallHandler();

    this.game.playMultiPromiseObject([this.staticRes.youReady, this.staticRes.dudu]).then(() => {
      this.countDown();
      this.npcRandomMove();
      this.redPeople.changePlaerState(PLAYERSTATE.STARTBALL);
      this.bindKeyBoard();
      this.keyboradState = KEYBORADSTATE.GAME;
    });
    this.indicatorBnt = new IndicatorBnt(this.game, this.data.pages.length * 2, { distance: 30, height: 560, width: 400 });
    this.game.indicatorBntData.forEach((item, index) => {
      this.indicatorBnt.setBtnColor(index, item);
    });
    setTimeout(() => {
      if (!this.gameIsStart) {
        this.gameIsStart = true;
        this.isNotSpace = true;
        this.redPeople.changePlaerState(PLAYERSTATE.ENDBALL);
      }
    }, 10000);
  }

  bindInBallHandler() {
    //进球逻辑
    this.redPeople.inBallHandler = (position) => {
      this.blueHitFlag = true;
      this.redHitFlag = false;
      this.ballCheckFlag = false;
      this.ball.visible = false;
      this.game.playSoundPromiseByObject(this.staticRes.didi).then(() => {
        if (!this.isGameOver) {
          this.redScore++;
          this.redScoreText.setText(this.redScore);
          return this.bluePeople.changePlaerState(PLAYERSTATE.STARTBALL);
        }
      }).then(() => {
        if (!this.isGameOver) {
          this.redPeople.ballTargets[position].loadTexture(this.staticRes.redbalkInBg.image);
          this.ball.x = 560;
          this.ball.y = this.ball.startXy.y + this.offsetY * this.bluePeople.playerPosition;
          this.ballCheckFlag = false;
          return this.game.playSoundPromiseByObject(this.staticRes.applause);
        }
      }).then(() => {
        if (!this.isGameOver) {
          return this.bluePeople.changePlaerState(PLAYERSTATE.ENDBALL);
        }
      });
    };

    this.bluePeople.inBallHandler = (position) => {
      this.blueHitFlag = false;
      this.redHitFlag = true;
      this.ballCheckFlag = false;
      this.ball.visible = false;
      this.game.playSoundPromiseByObject(this.staticRes.didi).then(() => {
        if (!this.isGameOver) {
          this.blueScore++;
          this.blueScoreText.setText(this.blueScore);
          this.isNotSpace = false;
          return this.redPeople.changePlaerState(PLAYERSTATE.STARTBALL);
        }
      }).then(() => {
        if (!this.isGameOver) {
          this.bluePeople.ballTargets[position].loadTexture(this.staticRes.bluebalkInBg.image);
          this.ball.x = this.ball.startXy.x;
          this.ball.y = this.ball.startXy.y + this.offsetY * this.redPeople.playerPosition;
          this.ballCheckFlag = false;
          return this.game.playSoundPromiseByObject(this.staticRes.crowdCheering);
        }
      });
    };
  }

  //倒计时
  countDown() {
    this.game.util.waitByPromise(1000).then(() => {
      this.game.defaultTime--;

      this.time.setText(this.game.getGameTimeText());
      if (this.game.defaultTime === 0) {
        this.gameOver();
      } else {
        this.countDown();
      }
    });
  }

  gameOver() {
    if (this.nowBallTween) {
      this.nowBallTween.stop();
    }
    this.redballTargets.forEach((item) => {
      item.loadTexture(this.staticRes.redbalkInBg.image);
    });
    this.blueballTargets.forEach((item) => {
      item.loadTexture(this.staticRes.bluebalkInBg.image);
    });
    //游戏结束
    this.keyboradState = KEYBORADSTATE.STOP;
    this.redPeople.changePlaerState(PLAYERSTATE.DEFAULT);
    this.bluePeople.changePlaerState(PLAYERSTATE.DEFAULT);
    this.isGameOver = true;
    this.redPeople.isGameOver = true;
    this.bluePeople.isGameOver = true;
    this.ballCheckFlag = false;
    this.ball.visible = true;
    let ballgo = this.game.add.tween(this.ball);
    ballgo.to({ x: 400, y: -100 }, 2000);
    ballgo.start();
    ballgo.onComplete.add(() => {
      this.bgSound.stop();
      this.game.stopToolbarWarning();
      this.game.redScore = this.redScore;
      this.game.blueScore = this.blueScore;
      this.game.state.start('lastPage');
    });
    this.game.playSoundPromiseByObject(this.staticRes.du);
  }

  ballLaunch(position, ballx, player) {
    if (this.nowBallTween) {
      this.nowBallTween.stop();
    }
    let sound = this.ballCheckFlag ? this.staticRes.tong.sound : this.staticRes.fu.sound;
    this.ballLanchSound = this.game.playSoundLoop(sound, 1, false);
    this.ball.visible = true;
    let tween = this.game.add.tween(this.ball);
    tween.to({
      x: ballx,
      y: this.ball.startXy.y + this.offsetY * position
    }, 700, Phaser.Easing.Linear.None);
    tween.start();
    this.nowBallTween = tween;
    this.ballCheckFlag = true;
    tween.onComplete.add(() => {
      this.ball.y = this.staticRes.ball.y + this.offsetY * this.playerPosition;
      this.ballInCallBack(position, player);
    });
  }

  npcRandomMove() {
    if (this.isGameOver) {
      return;
    }
    this.game.util.waitByPromise(300).then(() => {
      if (this.bluePeople.playerState === PLAYERSTATE.DEFAULT) {
        let index = Math.floor(Math.random() * 3);
        if (this.redPeople.sendPos) {
          index = this.redPeople.sendPos;
        }
        this.bluePeople.playerPosition = index;
        this.bluePeople.move();
      }
      this.npcRandomMove();
    });
  }

  ballInCallBack(position, player) {
    let nowTarget = player.ballTargets[position];
    nowTarget.loadTexture(nowTarget.hoverImage.image);
    player.inBallHandler(position);
  }

  bindKeyBoard() {
    if (!this.game.isMobile) {
      this.game.input.keyboard.onDownCallback = ((event) => {
        this.keyboardDownHandler(event);
      });
    }
  }

  keyboardDownHandler(event) {
    if (this.keyboradState === KEYBORADSTATE.GAME) {
      if (event.keyCode === Phaser.Keyboard.SPACEBAR &&
                !this.ballCheckFlag && this.redHitFlag && !this.isNotSpace) {
        this.gameIsStart = true;
        this.isNotSpace = true;
        this.redPeople.changePlaerState(PLAYERSTATE.ENDBALL);
      } else {
        this.keyboradState = KEYBORADSTATE.STOP;
        switch (event.keyCode) {
          case Phaser.Keyboard.UP:
            this.redPeople.playerPosition--;
            break;
          case Phaser.Keyboard.DOWN:
            this.redPeople.playerPosition++;
            break;
        }
        if (this.redPeople.playerPosition < 0) {
          this.redPeople.playerPosition = 0;
        }
        if (this.redPeople.playerPosition > 2) {
          this.redPeople.playerPosition = 2;
        }
        this.redPeople.move().then(() => {
          if (!this.isGameOver) {
            this.keyboradState = KEYBORADSTATE.GAME;
          }
        });
      }
    }
  }

  createBallIn(x, y, loadTexture, isRed) {
    let startXy = { x: x, y: y };
    let ballTargets = [];
    [0, 1, 2].forEach((item) => {
      let ballTarget = this.game.createSprite(startXy.x, startXy.y + item * this.offsetY, loadTexture);
      ballTarget.anchor.set(0.5);
      ballTarget.isRed = isRed;
      ballTarget.hoverImage = this.staticRes.balkInBg;
      ballTarget.index = item;
      if (this.game.isMobile) {
        ballTarget.inputEnabled = true;
        ballTarget.events.onInputDown.add((event) => {
          if (this.gameover || this.keyboradState !== KEYBORADSTATE.GAME) {
            return;
          }
          this.redPeople.playerPosition = event.index;
          if (isRed) {
            this.redPeople.move().then(() => {
              this.keyboardDownHandler({ keyCode: Phaser.Keyboard.SPACEBAR });
            });
          } else {
            this.redPeople.move();
          }
        });
      }
      ballTargets.push(ballTarget);
    });
    return ballTargets;
  }


  update() {
    this.game.logicLoop.update();
    if (this.ballCheckFlag && !this.isGameOver) {
      let ball = this.ball.getBounds();
      if (!this.blueHitFlag) {
        let blue = this.bluePeople.player.getBounds();
        let resBlue = Phaser.Rectangle.intersects(ball, blue);
        if (resBlue) {
          this.blueHitFlag = true;
          this.redHitFlag = false;
          this.nowBallTween.stop();
          this.bluePeople.changePlaerState(PLAYERSTATE.HIT);
        }
      }

      if (!this.redHitFlag) {
        let red = this.redPeople.player.getBounds();
        let resRed = Phaser.Rectangle.intersects(ball, red);
        if (resRed) {
          this.blueHitFlag = false;
          this.redHitFlag = true;
          this.nowBallTween.stop();
          this.redPeople.changePlaerState(PLAYERSTATE.HIT);
        }
      }
    }

  }
}

export {
  GamePageState
};