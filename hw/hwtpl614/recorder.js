import H5PlusRecorder from '../../framework/plugins/H5PlusRecorder';
import {
  CONSTANT
} from '../../framework/core/Constant';
const countDownStyle = {
  fill: '#ffffff',
  font: CONSTANT.DEFAULT_FONT,
  fontSize: '28px',
  fontWeight: 'bold'
};
class Recorder {
  constructor(game, dataArr = [], {
    recordStart = () => {},
    recordDone = () => {}
  } = {}) {
    this.game = game;
    this.recording = false;
    this.activeIndex = 0; //标识当前是第几题
    this.recordPosition = [176, 554];
    this.dataArr = dataArr;
    this.angle = {
      min: -90,
      max: -90
    };
    this.recordStart = recordStart;
    this.recordDone = recordDone;
    this.recorder = new H5PlusRecorder();
    this.playBtn = null;
    this.recordCountArr = new Array(this.dataArr.length);
    this.createRecordBtn();
    this.createDotCutDown();
    this.createBubble();
  }

  init(index) {
    this.activeIndex = index;
  }

  get data() {
    return this.dataArr[this.activeIndex];
  }

  createRecordBtn() {
    //正在录音按钮
    let recordingBg = this.game.createSprite(...this.recordPosition, 'recordingBg');
    let recordingInner = this.game.createSprite(0, 0, 'recordingInner');
    let recordingBtn = this.game.createSprite(0, 0, 'recordingBtn');
    this.graphicsCircle = this.game.add.graphics(0, 0);
    recordingBg.anchor.set(0.5);
    recordingInner.anchor.set(0.5);
    recordingBtn.anchor.set(0.5);
    recordingBg.addChild(this.graphicsCircle);
    recordingBg.addChild(recordingInner);
    recordingBg.addChild(recordingBtn);
    recordingBg.alpha = 0;
    recordingBg.events.onInputUp.add(() => {
      recordingBg.inputEnabled = false;
      this.recorder.stop();
    });
    this.recordingBg = recordingBg;
    let beforeRecord = this.game.add.autoSprite(176, 554, undefined, {
      bgColor: '#d061ff',
      width: 128,
      height: 60,
      radius: 30
    });
    beforeRecord.anchor.set(0.5);
    beforeRecord.alpha = 0;
    beforeRecord.tween = () => {
      beforeRecord.alpha = 1;
      return new Promise(resolve => {
        this.game.add.tween(this.recordingBg).to({
          'alpha': 1
        }, 400, 'Linear', true).onComplete.add(() => {
          this.recordingBg.inputEnabled = true;
        });
        this.game.add.tween(beforeRecord).to({
          '$width': 60,
        }, 800, 'Linear', true);
        this.game.add.tween(beforeRecord).to({
          'alpha': 0
        }, 800, 'Linear', true).onComplete.add(resolve);
      });
    };
    this.beforeRecord = beforeRecord;
    this.recordBtn = this.game.createSprite(176, 554, 'recordBtn');
    this.recordBtn.anchor.set(0.5);
    this.recordBtn.events.onInputUp.add((btn) => {
      btn.inputEnabled = false;
      this.recordStart();
      //倒计时开始
      this.countDown.start().then(() => {
        btn.visible = false;
        this.beforeRecord.tween().then(() => {
          this.recordingBg.inputEnabled = true;
        });
        this.startRecord(this.data.duration);
      });
    });
  }

