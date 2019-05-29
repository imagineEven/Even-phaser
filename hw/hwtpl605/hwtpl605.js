import { Courseware } from '../../framework/core/Courseware';
import StaticRes from './static-resource.json';
require('../../framework/phaserplugins/editsprite');
// require('../../framework/phaserplugins/phaserrichtext');
require('../../framework/phaserplugins/PhaserRichTextNew');
import { CONSTANT } from '../../framework/core/Constant';
import { TextureFlasher } from './../../framework/plugins/TextureFlasher';
import { XmlFlasher } from './XmlFlasher';
import { AutoWidthText } from '../../framework/plugins/AutoWidthText';
import ExitUtil from '../../framework/plugins/exitUtil';
import _ from 'lodash';
import { IndicatorHwBnt } from '../../framework/plugins/IndicatorHwBnt';

class Hwtpl605 extends Courseware {
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
        { distance: 20, height: 580}
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
    //提交按钮
    this.submit = this.createSprite(0, 0, this.staticRes.submit.images[0]);
    this.submit.flasher = new TextureFlasher(this, this.submit, this.staticRes.submit.images, { duration: 300 });
    this.submit.x = 400 - this.submit.width / 2;
    this.submit.y = 540 - this.submit.height;
    this.submit.visible = false;
    this.submit.inputEnabled = true;
    this.submit.events.onInputDown.add(() => this.checkAnswer());

    //next
    this.nextBtn = this.createSprite(0, 0, this.staticRes.btn_next);
    this.nextBtn.anchor.set(0.5, 1);
    this.nextBtn.x = 400;
    this.nextBtn.y = 540;
    this.nextBtn.visible = false;
    if (this.nowPageIndex === this.data.pages.length - 1) {
      this.nextBtn.loadTexture(this.staticRes.btn_finish_disable.image);
    }
    this.allSprite.push(this.nextBtn);

    this.createImageAndItems();
    this.createHwToolbar();
    pro.then(() => {
      this.allItems.forEach((item) => {
        item.inputEnabled = true;
      });
    });
  }

  checkAnswer() {
    let event  = this.select;
    let aduioObj = (event.isTrue ? this.staticRes.trueAudio : this.staticRes.falseAudio);
    this.util.setObjectArrayClicked(this.allItems, false);
    if (event.isTrue) {
      event.setNewBg(this.staticRes.right.xml, 'right');
      this.submit.visible = false;
      this.nextBtn.visible = true;
      if (this.nowPageIndex === this.data.pages.length - 1) {
        this.nextBtn.loadTexture(this.staticRes.btn_finish.image);
      } else {
        this.nextBtn.loadTexture(this.staticRes.btn_next.image);
      }
      this.nextBtn.inputEnabled = true;
      this.nextBtn.events.onInputUp.add(() => {
        this.goNext();
      });
    } else {
      this.answerQuestion(this.nowPageIndex, false);
      this.submit.visible = false;
      event.setNewBg(this.staticRes.wrong.xml, 'wrong');
      event.flasher = new XmlFlasher(this, event, ['normal', 'wrong'], { duration: 300, times: 6, source: this.staticRes });
      this.util.waitByPromise(500).then(() => {
        event.flasher.start();
        return this.util.waitByPromise(1800);
      }).then(() => {
        this.util.setObjectArrayClicked(this.allItems, true);
      });
    }
    this.playSoundPromiseByObject(aduioObj);
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
    this.mainSp = this.add.sprite(400, 246);
    this.mainSp.anchor.set(0.5, 0.5);
    this.allSprite.push(this.mainSp);
    this.questext = this.add.richtextNew(0, 0, unescape(this.nowPageData.sentence), { 
      font: CONSTANT.DEFAULT_FONT,
      fontSize: '26px',
      fill: '#000000' 
    });
    this.questext.lineSpacing = 0;
    this.questext.maxwidth = 680;
    this.questext.anchor.set(0, 0);
    this.questext.x = 0;
    this.questext.y = 0;
    this.mainSp.addChild(this.questext);

    let bgFrame = this.createSprite(0, 0, this.staticRes.bg_pic);
    bgFrame.y = this.questext.height + 30;
    this.mainSp.addChild(bgFrame);
    this.allSprite.push(bgFrame);

    if (this.nowPageData.pic) {
    
      this.nowPic = this.add.editsprite(0, 0, this.nowPageData.pic.image);
      this.nowPic.x = 10;
      this.nowPic.y = 10;
      this.nowPic.trueWidth = 320;
      this.nowPic.trueHeight = 240;
      bgFrame.addChild(this.nowPic);
    } else {
      bgFrame.visible = false;
    }
    let y = 0;
    let maxwidth = 0;

    let nowItems = this.nowPageData.items;
    let newItems = [];
    nowItems.forEach((item) => {
      if (item && item !== '') {
        newItems.push(item);
      }
    });
    nowItems = newItems;
    if (this.data.isRandom) {
      nowItems = _.shuffle(nowItems);
    }

    nowItems.forEach((item, index) => {
      let newObj = new AutoWidthText(this, bgFrame.width + 48, y + 25 + this.questext.height + 30, {
        key: this.staticRes.normal.xml,
        keyName: 'normal',
        style: { font: CONSTANT.DEFAULT_FONT, fontSize: '26px', fill: '#000000' },
        text: unescape(item),
        lineHeight: 30
      });
      newObj.isOption = true;
      newObj.sequence = index;
      newObj.anchor.set(0.5, 0.5);
      newObj.isTrue = (item === this.nowPageData.items[0]);
      newObj.events.onInputUp.add((event) => {
        this.select = event;
        this.submit.visible = true;
        this.submit.flasher.start();
        this.changeSprites(this.allSprite, event);
      });
      maxwidth = Math.max(newObj.textObj.width, maxwidth);
      y += newObj.height + 14;
      this.allItems.push(newObj);
      this.allSprite.push(newObj);
    });

    let itemWidth = 0;
    this.allItems.forEach((item) => {
      item.centerWidth = maxwidth;
      item.x += item.width / 2;
      item.y += (bgFrame.height - (bgFrame.height / 4) * this.allItems.length) / 2;
      itemWidth = item.width;
      this.mainSp.addChild(item);
    });

    let width = bgFrame.width + 48 + itemWidth;
    let height = bgFrame.height + this.questext.height + 30;
    this.bmp = this.make.bitmapData(width, height);
    this.mainSp.loadTexture(this.bmp);
    bgFrame.x -= this.mainSp.width * this.mainSp.anchor.x;
    bgFrame.y -= this.mainSp.height * this.mainSp.anchor.y;
    this.questext.x -= this.mainSp.width * this.mainSp.anchor.x;
    this.questext.y -= this.mainSp.height * this.mainSp.anchor.y;

    this.questext.x -= (this.questext.width - width) / 2;
    this.allItems.forEach((item) => {
      item.x -= this.mainSp.width * this.mainSp.anchor.x;
      item.y -= this.mainSp.height * this.mainSp.anchor.y;
    });
  }

  changeSprites(group, opt) {
    let sprites = group.filter(item => item.isOption);
    sprites.map(bg => {
      if (bg.sequence === opt.sequence) {
        bg.setNewBg(this.staticRes.select.xml, 'select');
      } else {
        bg.setNewBg(this.staticRes.normal.xml, 'normal');
      }
    });
  }
}

export {
  Hwtpl605
};