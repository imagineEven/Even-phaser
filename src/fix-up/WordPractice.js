import Phaser from 'phaser';
import resource from './resource.json';
import { CONSTANT } from './../../framework/core/Constant';
import _ from 'lodash';

class WordPractice extends Phaser.Sprite {
  constructor(game, data, finishFunc) {
    super(game, 0, 0, resource.particeBg.image);
    this.data = data;
    this.textArr = [];
    this.setupPractice();
    this.finishFunc = finishFunc;
    this.game.util.waitByPromise(500).then(() => {
      this.playIntroSound();
    });
    let bigWord = this.game.add.text(400, 125, this.game.data.ffix.text, {
      'fontSize': '60px',
      'fill': '#000',
      'font': CONSTANT.DEFAULT_FONT,
      'fontWeight': 'bolder'
    });
    bigWord.anchor.set(0.5);
    this.addChild(bigWord);
  }

  setupPractice() {
    let item, text, maxWidth = 0;
    let shuffleData = _.shuffle(this.data.arr);
    for (let i in this.data.arr) {
      item = shuffleData[i];
      text = this.game.add.text(0, 220 + i * 60, item.question, {
        'fill': '#000',
        'font': CONSTANT.DEFAULT_FONT_32,
        'fontWeight': 'bolder'
      });
      maxWidth = maxWidth > text.width ? maxWidth : text.width;
      if (!/^__/.test(item.question))
        text.anchor.set(1, 0);
      text.splita = item.splita;
      text.splitb = item.splitb;
      text.fix = item.fix;
      this.addChild(text);
      this.textArr.push(text);
      text.data = item;
    }

    for (let item of this.textArr) {
      if (!/^__/.test(item.text))
        item.x = (800 - maxWidth) / 2 + maxWidth;
      else
        item.x = (800 - maxWidth) / 2;
    }
    this.maxWordWidth = maxWidth;
  }

  playIntroSound() {
    this.game.createToolbar();
    this.game.playSoundPromise(this.game.data.ffix.sound).then(() => {
      this.toolbar = this.game.createToolbarWithWarning({
        soundData: {
          sound: resource['clickTheWordToAdd' + this.game.data.ffix.type].sound,
          autoPlay: true,
          once: () => {
            this.setWordClickable();
          }
        }
      });
    });
  }

  setWordClickable() {
    let item;
    let spaceSpt = this.game.add.text(0, 0, '');
    this.newTextArr = [];
    for (let i in this.textArr) {
      item = this.textArr[i];
      item.inputEnabled = true;
      item.events.onInputDown.add((btn) => {
        this.game.util.setObjectArrayClicked(this.textArr, 0);
        this.textArr.splice(i, 1, spaceSpt);
        this.newTextArr.push(btn);
        this.toolbar.showPauseBtnOnlyInstant();
        btn.inputEnabled = false;
        if (btn.data.no) {
          this.game.answerQuestion(0, false);
          this.answerWrong(btn);
        } else if (btn.splitb) {
          this.answerFix(btn);
        } else {
          this.game.answerQuestion(0, true);
          this.answerRight(btn);
        }
      });
    }
  }

  answerFix(btn) {
    let soundArr = [resource.iWillFixSpelling.sound, resource.spellingCheck.sound];
    let randomNum = _.floor(_.random(0, 1.999));
    let sounds = btn.splitb ? soundArr[randomNum] : '';
    btn.text = btn.text.replace(/_+/, this.game.data.ffix.text);
    btn.addColor('#FF8400', btn.splita.length);
    btn.addColor('black', btn.splita.length + btn.splitb.length);
    this.game.playSoundPromise(sounds).then(() => {
      this.game.toolbarWarning.start();
      this.answerRight(btn);
    });
  }

  answerRight(btn) {
    this.game.playSoundLoop(resource.duuuaaannnggg.sound, 1, false);
    this.game.playSoundPromise(btn.data.sound, {
      stopCurrentAudio: false
    }).then(() => {
      this.game.util.setObjectArrayClicked(this.textArr, 1);
      this.toolbar.moveIn();
    });
    btn.text = btn.data.word;
    let maxWidth = 0;
    let newTextArr = this.newTextArr.concat(this.textArr);
    for (let item of newTextArr) {
      maxWidth = maxWidth < item.width ? item.width : maxWidth;
    }
    for (let item of newTextArr) {
      if(this.game.data.ffix.type === 'Preffix')
        item.x = (800 - maxWidth) / 2;
      else
        item.x = (800 + maxWidth) / 2;
    }
    if (btn.splitb)
      btn.addColor('black', btn.splita.length);
    this.game.data.practice.amount--;
    if (this.game.data.practice.amount === 0) {
      this.game.util.setObjectArrayClicked(this.textArr, false);
      this.game.util.waitByPromise(500).then(() => {
        this.game.toolbarWarning.stop();
        this.finishFunc();
      });
    }
    this.toolbar.sounds = [resource['clickTheWordToAdd' + this.game.data.ffix.type].sound];
  }

  answerWrong(btn) {
    btn.fill = '#808080';
    let randomNum = _.random(0, 2.9999);
    let sounds = [resource.niceTryButThatsNotTheWord.sound, resource.opsYouCannotAddEveryWhere.sound, resource.sorryThatsTheWordYouCannotAddTo.sound];
    this.game.playMultiPromise([
      resource.wrongSound.sound,
      sounds[_.floor(randomNum)],
      resource.tryANewOne.sound
    ]).then(() => {
      this.game.util.setObjectArrayClicked(this.textArr, 1);
      this.toolbar.moveIn();
    });
    this.toolbar.sounds = [resource.tryANewOne.sound];
  }
}

export {
  WordPractice
};