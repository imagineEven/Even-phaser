import { Courseware } from '../../framework/core/Courseware';
import ExitUtil from '../../framework/plugins/exitUtil';
import staticRes from './static-resource.json';
import { IndicatorHwBnt } from '../../framework/plugins/IndicatorHwBnt';

class Hwtpl610 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = staticRes;
      this.loadPageResources(this.data, staticRes);
      this.loadHwPublicResource();
      this.util.loadSpeakerBtn();
    };

    super({}, preload, () => {
      this.initQuestionList(this.data.pages.length);
      this.createUI();
    });

    this.data = Object.assign(data, staticRes);
    this.pageIndex = 0;
  }

  createUI() {
    let pro = Promise.resolve();
    if (!this.pageIndex) {
      pro = pro.then(() => {
        return this.playSoundPromiseByObject(this.data.firstAudio);
      });
    }
    this.createSprite(0, 0, this.data.background);
    this.nextBtn = this.createSprite(0, 0, this.data.button.next);
    this.nextBtn.x = 400 - this.nextBtn.width / 2;
    this.nextBtn.y = 540 - this.nextBtn.height;
    this.nextBtn.inputEnabled = true;
    this.nextBtn.events.onInputDown.add(() => {
      this.goNext();
    });
    this.nextBtn.visible = false;
    this.createHwToolbar();
    this.createQuestion(pro);
    this.indicatorHwBnt = new IndicatorHwBnt(
      this,
      this.data.pages.length,
      { distance: 20, height: 580 }
    );
  }

  createQuestion(promise) {
    this.isCheckRight = false;
    this.pageGroup = this.add.group();
    if (this.pageIndex === this.data.pages.length - 1) {
      this.nextBtn.loadTexture(this.data.button.finish.image);
    }
    let pageData = this.data.pages[this.pageIndex];
    let speaker = this.util.createSpeakerAnimationBtn(0, 70, 'bigSpeaker');
    speaker.x = 400 - speaker.width / 2;
    speaker.inputEnabled = !promise;
    if (promise)
      promise.then(() => {
        speaker.inputEnabled = true;
      });
    speaker.events.onInputDown.add(btn => {
      speaker.inputEnabled = false;
      btn.playSound(pageData.sound, 5).then(() => {
        speaker.inputEnabled = true;
        this.util.setObjectArrayClicked([this.rightBtn, this.wrongBtn], !this.isCheckRight);
      });
    });

    this.rightBtn = this.createSprite(0, 0, this.data.button.right.images[0]);
    this.wrongBtn = this.createSprite(0, 0, this.data.button.wrong.images[0]);
    this.rightBtn.anchor.setTo(0.5);
    this.wrongBtn.anchor.setTo(0.5);
    let x = (680 - this.rightBtn.width * 2 + this.rightBtn.width) / 2;
    let y = 330 + speaker.height + this.rightBtn.height / 2;
    this.rightBtn.x = x;
    this.wrongBtn.x = x + this.rightBtn.width + 120;
    this.rightBtn.y = y;
    this.wrongBtn.y = y;
    this.rightBtn.answer = true;
    this.rightBtn.images = this.data.button.right.images;
    this.wrongBtn.answer = false;
    this.wrongBtn.images = this.data.button.wrong.images;

    this.rightBtn.inputEnabled = false;
    this.rightBtn.events.onInputDown.add(btn => {
      this.util.setObjectArrayClicked([this.rightBtn, this.wrongBtn], false);
      this.checkAnswer(btn);
    });
    this.wrongBtn.inputEnabled = false;
    this.wrongBtn.events.onInputDown.add(btn => {
      this.util.setObjectArrayClicked([this.rightBtn, this.wrongBtn], false);
      this.checkAnswer(btn);
    });

    if (pageData.image) {
      let wrap = this.createSprite(270, 90 + speaker.height, this.data.wrap);
      wrap.width = 260;
      wrap.height = 200;
      let picture = this.createSprite(0, 0, pageData.image);

      this.setImgScaleToBg(picture, wrap, 1);
      wrap.addChild(picture);
      this.addMultiGroup(speaker, this.rightBtn, this.wrongBtn, wrap);
    } else {
      y = (450 - speaker.height - this.rightBtn.height) / 2;
      speaker.y = y;
      this.rightBtn.y = y + speaker.height + this.rightBtn.height / 2 + 90;
      this.wrongBtn.y = y + speaker.height + this.rightBtn.height / 2 + 90;

      this.addMultiGroup(speaker, this.rightBtn, this.wrongBtn);
    }
  }

  checkAnswer(btn) {
    let pageData = this.data.pages[this.pageIndex];
    if (btn.answer === pageData.answer) {
      this.isCheckRight = true; // 已经选择正确后就不可以再选择
      this.util.setObjectArrayClicked([this.rightBtn, this.wrongBtn], false);
      btn.loadTexture(btn.images[1]);
      this.playSoundPromise(this.data.right.sound).then(() => {
        this.nextBtn.visible = true;
      });
    } else {
      this.answerQuestion(this.pageIndex, false);
      btn.loadTexture(btn.images[2]);
      this.playSoundPromise(this.data.wrong.sound).then(() => {
        btn.loadTexture(btn.images[0]);
        this.util.setObjectArrayClicked([this.rightBtn, this.wrongBtn], true);
      });
    }
  }

  goNext() {
    //停止上个页面题干音频
    this.soundStopAll(false);
    if (this.pageIndex + 1 >= this.data.pages.length) {
      ExitUtil.gameOver(this);
    } else {
      this.nextBtn.visible = false;
      this.pageGroup.destroy();
      this.pageIndex++;
      this.createQuestion();
    }
    this.indicatorHwBnt.changeBtnColor(this.pageIndex);
  }

  setImgScaleToBg(picImg, bg, scale = 0.85) {
    let width = bg.width - 20;
    let height = bg.height - 20;
    let finishPerx = 1;
    let finishPerY = 1;
    if (Math.abs(picImg.width) > width * scale) {
      finishPerx = Math.abs(scale * width / picImg.width);
    }
    if (Math.abs(picImg.height) > height * scale) {
      finishPerY = Math.abs(scale * height / picImg.height);
    }
    picImg.scale.set(Math.min(finishPerx, finishPerY));
    picImg.x = (bg.width - picImg.width) / 2;
    picImg.y = (bg.height - picImg.height) / 2;
  }

  addMultiGroup(...args) {
    args.map(obj => this.pageGroup.add(obj));
  }
}

export {
  Hwtpl610
};