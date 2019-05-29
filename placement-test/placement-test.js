import { Courseware } from '../framework/core/Courseware';
import StaticResource from './static.json';
import TestOptions from './test-option.json';
import Phaser from 'phaser';
import _ from 'lodash';
import { TextColorFlasher } from '../framework/plugins/TextColorFlasher';
import { TextureFlasher } from '../framework/plugins/TextureFlasher';
import $ from 'jquery';
class PlacementTest extends Courseware {
  constructor(userData) {
    let preload = () => {
      this.loadPageResource(StaticResource);
      let soundsArr = [];
      let imagesArr = [];
      TestOptions.arr.forEach(element => {
        let resource = element['resource'];
        let sounds = resource['sound'];
        if (sounds) {
          for (let item in sounds) {
            addItemToArr(soundsArr, sounds[item]);
          }
        }
        let images = resource['pic'];
        if (images) {
          for (let item of images) {
            addItemToArr(imagesArr, item);
          }
        }
      });
      this.loadAudioArr(soundsArr);
      this.loadImageArr(imagesArr);
    };

    let addItemToArr = (arr, item) => {
      if (item) {
        arr.push(item);
      }
    };

    super({}, preload, () => {
      this.createSprite(0, 0, 'video');
      this.playMultiPromise(['zh1', 'letsGetGoing'])
        .then(() => {
          this.firstPage();

        });
    }, undefined, undefined, '', false, Phaser.CANVAS);

    this.userData = userData;
    this.soundObjs = StaticResource.soundObj;
    this.imageObjs = StaticResource.imageObj;
  }

  firstPage() {
    let group = this.add.group();
    let arr = _.shuffle(TestOptions.intro);
    let bgGraphics = this.drawRectWithOutGroup(this.width, this.height, 0xe6f2ff);
    group.add(bgGraphics);
    this.contentGroup = this.add.group();
    this.drawRect(this.width * 0.85, this.height * 0.3, 0xffffff, this.width * 0.5, this.height * 0.45, 1);
    let fontSize = this.height / 7;
    let l = arr.length;
    let textArr = [];
    let submitBtn = this.createSprite(this.width / 2, this.height * 0.85, 'submit3');
    submitBtn.anchor.set(0.5);
    let letter;
    let textcolorFlasher;
    arr.forEach((item, index) => {
      let x = 0.5 * this.width + (index + 0.5 - l / 2) * this.width * 0.13;
      let text = this.createText(x, 0.45 * this.height, item, { font: `bold ${fontSize}px Century Gothic`, fill: '#000000' });

      text.events.onInputDown.add((e) => {
        letter = e;
        if (textcolorFlasher) {
          e.inputEnabled = false;
          textcolorFlasher.stop();
          this.firstPageSound();
          return;
        }
        textArr.forEach(i => {
          i.fill = '#000000';
        });
        e.fill = '#00c0ff';
        submitBtn.loadTexture('submit1');
        submitBtn.inputEnabled = true;
      });
      textArr.push(text);
    });

    submitBtn.events.onInputDown.add(() => {
      submitBtn.inputEnabled = false;
      letter.inputEnabled = false;
      if (letter.text !== 'D') {
        this.createToolbar();
        this.playMultiPromise(['noHeresTheRightAnswer', 'clickHere']);
        let correctLetter;
        textArr.forEach(item => {
          if (item.text === 'D') {
            correctLetter = item;
          } else {
            item.fill = '#777777';
            item.inputEnabled = false;
          }
        });
        textcolorFlasher = new TextColorFlasher(this, correctLetter, ['#00c0ff', '#000000'], { duration: 400, autoStart: true });
        return;
      }
      this.util.setObjectArrayClicked(textArr, false);
      this.firstPageSound();
    });

    this.contentGroup.alpha = 0;

    this.add.tween(this.contentGroup).to({ alpha: 1 }, 800)
      .start();
    let textureFlasher = new TextureFlasher(this, submitBtn, ['submit3', 'submit1'], { duration: 400 });
    this.createToolbar({
      soundData: {
        autoPlay: true,
        sound: ['firstGoToPractise', 'clickLetterD', 'd'],
        once: () => {
          textureFlasher.start();
          this.playSoundPromise('clickHereWhenYouDone').then(() => {
            textureFlasher.stop();
            this.util.setObjectArrayClicked(textArr, true);
          });
        }
      }
    });
  }

  firstPageSound() {
    this.isEnd = 0;
    this.createToolbar();
    this.playMultiPromise(['rightYouClickTheLetterD', 'tbl'])
      .then(() => {
        this.nextSection();
      });
  }

  nextSection() {
    this.correctNum = 0;
    this.questionNum = this.userData.firstactivity.length;
    this.questionIndex = 0;
    this.nextModule();
  }

