import { Courseware } from '../../framework/core/Courseware';
import _ from 'lodash';
import Gray from './../../framework/core/filter/gray.js';
import Transparent from './../../framework/core/filter/transparent.js';
import { } from './../../framework/core/filters/ColorToNewColor.js';
import { CONSTANT } from '../../framework/core/Constant';
require('../../framework/phaserplugins/phaserrichtext');
import ExitUtil from '../../framework/plugins/exitUtil';
import StaticRes from './static-resource.json';
import { TextureFlasher } from '../../framework/plugins/TextureFlasher';
import {IndicatorHwBnt} from '../../framework/plugins/IndicatorHwBnt';

class Hwtpl601 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = StaticRes;
      this.loadPageResources(this.data, StaticRes);
      this.loadHwPublicResource();
      this.util.loadSpeakerBtn();
      Transparent.load();
      Gray.load();
    };
    
    super({}, preload, () => {
      this.gray = this.add.filter('Gray');
      this.transparent = this.add.filter('Transparent');
      this.transparent = this.add.filter('Transparent');
      this.createUI();
    });
  }

  createUI() {
    this.bg = this.add.sprite(0, 0, StaticRes.bg.image);
    this.indicatorHwBnt = new IndicatorHwBnt(
      this,
      this.data.page.length,
      { distance: 20, height: 580 }
    );
    this.lastIndex = this.data.page.length;
    this.pageIndex = 0;
    this.selectItem = undefined;
    this.initQuestionList(this.data.page.length);
    this.createPage(this.pageIndex);
  }

  createPage(pageIndex) {
    this.util.batchDestroy(this.optionImageArr, this.optionSpriteArr, this.btnNext, this.audioBg, this.title, this.speakerBtn);
    this.optionsNum = this.data.page[pageIndex].options.length;
    this.currentStatic = this.data.page[pageIndex];
    this.createOptions();
    this.createOptionImage();
    this.createBtn();  
    this.playFirstAudio();
    this.createHwToolbar();
  }

  createBtn() {
    if (this.finish) {
      this.btnNext = this.createImgSprite(this.staticRes.position.btn, this.staticRes.btn_finish);
    } else {
      this.btnNext = this.createImgSprite(this.staticRes.position.btn, this.staticRes.btn_next);
    }
    this.btnNext.inputEnabled = true;
    this.btnNext.visible = false;
    this.btnNext.events.onInputUp.add(this.btnUpEvent, this);
    this.submit = this.createSprite(380, 444, StaticRes.yellowSubmit.image);
    this.submit.yellowSubmit = StaticRes.yellowSubmit.image;
    this.submit.greenSubmit = StaticRes.greenSubmit.image;
    this.submit.inputEnabled = true;
    this.submit.visible = false;
    this.submit.Flasher = new TextureFlasher(this, this.submit, [this.submit.yellowSubmit, this.submit.greenSubmit], { duration: 300, times: 0 });
    this.submit.events.onInputUp.add(() => {
      this.submit.inputEnabled = false;
      this.submit.Flasher.stop();
      this.judgeOption();
    });
  }

  playFirstAudio() {
    this.pageIndex === 0 ? this.playMultiPromise([this.data.firstAudio.sound]) : undefined;
    this.createTopTitle();
  }

  createTopTitle() {
    this.stopOptionSound = 0;
    if (this.currentStatic.title) {
      let exampleFont = { font: CONSTANT.DEFAULT_FONT, fill: '#000', fontSize: '32px', fontWeight: 100 };
      this.title = this.add.richtext(400, 100, unescape(this.currentStatic.title), exampleFont);
      this.title.anchor.set(0.5, 0.5);
      this.optionIsClick();
    } else {
      this.speakerBtn = this.util.createSpeakerAnimationBtn(this.staticRes.position.audiobg.x, this.staticRes.position.audiobg.y, 'bigSpeaker');
      this.speakerBtn.realSound = this.currentStatic.contentSound.sound;
      this.speakerBtn.inputEnabled = true;
      this.speakerBtn.events.onInputUp.add((event) => {
        event.playSound(event.realSound, 5).then(() => {
          this.optionIsClick();
        });
      });
    }
  }

  audioBgUpEvent() {
    this.audioBg.play('default', 10, true);
    this.util.setObjectArrayClicked(this.optionSpriteArr, false);
    this.playMultiPromise([this.currentStatic.contentSound.sound]).then(() => {
      this.audioBg.animations.stop(false);
    });
  }

  optionIsClick() {
    this.optionSoundFlag = [];
    this.optionSpriteArr.forEach((item, index) => {
      item.inputEnabled = true;
      item.clickIndex = index;
      this.optionSoundFlag.push(0);
      item.events.onInputUp.add(this.optionUpEvent, this);
    });
  }

  optionUpEvent(item) {//pendding
    this.changeSelectState(item);
    this.selectItem = item;
    if (item.speakerBtn) {
      this.optionSoundFlag[item.clickIndex] = 1;
      this.playOptionSound(item);
      this.submit.Flasher.start();
    } else {
      this.playSoundPromiseByObject('');
      if (this.submit.visible !== true) {
        this.submit.visible = true;
        this.submit.Flasher.start();
      }
    }
  }

  playOptionSound(item) {
    this.optionSoundFlag.forEach((i, index)=>{
      if(index!==item.clickIndex){
        this.optionSoundFlag[index]=0;
      }
    });
    item.speakerBtn.playSound(item.speakerBtn.realSound, 5).then(() => {
      if (this.optionSoundFlag[item.clickIndex] === 0) {
        throw new Error();
      }
      this.optionSoundFlag[item.clickIndex] = 0;
      if (this.submit.visible !== true) {
        this.submit.visible = true;
      }
    }).catch(()=>{
    });
  }

  changeSelectState(optionItem) {
    this.optionSpriteArr.forEach(item => {
      if (optionItem.index === item.index) {
        item.loadTexture(item.selectImage);
      } else {
        item.loadTexture(item.normalImage);
      }
    });
  }

  judgeOption() {
    if (this.selectItem.children[0].JudgeIndex === 0) {
      this.answerAright(this.selectItem);
    } else {
      this.answerQuestion(this.pageIndex, false);
      this.answerErr(this.selectItem);
    }
  }

  answerErr(item) {
    this.util.setObjectArrayClicked(this.optionSpriteArr, false);
    this.playMultiPromise([this.staticRes.playSound.err.sound]).then(() => {
    });
    this.errorEffect(item).then(() => {
      this.submit.inputEnabled = true;
      this.submit.visible = false;
      this.util.setObjectArrayClicked(this.optionSpriteArr, true);
      this.selectItem = undefined;
    });
  }

  errorEffect(item) {
    item.children[0].filters = [this.gray];
    item.loadTexture(this.staticRes.img_pic_wrong.image);
    return this.util.waitByPromise(300).then(() => {
      item.children[0].filters = undefined;
      item.loadTexture(this.staticRes.img_pic_normal.image);
      return this.util.waitByPromise(300);
    }).then(() => {
      item.children[0].filters = [this.gray];
      item.loadTexture(this.staticRes.img_pic_wrong.image);
      return this.util.waitByPromise(300);
    }).then(() => {
      item.children[0].filters = undefined;
      item.loadTexture(this.staticRes.img_pic_normal.image);
      return this.util.waitByPromise(0);
    });
  }

  answerAright(item) {
    this.util.setObjectArrayClicked(this.optionSpriteArr, false);
    item.loadTexture(this.staticRes.img_pic_highlight.image);
    this.submit.visible = false;
    this.playMultiPromise([this.staticRes.playSound.right.sound]).then(() => {
      this.submit.inputEnabled = true;
      this.submit.visible = false;
      this.btnNext.visible = true;
      this.removeAllOptionClick();
    });
  }

  removeAllOptionClick() {
    if (this.speakerBtn) {
      this.speakerBtn.events.onInputUp.removeAll();
      this.speakerBtn.events.onInputUp.add((event) => {
        event.playSound(event.realSound, 5);
      });
    }
    this.optionSpriteArr.forEach(item => {
      item.events.onInputUp.removeAll();
      item.inputEnabled = true;
      item.events.onInputUp.add(item => {
        if (item.speakerBtn) {
          item.speakerBtn.playSound(item.speakerBtn.realSound, 5);
        }
      });
    });
  }

  btnUpEvent() {
    if (this.pageIndex === this.lastIndex - 1) {
      ExitUtil.gameOver(this);
    } else {
      this.pageIndex++;
      this.finish = this.pageIndex === this.lastIndex - 1 ? true : false;
      this.createPage(this.pageIndex);
    }
    this.indicatorHwBnt.changeBtnColor(this.pageIndex);
  }

  createImgSprite(position, image, isIn = false) {
    let sprite = this.createSprite(position.x, position.y, image);
    sprite.anchor.set(0.5);
    if (isIn) {
      this.mainGroup.add(sprite);
    }
    return sprite;
  }

  createOptionImage() {
    this.optionImageArr = [];
    let newOptionSpriteArr = this.data.isRandom ? _.shuffle(this.optionSpriteArr) : this.optionSpriteArr;
    this.data.page[this.pageIndex].options.forEach((item, index) => {
      this.nowPic = this.createSprite(0, 0, item.image);
      this.setImgScaleToBg(this.nowPic, newOptionSpriteArr[index]);
      newOptionSpriteArr[index].addChild(this.nowPic);
      this.createImageSpeaker(newOptionSpriteArr[index], item);
      this.nowPic.anchor.set(0.5, 0.5);
      this.nowPic.JudgeIndex = index;
      this.optionImageArr.push(this.nowPic);
    });
  }

  createImageSpeaker(parent, option) {
    if (option.sound) {
      parent.speakerBtn = this.util.createSpeakerAnimationBtn(55, 40, 'smallSpeaker');
      parent.speakerBtn.realSound = option.sound;
      parent.addChild(parent.speakerBtn);
    }
  }

  createOptions() {
    this.getoptionPositonArr();
    this.optionNormalImg = StaticRes.img_pic_normal.image;
    if (this.optionSpriteArr) {
      for (let item of this.optionSpriteArr) {
        item.destroy();
      }
    }
    this.optionSpriteArr = [];
    this.optionPositonArr.forEach((position, index) => {
      let optionSprite = this.createImgSprite({ x: position[0], y: position[1] }, this.optionNormalImg);
      optionSprite.selectImage = StaticRes.img_pic_select.image;
      optionSprite.normalImage = StaticRes.img_pic_normal.image;
      optionSprite.highlightImage = StaticRes.img_pic_highlight.image;
      optionSprite.anchor.set(0.5);
      optionSprite.index = index;
      this.optionSpriteArr.push(optionSprite);
    });
  }

  getoptionPositonArr() {
    this.staticRes.position.option.forEach(item => {
      if (item.sign === this.optionsNum) {
        this.optionPositonArr = item.value;
      }
    });
  }

  setImgScaleToBg(picImg, bg, scale = 0.85) {
    let finishPerx = 1;
    let finishPerY = 1;
    if (Math.abs(picImg.width) > bg.width * scale) {
      finishPerx = Math.abs(scale * bg.width / picImg.width);
    }
    if (Math.abs(picImg.height) > bg.height * scale) {
      finishPerY = Math.abs(scale * bg.height / picImg.height);
    }
    picImg.scale.set(Math.min(finishPerx, finishPerY));
  }
  
}

export {
  Hwtpl601
};