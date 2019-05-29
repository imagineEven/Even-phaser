import {
  Courseware
} from '../../framework/core/Courseware';
import StaticRes from './static-resource.json';
require('../../framework/phaserplugins/editsprite');
require('../../framework/phaserplugins/PhaserRichTextNew');
import {
  CONSTANT
} from '../../framework/core/Constant';
import {
  AutoWidthText
} from '../../framework/plugins/AutoWidthText';
import ExitUtil from '../../framework/plugins/exitUtil';
import _ from 'lodash';
import { TextureFlasher } from '../../framework/plugins/TextureFlasher';
import { IndicatorHwBnt } from '../../framework/plugins/IndicatorHwBnt';
import { isUndefined } from 'util';
import { config } from 'rx';

class Hwtpl607 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = StaticRes;
      this.loadPageResources(this.data, StaticRes);
      this.loadHwPublicResource();
      this.util.loadSpeakerBtn();
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
    this.currectSelect = '';
    this.isOver = '';
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

    this.createBtn();
    this.createImageAndItems();
    this.createHwToolbar();
    pro.then(() => {
      if (this.audioBg) {
        this.audioBg.inputEnabled = true;
      }
    });
  }

  createBtn() {
    this.nextBtn = this.createSprite(0, 0, this.staticRes.btn_next);
    this.nextBtn.anchor.set(0.5, 1);
    this.nextBtn.x = 400;
    this.nextBtn.y = 540;
    this.nextBtn.inputEnabled = true;
    this.nextBtn.visible = false;
    this.nextBtn.events.onInputUp.add(() => {
      this.goNext();
    });

    this.submit = this.createSprite(380, 444, StaticRes.yellowSubmit.image);
    this.submit.yellowSubmit = StaticRes.yellowSubmit.image;
    this.submit.greenSubmit = StaticRes.greenSubmit.image;
    this.submit.inputEnabled = true;
    this.submit.visible = false;
    this.submit.Flasher = new TextureFlasher(this, this.submit, [this.submit.yellowSubmit, this.submit.greenSubmit], { duration: 300, times: 0 });
    this.submit.events.onInputUp.add(() => {
      this.judgeOption();
    });

    this.allSprite.push(this.nextBtn);
    this.allSprite.push(this.submit);
  }

  goNext() {
    if (this.nowPageIndex + 1 >= this.data.pages.length) {
      ExitUtil.gameOver(this);
    } else {
      this.nowPageIndex++;
      this.createUI();
    }
    this.indicatorHwBnt.changeBtnColor(this.nowPageIndex);
  }

  judgeOption() {

    let aduioObj = (this.currectSelect.isTrue ? this.staticRes.trueAudio : this.staticRes.falseAudio);
    this.submit.Flasher.stop();
    this.submit.visible = false;
    this.allItems.forEach((item) => {
      item.inputEnabled = false;
    });
    if (this.currectSelect.isTrue) {
      this.currectSelect.setNewBg(this.staticRes.right.xml, 'right', this.nowPageData.isHorizontal, 3);
      this.nextBtn.visible = true;
      if (this.nowPageIndex === this.data.pages.length - 1) {
        this.nextBtn.loadTexture(this.staticRes.btn_finish.image);
      } else {
        this.nextBtn.loadTexture(this.staticRes.btn_next.image);
      }

      this.isOver = true;
      this.playSoundPromiseByObject(aduioObj);

    } else {
      this.answerError(aduioObj);
    }
  }

  answerError(aduioObj) {
    this.playSoundPromiseByObject(aduioObj);
    this.currectSelect.setNewBg(this.staticRes.wrong.xml, 'wrong', this.nowPageData.isHorizontal, 3);
    this.util.waitByPromise(200).then(() => {
      this.currectSelect.setNewBg(this.staticRes.normal.xml, 'normal', this.nowPageData.isHorizontal, 3);
      return this.util.waitByPromise(200);
    }).then(() => {
      this.currectSelect.setNewBg(this.staticRes.wrong.xml, 'wrong', this.nowPageData.isHorizontal, 3);
      return this.util.waitByPromise(200);
    }).then(() => {
      this.currectSelect.setNewBg(this.staticRes.normal.xml, 'normal', this.nowPageData.isHorizontal, 3);
    }).then(() => {
      this.allItems.forEach((item) => {
        item.inputEnabled = true;
      });
      this.isOver = false;
    });
    this.answerQuestion(this.nowPageIndex, false);
  }

  //创建图片与选项
  createImageAndItems() {
    this.allItems = [];
    this.mainSp = this.add.sprite(400, 240);
    this.mainSp.anchor.set(0.5, 0.5);
    this.allSprite.push(this.mainSp);
    let audioBgWidth = 0;
    if (this.nowPageData.sound) {
      this.audioBg = this.util.createSpeakerAnimationBtn(0, 0, 'bigSpeaker');
      this.audioBg.events.onInputUp.add(() => {
        this.allItems.forEach((item) => {
          item.inputEnabled = false;
        });
        this.audioBg.playSound(this.nowPageData.sound, 5).then(() => {
          this.allItems.forEach((item) => {
            if (!this.isOver) {
              item.inputEnabled = true;
            }
          });
        });
      });
      this.mainSp.addChild(this.audioBg);
      audioBgWidth = this.audioBg.width;
      this.allSprite.push(this.audioBg);
    }
    let height = 0;
    let quetextHeight = 0;
    let quetextWidth = 0;
    if (this.nowPageData.sentence) {
      this.nowPageData.sentence = this.nowPageData.sentence.replace(/_+/g, '<span style = "text-decoration:underline;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
      this.questext = this.add.richtextNew(audioBgWidth + 20, 0, unescape(this.nowPageData.sentence), {
        font: CONSTANT.DEFAULT_FONT,
        fontSize: '26px',
        fill: '#000000',
      });
      this.questext.lineHeight = '55px';
      this.questext.lineSpacing = 0;
      this.questext.maxwidth = 600;
      this.allSprite.push(this.questext);
      this.mainSp.addChild(this.questext);
      quetextHeight = this.questext.height + 30;
      quetextWidth = this.questext.width;
    } else if (this.audioBg) {
      quetextHeight = this.audioBg.height + 30;
    }

    height = quetextHeight;

    let y = 0;
    let x = 0;
    let maxwidth = 0;
    let maxheight = 0;
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

    nowItems.forEach((item) => {
      let newObj = new AutoWidthText(this, x, y + quetextHeight, {
        key: this.staticRes.normal.xml,
        keyName: 'normal',
        lineHeight: 30,
        paddingLeft: 10,
        paddingRight: 10,
        style: {
          font: CONSTANT.DEFAULT_FONT,
          fontSize: '28px',
          fill: '#000000'
        },
        text: unescape(item)
      });

      newObj.y += newObj.height / 2;
      newObj.x += newObj.width / 2;
      newObj.anchor.set(0.5, 0.5);
      newObj.isTrue = (item === this.nowPageData.items[0]);

      newObj.events.onInputUp.add((event) => {
        this.allItems.forEach((item) => {
          item.setNewBg(this.staticRes.normal.xml, 'normal', this.nowPageData.isHorizontal, 3);
        });
        event.setNewBg(this.staticRes.select.xml, 'select', this.nowPageData.isHorizontal, 3);
        this.currectSelect = event;

        // console.log(this.submit.visible)

        if (this.submit.visible === false) {

          this.submit.visible = true;
          this.submit.Flasher.start();
        }
      });

      maxwidth = Math.max(newObj.textObj.width, maxwidth);

      if (this.nowPageData.isHorizontal) {
        x += newObj.bmp.width + 30;
        maxheight = Math.max(newObj.textObj.height, maxheight);
      } else {
        y += newObj.height + 14;
        height += newObj.height;
      }
      this.allItems.push(newObj);
      this.allSprite.push(newObj);
    });
    height += maxheight;
    let minx = 0;
    let maxx = 0;

    this.allItems.forEach((item, index) => {

      if (this.nowPageData.isHorizontal) {
        item.centerWidth = maxwidth;
        if (this.nowPageData.isHorizontal) {
          item.textObj.x += (item.centerWidth - item.textObj.width) / 2;
        }
        item.x = index * (item.width + 30);
        item.x += item.width / 2;
        minx = Math.min(item.x - item.width / 2, minx);
        maxx = Math.max(item.x + item.width / 2, maxx);
      } else {
        item.x += (maxwidth - item.textObj.width) / 2;
        item.centerWidth = maxwidth;
        item.x -= item.width / 2;
      }
      this.mainSp.addChild(item);
    });

    if (this.nowPageData.isHorizontal) {
      this.allItems.forEach((item) => {
        item.x -= (maxx - minx) / 2;
      });
    }

    let width = Math.max(quetextWidth + 20 + audioBgWidth, 600 + 20 + audioBgWidth);
    this.bmp = this.make.bitmapData(width, height);
    this.mainSp.loadTexture(this.bmp);

    let offset = (width - (quetextWidth + 20 + audioBgWidth)) / 2;
    if (this.questext) {
      this.questext.x -= this.mainSp.width * this.mainSp.anchor.x;
      this.questext.y -= this.mainSp.height * this.mainSp.anchor.y;
      this.questext.x += offset;
    }

    if (this.audioBg) {
      this.audioBg.x -= this.mainSp.width * this.mainSp.anchor.x;
      this.audioBg.y -= this.mainSp.height * this.mainSp.anchor.y;
      this.audioBg.x += offset;
      if (this.questext) {
        this.audioBg.y += (this.questext.height - this.audioBg.height) / 2 - 3;
      }
    }
    this.allItems.forEach((item) => {
      item.y -= this.mainSp.height * this.mainSp.anchor.y;
    });

    if (!this.nowPageData.sound) {
      this.allItems.forEach((item) => {
        if (!this.isOver) {
          item.inputEnabled = true;
        }
      });
    }
  }
}

export {
  Hwtpl607
};