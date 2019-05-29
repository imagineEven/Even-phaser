import Phaser from 'phaser';
import { ObjectPropertyFlasher } from './../../framework/plugins/ObjectPropertyFlasher';
import {} from './../../framework/core/filters/Gray.js';
import { IndicatorBnt } from '../../framework/plugins/IndicatorBnt';
import { TextureFlasher } from './../../framework/plugins/TextureFlasher';
import { KeyboradInputHelp } from './../../framework/plugins/keyboradInputhelp';
import { KEYBORADSTATE, GAMEPOSITION, PLAYERSTATE } from './constinfo';
import { Player } from './Player';
import _ from 'lodash';
import { CONSTANT } from '../../framework/core/Constant.js';
import { PlusVideoPlayer } from './../../framework/plugins/PlusVideoPlayer.js';

const COLORSTATE = IndicatorBnt.getColorState;
const COLORDATA = ['#ffff00', '#000000', '#D6D3D6', '	#FFA500'];

class QuestionPageState extends Phaser.State {
  constructor(data, staticRes) {
    super();
    this.data = data;
    this.staticRes = staticRes;
  }

  create() {
    this.fontFamily = CONSTANT.DEFAULT_FONT;
    this.gray = this.game.add.filter('Gray');
    this.offsetY = 155;
    this.keyboradState = KEYBORADSTATE.STOP;
    this.toolBar = this.game.createToolbar({
      soundData: {},
      onlyShowPauseBtn: false,
      autoMoveIn: false
    });
    this.toolBar.showPauseBtnOnlyInstant();
    this.game.createSprite(0, 0, this.staticRes.quesitionBg);
    this.game.createSprite(0, 0, this.staticRes.quesitionBg2);
    this.KeyboradInput = new KeyboradInputHelp(this.game, (event) => {
      this.keyboardDownHandler(event);
    });
    this.KeyboradInput.createKeyBords(this.staticRes.keyboradBg.x, this.staticRes.keyboradBg.y);

    this.pageIndex = 0;
    this.nowPageData = this.data.pages[this.pageIndex];


    this.redPeople = new Player(this.game, 50, 138, this.staticRes.redPeople, this.offsetY, () => {
      this.ballLaunch(this.redPeople.playerPosition, 700, this.redPeople);
    }, () => {
      this.ball.y = this.ball.startXy.y + this.redPeople.playerPosition * this.offsetY;
    }, () => {
      this.ballLaunch(_.take(_.shuffle([0, 1, 2]), 1)[0], 700, this.redPeople);
    }, GAMEPOSITION.CENTER);

    this.ball = this.game.createSpriteForObj(this.staticRes.ball);
    this.ball.y += this.offsetY;
    this.ball.startXy = this.staticRes.ball;
    this.ball.anchor.set(0.5);
    this.ball.visible = false;
    this.bgSound = this.game.playSoundLoop(this.staticRes.danceMusic.sound);
    this.bgSound.play();
    this.bindKeyBoard();
    this.questionWordBg = this.game.createSpriteForObj(this.staticRes.questionWordBg);
    this.questionWordBg.visible = false;
    this.questionWordBg.setDefault = (isShowWord = false) => {
      if (isShowWord) {
        this.questionWordBg.sentence.text = this.nowPageData.sentence.replace('{{word}}', this.nowPageData.answers[0]);
      } else {
        this.questionWordBg.sentence.text = this.nowPageData.sentence.replace('{{word}}', '_____');
      }
      this.questionWordBg.sentence.clearFontValues();
      this.questionWordBg.sentence.addFontWeight('normal', 0);
      this.questionWordBg.loadTexture(this.staticRes.questionWordBg.image);
    };
    this.questionWordBg.setHover = (isShowWord = true) => {
      if (isShowWord) {
        this.questionWordBg.sentence.text = this.nowPageData.sentence.replace('{{word}}', this.nowPageData.answers[0]);
      } else {
        this.questionWordBg.sentence.text = this.nowPageData.sentence.replace('{{word}}', '_____');
      }
      let wordIndex = this.nowPageData.sentence.indexOf('{{word}}');
      this.questionWordBg.sentence.clearFontValues();
      if (isShowWord) {
        this.questionWordBg.sentence.addFontWeight('bold', wordIndex);
        this.questionWordBg.sentence.addFontWeight('normal', wordIndex + this.nowPageData.answers[0].length);
      }
      this.questionWordBg.loadTexture(this.staticRes.questionWordHoverBg.image);
    };

    this.questionWordBg.anchor.set(0.5);
    this.questionWordBg.sentence = this.game.add.text(0, 0, '', { fontWeight: 'normal', fontSize: 18, align: 'center', font: this.fontFamily });
    this.questionWordBg.sentence.anchor.set(0.5);

    this.questionWordBg.addChild(this.questionWordBg.sentence);
    this.timeBg = this.game.createSpriteForObj(this.staticRes.timeBg);
    this.timeBg.visible = false;
    this.timeColorArr = ['#02E342', '#ffffff'];
    this.timeBg.setDefault = () => {

      this.time.setText(this.game.getGameTimeText());
      this.timeBg.loadTexture(this.staticRes.timeBg.image);
      this.time.fill = this.timeColorArr[0];
    };
    this.timeBg.setHover = () => {

      this.time.setText(this.game.getGameTimeText());
      this.timeBg.loadTexture(this.staticRes.timeBgHover.image);
      this.time.fill = this.timeColorArr[1];
    };
    this.timeBg.anchor.set(0.5);
    this.time = this.game.add.text(0, 0, '00:00', { fill: this.timeColorArr[0], fontSize: 24, fontWeight: 'bold', font: this.fontFamily });

    this.time.anchor.set(0.5);
    this.timeBg.addChild(this.time);
    this.timeBg.setHover();




    if (this.data.isNeedDemo && !this.game.isMobile) {
      this.goDemoState();
    } else {
      this.goNextQuestionState(true);
    }

  }



