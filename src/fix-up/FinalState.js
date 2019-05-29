import Phaser from 'phaser';
import { TextureFlasher } from './../../framework/plugins/TextureFlasher';
import { TextColorFlasher } from './../../framework/plugins/TextColorFlasher';
import { CommonRegex } from './../../framework/util/CommonRegex';
import resource from './resource.json';
import { CONSTANT } from './../../framework/core/Constant';
import _ from 'lodash';

class FinalState extends Phaser.State {
  create() {
    this.add.sprite(0, 0, resource.choiceBg.image);
    this.data = this.game.data.reading;
    this.createQuestion();
  }

  createQuestion() {
    this.textArr = [];
    this.btnArr = [];
    this.submitBtn = this.game.createSprite(300, 525, resource.submit2);
    this.submitBtn.events.onInputDown.add(() => {
      this.submitBtn.inputEnabled = false;
      this.submitAnswer();
    });
    this.game.add.image(560, 150, this.data.image).anchor.set(0.5);
    this.bigWord = this.game.add.text(180, 75, this.game.data.ffix.text, {
      'fontSize': '56px',
      'fill': '#000',
      'font': CONSTANT.DEFAULT_FONT,
      'fontWeight': 'bolder'
    });
    this.bigWord.anchor.set(0.5);
    this.bigWord.flasher = new TextColorFlasher(this.game, this.bigWord, ['#000', '#f80'], {
      duration: 300,
      autoStart: false
    });

    let shuffleData = _.shuffle(this.data.choice);
    for (let i in shuffleData) {
      let item = shuffleData[i];
      let text = this.game.add.text(0, 0, item.text, {
        'fontSize': '24px',
        'fill': '#f80',
        'font': CONSTANT.DEFAULT_FONT,
        'fontWeight': 'bolder'
      });
      this.btnArr.push(text);
      text.anchor.set(0.5);
      text.answer = item.answer;
      text.position.set(70 + text.width / 2, 210 + 70 * i);
    }
    this.sptText = this.data.questionArticle.text.replace(/\s{2,}/g, ' ');
    this.createArticleText(this.sptText, () => {
      this.playQuestionSound();
    });
  }

  submitAnswer() {
    let hasWrong = false;
    for (let i in this.blankArr) {
      let answerBtn = this.blankArr[i].answerBtn;
      answerBtn.inputEnabled = false;
      if (answerBtn.answer === i * 1) {
        answerBtn.isAlreadyRight = true;
        answerBtn.hasWrong = false;
      } else {
        hasWrong = answerBtn.hasWrong = true;
      }
    }
    this.game.answerQuestion(1, !hasWrong);
    if (!hasWrong) {
      this.answerRight();
    } else {
      this.answerWrong();
    }
  }

  answerWrong() {
    let orangeBackArr = [];
    let wrongArr = [];
    for (let item of this.btnArr) {
      if (item.hasWrong) {
        wrongArr.push(item);
        orangeBackArr.push(this.drawOrangeBack(item.blank.answerBtn));
      }
    }
    setTimeout(() => {
      this.submitBtn.loadTexture(resource.submit2.image);
    }, 20);
    this.game.playMultiPromise([resource.wrongSound.sound, resource.thatDoesntFitContext.sound])
      .then(() => {
        this.findGreenWord(wrongArr);
        return this.game.playSoundPromise(resource.theseWordWillHelpYouFigureOutAnswer.sound);
      }).then(() => {
        for (let btn of wrongArr) {
          btn.text = btn.text.replace(CommonRegex.textFilter, '');
          this.game.add.tween(btn.position).to({
            x: btn.oldPosition.x,
            y: btn.oldPosition.y
          }, 300, 'Linear', true).onComplete.add(() => {
            btn.inputEnabled = true;
          });
        }
        for (let btn of wrongArr) {
          btn.blank.answerBtn = undefined;
          btn.blank = undefined;
        }
        for (let item of this.textArr) {
          item.isAddSign = false;
        }
        this.game.util.batchDestroy(orangeBackArr);
        this.resetPosition();
        for (let item of this.blankArr) {
          if (!item.answerBtn) {
            item.alpha = 1;
          }
        }
        this.game.playSoundPromise(resource.tryUsingDifferentWord.sound);
        this.toolbar = this.game.createToolbarWithWarning({
          soundData: {
            autoMoveIn: false,
            onlyShowPauseBtn: false,
            sound: resource.tryUsingDifferentWord.sound
          }
        });
        this.toolbar.moveIn();
      });
  }