  nextModule() {
    if (this.questionIndex >= this.questionNum) {
      this.getTestStatus();
      return;
    }
    let index = this.userData.firstactivity[this.questionIndex];
    let data = TestOptions.arr[index];
    this.startModule(data);
  }

  getTestStatus() {
    if (this.isEnd) {
      $.ajax({
        url: 'http://www.4006688991.com:85/studenttest.asmx/GetStudentTestLevel',
        dataType: 'jsonp',
        jsonp: 'param',
        data: { token: this.userData.token, num: this.questionNum, correct: this.correctNum },
        success: () => {
          window.top.location.href = 'http://wx.4006688991.cn/studenttest/studentinfo.aspx';
        }
      });
      return;
    }
    $.ajax({
      url: 'http://www.4006688991.com:85/studenttest.asmx/GetStudentActivity',
      dataType: 'jsonp',
      jsonp: 'param',
      data: { token: this.userData.token, num: this.questionNum, correct: this.correctNum, tt: Math.random() },
      success: (data) => {
        this.userData.firstactivity = data.ActivityID;
        this.userData.isVote = data.IsVote;
        this.isEnd = data.IsVote;
        this.nextSection();
      }
    });
  }

  startModule(data) {
    this.contentGroup.removeAll(true);
    this.answerCorrect = false;
    let type = data.type;
    switch (type) {
      case 1001:
        this.module1001(data);
        break;
      case 2001:
        this.module2001(data);
        break;
      case 5001:
        this.module5001(data);
        break;
      case 6001:
      case 6002:
        this.module6001(data);
        break;
      case 7001:
        this.module7001(data);
        break;
      case 7002:
        this.module7002(data);
        break;
      default:
        break;
    }
  }

  module1001(data) {
    this.drawRect(this.width * 0.85, this.height * 0.3, 0xffffff, this.width * 0.5, this.height * 0.45, 1);
    let fontSize = this.height / 7;
    let correctLetter = data.pages[0];
    let arr = _.shuffle(data.pages);
    let l = arr.length;
    let textArr = [];
    let submitBtn = this.createSprite(this.width / 2, this.height * 0.85, 'submit3');
    submitBtn.anchor.set(0.5);
    this.contentGroup.add(submitBtn);
    arr.forEach((item, index) => {
      let x = 0.5 * this.width + (index + 0.5 - l / 2) * this.width * 0.13;
      let text = this.createText(x, 0.45 * this.height, item, { font: `bold ${fontSize}px Century Gothic`, fill: '#000000' });
      text.isCorrect = item === correctLetter;
      text.events.onInputDown.add((e) => {
        textArr.forEach(i => {
          i.fill = '#000000';
        });
        e.fill = '#00c0ff';
        submitBtn.loadTexture('submit1');
        submitBtn.inputEnabled = true;
        this.answerCorrect = text.isCorrect;
      });
      textArr.push(text);
    });
    submitBtn.spriteArr = textArr;
    this.showToolBar(['clickOnTheLetter', data.resource.sound[correctLetter]], textArr);
    submitBtn.events.onInputDown.add(this.submitEvent, this);
  }

  module2001(data) {
    this.drawRect(this.width * 0.8, this.height * 0.18, 0xFFFFFF, this.width * 0.5, this.height * 0.5, 1);
    let correctWord = data.words[0];
    let arr = _.shuffle(data.words);
    let textArr = [];
    let submitBtn = this.createSprite(this.width / 2, this.height * 0.85, 'submit3');
    submitBtn.anchor.set(0.5);
    this.contentGroup.add(submitBtn);
    arr.forEach((item, index) => {
      let text = this.createText(0, 0, item, { font: `bold ${this.height/24}px Century Gothic`, fill: '#000000' });
      text.isCorrect = item === correctWord;
      text.x = this.width * 0.245 + this.width * 0.17 * index;
      text.y = this.height * 0.5;
      text.events.onInputDown.add((e) => {
        textArr.forEach(i => {
          i.fill = '#000000';
        });
        e.fill = '#00c0ff';
        submitBtn.loadTexture('submit1');
        submitBtn.inputEnabled = true;
        this.answerCorrect = text.isCorrect;
      });
      textArr.push(text);
    });
    submitBtn.spriteArr = textArr;
    this.showToolBar(['clickTheRightWord', data.resource.sound.word], textArr);
    submitBtn.events.onInputDown.add(this.submitEvent, this);
  }