  startRecord(second) {
    let timer;
    let circleTween = this.game.add.tween(this.angle).to({
      max: 269
    }, second * 1000, 'Linear', true);
    this.recording = true;
    this.recorder.record().then((path) => {
      //录音完成  
      this.recording = false;
      this.recordingBg.children[2].visible = true;
      circleTween.stop();
      this.resetRecordBtn();
      this.angle.max = -90;
      timer && clearTimeout(timer);
      let batchNum = this.recordCountArr[this.activeIndex] || 0;
      this.recorder.upload(path, unescape(this.data.text), this.activeIndex, ++batchNum).then((res) => {
        this.recordCountArr[this.activeIndex] = batchNum;
        this.evalingBubble.visible = true;
        H5PlusRecorder.getEvalData(res.evalId).then((data) => {
          this.evalingBubble.visible = false;
          this.recordBtn.inputEnabled = true;
          this.game.playSoundPromise(this.recordDoneSound(data.score));
          this.recordDone(path, data);
        }).catch(err => {
          plus.nativeUI.toast(err);
          this.evalingBubble.visible = false;
          this.recordBtn.inputEnabled = true;
        });
      }).catch(() => {
        console.log('上传录音失败');
      });
    });
    timer = setTimeout(() => {
      this.createNumCountDown().then(() => {
        this.recorder.stop();
      });
    }, (second - 5) * 1000);
  }

  resetRecordBtn() {
    //录音按钮恢复初始状态
    this.beforeRecord.$width = 128;
    this.recordingBg.alpha = 0;
    this.recordBtn.visible = true;
  }

  destroy() {
    this.beforeRecord.destroy();
    this.recordingBg.destroy();
    this.recordBtn.destroy();
  }

  createBubble() {
    this.evalingBubble = this.game.createSprite(157, 486, 'yellowBubble');
    let evalingText = this.game.add.text(this.evalingBubble.width / 2, this.evalingBubble.height / 2, '正在评分...', {
      font: CONSTANT.DEFAULT_FONT_12,
      fill: '#ffffff'
    });
    evalingText.anchor.set(0.5);
    this.evalingBubble.addChild(evalingText);
    this.evalingBubble.visible = false;
  }

  recordDoneSound(data) {
    let score = data.toFixed(0);
    let sound = 'tryAgain';
    if (score >= 90) {
      sound = 'fantastic';
    } else if (score >= 80) {
      sound = 'youAreDoingGreat';
    } else if (score >= 60) {
      sound = 'greatJob';
    } else if (score >= 10) {
      sound = 'duang';
    }
    return sound;
  }

  drawCircle() {
    this.graphicsCircle.clear();
    this.graphicsCircle.lineStyle(8, 0xFFB600);
    this.graphicsCircle.arc(0, 0, 34, this.game.math.degToRad(this.angle.max), this.game.math.degToRad(this.angle.min), true);
    this.graphicsCircle.endFill();
  }

  //录音前倒计时
  createDotCutDown() {
    this.countDown = this.game.add.group();
    for (let i = 0; i < 3; i++) {
      let dot = this.game.createSprite(12 * i, 0, 'dot');
      dot.alpha = 0;
      this.countDown.add(dot);
    }
    this.countDown.x = this.game.width / 2 - this.countDown.width / 2;
    this.countDown.y = 245;
    this.countDown.start = () => {
      let pro = Promise.resolve();
      let len = this.countDown.children.length;
      for (let i = 0; i < len; i++) {
        let dot = this.countDown.children[len - i - 1];
        dot.alpha = 1;
        pro = pro.then(() => {
          return this.game.util.waitByPromise(500);
        }).then(() => {
          dot.alpha = 0;
          return this.game.util.waitByPromise(0);
        });
      }
      return pro;
    };
  }

  //录音倒计时
  createNumCountDown() {
    this.recordingBg.children[2].visible = false;
    let pro = Promise.resolve();
    for (let i = 5; i > 0; i--) {
      let text = this.game.add.text(0, 0, i, countDownStyle);
      this.recordingBg.children[1].addChild(text);
      text.anchor.set(0.5);
      text.alpha = 0;
      pro = pro.then(() => {
        return new Promise(resolve => {
          text.alpha = 1;
          this.game.add.tween(text).to({
            alpha: 0
          }, 1000, 'Linear', true).onComplete.add(() => {
            text.destroy();
            resolve();
          });
        });
      });
    }
    return pro;
  }
}

export {
  Recorder
};