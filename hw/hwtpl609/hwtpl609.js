import {
  Courseware
} from '../../framework/core/Courseware';
import StaticRes from './static-resource.json';
import { ObjectPropertyFlasher } from '../../framework/plugins/ObjectPropertyFlasher';
import $ from 'jquery';
import ExitUtil from '../../framework/plugins/exitUtil';
import _ from 'lodash';
import { IndicatorHwBnt } from '../../framework/plugins/IndicatorHwBnt';
const LETTER_FONT = {
  font: 'Century Gothic',
  fontSize: 30,
  fill: '#000'
};
const BorderTexture = ['img_word_normal', 'img_word_success'];
class Hwtpl609 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = StaticRes;
      this.loadPageResources(this.data, StaticRes);
      this.loadHwPublicResource();
      this.util.loadSpeakerBtn(); //载入speaker
    };

    super({}, preload, () => {
      this.initQuestionList(this.data.pages.length);
      this.createUI();
      this.playSoundPromiseByObject(this.data.firstAudio);
    });
    this.nowPageIndex = 0;
    this.bCenterPoint = []; //存储边框中心点
  }

  createUI() {
    this.createSprite(0, 0, 'bg');
    this.createHwToolbar();
    if (this.data.isRandom) {
      this.data.pages = _.shuffle(this.data.pages);
    }
    this.initPage();
    this.indicatorHwBnt = new IndicatorHwBnt(
      this,
      this.data.pages.length,
      { distance: 20, height: 580 }
    );
  }

  initPage() {
    this.currentData = this.data.pages[this.nowPageIndex];
    this.questionGroup && this.questionGroup.destroy();
    this.questionGroup = this.add.group();
    let questionAndSound = this.createStem();
    let answerArea = this.createFillArea();
    answerArea.y = questionAndSound.height + 40;
    this.questionGroup.add(questionAndSound);
    this.questionGroup.add(answerArea);
    //set layout
    this.questionGroup.y = (this.height - 20 - this.questionGroup.height) / 2;
    this.submitBtn = this.createSprite(this.width / 2, 484, 'icon_submit_02');
    this.submitBtn.anchor.x = 0.5;
    this.submitBtn.inputEnabled = true;
    this.submitBtn.visible = false;
    this.submitBtn.events.onInputDown.add((btn) => {
      btn.loadTexture('icon_submit_01');
      btn.inputEnabled = false;
      this.submitFill();
    });
    this.nextBtn = this.createSprite(this.width / 2, 492, 'btn_next');
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
  }

  //创建题干
  createStem() {
    let data = this.currentData;
    let imageAndSound = this.add.group();
    if (data.sound) {
      let bigSpeaker = this.util.createSpeakerAnimationBtn(0, 0, 'bigSpeaker');
      bigSpeaker.inputEnabled = true;
      bigSpeaker.events.onInputDown.add((e) => {
        e.playSound(data.sound, 5);
      });
      bigSpeaker.anchor.x = 0.5;
      imageAndSound.add(bigSpeaker);
      imageAndSound.sound = bigSpeaker;
    }
    if (data.question.image) {
      let imageWithBg = this.createImageWithBg('bg_pic', data.question.image, 272 / 288);
      if (data.question.sound) {
        let smallSpeaker = this.util.createSpeakerAnimationBtn(0, 0, 'smallSpeaker');
        smallSpeaker.y = imageWithBg.height - 10;
        smallSpeaker.x = imageWithBg.width - 10;
        smallSpeaker.anchor.set(1);
        smallSpeaker.inputEnabled = true;
        smallSpeaker.events.onInputDown.add(e => {
          e.playSound(data.question.sound, 5);
        });
        imageWithBg.addChild(smallSpeaker);
        imageWithBg.inputEnabled = true;
        imageWithBg.events.onInputDown.add(() => {
          this.playSoundPromise(data.question.sound);
        });
      }
      imageAndSound.add(imageWithBg);
      imageAndSound.image = imageWithBg;
    }
    //元素定位
    if (imageAndSound.sound) {
      imageAndSound.sound.x = imageAndSound.width / 2;
    }
    if (imageAndSound.image) {
      imageAndSound.image.y = imageAndSound.sound ? imageAndSound.sound.height + 18 : 0;
    }
    imageAndSound.x = (this.width - imageAndSound.width) / 2;
    return imageAndSound;
  }

  //创建答题区域
  createFillArea() {
    let text = this.currentData.question.text;
    if (!text) return null;
    this.words = $.trim(decodeURIComponent(text)).split(/[\s|\n]+/);
    //是否单词内排序
    let isSplit = this.currentData.question.isSplit;
    return this.createBorderAndLetter(isSplit);
  }

  //创建居中对齐图片
  createImageWithBg(bgKey, imageKey, scale) {
    let bg = this.add.sprite(0, 0, bgKey),
      image = this.add.sprite(bg.width / 2, bg.height / 2, imageKey);
    image.anchor.set(0.5);
    bg.addChild(image);
    this.util.setImgScaleToBg(image, bg, scale);
    return bg;
  }

  goNext() {
    this.nowPageIndex++;
    if (this.nowPageIndex === this.data.pages.length) {
      //结束
      return;
    }
    this.initPage();
    this.indicatorHwBnt.changeBtnColor(this.nowPageIndex);
  }

  //创建边框,生成位置
  createBorderAndLetter(isSplit = true) {
    let answerArea = this.add.group();
    this.borderGroup = this.add.group();
    this.letterGroup = this.add.group();
    this.letterGroup.inputEnableChildren = true;
    this.bCenterPoint = [];
    this.flags = [];
    let calx = 0;
    this.words.forEach(word => {
      let letterArr = word.split('');
      if (calx) calx += 20;
      letterArr.forEach(() => {
        let singleBorder = this.add.sprite(calx, 0, BorderTexture[0]);
        calx += singleBorder.width - 2;
        this.borderGroup.add(singleBorder);
        this.bCenterPoint.push({
          x: singleBorder.centerX,
          y: singleBorder.centerY
        });
        this.flags.push(null); //false表示为填充，true表示已填充
      });
    });
    if (isSplit) {
      this.shuffeLetterArr = this.words.reduce((prev, next) => {
        return prev.concat(_.shuffle(next));
      }, []);
      this.shuffeLetterArr.forEach((letter, i) => {
        let position = this.bCenterPoint[i];
        let letterText = this.add.text(0, 0, letter, LETTER_FONT);
        letterText.oldX = letterText.x = position.x;
        letterText.oldY = letterText.y = position.y + 70;
        letterText.letter = letter;
        letterText.anchor.set(0.5);
        letterText.inputEnabled = true;
        letterText.events.onInputDown.add((letter) => {
          this.handleLetterClick(letter);
        });
        this.letterGroup.add(letterText);
      });
    } else {
      this.shuffeLetterArr = _.shuffle(this.words.join(''));
      let calx = 0;
      this.shuffeLetterArr.forEach((letter, i) => {
        let position = this.bCenterPoint[i];
        let letterText = this.add.text(0, 0, letter, LETTER_FONT);
        calx += calx ? 26 : 0;
        letterText.oldX = letterText.x = calx;
        letterText.oldY = letterText.y = position.y + 70;
        letterText.letter = letter;
        calx += letterText.width;
        letterText.anchor.set(0.5);
        letterText.inputEnabled = true;
        letterText.events.onInputDown.add((letter) => {
          this.handleLetterClick(letter);
        });
        this.letterGroup.add(letterText);
      });
    }
    answerArea.add(this.borderGroup);
    answerArea.add(this.letterGroup);
    answerArea.x = (this.width - answerArea.width) / 2;
    return answerArea;
  }

  handleLetterClick(letter) {
    if (letter.y === letter.oldY) {
      let targetIndex = this.flags.indexOf(null),
        targetPosition = this.bCenterPoint[targetIndex];
      letter.x = targetPosition.x;
      letter.y = targetPosition.y;
      this.flags[targetIndex] = letter;
      letter.i = targetIndex;
    } else {
      letter.x = letter.oldX;
      letter.y = letter.oldY;
      this.flags[letter.i] = null;
    }
    if (this.flags.indexOf(null) < 0) { //全部填满
      this.submitBtn.loadTexture('icon_submit_02');
      this.submitBtn.visible = true;
      this.submitBtn.inputEnabled = true;
    } else {
      this.submitBtn.visible = false;
    }
  }

  submitFill() {
    let hasError = false;
    this.errorWords = [];
    //lock letters
    this.letterGroup.forEach(letter => {
      letter.inputEnabled = false;
    });
    if (this.words.length === 1) { //一个单词的情况
      let word = this.words[0];
      this.flags.forEach((l, i) => {
        let border = this.borderGroup.children[i];
        if (word[i] === l.letter) {
          border.loadTexture(BorderTexture[1]);
        } else { //坐错位置了
          hasError = true;
          this.errorWords.push(l);
          border.alpha = 0.5;
        }
      });
      if (hasError) {
        this.answerWrong();
      } else {
        this.answerRight();
      }
    } else {
      let lIdx = 0;
      this.words.forEach((word) => {
        let letters = word.split('');
        let letterTexts = this.flags.filter((l, index) => {
          if (index >= lIdx && index < lIdx + word.length) {
            return true;
          }
        });
        let matchLetters = letterTexts.map(letter => {
          return letter.letter;
        });
        if (word === matchLetters.join('')) {//正确
          this.borderGroup.children.forEach((child, index) => {
            if (index >= lIdx && index < word.length + lIdx) {
              child.loadTexture(BorderTexture[1]);
            }
          });
        } else {
          hasError = true;
          this.borderGroup.children.forEach((child, i) => {
            if (i >= lIdx && i < word.length + lIdx) {
              child.alpha = 0.5;
            }
          });
          this.errorWords.push(letterTexts);
        }
        //匹配单词
        letters.forEach(() => {
          lIdx++;
        });
      });
      if (hasError) {
        this.answerWrong();
      } else {
        this.answerRight();
      }
    }
  }

  resetLetterAndBorder() {
    this.submitBtn.visible = false;
    this.flags = this.flags.map(() => {
      return null;
    });
    //众仙归为
    this.letterGroup.forEach((lette) => {
      lette.x = lette.oldX;
      lette.y = lette.oldY;
      lette.fill = '#000';
      lette.inputEnabled = true;
    });
    //重铸熔炉
    this.borderGroup.forEach((border) => {
      border.loadTexture(BorderTexture[0]);
      border.alpha = 1;
    });
  }

  answerRight() {
    this.playSoundPromise('correctSound').then(() => {
      this.submitBtn.visible = false;
      if (this.nowPageIndex >= this.data.pages.length - 1) {
        this.nextBtn.loadTexture('btn_finish');
        this.nextBtn.finished = true;

      }
      this.nextBtn.inputEnabled = true;
      this.nextBtn.visible = true;
    });
  }

  answerWrong() {
    this.answerQuestion(this.nowPageIndex, false);
    let errorFlasher = [];
    this.errorWords.forEach((errorWord) => {
      errorWord = new ObjectPropertyFlasher(this, errorWord, 'fill', ['#ccc', '#000'], { duration: 200 }, true);
      errorFlasher.push(errorWord);
      errorWord.start();
    });
    this.playSoundPromise('errorSound').then(() => {
      return this.util.waitByPromise(600);
    }).then(() => {
      errorFlasher.forEach((errf) => {
        errf.stop();
      });
      return this.util.waitByPromise(3000);
    }).then(() => {
      this.resetLetterAndBorder();
    });
  }
}

export {
  Hwtpl609
};