  module5001(data) {
    this.drawRect(this.width * 0.8, this.height * 0.18, 0xffffff, this.width * 0.5, this.height * 0.25, 1);
    this.createText(this.width * 0.5, this.height * 0.25, data.title, { font: `bold ${this.height/18}px Century Gothic`, fill: '#000000' });
    let correctPic = data.resource.pic[0];
    let arr = _.shuffle(data.resource.pic);
    let picSpriteArr = [];
    let submitBtn = this.createSprite(this.width / 2, this.height * 0.85, 'submit3');
    submitBtn.anchor.set(0.5);
    this.contentGroup.add(submitBtn);
    arr.forEach((item, index) => {
      let border = this.createSprite(this.width * 0.125 + this.width * 0.25 * index, this.height * 0.6, 'picBorder1');
      border.isCorrect = item === correctPic;
      border.anchor.set(0.5);
      let sprite = this.createSprite(20, 20, item);
      if (sprite.width >= sprite.height) {
        sprite.height *= (140 / sprite.width);
        sprite.width = 140;
      } else {
        sprite.width *= (140 / sprite.height);
        sprite.height = 140;
      }
      sprite.x = -1 * border.width / 2 + 18;
      sprite.y = -1 * border.height / 2 + 18;
      picSpriteArr.push(border);
      border.addChild(sprite);
      border.events.onInputDown.add((e) => {
        picSpriteArr.forEach(i => {
          i.loadTexture('picBorder1');
        });
        e.loadTexture('picBorder2');
        submitBtn.loadTexture('submit1');
        submitBtn.inputEnabled = true;
        this.answerCorrect = border.isCorrect;
      });
      this.contentGroup.add(border);
    });
    submitBtn.spriteArr = picSpriteArr;
    this.showToolBar(['whichPictureShows', data.resource.sound.word], picSpriteArr);
    submitBtn.events.onInputDown.add(this.submitEvent, this);
  }

  module6001(data) {
    this.drawRect(this.width * 0.8, this.height * data.bg.height, 0xffffff, this.width * 0.5, this.height * data.bg.y, 1);
    let correctWord = data.words[0];
    let arr = _.shuffle(data.words);
    let submitBtn = this.createSprite(this.width / 2, this.height * 0.85, 'submit3');
    submitBtn.anchor.set(0.5);
    this.contentGroup.add(submitBtn);
    let fontSize = this.height / 18;
    if (data.wordSize) {
      fontSize = fontSize * data.wordSize;
    }
    this.createText(this.width * 0.5,
      this.height * data.question.y,
      data.question.text, {
        font: `bold ${this.height/24}px Century Gothic`,
        fill: '#000000'
      }
    );
    let y = this.height * data.wordsY;
    let textArr = [];
    arr.forEach((item, index) => {
      let text = this.createText(this.width * 0.2 + this.width * 0.2 * index, y, item, { font: `bold ${fontSize}px Century Gothic`, fill: '#000000' });
      text.isCorrect = item === correctWord;
      textArr.push(text);
      text.events.onInputDown.add((e) => {
        textArr.forEach(i => {
          i.fill = '#000000';
        });
        e.fill = '#00c0ff';
        submitBtn.loadTexture('submit1');
        submitBtn.inputEnabled = true;
        this.answerCorrect = e.isCorrect;
        this.playSoundPromise(data.resource.sound[item]);
      });
    });
    if (data.resource.pic && data.resource.pic[0]) {
      let img = this.createSprite(this.width * 0.5, this.height * data.pic.y, data.resource.pic[0]);
      img.anchor.set(0.5);
      img.width *= data.pic.scale;
      img.height *= data.pic.scale;
      this.contentGroup.add(img);
    }
    submitBtn.spriteArr = textArr;
    let soundArr = [data.resource.sound.question];
    if (data.resource.sound.question2) {
      soundArr.push(data.resource.sound.question2);
    }
    this.showToolBar(soundArr, textArr);
    submitBtn.events.onInputDown.add(this.submitEvent, this);
  }