  //进入demo状态
  goDemoState() {
    this.isDemo = true;
    this.KeyboradInput.keyBorad.scale.set(0.31);
    this.KeyboradInput.keyBorad.alpha = 0.6;
    this.KeyboradInput.inputEnabled = false;
    this.KeyboradInput.keyBorad.visible = true;
    this.createBallTarget();
    this.game.playSoundPromiseByObject(this.staticRes.firstLetsLearnHow).then(() => {
      this.KeyboradInput.up.hoverBg.flash.start();
      return this.game.playSoundPromiseByObject(this.staticRes.pressUpArrow).then(() => {
        this.keyboradState = KEYBORADSTATE.DEMOUP;
      });
    });
  }

  //进入答题状态
  goNextQuestionState(isAfterDemo = false) {
    this.errCount = 0;
    this.isDemo = false;
    this.questionWordBg.visible = true;
    this.timeBg.visible = true;
    if (!this.indicatorBnt) {
      this.indicatorBnt = new IndicatorBnt(this.game, this.data.pages.length * 2, { distance: 30, height: 560, width: 400 });
    }
    if (!isAfterDemo) {
      this.pageIndex++;
    }
    if (this.pageIndex / 2 >= this.data.pages.length) {
      this.bgSound.stop();
      this.game.stopToolbarWarning();
      this.game.indicatorBntData = [];
      for (let i = 0; i <= this.data.pages.length * 2 - 1; i++) {
        this.game.indicatorBntData.push(this.indicatorBnt.getColor(i));
      }
      this.game.state.start('gameState');
      return;
    }
    if (this.pageIndex % 2 === 0) {
      let AduioArr = [this.staticRes.pressTheSpaceBarToShoot.sound, this.staticRes.hitTheGoalWithTheWord.sound];


      this.game.playSoundPromiseByObject(this.staticRes.addMoreTime)
        .then(() => {
          this.timeBg.setDefault();
          if (this.pageIndex === 0) {
            return this.game.playMultiPromiseObject(AduioArr);
          }
        }).then(() => {
          this.questionWordBg.setHover(false);
          return this.game.playSoundPromiseByObject(this.nowPageData.sentenceSound.sounds[0]);
        }).then(() => {
          this.questionWordBg.setDefault();
        });
      this.game.stopToolbarWarning();
      this.toolBar = this.game.createToolbarWithWarningCallback({
        soundData: {
          sound: AduioArr,
          autoPlay: false,
          callback: () => {

          }
        },
        invokePendingPromise: false,
        onlyShowPauseBtn: false,
        autoMoveIn: true
      }, 15, 3, () => {});

      this.toolBar.moveInInstant();
      this.KeyboradInput.keyBorad.visible = false;
      this.nowPageData = this.data.pages[this.pageIndex / 2];
      this.game.util.batchDestroy(this.keyBoradTextArr, this.wordTextArr);
      this.keyboradState = KEYBORADSTATE.GAME;
      this.questionWordBg.setDefault();
      this.createBallTarget();
      this.redPeople.changePlaerState(PLAYERSTATE.STARTBALL);
      this.questionWordBg.sentence.visible = true;

    } else {
      if (this.game.isMobile) {
        this.KeyboradInput.keyBorad.alpha = true;
        this.KeyboradInput.keyBorad.visible = true;
        this.KeyboradInput.keyBorad.scale.set(1);
        this.KeyboradInput.keyBorad.x = 6;
        this.KeyboradInput.keyBorad.y = 204;
        this.KeyboradInput.hideDirection();
        this.KeyboradInput.inputEnabled = true;
      }
      this.questionWordBg.sentence.visible = false;
      this.keyboradState = KEYBORADSTATE.INPUTWORD;
      this.nowKeyBoardIndex = 0;
      this.bugsErrCount = 0;
      this.game.util.batchDestroy(this.ballTargets);
      this.redPeople.player.visible = false;
      this.timeBg.setDefault();
      this.game.stopToolbarWarning();
      this.addKeyBoradText();


      this.keyBoradTextArr[0].flash.start();
      this.game.stopToolbarWarning();
      this.toolBar = this.game.createToolbarWithWarning({
        soundData: {
          sound: [this.staticRes.spealThelWord.sound, this.nowPageData.wordSound.sound],
          autoPlay: true,
          callback: () => {}
        },
        onlyShowPauseBtn: false,
        autoMoveIn: true
      }, 15, 3);
    }

    if (this.pageIndex === 0) {
      this.timeBg.setHover();
    } else {
      if (this.pageIndex % 2 === 0) {
        this.game.playSoundPromiseByObject(this.nowPageData.sentenceSound.sounds[0]);
      } else {
        this.game.playMultiPromiseObject([this.staticRes.spealThelWord.sound, this.nowPageData.wordSound.sound]);
      }
      this.timeBg.setDefault();
    }

  }

