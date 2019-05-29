import Phaser from 'phaser';
import staticRes from './static-resource.json';
import RecorderObj from './RecorderObj.js';
import {
  getScore
} from '../../framework/util/apis';
import {
  CONSTANT
} from '../../framework/core/Constant';
import ExitUtil from '../../framework/plugins/exitUtil';
require('../../framework/phaserplugins/contentWithScrollBar');
require('../../framework/phaserplugins/PhaserRichTextNew');
class Recording extends Phaser.Group {
  constructor(game) {
    super(game);
    this.game = game;
    this.recorderObj = new RecorderObj();
  }

  init(page) {
    this.page = page;
    this.removeAll();
    this.createUI();
  }

  createUI() {
    this.createRecord();
    this.createMessage();
    this.createArticle();
  }

  createImage(page) {
    this.image = this.game.util.createThumbNailWithBorder(80, 203, page.image, {
      margin: 1,
      backgroundColor: 0xffffff,
      borderColor: 0xBB97E2,
      radius: 8,
      width: 240,
      height: 180
    });
    this.add(this.image);
  }

  createArticle() {
    if (this.page.image) {
      this.createImage(this.page);
      this.createArticlePannel(336, 131, 384, true);
    } else {
      this.createArticlePannel(80, 130, 640, true);
    }
  }

  createArticlePannel(x, y, width, isVertical = false) {
    let contentGraphics = this.game.add.graphics(0, 0);
    this.article = this.game.add.richtextNew(0, 0, unescape(this.page.longText), {
      font: CONSTANT.DEFAULT_FONT,
      fontSize: '20px',
      fill: '#333333',
      maxwidth: width,
      align: 'left'
    });
    contentGraphics.beginFill(0xffffff, 0);
    if (isVertical && this.article.height < 332) {
      contentGraphics.drawRect(0, 0, width, 332);
      contentGraphics.endFill();
      this.article.y = contentGraphics.height / 2 - this.article.height / 2;
    } else {
      contentGraphics.drawRect(0, 0, width, this.article.height);
      contentGraphics.endFill();
    }
    contentGraphics.addChild(this.article);
    let scrollBg = this.game.add.graphics(0, 0);
    scrollBg.beginFill(0xffffff, 0);
    scrollBg.drawRect(0, 0, 4, 332);
    let scrollThunk = this.game.add.graphics(0, 0);
    scrollThunk.beginFill(0x6e6e6e, 1);
    scrollThunk.drawRect(0, 0, 4, 440);
    let question = this.game.add.contentWithScroll(x, y, contentGraphics, {
      width: 640,
      height: 332,
      backgroundColor: 0xffffff,
      backgroundAlpha: 0
    }, undefined, {
      yTrack: scrollBg.generateTexture(),
      yThumb: scrollThunk.generateTexture(),
      yPosition: {
        x: width + 10,
        y: 0
      },
      yVisible: true
    });
    question.enableScroll();
    this.question = question;
    this.add(this.question);
  }

  createMessage() {
    let style = {
      font: CONSTANT.DEFAULT_FONT,
      fill: '#FFFFFF',
      fontSize: '16px',
      fontWeight: '400'
    };
    this.message = this.game.createSprite(200, 503, staticRes.localImage.recordedMessage);
    this.message.anchor.set(0.5);
    let messageInfo = this.game.add.text(0, -2, '正在评分', style);
    messageInfo.anchor.set(0.5);
    this.message.addChild(messageInfo);
    this.add(this.message);
    this.message.visible = false;
  }

  createRecord() {
    let record = this.game.createSprite(166, 552, staticRes.localImage.record);
    record.normal = staticRes.localImage.record.image;
    record.press = staticRes.localImage.recordPress.image;
    record.anchor.set(0.5);
    this.add(record);
    record.inputEnabled = true;
    record.events.onInputDown.add(this.recordDownEvent, this);
    record.events.onInputUp.add(this.recordUpEvent, this);
    this.record = record;
  }

  recordDownEvent(item) {
    this.game.playSoundPromiseByObject('');
    this.recorderObj.stopPlay();
    this.game.soundStopAll(false);
    item.loadTexture(item.press);
  }

  startRecord() {
    this.recorderObj.record().then((data) => {
      this.message.visible = true;
      this.sendAxios(data);
    });
  }

  stopRecord() {
    this.recorderObj.stop();
  }

  stopPlay() {
    this.recorderObj.stopPlay();
  }


  sendAxios(data) {
    let json = unescape(this.page.longText);
    this.game.changeAudioDetail(data);
    // variable declaration currnet subject
    this.currentPath = this.game.audioDetail[this.game.currentBall.oldIndex].audioPath;
    // variabel declaration current batch
    if (!this.batch) {
      this.batch = 1;
    } else {
      this.batch++;
    }
    this.recorderObj.upload({
      word: json
    }, this.currentPath, this.game.currentBall.oldIndex, this.batch).then(() => {
      return this.game.util.waitByPromise(1000);
    }).then(() => {
      this.getEvalData(this.game.currentBall.oldIndex, this.batch);
    });
  }

