import {
  CONSTANT
} from '../../framework/core/Constant';
import {
  Array
} from 'core-js';
import {
  LoopManager
} from '../../framework/core/LoopManager';
import Phaser from 'phaser';
import _ from 'lodash';
require('../../framework/phaserplugins/contentWithScrollBar');

const textNormalStyle = {
  font: CONSTANT.DEFAULT_FONT_22,
  fill: '#999999',
  wordWrap: true,
  wordWrapWidth: 500,
  align:'center'
};

const textHighlightStyle = {
  font: CONSTANT.DEFAULT_FONT_22,
  fill: '#8561ed',
  wordWrap: true,
  wordWrapWidth: 500,
  fontWeight: 'bold',
  align:'center'
};

const textActiveStyle = {
  font: CONSTANT.DEFAULT_FONT_22,
  fill: '#333333',
  wordWrap: true,
  wordWrapWidth: 500,
  align:'center'
};

class Question {
  constructor(game, data, stateChange = () => {}) {
    this.game = game;
    this.data = data;
    this._limitIndex = 0;
    this._activeIndex = 0;
    this.scrollPoint = [];
    this.scoreArr = [];
    this.textArr = [];
    this.stateChange = stateChange;
    this.origSoundArr = [];
    this.questionGroup = this.game.add.group();
    this.loop = new LoopManager();
    this.recordTotalDuration = 0; //录音总时长
    this.timeInRecord = 0; //当前音频播放时间点
    this.timeInAudio = 0;
    this.startPoints = [0];
    //状态记录
    this.origSoundIndex = 0; //原文播放索引
    this.recordSoundIndex = 0; //第几段录音
    this.recordIsPlay = false;
    this.origSoundIsPlay = false;
    this.recordPlayDone = false; //录音是否播放完成
    this.origSoundIsDone = false; //原文是否播放完成
    this.initUI();
  }

  set limitIndex(index) {
    this._limitIndex = index;
    this.textArr.forEach((text, i) => {
      if (i <= index) {
        text.inputEnabled = true;
      }
    });
    this.scrollContent.yGrid = this.scrollPoint.filter((y, i) => {
      return i <= this._limitIndex;
    });
  }

  get limitIndex() {
    return this._limitIndex;
  }

  set activeIndex(index) {
    this.stateChange(index);
    this._activeIndex = index;
  }

  get activeIndex() {
    return this._activeIndex;
  }

  get currSound() {
    return this.origSoundArr[this.origSoundIndex];
  }

  get currAudio() {
    return this.game.audios.get(this.recordSoundIndex);
  }

  initUI() {
    this.data.forEach(question => {
      let y = this.questionGroup.height && this.questionGroup.height + 10;
      let text = this.game.add.text(250, y, question.text, textNormalStyle);
      text.anchor.x = 0.5;
      let score = this.game.add.text(570, y, ' ', textNormalStyle);
      score.anchor.x = 1;
      this.scrollPoint.push(y);
      this.questionGroup.add(text);
      this.questionGroup.add(score);
      this.textArr.push(text);
      this.scoreArr.push(score);
    });
    this.createScroll();
    if (this.data[0].sound) {
      this.createSoundBtn();
    }
    //初始动画
    this.limitIndex = this.data.length - 1; //解开限制
    this.scrollContent.scrollTop = this.scrollPoint.slice(-1);
    let duration = 200 * this.data.length;
    this.scrollContent.setScrollTop(0, duration).then(() => {
      this.limitIndex = 0;
      this.textArr[this.activeIndex].setStyle(textHighlightStyle);
      this.scoreArr[this.activeIndex].setStyle(textHighlightStyle);
    });
  }

  createSoundBtn() {
    this.soundBtn = this.game.util.createSpeakerAnimationBtn(
      80,
      255,
      'yellowSpeaker'
    );
    this.soundBtn.events.onInputDown.add(() => {
      //暂停录音的播放
      if(this.game.audios.get(this.activeIndex)){
        this.game.audios.get(this.activeIndex).pause();
      }
      this.soundBtn.playSound(this.data[this.activeIndex].sound, 5);
    });
  }

  switchActive(b) {
    if (this.soundBtn) {
      !b && this.soundBtn.stop();
      this.soundBtn.inputEnabled = b;
    }
    this.scrollContent.enableScroll(b);
  }