  //进球逻辑
  ballInCallBack() {
    let nowTarget = this.ballTargets[this.redPeople.playerPosition];
    this.toolBar.showPauseBtnOnlyInstant();
    if (this.isDemo) {
      nowTarget.loadTexture(nowTarget.hoverImage);
      this.game.playSoundPromiseByObject(this.staticRes.greatJob).then(() => {
        this.KeyboradInput.keyBorad.visible = false;
        this.goNextQuestionState(true);
      });
    } else {
      this.timeBg.setDefault();
      this.questionWordBg.setDefault();
      let nowTarget = this.ballTargets[this.redPeople.playerPosition];
      if (nowTarget.text !== this.nowPageData.answers[0]) {
        this.errCount++;
        this.indicatorBnt.setBtnColor(this.pageIndex, COLORSTATE.Red);
        nowTarget.addGray();
        let AduioArr = [this.staticRes.mu, this.staticRes.crowdCheering];
        this.timeBg.setDefault();
        this.questionWordBg.setDefault();
        let pro = this.game.playMultiPromiseObject(AduioArr, { invokePendingPromise: false });
        if (this.errCount === 1) {
          pro = pro.then(() => {
            return this.game.playSoundPromiseByObject(this.staticRes.looksYouNeed);
          }).then(() => {
            this.bgSound.stop();
            this.game.stopToolbarWarning();
            this.toolBar = this.game.createToolbarWithWarningCallback({
              soundData: {
                sound: [this.staticRes.hitTheGoalWithTheWord.sound],
                autoPlay: false,
                callback: () => {

                }
              },
              invokePendingPromise: false,
              onlyShowPauseBtn: false,
              autoMoveIn: true
            }, 15, 3, () => {});
            let vedioPro = new Promise((resolve) => {
              let video = new PlusVideoPlayer(this.game, 0, 0, this.nowPageData.vedio);
              video.play();
              video.events.onStop.add(() => {
                video.destroy();
                this.bgSound.play();
                resolve();
              });
            });
            return vedioPro;
          });

        } else if (this.errCount === 2) {
          pro = pro.then(() => {
            this.trueBallTarget.flash.start();
            return this.game.playMultiPromiseObject([this.nowPageData.wordSound, this.staticRes.isCreateEnter]);
          }).then(() => {
            this.trueBallTarget.flash.stop();
          });
        }
        pro.then(() => {
          this.redPeople.changePlaerState(PLAYERSTATE.STARTBALL);
          this.keyboradState = KEYBORADSTATE.GAME;
          this.toolBar.moveIn();
        });
      } else {
        nowTarget.loadTexture(nowTarget.hoverImage);
        if (this.errCount === 1) {
          this.indicatorBnt.setBtnColor(this.pageIndex, COLORSTATE.Yellow);
        } else if (this.errCount === 0) {
          this.indicatorBnt.setBtnColor(this.pageIndex, COLORSTATE.Green);
        }
        let AduioArr = [this.staticRes.applause];
        let pro = this.game.playSoundPromiseByObject(this.staticRes.whoosh, { invokePendingPromise: false })
          .then(() => {

            return this.game.playMultiPromiseObject(AduioArr);
          }).then(() => {
            this.questionWordBg.setHover();
            nowTarget.loadTexture(this.staticRes.ballTarget.image);
            return this.game.playMultiPromiseObject([this.nowPageData.sentenceSound.sounds[1]]);
          });

        if (this.errCount === 0) {
          pro = pro.then(() => {
            this.questionWordBg.setDefault(true);
            if (!this.fiveFlag) {
              this.fiveFlag = true;
              return this.game.playSoundPromiseByObject(this.staticRes.youAndFiveSecend);
            }
          }).then(() => {
            return this.addSeceond(5);
          });
        }
        pro.then(() => {
          this.goNextQuestionState();
        });
      }
    }
  }



