import {
  Courseware
} from '../../framework/core/Courseware';
import staticRes from './staticResource.json';
import {
  ExitDialog
} from '../../framework/plugins/exitDialog';
import ExitUtil from '../../framework/plugins/exitUtil';
import {
  Question
} from './question';
import {
  Recorder
} from './recorder';
require('../../framework/phaserplugins/PhaserRichTextNew');
require('../../framework/phaserplugins/autoSprite');
class Hwtpl614 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.loadPageResources(this.data, staticRes);
      this.loadHwPublicResource();
      this.util.loadSpeakerBtn();
    };
    let update = () => {
      if (this.recorder.recording) {
        this.recorder.drawCircle();
      }
    };
    super({}, preload, () => {
      this.createUI();
      this.initQuestionList(this.data.questions.length);
      new ExitDialog(this, {
        zIndex: 900
      });
    }, update);
    this.allSounds = [];
    this.data = Object.assign({}, data);
    this.staticRes = staticRes;
    this.recorder = null;
    this.activeIndex = 0; //当前答题文本
    this.audios = new Map(); //所有audio player
    this.isPlaying = false;
  }

  createUI() {
    this.createSprite(0, 0, 'bg');
    this.createPlayBtn();
    this.createSubmitBtn();
    this.recorder = new Recorder(this, this.data.questions, {
      recordStart: () => {
        this.currAudio && this.currAudio.pause();
        this.question.switchActive(false);
        this.playRecordBtn.inputEnabled = false;
      },
      recordDone: (path, data) => {
        this.createAudio(this.activeIndex, data.audioSrc);
        this.playRecordBtn.visible = true;
        this.playRecordBtn.inputEnabled = true;
        this.question.switchActive(true);
        //获取评分
        this.question.addScore(data.score);
        this.addScore(this.activeIndex, data.score, data.audioSrc);
        if (this.activeIndex === this.data.questions.length - 1) {
          this.submitBtn.visible = true;
          this.submitBtn.inputEnabled = true;
          return;
        }
        this.question.activeNext();
      }
    });
    this.question = new Question(this, this.data.questions, (index) => {
      this.activeIndex = index;
      this.recorder.init(index);
      this.playRecordBtn.visible = !!this.audios.get(this.activeIndex);
    });
    let pro = Promise.resolve();
    pro = pro.then(() => {
      return new Promise(resolve => {
        if (this.data.firstAudio.sound) {
          this.playSoundPromise(this.data.firstAudio.sound).then(resolve);
        } else {
          resolve();
        }
      });
    });
    pro.then(() => {
      this.recorder.recordBtn.inputEnabled = true;
      if (this.question.soundBtn)
        this.question.soundBtn.inputEnabled = true;
    });
  }

  createAudio(index, path) {
    let audio = document.createElement('audio');
    audio.src = path;
    audio.onplay = () => {
      this.playRecordBtn.loadTexture('recordingBtn');
      this.isPlaying = true;
    };
    //注册回调函数
    audio.onended = audio.onpause = () => {
      this.playRecordBtn.loadTexture('playRecordBtn');
      this.isPlaying = false;
    };
    this.audios.set(index, audio);
  }

  get currAudio() {
    return this.audios.get(this.activeIndex);
  }

  createPlayBtn() {
    let playRecordBtn = this.createSprite(254, 524, 'playRecordBtn');
    playRecordBtn.inputEnabled = true;
    playRecordBtn.visible = false;
    playRecordBtn.events.onInputUp.add(() => {
      if (this.currAudio.paused) {
        //暂停正在播放的原文录音
        this.question.soundBtn && this.question.soundBtn.stop();
        this.currAudio.play();
      } else {
        this.currAudio.pause();
      }
    });
    this.playRecordBtn = playRecordBtn;
  }

  createSubmitBtn() {
    this.submitBtn = this.createSprite(538, 530, 'submitBtn');
    this.submitBtn.visible = false;
    this.submitBtn.events.onInputUp.add(() => {
      this.submitBtn.visible = false;
      this.recorder.destroy();
      this.playRecordBtn.destroy();
      this.question.stepToFinish();
      this.gameOver();
    });
  }

  gameOver() {
    this.finishBtn = this.createSprite(538, 530, 'finishBtn');
    this.finishBtn.inputEnabled = true;
    this.finishBtn.events.onInputUp.add(() => {
      ExitUtil.gameOver(this);
    });
  }
}

export {
  Hwtpl614
};