  createScroll() {
    let contentGraphic = this.game.add.graphics(0, 0);
    contentGraphic.beginFill(0xffffff, 0);
    contentGraphic.drawRect(0, 0, 500, this.questionGroup.height + 600);
    contentGraphic.endFill();
    contentGraphic.addChild(this.questionGroup);
    this.questionGroup.y = 193;
    let scrollBg = this.game.add.graphics(0, 0);
    scrollBg.beginFill(0xffffff, 0);
    scrollBg.drawRect(0, 0, 4, 400);

    let scrollThumb = this.game.add.autoSprite(0, 0, undefined, {
      bgColor: 'rgba(0,0,0,0.1)',
      radius: 3,
      width: 6,
      height: 60
    });

    this.scrollContent = this.game.add.contentWithScroll(
      150,
      63,
      contentGraphic, {
        backgroundColor: 0xffff00,
        backgroundAlpha: 0,
        height: 400,
      },
      undefined, {
        yTrack: scrollBg.generateTexture(),
        yThumb: scrollThumb,
        yPadding: 4,
        yPosition: {
          x: 582,
          y: 0,
        },
        yVisible: false,
      }
    );
    this.scrollContent.yGrid = [0];
    this.scrollContent.events.onScroll.add((scroll, y) => {
      if (this.origSoundIsPlay && !this.currSound.paused) {
        this.currSound.pause();
      }
      if (this.recordIsPlay && !this.currAudio.paused) {
        this.currAudio.pause();
      }
      if (this.progressBarTween) {
        this.progressBarTween.stop();
      }
      let nearIndex = this.findNearInArr(y, this.scrollPoint);
      this.switchText(nearIndex);
      if (this.progressBar) {
        //最后播放场景
        this.recordSoundIndex = nearIndex;
        this.origSoundIndex = nearIndex;
        this.recordPlayDone = false;
        this.origSoundIsDone = false;
        this.timeInAudio = 0;
        this.timeInRecord = 0;
      }
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        scroll.setScrollTop(this.scrollPoint[nearIndex]);
        //当前是否正在播放
        if (this.origSoundIsPlay) {
          this.playOrigSound();
        }
        if (this.recordIsPlay) {
          this.playRecord();
        }
      }, 400);
      if (this.progressBar) {
        this.setProgressX();
      }
    });
    this.scrollContent.enableScroll();
  }

  switchText(index) {
    if (index !== this.activeIndex) {
      this.textArr[this.activeIndex].setStyle(textActiveStyle);
      this.scoreArr[this.activeIndex].setStyle(textActiveStyle);
      this.textArr[index].setStyle(textHighlightStyle);
      this.scoreArr[index].setStyle(textHighlightStyle);
      this.scrollContent.setScrollTop(this.scrollPoint[index], 100);
      this.activeIndex = index;
    }
  }

  findNearInArr(n, arr) {
    if (Array.isArray(arr)) {
      let matchIndex, lastVal = Infinity;
      arr.forEach((num, i) => {
        if (lastVal > Math.abs(num - n)) {
          lastVal = Math.abs(num - n);
          matchIndex = i;
        }
      });
      return matchIndex;
    }
  }

  //进入下一题
  activeNext() {
    let nextIndex = this.activeIndex + 1;
    if (nextIndex > this.limitIndex) {
      this.limitIndex = nextIndex;
      this.textArr[this.limitIndex].setStyle(textActiveStyle);
    }
  }

  //向文本中添加得分
  addScore(score) {
    this.scoreArr[this.activeIndex].text = score.toFixed(0);
  }

  //创建滚动条
  createProgressBar() {
    const intervalTime = 0; //每段录音之间的间隔
    this.playAllRecordBtn = this.game.createSprite(112, 524, 'playRecordBtn');
    this.playAllRecordBtn.inputEnabled = true;
    this.playAllRecordBtn.events.onInputUp.add(() => {
      if (this.currAudio.paused) {
        this.playRecord();
      } else {
        this.playAllRecordBtn.loadTexture('playRecordBtn');
        this.recordIsPlay = false;
        this.currAudio.pause();
        this.progressBarTween && this.progressBarTween.stop();
      }
    });

    this.progressBar = this.game.createSprite(189, 550, 'progressBar');
    //用来扩大触碰区域，以便可以拖动进度条
    let touchGraphics = this.game.add.graphics(189, 540);
    touchGraphics.beginFill(0xffffff, 0);
    touchGraphics.drawRect(0, 0, this.progressBar.width, 25);
    touchGraphics.endFill();
    touchGraphics.inputEnabled = true;

    let dotGraphic = this.game.add.graphics(0, 0);
    dotGraphic.beginFill(0xffffff, 1);
    dotGraphic.drawCircle(0, this.progressBar.height / 2, 18);
    dotGraphic.endFill();
    dotGraphic.anchor.x = 0.5;
    this.dotGraphic = dotGraphic;
    this.progressBar.addChild(this.dotGraphic);
    touchGraphics.events.onInputDown.add((btn, pointer) => {
      //暂停正在播放的声音
      this.currAudio.pause();
      this.isDown = true;
      this.recordPlayDone = false;
      this.dotGraphic.x = pointer.x - btn.x;
      let result = this.caculateIndexAndTime();
      this.recordSoundIndex = result[0];
      this.timeInRecord = result[1];
      this.switchText(this.recordSoundIndex);
      //暂停进度条动画
      this.progressBarTween && this.progressBarTween.stop();
    });

    this.game.input.addMoveCallback((pointer, x) => {
      if (this.isDown) {
        if (x - this.progressBar.x < 0) {
          this.dotGraphic.x = 0;
        } else if (x - this.progressBar.x > this.progressBar.width) {
          this.dotGraphic.x = this.progressBar.width;
        } else {
          this.dotGraphic.x = x - this.progressBar.x;
        }
        let result = this.caculateIndexAndTime();
        this.recordSoundIndex = result[0];
        this.timeInRecord = result[1];
        this.switchText(this.recordSoundIndex);
      }
    });

    touchGraphics.events.onInputUp.add(() => {
      this.isDown = false;
      if (this.recordIsPlay) {
        this.playRecord(this.timeInRecord);
      }
    });
    this.combinateAudio(intervalTime);
  }

  //声音连续播放
  soundToQueen() {
    const len = this.data.length;
    this.data.forEach((question, index) => {
      let audio = this.game.add.audio(question.sound);
      audio.onStop.add(() => {
        if (this.origSoundIndex >= len - 1) {
          this.playOrigBtn.loadTexture('origSoundPlay');
          this.origSoundIsPlay = false;
          this.origSoundIsDone = true;
          return;
        }
        this.origSoundIndex = index + 1;
        this.switchText(this.origSoundIndex);
        this.currSound.play();
      });
      this.origSoundArr.push(audio);
      audio.onPause.add(() => {
        this.timeInAudio = audio.currentTime;
      });
    });
  }

  //合成录音音频文件
  combinateAudio(intervalTime = 0) {
    const len = this.data.length;
    let pro = Promise.resolve();
    Array.from(this.game.audios.values()).forEach((audio, index) => {
      audio.onended = () => {
        if (this.recordSoundIndex === len - 1) {
          //播放结束
          this.playAllRecordBtn.loadTexture('playRecordBtn');
          this.recordIsPlay = false;
          this.recordPlayDone = true;
          this.timeInRecord = 0;
          return;
        }
        //切换文本
        this.recordSoundIndex = index + 1;
        this.switchText(this.recordSoundIndex);
        this.game.util.waitByPromise(intervalTime).then(() => {
          this.currAudio.currentTime = 0;
          this.currAudio.play();
        });
      };
      audio.onpause = () => {
        this.timeInRecord = audio.currentTime * 1000;
      };
      audio.onplay = () => {};
      pro = pro.then(() => {
        return this.game.util.waitByPromise(100).then(() => {
          this.recordTotalDuration += audio.duration * 1000;
          if (index < len - 1) {
            //加入时间间隔
            this.startPoints.push(
              this.startPoints.slice(-1)[0] +
              audio.duration * 1000 +
              intervalTime
            );
            this.recordTotalDuration += intervalTime;
          }
          return Promise.resolve();
        });
      });
    });
    return pro;
  }

  //计算出当前录音的索引和时间点
  caculateIndexAndTime() {
    let dotGraphic = this.progressBar.children[0];
    let timePoint =
      dotGraphic.x / this.progressBar.width * this.recordTotalDuration;
    let recordSoundIndex = 0,
      timeInRecord = 0;
    this.startPoints.forEach((point, index) => {
      let nextPoint = this.startPoints[index + 1];
      if (timePoint - point >= 0 && (!nextPoint || timePoint - nextPoint < 0)) {
        recordSoundIndex = index;
        timeInRecord = timePoint - point;
      }
    });
    return [recordSoundIndex, timeInRecord];
  }

  //设置进度条的位置
  setProgressX() {
    let currentPoint = this.startPoints[this.recordSoundIndex];
    let x = currentPoint * this.progressBar.width / this.recordTotalDuration;
    this.progressBar.children[0].x = x;
  }

  //播放总结录音
  playRecord() {
    this.playAllRecordBtn.loadTexture('recordingBtn');
    this.recordIsPlay = true;
    if (this.recordPlayDone) {
      this.recordPlayDone = false;
      this.recordSoundIndex = 0;
      this.dotGraphic.x = 0;
    }
    //暂停正在播放的原文音频
    if (this.origSoundIsPlay) {
      this.currSound.pause();
      this.origSoundIsPlay = false;
      this.playOrigBtn.loadTexture('origSoundPlay');
    }
    this.switchText(this.recordSoundIndex);
    this.currAudio.currentTime = this.timeInRecord / 1000;
    this.currAudio.play();
    //进度条动画
    this.progressBarTween && this.progressBarTween.stop();
    this.progressBarTween = this.game.add.tween(this.dotGraphic).to({
      x: this.progressBar.width,
    },
    this.recordTotalDuration -
      this.startPoints[this.recordSoundIndex] -
      this.timeInRecord,
    'Linear',
    true
    );
  }

  playOrigSound() {
    this.playAllRecordBtn.loadTexture('playRecordBtn');
    this.origSoundIsPlay = true;
    if (this.origSoundIsDone) {
      //重置
      this.origSoundIsDone = false;
      this.origSoundIndex = 0;
    }
    if (this.recordIsPlay) {
      this.currAudio.pause();
      this.recordIsPlay = false;
      this.progressBarTween.stop();
    }
    this.switchText(this.origSoundIndex);
    this.currSound.play();
  }

  //得分动画
  createScoreAnimation() {
    let scoreMasker = this.game.add.graphics();
    scoreMasker.beginFill(0xffffff, 0);
    scoreMasker.drawCircle(695, 96, 44);
    scoreMasker.endFill();
    let scoreGroup = this.game.add.group();
    let texts = this.scoreArr.map(text => {
      return +text.text;
    });
    let averageScore = parseInt(_.mean(texts));
    let badge = this.game.createSprite(695, 103, 'badge');
    badge.anchor.set(0.5);
    const timePoints = [500, 250, 0];
    const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let scoreLetters = averageScore.toString().split('');
    let len = scoreLetters.length,
      numArr = [];
    if (len === 3) {
      numArr = [
        [1, 0],
        [0, 4, 6, 9, 0],
        [0, 2, 5, 7, 9, 0]
      ];
    } else {
      let hPlace = scoreLetters[0],
        oPlace = scoreLetters[1];
      let hNums = [+hPlace].concat(nums.slice(0, hPlace).filter(num => {
        return !!(num % 2);
      }));
      numArr.push(hNums);
      if (oPlace) {
        let oNums = [oPlace, Math.floor(Math.random() * oPlace), 9, 8, 4, 0];
        numArr.push(oNums);
      }
    }
    let x = 0;
    for (let i = 0; i < numArr.length; i++) {
      let nums = numArr[i];
      let y = 0;
      let oneCol = this.game.add.group();
      for (let j = 0; j < nums.length; j++) {
        let oneNum = this.game.add.text(0, y, nums[j], {
          fill: '#ffffff',
          font: CONSTANT.DEFAULT_FONT_20
        });
        y += oneNum.height + 2;
        oneCol.add(oneNum);
      }
      oneCol.x = x;
      oneCol.y = -oneCol.height;
      x += oneCol.width;
      oneCol.tween = () => {
        this.game.add.tween(oneCol).to({
          y: 10
        }, 1000 - timePoints[i], 'Linear', true, timePoints[i]).onComplete.addOnce(() => {
          this.game.add.tween(oneCol).to({
            y: 0
          }, 200, Phaser.Easing.Circle, true);
        });
      };
      scoreGroup.add(oneCol);
      scoreGroup.mask = scoreMasker;
    }
    scoreGroup.x = -scoreGroup.width / 2;
    scoreGroup.y = -18;
    badge.addChild(scoreGroup);
    badge.scale.set(0);
    this.game.add.tween(badge.scale).to({
      x: 1,
      y: 1
    }, 500, 'Linear', true).onComplete.add(() => {
      scoreGroup.children.forEach(oneCol => {
        oneCol.tween();
      });
    });
  }

  //最后总结
  stepToFinish() {
    this.createScoreAnimation();
    this.game.util.batchDestroy(...this.scoreArr);
    this.switchText(0);
    this.soundBtn && this.soundBtn.destroy();
    this.createProgressBar();
    //没有原文声音
    if (!this.data[0].sound) return;
    //初始化声音文件 
    this.soundToQueen();
    let playOrigBtn = this.game.createSprite(80, 255, 'origSoundPlay');
    playOrigBtn.inputEnabled = true;
    playOrigBtn.events.onInputUp.add(btn => {
      //播放和暂停
      if (this.origSoundIsPlay) {
        this.currSound.pause();
        this.origSoundIsPlay = false;
        btn.loadTexture('origSoundPlay');
      } else {
        this.playOrigSound();
        btn.loadTexture('origSoundPause');
      }
    });
    this.playOrigBtn = playOrigBtn;
  }
}

export {
  Question
};