  bindKeyBoard() {
    if (!this.game.isMobile) {
      this.game.input.keyboard.onDownCallback = ((event) => {
        this.keyboardDownHandler(event);
      });
    }
  }

  keyboardDownHandler(event) {
    switch (this.keyboradState) {
      case KEYBORADSTATE.DEMOUP:
        if (event.keyCode === Phaser.Keyboard.UP || event.keyCode === Phaser.Keyboard.DOWN) {
          this.movePlayer(event.keyCode).then(() => {
            if (event.keyCode === Phaser.Keyboard.UP) {
              this.KeyboradInput.up.hoverBg.flash.stop();
              this.KeyboradInput.down.hoverBg.flash.start();
              return this.game.playSoundPromiseByObject(this.staticRes.pressDownArrow).then(() => {
                this.keyboradState = KEYBORADSTATE.DEMODOWN;
              });
            } else {
              this.keyboradState = KEYBORADSTATE.DEMOUP;
            }
          }).then(() => {

          });
          this.keyboradState = KEYBORADSTATE.STOP;
        }

        break;
      case KEYBORADSTATE.DEMODOWN:
        if (event.keyCode === Phaser.Keyboard.DOWN || event.keyCode === Phaser.Keyboard.UP) {
          this.movePlayer(event.keyCode).then(() => {
            if (event.keyCode === Phaser.Keyboard.DOWN) {
              this.KeyboradInput.down.hoverBg.flash.stop();
              this.KeyboradInput.space.hoverBg.flash.start();
              this.redPeople.changePlaerState(PLAYERSTATE.STARTBALL);
              return this.game.playSoundPromiseByObject(this.staticRes.pressTheSpaceBarToShoot).then(() => {
                this.keyboradState = KEYBORADSTATE.DEMOSPACE;
              });
            } else {
              this.keyboradState = KEYBORADSTATE.DEMODOWN;
            }
          });
          this.keyboradState = KEYBORADSTATE.STOP;
        }
        break;
      case KEYBORADSTATE.DEMOSPACE:
        if (event.keyCode === Phaser.Keyboard.SPACEBAR || event.keyCode === Phaser.Keyboard.DOWN || event.keyCode === Phaser.Keyboard.UP) {
          if (event.keyCode === Phaser.Keyboard.SPACEBAR) {
            this.redPeople.changePlaerState(PLAYERSTATE.ENDBALL);
            this.KeyboradInput.space.hoverBg.flash.stop();
            this.keyboradState = KEYBORADSTATE.STOP;
          } else {
            this.movePlayer(event.keyCode).then(() => {
              this.keyboradState = KEYBORADSTATE.DEMOSPACE;
            });
            this.keyboradState = KEYBORADSTATE.STOP;
          }
        }
        break;
      case KEYBORADSTATE.GAME: //游戏状态
        this.keyboradState = KEYBORADSTATE.STOP;
        if (event.keyCode === Phaser.Keyboard.SPACEBAR &&
          !this.ballTargets[this.redPeople.playerPosition].grayFlag) {
          this.redPeople.changePlaerState(PLAYERSTATE.ENDBALL);
        } else {
          this.movePlayer(event.keyCode).then(() => {
            this.keyboradState = KEYBORADSTATE.GAME;
          });
        }
        break;
      case KEYBORADSTATE.INPUTWORD: //单词输入
        this.keyBoardOnDownCharHandler(event);
        break;
    }
  }

