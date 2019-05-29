import { Courseware } from '../../framework/core/Courseware';
import { CONSTANT } from '../../framework/core/Constant';
import ExitUtil from '../../framework/plugins/exitUtil';
import { TextureFlasher } from './../../framework/plugins/TextureFlasher';
import { ScrollBar } from './ScrollBar.js';
import _ from 'lodash';
require('../../framework/phaserplugins/PhaserRichTextNew');
import staticRes from './static-resource.json';
import { IndicatorHwBnt } from '../../framework/plugins/IndicatorHwBnt';


class Hwtpl612 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = staticRes;
      this.loadPageResources(this.data, staticRes);
      this.loadHwPublicResource();
      this.util.loadSpeakerBtn();
    };

    let update = () => {
      if (this.indicatorHwBnt) {
        this.indicatorHwBnt.setVisible(this.nextBtn, this.submit);
      }
    };

    super({}, preload, () => {
      this.initQuestionList(this.data.pages.length);
      this.createUI();
      this.indicatorHwBnt = new IndicatorHwBnt(
        this,
        this.data.pages.length,
        { distance: 20, height: 580 }
      );
    }, update);

    Object.assign(data, staticRes);
    this.pageIndex = 0;
  }

  createUI() {
    this.createSprite(0, 0, this.data.background);
    let pro = Promise.resolve();
    if (!this.pageIndex) {
      pro = pro.then(() => {
        let children = [...this.optionGroup.children, ...this.speakerGroup.children];
        this.util.setObjectArrayClicked(children, false);
        return this.playSoundPromiseByObject(this.data.firstAudio).then(() => {
          this.util.setObjectArrayClicked(children, true);
        });
      });
    }

    this.submit = this.createSprite(0, 0, this.data.submit.images[0]);
    this.submit.flasher = new TextureFlasher(this, this.submit, this.data.submit.images, { duration: 300 });
    this.submit.x = 400 - this.submit.width / 2;
    this.submit.y = 590 - this.submit.height;
    this.submit.visible = false;
    this.submit.inputEnabled = true;
    this.submit.events.onInputDown.add(btn => this.checkAnswer(btn));
    this.nextBtn = this.createSprite(0, 0, this.data.button.next);
    this.nextBtn.x = 400 - this.nextBtn.width / 2;
    this.nextBtn.y = 580 - this.nextBtn.height;
    this.nextBtn.inputEnabled = true;
    this.nextBtn.events.onInputDown.add(() => {
      this.goNext();
    });
    this.nextBtn.visible = false;

    this.createHwToolbar();
    this.createQuestion(pro);
  }

  createQuestion(promise) {
    this.pageArray = [];
    this.page = this.data.pages[this.pageIndex];
    let y = 176 - 30 * this.page.options.length;
    this.background = this.createSprite(0, y, this.data.question_bg);
    this.background.x = 400 - this.background.width / 2;

    let text = this.add.richtextNew(this.background.x + 30, this.background.y + 20, unescape(this.page.text), {
      font: CONSTANT.DEFAULT_FONT,
      fontSize: '20px',
      fill: this.data.color.normal,
      maxwidth: 540,
      align: 'left',
      lineSpacing: -2
    });
    if (text.height > 170) {
      this.scrollBar = new ScrollBar(this, this.data, text, {
        id: 'rightScroll',
        canClicked: false,
        scrollX: this.background.x + this.background.width,
        rectX: this.background.x + 30,
        rectY: this.background.y + 20,
        ml: 30
      });
    }
    this.overbg = this.createSprite(0, 0, this.data.over_bg.images[this.page.options.length - 2]);

    this.addMultiArray(this.background, text, this.overbg);
    if (this.page.sound) {
      let speaker = this.util.createSpeakerAnimationBtn(720, 0, 'bigSpeaker');
      speaker.y = y + 210 - speaker.height;
      speaker.inputEnabled = !promise;
      if (promise)
        promise.then(() => {
          speaker.inputEnabled = true;
        });
      speaker.events.onInputDown.add(btn => {
        speaker.inputEnabled = false;
        btn.playSound(this.page.sound, 5).then(() => {
          speaker.inputEnabled = true;
        });
      });
      this.pageArray.push(speaker);
    }
    this.createOptions(y);
  }

  createOptions(pos) {
    this.select = undefined;
    this.optionGroup = this.add.group();
    this.speakerGroup = this.add.group();
    let options = this.page.options;
    let newOptions = [...options];
    let topY = pos + 212;
    for (let i = 0; i < options.length; i++) {
      let option = this.getRandOption(newOptions);
      let y = !i ? topY : topY + i * 60;
      let bg = this.createSprite(90, y, this.data.img_option.images[0]);
      bg.sequence = i;
      bg.isAnswer = !!option.isAnswer;
      bg.inputEnabled = true;
      bg.events.onInputDown.add(opt => {
        this.select = opt;
        this.submit.visible = true;
        this.submit.inputEnabled = true;
        this.submit.flasher.start();
        this.changeSprites(this.optionGroup, opt);
      });

      if (option.sound) {
        let speaker = this.util.createSpeakerAnimationBtn(95 + bg.width, 0, 'optionSpeaker');
        speaker.y = y + 35 - speaker.height / 2;
        speaker.inputEnabled = true;
        speaker.events.onInputDown.add(btn => {
          speaker.inputEnabled = false;
          btn.playSound(option.sound, 5).then(() => {
            speaker.inputEnabled = true;
          });
        });
        this.speakerGroup.add(speaker);
      }

      let text = this.add.richtextNew(30, 0, unescape(option.text), {
        font: CONSTANT.DEFAULT_FONT,
        fontSize: '20px',
        fill: this.data.color.normal,
        maxwidth: bg.width * 0.9,
        ellipses: true,
        align: 'left',
        lineSpacing: -10
      });
      text.y = (bg.height - text.height) / 2;
      bg.addChild(text);
      this.optionGroup.add(bg);
    }
    this.addMultiArray(this.optionGroup, this.speakerGroup);
    this.submit.bringToTop();
    this.nextBtn.bringToTop();
  }

  checkAnswer(btn) {
    let canClickArr = [...this.optionGroup.children, this.submit];
    this.util.setObjectArrayClicked(canClickArr, false);
    if (this.select.isAnswer) {
      this.playSoundPromise(this.data.right.sound);
      this.select.loadTexture(this.data.img_option.images[2]);
      btn.visible = false;
      this.nextBtn.visible = true;
      if (this.pageIndex >= this.data.pages.length - 1) {
        this.nextBtn.loadTexture(this.data.button.finish.image);
      }
    } else {
      this.answerQuestion(this.pageIndex, false);
      this.submit.flasher.stop();
      this.playSoundPromise(this.data.wrong.sound);
      this.select.loadTexture(this.data.img_option.images[3]);
      this.util.waitByPromise(2000).then(() => {
        this.util.setObjectArrayClicked(canClickArr, true);
        this.submit.visible = false;
        this.select.loadTexture(this.data.img_option.images[0]);
        this.select = undefined;
      });
    }
  }

  goNext() {
    //停止上个页面题干音频
    this.soundStopAll(false);
    this.select.loadTexture(this.data.img_option.images[0]);
    if (this.pageIndex >= this.data.pages.length - 1) {
      ExitUtil.gameOver(this);
    } else {
      this.nextBtn.visible = false;
      this.util.batchDestroy(this.pageArray);
      if (this.scrollBar) {
        this.scrollBar.clearScroll();
        this.scrollBar = undefined;
      }
      this.pageIndex++;
      this.createQuestion();
    }
    this.indicatorHwBnt.changeBtnColor(this.pageIndex);
  }

  changeSprites(group, opt) {
    group.children.map(bg => {
      let index = bg.sequence === opt.sequence ? 1 : 0;
      bg.loadTexture(this.data.img_option.images[index]);
    });
  }

  addMultiArray(...args) {
    args.map(obj => this.pageArray.push(obj));
  }

  getRandOption(arr) {
    let option = _.shuffle(arr)[0];
    _.remove(arr, item => item.text === option.text);

    return option;
  }
}

export {
  Hwtpl612
};