  module7001(data) {
    this.drawRect(this.width * 0.7, this.height * data.whiteBg.height, 0xffffff, this.width * 0.4, this.height * data.whiteBg.y, 1);
    if (data.resource.pic && data.resource.pic[0]) {
      let img = this.createSprite(this.width * 0.4, this.height * data.pic.y);
      img.anchor.set(0.5);
      img.width *= data.pic.scale;
      img.height *= data.pic.scale;
      this.contentGroup.add(img);
    }
    let style = {
      font: `bold ${this.height/24}px Century Gothic`,
      fill: '#000000'
    };
    this.createText(this.width * 0.4, this.height * data.question.y, data.question.text, style);
    this.drawRect(this.width * 0.66, this.height / 18, 0xffff77, this.width * 0.4, this.height * data.word.y, 1);
    this.createText(this.width * 0.4, this.height * data.word.y, data.word.text, style);
    let submitBtn = this.createSprite(this.width / 2, this.height * 0.85, 'submit3');
    submitBtn.anchor.set(0.5);
    this.contentGroup.add(submitBtn);
    let yesBtn = this.createSprite(this.width * 0.8, this.height * 0.28, 'yesBtn1');
    yesBtn.normalTexture = 'yesBtn1';
    yesBtn.clickTexture = 'yesBtn2';
    yesBtn.isCorrect = data.answer === 'yes';
    this.contentGroup.add(yesBtn);
    let noBtn = this.createSprite(this.width * 0.8, this.height * 0.52, 'noBtn1');
    noBtn.normalTexture = 'noBtn1';
    noBtn.clickTexture = 'noBtn2';
    noBtn.isCorrect = data.answer === 'no';
    this.contentGroup.add(noBtn);
    let btnArr = [];
    btnArr.push(yesBtn);
    btnArr.push(noBtn);
    btnArr.forEach(e => {
      e.x = e.x + e.width / 2;
      e.y = e.y + e.height / 2;
      e.anchor.set(0.5);
      e.events.onInputDown.add((item) => {
        btnArr.forEach(btn => {
          btn.loadTexture(btn.normalTexture);
        });
        item.loadTexture(item.clickTexture);
        submitBtn.inputEnabled = true;
        this.answerCorrect = item.isCorrect;
      });
    });
    submitBtn.spriteArr = btnArr;
    this.showToolBar([data.resource.sound.question, data.resource.sound.word], btnArr);
    submitBtn.events.onInputDown.add(this.submitEvent, this);
  }

  module7002(data) {
    let style = {
      font: `bold ${this.height/24}px Century Gothic`,
      fill: '#000000'
    };
    this.drawRect(this.width * data.bgWidth, this.height * 0.5, 0xffffff, this.width * 0.5, this.height * 0.5, 1);
    let correctWord = data.words[0];
    let textArr = [];
    let arr = _.shuffle(data.words);
    let submitBtn = this.createSprite(this.width / 2, this.height * 0.85, 'submit3');
    submitBtn.anchor.set(0.5);
    this.contentGroup.add(submitBtn);
    arr.forEach((item, index) => {
      let isSentence = item.indexOf('.') > 0 || item.indexOf('?') > 0;
      let x = isSentence ? this.width * (0.53 - data.bgWidth / 2) : this.width * 0.5;
      let y = this.height * 0.31 + this.height * index * 0.125;
      let text = this.add.text(x, y, item, style);
      if (isSentence) {
        text.anchor.set(0, 0.5);
      } else {
        text.anchor.set(0.5);
      }
      text.isCorrect = item === correctWord;
      textArr.push(text);
      this.contentGroup.add(text);
      text.events.onInputDown.add((e) => {
        this.answerCorrect = e.isCorrect;
        textArr.forEach(i => {
          i.fill = '#000000';
        });
        e.fill = '#00c0ff';
        submitBtn.inputEnabled = true;
      });
    });

    this.createText(this.width * 0.5, this.height * 0.12, data.question, style);

    if (data.yellowWord) {
      this.drawRect(this.width * 0.5, this.height / 18, 0xffff77, this.width * 0.5, this.height * 0.2, 1);
      this.createText(this.width * 0.5, this.height * 0.2, data.yellowWord, style);
    }
    let soundArr = [data.resource.sound.question];
    if (data.resource.sound.yellowWord) {
      soundArr.push(data.resource.sound.yellowWord);
    }
    submitBtn.spriteArr = textArr;
    this.showToolBar(soundArr, textArr);
    submitBtn.events.onInputDown.add(this.submitEvent, this);
  }

  showToolBar(sounds, arr) {
    this.createToolbar({
      soundData: {
        autoPlay: true,
        sound: sounds,
        once: () => {
          this.util.setObjectArrayClicked(arr, 1);
        }
      }
    });
  }


  submitEvent(e) {
    e.inputEnabled = false;
    if (this.answerCorrect) {
      this.correctNum++;
    }
    if (e.spriteArr) {
      this.util.setObjectArrayClicked(e.spriteArr, false);
    }
    this.questionIndex++;
    this.nextModule();
  }

  drawRect(width, height, fill, x = 0, y = 0, anchor = 0) {
    let bgGraphics = this.drawRectWithOutGroup(width, height, fill, x, y, anchor);
    this.contentGroup.add(bgGraphics);
    return bgGraphics;
  }

  drawRectWithOutGroup(width, height, fill, x = 0, y = 0, anchor = 0) {
    if (anchor) {
      x = x - width / 2;
      y = y - height / 2;
    }
    let bgGraphics = this.add.graphics();
    bgGraphics.beginFill(fill);
    bgGraphics.lineStyle(0);
    bgGraphics.drawRect(x, y, width, height);
    bgGraphics.endFill();
    return bgGraphics;
  }

  createText(x, y, text, style) {
    let t = this.add.text(x, y, text, style);
    t.anchor.set(0.5);
    this.contentGroup.add(t);
    return t;
  }
}


export {
  PlacementTest
};