  //发射球体
  ballLaunch(position) {
    this.ballLanchSound = this.game.playSoundLoop(this.staticRes.fu.sound, 1, false);
    this.ball.visible = true;
    let tween = this.game.add.tween(this.ball);
    tween.to({
      x: 525,
      y: this.staticRes.ball.y + this.offsetY * position
    }, 800, Phaser.Easing.Linear.None);
    tween.start();
    tween.onComplete.add(() => {
      this.ball.visible = false;
      this.ball.x = this.staticRes.ball.x;
      this.ball.y = this.staticRes.ball.y + this.offsetY * this.redPeople.playerPosition;
      this.ballInCallBack();
    });
  }

  startQuestion() {
    this.keyboradState = KEYBORADSTATE.GAME;
  }

  movePlayer(keyCode) {
    switch (keyCode) {
      case Phaser.Keyboard.UP:
        this.redPeople.playerPosition--;
        break;
      case Phaser.Keyboard.DOWN:
        this.redPeople.playerPosition++;
        break;
      case -1:
        break;
      default:
        return Promise.resolve();
    }
    if (this.redPeople.playerPosition < 0) {
      this.redPeople.playerPosition = 0;
    }
    if (this.redPeople.playerPosition > 2) {
      this.redPeople.playerPosition = 2;
    }

    return this.redPeople.move();
  }

