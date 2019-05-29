import {
  Courseware
} from '../../framework/core/Courseware';
import ExitUtil from '../../framework/plugins/exitUtil';
import staticRes from './static-resource.json';
import {
  DomTextWithInput
} from './domTextWithInput.js';
import {
  Keyboard
} from './keyboard.js';
import keyboardRes from './keyboard.json';
import _ from 'lodash';
import {
  IndicatorHwBnt
} from '../../framework/plugins/IndicatorHwBnt';


const boxContainerStyle = {
  padding: '2px 40px',
  fontSize: '28px',
  fontFamily: 'Century Gothic',
  lineHeight: '42px',
  overflowY: 'auto',
  borderRadius: '10px',
  transition: 'top 0.5s linear'
};
class Hwtpl611 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = staticRes;
      this.loadPageResources(this.data, staticRes, keyboardRes);
      this.loadHwPublicResource();
      boxContainerStyle.backgroundImage = `url(${this.util.fullUrl(staticRes.imageObj.bg_text_normal)})`; //设置背景
      this.util.loadSpeakerBtn();
    };

    let update = () => {
      if (this.indicatorHwBnt) {
        this.indicatorHwBnt.setVisible(this.submitBtn);
      }
    };

    super({}, preload, () => {
      this.createSprite(0, 0, 'bg');
      this.toolbar = this.createHwToolbar();
      this.initQuestionList(this.data.pages.length);
      if (this.data.isRandom) {
        this.data.pages = _.shuffle(this.data.pages);
      }
      this.createUI();
    }, update);
    this.pageIndex = 0;
  }

  createUI() {
    let pro = Promise.resolve();
    if (!this.pageIndex) {
      pro = pro.then(() => {
        return this.playSoundPromiseByObject(this.data.firstAudio);
      });
    }
    this.submitBtn = this.createSprite(0, 518, 'icon_submit_02');
    pro.then(() => {
      this.submitBtn.inputEnabled = true;
    });
    this.submitBtn.visible = false;
    this.submitBtn.events.onInputDown.add((btn) => {
      btn.loadTexture('icon_submit_01');
    });
    this.submitBtn.events.onInputUp.add(btn => {
      btn.inputEnabled = false;
      btn.loadTexture('icon_submit_02');
      this.question.authencationAnswer();
    });
    this.submitBtn.x = (this.width - this.submitBtn.width) / 2;

    this.nextBtn = this.createSprite(this.width / 2, 518, 'btn_next');
    this.nextBtn.anchor.x = 0.5;
    this.nextBtn.visible = false;
    this.nextBtn.events.onInputDown.add((btn) => {
      btn.inputEnabled = false;
      btn.visible = false;
      if (btn.finished) {
        ExitUtil.gameOver(this);
        return;
      }
      this.goNext();
    });
    this.indicatorHwBnt = new IndicatorHwBnt(
      this,
      this.data.pages.length, {
        distance: 20,
        height: 580
      }
    );
    //创建键盘
    this.createEven();
    //创建题干
    this.createStem();
  }

  //创建题干
  createStem() {
    boxContainerStyle.top = '46%';
    this.submitBtn.y = this.nextBtn.y = 518;

    this.currentData = this.data.pages[this.pageIndex];
    if (this.imageSoundGroup) {
      this.imageSoundGroup.removeAll(true);
    }
    if (this.question) {
      this.question.destory();
    }

    let imageSoundGroup = this.add.group();
    if (this.currentData.image) {
      let image = this.util.createImageWithBg(this, 'bg_pic', this.currentData.image, 232 / 246);
      image.x = (this.width - image.width) / 2;
      imageSoundGroup.add(image);
      imageSoundGroup.image = image;
      if (this.currentData.imageSound && this.currentData.imageSound.sound) {
        let imageSpeaker = this.util.createSpeakerAnimationBtn(image.width - 10, image.height - 10, 'smallSpeaker');
        imageSpeaker.anchor.set(1);
        image.addChild(imageSpeaker);
        imageSpeaker.inputEnabled = true;
        imageSoundGroup.imageSound = imageSpeaker;
        let playSound = () => {
          imageSpeaker.playSound(this.currentData.imageSound.sound, 5);
        };
        imageSpeaker.events.onInputDown.add(() => {
          playSound();
        });
        image.inputEnabled = true;
        image.events.onInputDown.add(() => {
          playSound();
        });
      }
      imageSoundGroup.y = 70;
    }
    //播放题干音频
    if (this.currentData.sound) {
      let speaker = this.util.createSpeakerAnimationBtn(0, 0, 'bigSpeaker');
      speaker.anchor.set(0.5);
      imageSoundGroup.add(speaker);
      speaker.inputEnabled = true;
      imageSoundGroup.sound = speaker;
      speaker.events.onInputDown.add(() => {
        speaker.playSound(this.currentData.sound, 5).then(() => {
          this.question.setEnable(true);
        });
      });
      //设置位置
      if (!imageSoundGroup.image) {
        speaker.x = this.width / 2;
        speaker.y = 142 + speaker.height / 2;
        boxContainerStyle.top = '34.67%';
        this.submitBtn.y = this.nextBtn.y = 446;
      } else {
        speaker.x = imageSoundGroup.image.x - 40 - speaker.width / 2;
        speaker.y = imageSoundGroup.height / 2 - speaker.height / 2;
      }
    }

    this.imageSoundGroup = imageSoundGroup;

    //拼接题目和答案
    let questionText = this.currentData.question.reduce((prev, next) => {
      return prev + next.text.toString() + '\n';
    }, '');
    let questionAnswer = this.currentData.question.reduce((prev, next) => {
      return prev.concat(next.answer);
    }, []);
    this.question = new DomTextWithInput(this, questionText, questionAnswer, boxContainerStyle, {
      focus: (DI) => {
        this.keyboard.switchKeyBoards();
        if (this.imageSoundGroup.image) {
          this.exChangeLayout(-260);
        } else {
          this.exChangeLayout(-188);
        }
        DI.setStyle({
          top: '4%'
        });
      },
      answerRight: (DI) => { //回答正确
        if (this.pageIndex === this.data.pages.length - 1) {
          this.nextBtn.loadTexture('btn_finish');
          this.nextBtn.finished = true;
        }
        this.playSoundPromise('correctSound').then(() => {
          this.submitBtn.visible = false;
          this.nextBtn.visible = true;
          this.nextBtn.inputEnabled = true;
          DI.setStyle({
            boxShadow: '0 0 15px 3px #68b1e0'
          });
          DI.setEnable(false);
          this.keyboard.switchKeyBoards();
          this.recoverLayout();
        });
      },
      answerWrong: () => { //回答错误
        this.answerQuestion(this.pageIndex, false);
        this.playSoundPromise('errorSound');
      },
      fillDone: (b) => {
        this.submitBtn.visible = !!b;
        this.submitBtn.inputEnabled = !!b;
      }
    }, this.currentData.type);

    if (!this.imageSoundGroup.imageSound && !this.imageSoundGroup.sound) {
      this.question.setEnable(true);
    }

    this.toolbar.addEvents({
      'showExit': () => {
        this.question && this.question.setStyle({
          display: 'none'
        });
      },
      'hideExit': () => {
        this.question && this.question.setStyle({
          display: 'block'
        });
      }
    });
  }

  createEven() {
    let keyboard = new Keyboard(this, (keyInfo) => {
      this.keyboardInput(keyInfo);
    }, () => {
      this.recoverLayout();
    });
    keyboard.createKeyBords(0, 320);
    this.keyboard = keyboard;
  }

  recoverLayout() {
    if (this.imageSoundGroup.image) {
      this.exChangeLayout(+260);
    } else {
      this.exChangeLayout(+188);
    }
    this.question.setStyle(boxContainerStyle);
    this.question.removeCursor();
  }

  exChangeLayout(step) {
    this.add.tween(this.imageSoundGroup).to({
      y: this.imageSoundGroup.y + step,
    }, 500, 'Linear').start();
    this.add.tween(this.submitBtn).to({
      y: this.submitBtn.y + step
    }, 500, 'Linear').start();
    this.add.tween(this.nextBtn, {
      y: this.nextBtn.y + step
    }, 500, 'Linear').start();
  }

  goNext() {
    this.pageIndex++;
    this.createStem();
    this.indicatorHwBnt.changeBtnColor(this.pageIndex);
  }

  keyboardInput(keyInfo) {
    let keyCode = Number(keyInfo.keyCode);
    if (keyCode > 100 && keyCode < 127) {
      this.question.inputText(keyInfo.key);
    } else if (keyCode === 402) {
      this.question.backSpace();
    } else if (keyCode === 405) {
      this.question.moveCursor(1);
    } else if (keyCode === 404) {
      this.question.moveCursor(-1);
    } else if (keyCode === 406) {
      this.question.space();
    } else if (keyCode === 407) {
      this.question.enter();
    }
  }

}

export {
  Hwtpl611
};