  findGreenWord(wrongArr) {
    let greenWordArr = [];
    let arr = this.data.questionArticle.helpWords;
    for (let item of wrongArr) {
      greenWordArr.push(arr[item.answer * 1]);
    }

    for (let item of this.textArr) {
      item.fill = '#000';
    }

    for (let item of greenWordArr) {
      let wordArr = item[0].split(' ');
      let wordLength = wordArr.length;
      let letterArr = this.sptText.split(item[0]);
      let letterFirstArr = _.trim(letterArr[0]).split(' ');
      let frontLenth = letterFirstArr.length;
      for (let i = frontLenth; i < wordLength + frontLenth; i++) {
        this.textArr[i].fill = '#008400';
        for (let j in this.textArr[i].text) {
          let val = this.textArr[i].text[j];
          if (CommonRegex.textFilter.test(val))
            this.textArr[i].addColor('#000', j);
        }
      }
    }
  }

  answerRight() {
    this.game.toolbarWarning.stop();
    setTimeout(() => {
      this.submitBtn.loadTexture(resource.submit2.image);
    }, 20);
    this.game.util.setObjectArrayClicked(this.btnArr, false);
    this.sound.stopAll();
    this.game.util.waitByPromise(300).then(() => {
      return this.game.playSoundPromise(resource.greatJobYouFixIt.sound);
    }).then(() => {
      this.game.util.batchDestroy(this.textArr, this.btnArr);
      this.createArticleText(this.data.article.text, () => {
        this.gameOver();
      });
    });
  }

  drawOrangeBack(blank) {
    let rectangle = new Phaser.Graphics(this.game,
      blank.position.x, blank.position.y);
    rectangle.beginFill(0xff8000);
    rectangle.drawRect(-blank.width / 2, -blank.height / 2, blank.width, blank.height);
    rectangle.endFill();
    rectangle.alpha = 0.3;
    this.game.world.addChild(rectangle);
    return rectangle;
  }

  createArticleText(textData, callback) {
    let arr = textData.split(' ');
    let x = 380;
    let y = 280;
    let maxWidth = 350;
    let left = 0;
    this.textArr = [];
    this.blankArr = [];
    let isUnderline;
    for (let word of arr) {
      isUnderline = word.indexOf('_') > -1;
      let text = this.game.add.text(x + left,
        y + (isUnderline ? 6 : 0),
        word, {
          'fontSize': isUnderline ? '18px' : '24px',
          'fill': '#000',
          'font': CONSTANT.DEFAULT_FONT,
          'fontWeight': 'bolder'
        });
      left += text.width + 8;
      if (left >= maxWidth) {
        left = 0;
        y += 30;
        text.position.set(x, y + (isUnderline ? 6 : 0));
        left += text.width + 8;
      }
      this.textArr.push(text);
      if (word.indexOf('_') > -1) {
        this.blankArr.push(text);
      }
    }
    this.game.util.waitByPromise(500).then(() => {
      callback();
    });
  }

  playQuestionSound() {
    this.game.playSoundPromise(this.data.questionArticle.sound).then(() => {
      return this.game.util.waitByPromise(300);
    }).then(() => {
      return this.game.playMultiPromise([
        resource.AOTheseParagraphDontSense.sound
      ]);
    }).then(() => {
      this.createCloze();
      this.toolbar = this.game.createToolbarWithWarning({
        soundData: {
          sound: resource.useTheWordYouMakeToFixItUp.sound,
          autoPlay: true
        }
      }, 15, 3);
    });
    let signArr = this.sptText.match(/_+/g);
    let signTimeArr = signArr.map(() => {
      return this.data.questionArticle.time[0];
    });
    let textTimeArr = this.data.questionArticle.time.concat(signTimeArr);
    this.game.util.highlightWordForEach(
      this.textArr,
      textTimeArr, ['#000', '#00f'],
      () => {},
      false
    );
  }

