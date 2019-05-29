import { Courseware } from '../../framework/core/Courseware';
import StaticRes from './static-resource.json';
require('../../framework/phaserplugins/editsprite');
require('../../framework/phaserplugins/phaserrichtext');
import ExitUtil from '../../framework/plugins/exitUtil';
import { CONSTANT } from '../../framework/core/Constant';
import { IndicatorHwBnt } from '../../framework/plugins/IndicatorHwBnt';

class Hwtpl606 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = StaticRes;
      this.loadPageResources(this.data, StaticRes);
      this.loadHwPublicResource();
    };

    super({}, preload, () => {
      this.initQuestionList(this.data.pages.length);
      this.createUI();
      this.indicatorHwBnt = new IndicatorHwBnt(
        this,
        this.data.pages.length,
        { distance: 20, height: 580 }
      );
    });
    this.nowPageIndex = 0;
  }

  createUI() {
    this.util.batchDestroy(this.allSprite);

    let pro = Promise.resolve();
    if (this.nowPageIndex === 0) {
      pro = pro.then(() => {
        return this.playSoundPromiseByObject(this.data.firstAudio);
      });
    }

    this.nowPageData = this.data.pages[this.nowPageIndex];
    this.allSprite = [];
    let bg = this.createSprite(0, 0, this.staticRes.bg);
    this.allSprite.push(bg);

    this.nextBtn = this.createSprite(0, 0, this.staticRes.btn_next_disable);
    this.nextBtn.anchor.set(0.5, 1);
    this.nextBtn.x = 400;
    this.nextBtn.y = 540;
    if (this.nowPageIndex === this.data.pages.length - 1) {
      this.nextBtn.loadTexture(this.staticRes.btn_finish_disable.image);
    }
    this.allSprite.push(this.nextBtn);
    this.createImageAndItems();
    this.createHwToolbar();
    pro.then(() => {
      this.trueBtn.inputEnabled = true;
      this.falseBtn.inputEnabled = true;
    });
  }

  goNext() {
    if (this.nowPageIndex + 1 >= this.data.pages.length) {
      //没有题目了
      ExitUtil.gameOver(this);
    } else {
      this.nowPageIndex++;
      this.createUI();
    }
    this.indicatorHwBnt.changeBtnColor(this.nowPageIndex);
  }

  //创建图片与选项
  createImageAndItems() {
    this.allItems = [];
    this.mainSp = this.add.sprite(400, 240);
    this.mainSp.anchor.set(0.5, 0.5);
    this.allSprite.push(this.mainSp);

    this.allSprite.push(this.audioBg);
    this.questext = this.add.richtext(0, 0, unescape(this.nowPageData.sentence), { font: CONSTANT.DEFAULT_FONT, fontSize: '26px', fill: '#000000' });
    this.questext.lineSpacing = 0;
    this.questext.maxwidth = 680;
    this.allSprite.push(this.questext);
    this.mainSp.addChild(this.questext);

    let height = this.questext.height;
    let maxwidth = 0;
    if (this.nowPageData.image) {
      //有图片
      height += 30;
      this.bgFrame = this.createSprite(0, height, this.staticRes.bg_pic);
      this.bgFrame.anchor.set(0.5, 0);
      this.allSprite.push(this.bgFrame);
      this.mainSp.addChild(this.bgFrame);

      this.nowPic = this.add.editsprite(0, 0, this.nowPageData.image);
      this.nowPic.x = 0;
      this.nowPic.anchor.set(0.5, 0);
      this.nowPic.y = 10;
      this.nowPic.trueWidth = 240;
      this.nowPic.trueHeight = 180;
      this.bgFrame.addChild(this.nowPic);

      height += this.bgFrame.height + 40;
    } else {
      height += 90;
    }
    this.trueBtn = this.createSprite(0, height, this.staticRes.btn_left_normal);
    this.trueBtn.anchor.set(0.5, 0.5);
    this.trueBtn.x -= 60 + this.trueBtn.width / 2;
    this.trueBtn.y = height + this.trueBtn.height / 2;
    this.trueBtn.events.onInputUp.add((event) => {
      if (!this.nowPageData.isRight) {
        this.answerQuestion(this.nowPageIndex, false);
        event.loadTexture(this.staticRes.btn_left_wrong.image);
      } else {
        event.loadTexture(this.staticRes.btn_left_highlight.image);
      }
      this.answerQus(this.nowPageData.isRight, event);
    });
    this.allSprite.push(this.trueBtn);
    this.mainSp.addChild(this.trueBtn);

    this.falseBtn = this.createSprite(0, height, this.staticRes.btn_right_normal);
    this.falseBtn.anchor.set(0.5, 0.5);
    this.falseBtn.x = 60 + this.falseBtn.width / 2;
    this.falseBtn.y = height + this.falseBtn.height / 2;
    this.falseBtn.events.onInputUp.add((event) => {
      if (this.nowPageData.isRight) {
        event.loadTexture(this.staticRes.btn_right_wrong.image);
      } else {
        event.loadTexture(this.staticRes.btn_right_highlight.image);
      }
      this.answerQus(!this.nowPageData.isRight, event);
    });
    this.allSprite.push(this.falseBtn);
    this.mainSp.addChild(this.falseBtn);

    height += this.trueBtn.height;

    this.allItems.forEach((item) => {
      item.centerWidth = maxwidth;
      item.x += item.width / 2;
      this.mainSp.addChild(item);
    });

    let width = Math.max(this.questext.width, 680);
    this.bmp = this.make.bitmapData(width, height);
    this.mainSp.loadTexture(this.bmp);
    this.questext.x -= this.mainSp.width * this.mainSp.anchor.x;
    this.questext.y -= this.mainSp.height * this.mainSp.anchor.y;

    this.trueBtn.y -= this.mainSp.height * this.mainSp.anchor.y;
    this.falseBtn.y -= this.mainSp.height * this.mainSp.anchor.y;
    if (this.bgFrame) {
      this.bgFrame.y -= this.mainSp.height * this.mainSp.anchor.y;
    }

    let offset = (width - (this.questext.width)) / 2;
    this.questext.x += offset;
    this.allItems.forEach((item) => {
      item.x -= item.width / 2;
      item.y -= this.mainSp.height * this.mainSp.anchor.y;
    });
  }

  answerQus(isTure, event) {
    let aduioObj = (isTure ? this.staticRes.trueAudio : this.staticRes.falseAudio);
    event.inputEnabled = false;
    if (isTure) {
      this.trueBtn.inputEnabled = false;
      this.falseBtn.inputEnabled = false;
      this.nextBtn.inputEnabled = true;
      if (this.nowPageIndex === this.data.pages.length - 1) {
        this.nextBtn.loadTexture(this.staticRes.btn_finish.image);
      } else {
        this.nextBtn.loadTexture(this.staticRes.btn_next.image);
      }
      this.nextBtn.events.onInputUp.add(() => {
        this.goNext();
      });
    }
    this.playSoundPromiseByObject(aduioObj).then(() => {
      if (!isTure) {
        event.inputEnabled = false;
      }
    });
  }
}

export {
  Hwtpl606
};