  createBallTarget() {
    this.game.util.batchDestroy(this.ballTargets);
    let startXy = { x: this.staticRes.ballTarget.x, y: this.staticRes.ballTarget.y };
    let nowWordsArr = _.shuffle(this.nowPageData.answers);
    this.ballTargets = [];
    nowWordsArr.forEach((item, index) => {

      let ballTarget = this.game.createSprite(startXy.x, startXy.y + index * this.offsetY, this.staticRes.ballTarget);
      ballTarget.text = item;
      ballTarget.anchor.set(0.5);
      ballTarget.hoverImage = this.staticRes.ballTargetActive.image;
      ballTarget.textObj = this.game.add.text(0, 3, item, { fontWeight: 'normal', font: this.fontFamily, fontSize: 20 });
      ballTarget.textObj.anchor.set(0.5);
      ballTarget.flash = new TextureFlasher(this.game, ballTarget, [this.staticRes.ballTarget.image, ballTarget.hoverImage], {
        duration: 200,
        times: 0
      });
      ballTarget.addChild(ballTarget.textObj);
      ballTarget.addGray = () => {
        ballTarget.filters = [this.gray];
        ballTarget.grayFlag = true;
      };
      ballTarget.index = index;
      ballTarget.clearGray = () => {
        ballTarget.filters = undefined;
        ballTarget.grayFlag = false;
      };
      ballTarget.textObj.visible = !this.isDemo;
      if (item === this.nowPageData.answers[0]) {
        this.trueBallTarget = ballTarget;
      }
      if (this.game.isMobile) {
        ballTarget.inputEnabled = true;
        ballTarget.events.onInputDown.add((event) => {
          if (this.keyboradState === KEYBORADSTATE.GAME) {
            this.keyboradState = KEYBORADSTATE.STOP;
            this.redPeople.playerPosition = event.index;
            this.movePlayer(-1).then(() => {
              this.keyboradState = KEYBORADSTATE.GAME;
              this.keyboardDownHandler({ keyCode: Phaser.Keyboard.SPACEBAR });
            });
          }
        });
      }
      this.ballTargets.push(ballTarget);

    });
  }




  ///添加键盘输入区域
  addKeyBoradText() {
    let word = this.nowPageData.answers[0];
    let wordLen = this.nowPageData.answers[0].length;
    if (this.keyBoradTextArr) {
      this.game.util.batchDestroy(this.keyBoradTextArr, this.wordTextArr);
    }
    this.keyBoradTextArr = [];
    this.wordTextArr = [];
    let startX = -(47 * wordLen) / 2;
    let nowx = startX;
    let hideArr = [];
    let hideCount = Math.floor(wordLen / 2.0) - 1;
    if (hideCount < 1) {
      hideCount = 1;
    }

    for (let i = 0; i <= wordLen - 1; i++) {
      let item = this.game.add.text(nowx, -this.questionWordBg.height + 30, '_', { fontSize: 70, fontWeight: 'bold' });
      item.errCount = 0;
      item.flash = this.getObjFlash(item);
      this.questionWordBg.addChild(item);
      this.keyBoradTextArr.push(item);
      let worditem = this.game.add.text(nowx + item.width / 2, -this.questionWordBg.height + 48, word[i], { fontSize: 45, fontWeight: 'bold', font: this.fontFamily });
      worditem.visible = true;
      worditem.fill = COLORDATA[2];
      worditem.anchor.set(0.5, 0);
      nowx += item.width + 8;
      this.questionWordBg.addChild(worditem);
      this.wordTextArr.push(worditem);
      if (this.nowPageData.hidePos.indexOf(i) !== -1) {
        hideArr.push(i);
      }
    }
    //hideArr = _.take(_.shuffle(hideArr), hideCount);
    hideArr.forEach((item) => {
      this.wordTextArr[item].visible = false;
    });
  }