  createCloze() {
    for (let btn of this.btnArr) {
      btn.inputEnabled = true;
      btn.input.enableDrag(true);
      btn.oldPosition = {
        x: btn.position.x,
        y: btn.position.y
      };
      btn.events.onInputDown.add(() => {
        this.game.toolbarWarning.start();
        if (btn.blank) {
          btn.blank.answerBtn = undefined;
          btn.blank = undefined;
        }
      });
      btn.events.onInputUp.add(() => {
        if (btn.isOprate) {
          this.game.add.tween(btn).to({
            x: btn.oldPosition.x,
            y: btn.oldPosition.y
          }, 300, 'Linear', true);
          btn.input.enableDrag();
          btn.isOprate = false;
          let arr = CommonRegex.textFilter.exec(btn.text);
          if (arr)
            btn.text = btn.text.substring(0, arr.index);
          this.resetPosition();
        }
      });
      btn.events.onDragStop.add(() => {
        let isDragToBlank = false;
        for (let item of this.blankArr) {
          isDragToBlank = this.game.util.inRectArea(
            btn.position,
            item.position,
            item.width,
            item.height);
          if (isDragToBlank) {
            btn.input.disableDrag();
            btn.isOprate = true;
            if (item.answerBtn) {
              item.answerBtn.blank = undefined;
              this.game.add.tween(item.answerBtn.position).to({
                x: item.answerBtn.oldPosition.x,
                y: item.answerBtn.oldPosition.y
              }, 300, 'Linear', true);
            }
            item.alpha = 0;
            item.answerBtn = btn;
            btn.blank = item;
            btn.position.set(
              item.position.x + item.width / 2,
              item.position.y + item.height / 2 - 3
            );
            break;
          }
        }
        if (!isDragToBlank) {
          this.game.add.tween(btn.position).to({
            x: btn.oldPosition.x,
            y: btn.oldPosition.y
          }, 300, 'Linear', true);
        }
        this.resetPosition();
        this.checkAllDrag();
      });
    }
  }

  resetPosition() {
    let x = 380;
    let y = 280;
    let maxWidth = 350;
    let left = 0;
    let answerBtn;
    let isUnderline;
    for (let word of this.textArr) {
      answerBtn = word.answerBtn;
      if (answerBtn) {
        word.alpha = 0;
        if (left + answerBtn.width + 8 >= maxWidth) {
          left = 0;
          y += 30;
        }
        word.position.set(x + left, y + 6);
        let reArr = CommonRegex.textFilter.exec(word.text);
        let isSign = CommonRegex.textFilter.test(answerBtn.text);
        if (reArr && !word.isAddSign && !isSign)
          answerBtn.text += reArr[0],
          answerBtn.addColor('black', answerBtn.text.length - 1),
          word.isAddSign = true;
        answerBtn.position.set(x + left + answerBtn.width / 2, y + answerBtn.height / 2);
        left += answerBtn.width + 8;
      } else {
        word.alpha = 1;
        isUnderline = word.text.indexOf('_') > -1;
        word.position.set(x + left, y + (isUnderline ? 6 : 0));
        left += word.width + 8;
        if (left >= maxWidth) {
          left = 0;
          y += 30;
          word.position.set(x, y + (isUnderline ? 6 : 0));
          left += word.width + 8;
        }
      }
    }
  }

  checkAllDrag() {
    if (this.blankArr.some((item) => {
      return !item.answerBtn;
    })) {
      this.submitBtn.inputEnabled = false;
      return;
    }

    this.submitBtn.inputEnabled = true;
    this.submitBtn.flasher = new TextureFlasher(
      this.game, this.submitBtn, [resource.submit0.image, resource.submit1.image], {
        duration: 300,
        autoStart: true
      });
    this.toolbar = this.game.createToolbarWithWarning({
      soundData: {
        sound: resource.clickHereWhenYouReadyToCheckAnswer.sound,
        autoPlay: false,
        autoMoveIn: false,
        onlyShowPauseBtn: false,
        startCallback: () => {
          this.submitBtn.flasher.start();
        },
        callback: () => {
          this.submitBtn.flasher.stop();
        }
      }
    });
    this.toolbar.moveIn();
    this.game.playSoundPromise(resource.clickHereWhenYouReadyToCheckAnswer.sound).then(() => {
      this.submitBtn.flasher.stop();
      this.game.playSoundPromise(resource.orIfYouThinkMistakeClickHere.sound);
    });
  }

  gameOver() {
    this.game.playSoundPromise(this.data.article.sound).then(() => {
      return this.game.util.waitByPromise(300);
    }).then(() => {
      this.bigWord.flasher.start();
      this.game.playSoundPromise(resource['nowYouKnowHowToAdd' + this.game.data.ffix.type].sound)
        .then(() => {
          this.bigWord.flasher.stop();
          this.game.createToolbar({
            soundData: {
              sound: resource.clickLetsGo.sound,
              autoPlay: true
            },
            exitData: () => {}
          });
        });
    });
    this.game.util.highlightWordForEach(
      this.textArr,
      this.data.article.time, ['#000', '#00f'],
      () => {},
      false
    );
  }

  update() {
    this.game.logicLoop.update();
  }
}

export {
  FinalState
};