  clearTimeOut() {
    this.recordedTiming ? clearTimeout(this.recordedTiming) : undefined;
    this.clearRecordedTiming ? clearTimeout(this.clearRecordedTiming) : undefined;
    this.recordingTiming ? clearTimeout(this.recordingTiming) : undefined;
  }

  recordUpEvent(item) {
    // this.stopPlay();
    this.game.allClick(false);
    this.game.changeState();
    item.loadTexture(item.normal);
    item.visible = false;
    this.game.PlayFinishBg.visible = true;
    this.game.util.waitByPromise(3100).then(() => {
      // 解决录音延迟问题
      this.startRecord();
    });

    this.game.recordPrelude().then(() => {
      this.game.PlayFinishBg.inputEnabled = true;
      let time = this.page.time * 1000;
      this.game.startRotate(time);
      // 开始录音的时候 总是延迟录音，解决办法；提前500毛秒开始录音 
      // this.startRecord();
      // 开始旋转圈圈了;开始录音；
      return this.startTime(time - 5000);
    }).then(() => {
      // 录音结束；
      this.stopRecordTip();
    });
  }

  startTime(time) {
    let style = {
      font: CONSTANT.DEFAULT_FONT,
      fill: '#FFFFFF',
      fontSize: '18px',
      fontWeight: '600'
    };
    return new Promise(resolve => {
      this.Timeing = setTimeout(() => {
        this.game.PlayFinishBg.graphicsInnerBg.graphicsInner.visible = false;
        this.game.startTime(5, style, {
          x: 0,
          y: 3
        }, this.game.PlayFinishBg.graphicsInnerBg).then(() => {
          resolve();
        });
      }, time);
    });
  }

  stopRecordTip() {
    this.stopRecord();
    this.game.angle = {
      min: 0,
      max: 0
    };
    this.game.tweenObj.stop();
    this.game.tweenObj2.stop();
    this.game.PlayFinishBg.visible = false;
    this.game.PlayFinishBg.graphicsInnerBg.graphicsInner.visible = true;
    this.game.PlayFinishBg.inputEnabled = false;
    this.record.visible = true;
    this.Timeing && clearTimeout(this.Timeing);
  }

  getEvalData(index, batch) {
    if (this.fetchCount > 70) {
      alert('获取评分失败');
      ExitUtil.exitGame();
      return;
    }
    setTimeout(() => {
      this.fetchCount++;
      getScore({
        type: 2,
        batch: batch
      }).then(data => {
        if (!data) {
          this.getEvalData(index, batch);
        } else {
          // success get score
          this.initScored(data);
        }
      });
    }, 100);
  }

  getScored(data, audioSrc) {
    this.message.visible = false;
    this.score = parseInt(data);
    this.game.addScore(this.game.pageIndex, this.score, audioSrc);
    this.playSound(this.score);
    // this.game.scoreMessage && this.game.scoreMessage.destroy();
    // this.game.createNowScore(this.score);
    // this.game.scoreMessage.visible = false;
    // if (this.score > this.game.currentBall.score || this.score === this.game.currentBall.score) {
    this.game.createBallAnimation(this.score).then(() => {
      this.game.currentBall.isComplete = true;
      this.game.stepByStep();
      this.game.allClick(true);
      this.game.playAudio.visible = true;
      // this.game.scoreMessage.visible = true;
    });
    // } else {
    //   this.game.util.waitByPromise(800).then(() => {
    //     this.game.currentBall.isComplete = true;
    //     this.game.stepByStep();
    //     this.game.allClick(true);
    //     this.game.playAudio.visible = true;
    //     this.game.scoreMessage.visible = true;
    //   });
    // }
  }

  initScored(data) {
    let {
      fluency,
      integrity,
      pronunciation,
      audioSrc
    } = data;
    // this.game.domAudio.audios.src = audioSrc;
    let scroe = fluency * 0.1 + integrity * 0.45 + pronunciation * 0.45;
    this.getScored(scroe, audioSrc);
  }

  playSound(score) {
    if (score < 10) {
      this.game.playSoundPromiseByObject(staticRes.localSound.try_again);
    } else if (score >= 10 && score < 60) {
      this.game.playSoundPromiseByObject(staticRes.localSound.dingding);
    } else if (score >= 60 && score < 80) {
      this.game.playSoundPromiseByObject(staticRes.localSound.great_job);
    } else if (score >= 80 && score < 90) {
      this.game.playSoundPromiseByObject(staticRes.localSound.doing_great);
    } else {
      this.game.playSoundPromiseByObject(staticRes.localSound.fantastic);
    }
  }
}

export {
  Recording
};