  getObjFlash(item) {
    return new ObjectPropertyFlasher(this.game, item, 'fill', [COLORDATA[1], COLORDATA[0]], {
      duration: 250,
      times: 0
    });
  }

  //添加五分
  addSeceond(second) {

    if (second === 0) {
      return this.game.util.waitByPromise(100).then(() => {
        this.timeBg.setDefault();
      });
    } else {
      --second;
      this.game.defaultTime++;
    }
    this.timeBg.setHover();
    return this.game.playSoundPromiseByObject(this.staticRes.di).then(() => {
      return this.game.util.waitByPromise(100);
    }).then(() => {

      this.timeBg.setHover();
      return this.addSeceond(second);
    });
  }

  keyBoardOnDownCharGoNext(nowWordItem, nowWordCharItem) {
    let wordItem = this.keyBoradTextArr[this.nowKeyBoardIndex];
    nowWordCharItem.fill = COLORDATA[1];
    wordItem.flash.stop();
    nowWordCharItem.visible = true;
    this.nowKeyBoardIndex++;
    if (this.nowKeyBoardIndex >= this.nowPageData.answers[0].length) {
      this.keyboradState = KEYBORADSTATE.STOP;
      let pro = Promise.resolve();
      if (this.bugsErrCount >= 1) {
        this.indicatorBnt.setBtnColor(this.pageIndex, COLORSTATE.Red);

      } else if (this.bugsErrCount === 0) {
        this.indicatorBnt.setBtnColor(this.pageIndex, COLORSTATE.Green);
        pro = this.game.playMultiPromiseObject([this.staticRes.applause, this.nowPageData.wordSound, this.staticRes.niceJob]).then(() => {
          return this.addSeceond(5);
        });
      }
      if (this.bugsErrCount !== 0) {
        pro = this.game.playSoundPromiseByObject(this.staticRes.letsTryAnotherWord);
      }
      pro.then(() => {
        this.goNextQuestionState();
      });

    } else {
      this.keyBoradTextArr[this.nowKeyBoardIndex].flash.start();
    }
  }

  ///输入字符串处理逻辑
  keyBoardOnDownCharHandler(event) {
    if (!(event.keyCode >= 65 && event.keyCode <= 90)) {
      return;
    }
    let nowWordItem = this.keyBoradTextArr[this.nowKeyBoardIndex];
    let nowWordCharItem = this.wordTextArr[this.nowKeyBoardIndex];
    let nowChar = this.nowPageData.answers[0][this.nowKeyBoardIndex].toLowerCase();
    if (event.key.toLowerCase() === nowChar) {
      this.game.playSoundPromiseByObject(this.staticRes.whoosh);
      this.keyBoardOnDownCharGoNext(nowWordItem, nowWordCharItem, nowChar);

    } else {
      this.keyboradState = KEYBORADSTATE.STOP;
      nowWordItem.errCount++;
      this.bugsErrCount += 1;
      nowWordItem.flash.stop();
      nowWordCharItem.fill = COLORDATA[1];
      //this.indicatorBnt.setBtnColor(this.pageIndex, COLORSTATE.Red);
      let trueChar = nowWordCharItem.text;
      nowWordCharItem.visible = true;
      nowWordCharItem.fill = COLORDATA[3];
      nowWordCharItem.setText(event.key.toLowerCase());
      this.game.playSoundPromiseByObject(this.staticRes.mu, { stopCurrentAudio: false }).then(() => {
        nowWordCharItem.setText(trueChar);
        nowWordCharItem.fill = COLORDATA[1];
        return this.game.util.waitByPromise(300).then(() => {
          nowWordItem.flash.start();
          this.keyboradState = KEYBORADSTATE.INPUTWORD;
          this.keyBoardOnDownCharGoNext(nowWordItem, nowWordCharItem, nowChar);
        });
      });
    }
  }

  update() {
    this.game.logicLoop.update();
  }
}

export {
  QuestionPageState
};