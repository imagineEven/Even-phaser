import { Courseware } from '../../framework/core/Courseware';
import historyHero from './history-hero.json';
import { ObjectPropertyFlasher } from './../../framework/plugins/ObjectPropertyFlasher.js';
import { IndicatorBnt } from '../../framework/plugins/IndicatorBnt';
import { TextureFlasher } from '../../framework/plugins/TextureFlasher';
import _ from 'lodash';
import { CONSTANT } from '../../framework/core/CONSTANT';
import { MultiTextCreate } from './../../framework/plugins/MultiTextCreate';

const STATIC = {
  BLACK: 'black',
  BLUE: '#00A9D3',
  GREY: '#7F7F7F',
  LIGHT_BLUE: '#00A9D3'
};

const textStyle = {
  fontSize: 36,
  font: CONSTANT.DEFAULT_FONT,
  fontWeight: 'bold'
};

class HistoryHero extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.loadPageResources(this.data, historyHero);
      this.index = 0;
      this.rightIndex = 0;
    };

    super({}, preload, () => {
      this.createToolbar();
      this.dataArrInit = this.data.pages;
      this.dataInit = this.data.pages.slice();
      this.lengthInit = this.dataInit.length;
      this.player = this.createRecyclingVideoPlay(this.data.videoData.start, {}, () => {
        this.staticResource = this.data.staticResource;
        this.createUI();
        return this.playMultiPromise(this.staticResource.startStage.sounds).then(() => {
          this.letterBg.letterBgFlasher.start();
          this.letterBg.loadTexture(this.letterBg.activeKey);
          return this.playSoundPromiseByObject(this.dataInit[this.randomIndex]);
        }).then(() => {
          this.choiceBtn.inputEnabled = true;
          this.letterBg.inputEnabled = true;
          this.util.setObjectArrayClicked(this.optionsBtnArr, 1);
          this.normalTool();
        });
      });
    });
  }

  createUI() {
    this.pageGroup = this.add.group();
    this.wrongWordArr = [];
    this.flag = true;
    this.wrongData = [];
    this.renderTempleInit();
    this.renderSuccessChoiceBg();
    this.renderLetter();
    this.renderChoiceBtn();
    this.renderOptionsBtn();
  }

  renderTempleInit() {
    let staticImgs = historyHero.pageImages;
    this.pageGroup.create(0, 0, staticImgs.templeBg.image);
    this.temple = this.pageGroup.create(0, -40, staticImgs.temple.image);
    this.pageGroup.create(0, 0, staticImgs.leaves.image);
    this.pageGroup.create(0, 380, staticImgs.whiteBg.image);
    this.templeWidth = this.temple.width;
    this.templeHgt = this.temple.height;
    this.temple.scale.setTo(1 / (this.lengthInit + 1));
    this.temple.y = 395 - this.temple.height;
    this.temple.x = this.pageGroup.width / 2 - this.temple.width / 2 + 2;
  }

  renderLetter() {
    this.letterGroup = this.add.group();
    this.renderTextBg();
    let data = this.getData();
    this.renderText(data);
    this.letterBgEffect(data);
    data.splice(this.randomIndex, 1);
  }

  getData() {
    let data = this.dataArrInit.length !== 0 ? this.dataArrInit : this.wrongWordArr;
    this.randomIndex = Math.ceil(Math.random() * data.length) - 1;
    return data;
  }

  letterBgEffect(data) {
    this.letterBg.optionArr = data[this.randomIndex];
    this.dataCurrent = data[this.randomIndex];
    if (this.index !== 0) {
      if(this.idleWarn)
        this.idleWarn.stop();
      this.idleWarning();
      this.letterBg.loadTexture(this.letterBg.activeKey);
      this.playSoundPromiseByObject(data[this.randomIndex]).then(() => {
        this.letterBg.loadTexture(this.letterBg.resetKey);
        this.letterBg.inputEnabled = true;
        this.util.setObjectArrayClicked(this.optionsBtnArr, 1);
        this.normalTool();
      });
    }
  }

  renderText(data) {
    let spriteParent, spriteParentWidth;
    spriteParent = this.createSprite(0, 0, data[this.randomIndex]);
    spriteParent.y = this.letterBg.height / 2 - spriteParent.height / 2;
    spriteParentWidth = spriteParent.width;
    this.letterBg.addChild(spriteParent);
    let textSpriteAll = new MultiTextCreate(this, this.letterGroup, data[this.randomIndex].letter, { x: spriteParentWidth, y: 0 }, textStyle);
    for (let item of textSpriteAll.wordTextArr) {
      this.letterBg.addChild(item);
      spriteParentWidth += item.width;
      item.y = this.letterBg.height / 2 - item.height / 2;
      if (data[this.randomIndex].lightHight.text === _.trim(item.text)) {
        item.fill = STATIC.BLUE;
      }
    }
    textSpriteAll.wordTextArr.unshift(spriteParent);
    this.letterItemArr = textSpriteAll.wordTextArr;
    for (let item of this.letterItemArr) {
      item.x += this.letterBg.width / 2 - spriteParentWidth / 2;
    }
  }

  renderTextBg() {
    let staticImgs = historyHero.pageImages;
    this.letterBg = this.pageGroup.create(27, 400, staticImgs.whiteBg2.image);
    this.letterBg.activeKey = staticImgs.echelonYellow.image;
    this.letterBg.resetKey = staticImgs.whiteBg2.image;
    let letterBgFlasher = new TextureFlasher(this, this.letterBg, [staticImgs.whiteBg2.image, staticImgs.echelonYellow.image], { duration: 500, times: 2, autoStart: false });
    this.letterBg.letterBgFlasher = letterBgFlasher;
    this.letterBg.inputEnabled = false;
    this.letterBg.events.onInputDown.add(() => {
      this.letterBg.loadTexture(this.letterBg.activeKey);
      this.playSoundPromiseByObject(this.letterBg.optionArr).then(() => {
        this.letterBg.loadTexture(this.letterBg.resetKey);
      });
    });
  }

  renderSuccessChoiceBg() {
    let staticImgs = historyHero.pageImages;
    this.letterPassBg = this.createSprite(0, 380, staticImgs.whiteBg4);
    this.letterPassBg.alpha = 0;
    this.pageGroup.add(this.letterPassBg);
    this.renderIndicatorBtn();
  }

  renderIndicatorBtn() {
    this.indicatorBtn = new IndicatorBnt(this, this.lengthInit, { height: 588, distance: 28 });
    for (let item of this.indicatorBtn.bntGroup.children) {
      item.scale.set(0.7);
    }
  }

  renderChoiceBtn() {
    let staticImgs = historyHero.pageImages;
    this.choiceBtn = this.pageGroup.create(363, 510, staticImgs.rightGreen.image);
    let choiceGrey = this.createSprite(0, 0, staticImgs.rightGrey);
    this.choiceBtn.addChild(choiceGrey);
    this.choiceBtn.hoverKey = staticImgs.rightCircle.image;
    this.choiceBtn.greyKey = staticImgs.rightGrey.image;
    let btnFlasher = new TextureFlasher(this, choiceGrey, [staticImgs.rightGreen.image, staticImgs.rightCircle.image], { duration: 350, autoStart: false });
    this.choiceBtn.btnFlasher = btnFlasher;
    this.choiceBtn.choiceGrey = choiceGrey;
    this.choiceBtn.inputEnabled = false;
    this.choiceBtn.events.onInputDown.add(() => {
      this.idleWarn.stop();
      this.choiceBtnEvent();
    });
  }

  choiceBtnEventInit() {
    this.createToolbar();
    if (this.index === this.lengthInit - 1 && this.firstFinish === undefined) {
      this.finishQuestion = true;
      this.firstFinish = true;
    }
    this.choiceBtn.btnFlasher.stop();
    this.choiceBtn.choiceGrey.loadTexture(this.choiceBtn.greyKey);
    this.choiceBtn.inputEnabled = false;
    this.util.setObjectArrayClicked(this.optionsBtnArr, 0);
    this.letterBg.inputEnabled = false;
  }

  choiceBtnEvent() {
    this.choiceBtnEventInit();
    if (this.choiceBtn.paradox === undefined) {
      return;
    }
    if (this.choiceBtn.paradox !== this.letterBg.optionArr.paradox) {
      if (!this.finishQuestion || this.firstFinish) {
        this.indicatorBtn.set(this.index, 'red');
      }
      this.failCallback();
    } else {
      if (!this.finishQuestion || this.firstFinish) {
        this.indicatorBtn.set(this.index, 'green');
      }
      this.sucCallback();
    }
    for (let item of this.optionsBtnArr) {
      item.loadTexture(item.resetKey);
    }
    this.choiceBtn.paradox = undefined;
  }

  failCallback() {
    let soundAddr = historyHero.pageSounds;
    let sounds;
    if (this.firstFinish) {
      sounds = this.failFirstFinish();
    } else if (!this.finishQuestion) {
      sounds = this.failNotfinish();
    } else if (this.wrongWordArr.length === 0 && this.finishQuestion) {
      this.playSoundPromiseByObject(soundAddr.wrongSound).then(() => {
        this.renderLastPage();
      });
      return;
    } else if (this.finishQuestion) {
      sounds = this.failTwiceChoice();
    }
    this.playMultiPromiseObject(sounds).then(() => {
      this.letterBg.optionArr = null;
      this.renderLetter();
    });
  }

  failNotfinish() {
    let soundAddr = historyHero.pageSounds;
    this.index++;
    let randomNumber = Math.round(Math.random());
    let sounds;
    if (randomNumber) {
      sounds = [soundAddr.wrongSound, this.staticResource.answerWrong];
    } else {
      sounds = [soundAddr.wrongSound];
    }
    this.wrongWordArr.push(this.letterBg.optionArr);
    return sounds;
  }

  failTwiceChoice() {
    let soundAddr = historyHero.pageSounds;
    let sounds;
    let randomNumber = Math.round(Math.random());
    if (randomNumber) {
      sounds = [soundAddr.wrongSound, this.staticResource.answerWrong];
    } else {
      sounds = [soundAddr.wrongSound];
    }
    return sounds;
  }

  failFirstFinish() {
    let soundAddr = historyHero.pageSounds;
    this.firstFinish = false;
    let sounds = [soundAddr.wrongSound, soundAddr.theTempleStillSmall];
    this.wrongWordArr.push(this.letterBg.optionArr);
    for (let val of this.wrongWordArr) {
      this.wrongData.push(val);
      val.inputEnabled = true;
    }
    return sounds;
  }

  sucCallback() {
    this.rightIndex++;
    let soundsAddr = historyHero.pageSounds;
    let soundArr = [soundsAddr.right, soundsAddr.great, soundsAddr.ouser];
    let randomIndex = Math.floor(Math.random() * soundArr.length);
    this.playSoundPromiseByObject(soundArr[randomIndex]).then(() => {
      return this.successFirstStep();
    }).then(() => {
      this.templeChange();
    });
  }

  successFirstStep() {
    this.letterPassBg.alpha = 1;
    this.letterPassBg.removeChildren();
    for (let item of this.letterItemArr) {
      this.letterPassBg.addChild(item);
    }
    this.letterPassBg.bringToTop();
    let sound = this.dataCurrent.lightHight.text ? this.dataCurrent.lightHight : this.dataCurrent;
    let soundArr1 = [sound, this.staticResource.choiceSound.positive];
    let soundArr2 = [sound, this.staticResource.choiceSound.reverse];
    let sounds = !this.letterBg.optionArr.paradox ? soundArr1 : soundArr2;
    return this.playMultiPromiseObject(sounds);
  }

  templeChange() {
    let soundsAddr = historyHero.pageSounds;
    this.playSoundPromiseByObject(soundsAddr.biggerSoundEffect);
    let per = 1 / (this.lengthInit + 1);
    let num = (1 + this.rightIndex) * per;
    let temWid = num * this.templeWidth;
    let temHgt = num * this.templeHgt;
    let tween = this.add.tween(this.temple).to({
      width: temWid,
      height: temHgt,
      x: this.pageGroup.width / 2 - temWid / 2 + 2,
      y: 395 - temHgt
    }, 500, null, true, 0, 0, false);
    tween.onComplete.add(() => {
      this.util.waitByPromise(2000).then(() => {
        if (this.rightIndex === this.lengthInit) {
          this.tweenComplete();
        } else if (this.firstFinish) {
          this.firstFinishChoice();
        } else {
          this.nextQuestion();
        }
      });
    });
  }

  firstFinishChoice() {
    for (let val of this.wrongWordArr) {
      this.wrongData.push(val);
      val.inputEnabled = true;
    }
    let sounds = [historyHero.pageSounds.theTempleStillSmall];
    this.playMultiPromiseObject(sounds).then(() => {
      this.firstFinish = false;
      this.letterPassBg.alpha = 0;
      this.letterBg.removeChild(this.letter);
      this.letterBg.optionArr = {};
      this.renderLetter();
    });
  }

  nextQuestion() {
    for (let item of this.letterItemArr) {
      item.destroy();
    }
    this.letterPassBg.alpha = 0;
    this.letterBg.removeChild(this.letter);
    this.letterBg.optionArr = {};
    if (this.index < this.lengthInit - 1) {
      this.index++;
      this.renderLetter();
    } else if (this.wrongWordArr.length) {
      this.renderLetter();
    } else if (this.index === this.lengthInit - 1) {
      this.renderLastPage();
    }
  }

  tweenComplete() {
    let staticImgs = historyHero.pageImages;
    let sounds = [historyHero.pageSounds.hornSound, historyHero.pageSounds.youDidIt];
    this.playMultiPromiseObject(sounds).then(() => {
      this.lastPlayer = this.createRecyclingVideoPlay(this.data.videoData.end, {}, () => {
        this.lastPlayer.destroy();
        if (this.wrongData.length) {
          this.renderLastPage();
        } else {
          let bg = this.createSprite(0, 0, staticImgs.templeBg.image);
          let temple = this.createSprite(0, -40, staticImgs.temple);
          bg.addChild(temple);
          let leaves = this.createSprite(0, 0, staticImgs.leaves);
          temple.x = this.pageGroup.width / 2 - temple.width / 2 + 2;
          bg.addChild(leaves);
          bg.bringToTop();
          this.finishPage();
        }
      });
    });
  }

  normalTool() {
    if(this.idleWarn)
      this.idleWarn.stop();
    this.idleWarning();
    this.createToolbar({
      onlyShowPauseBtn: false,
      soundData: {
        autoPlay: false,
        sound: [this.staticResource.repeatSound.sound, historyHero.pageSounds.clickTheRightAnswer.sound],
        callback: () => {
          if(this.idleWarn)
            this.idleWarn.stop();
          this.idleWarning();
        }
      }
    });
  }

  finishPage() {
    if(this.idleWarn)
      this.idleWarn.stop();
    this.idleWarning(historyHero.pageSounds.clickThatsGo.sound, null, 15);
    this.exit = this.createToolbar({
      onlyShowPauseBtn: false,
      soundData: {
        autoPlay: true,
        sound: historyHero.pageSounds.clickThatsGo.sound,
        startCallback: () => {
          if (this.exitFlasher) {
            this.exitFlasher.start();
          }
        },
        callback: () => {
          this.exitFlasher.stop();
        }
      },
      exitData: () => {
        //TODO:待退出方法完善
      }
    });
    this.exitFlasher = new TextureFlasher(this, this.exit.exitBtn, [
      'toolbarIconExit',
      'toolbarIconExitFlasher'
    ], {
      duration: 300,
      autoStart: false
    });
    this.exitFlasher.start();
  }

  renderOptionsBtn() {
    this.optionsBtnArr = [];
    let staticImgs = historyHero.pageImages;
    this.staticResource.options.forEach((item, i) => {
      let optionBtn = this.pageGroup.create(item.position.x, item.position.y, staticImgs.whiteBg3.image);
      optionBtn.lightHightKey = staticImgs.YellowBlock.image;
      optionBtn.resetKey = staticImgs.whiteBg3.image;
      let text = this.add.text(0, 0, item.text, textStyle);
      text.x = optionBtn.width / 2 - text.width / 2;
      text.y = optionBtn.height / 2 - text.height / 2;
      optionBtn.addChild(text);
      optionBtn.inputEnabled = false;
      optionBtn.events.onInputDown.add(() => {
        this.optionsClickEvent(optionBtn, i, item);
      });
      this.optionsBtnArr.push(optionBtn);
    });
  }

  optionsClickEvent(sprite, i, item) {
    this.choiceBtn.inputEnabled = true;
    for (let list of this.optionsBtnArr) {
      list.loadTexture(list.resetKey);
    }
    sprite.loadTexture(sprite.lightHightKey);
    this.choiceBtn.paradox = i;
    this.choiceBtn.loadTexture(this.choiceBtn.activeKey);
    this.choiceBtn.btnFlasher.start();
    this.playSoundPromiseByObject(item);
  }

  renderTemple() {
    let staticImgs = historyHero.pageImages;
    this.pageGroup.removeAll();
    this.pageGroup.create(0, 0, staticImgs.templeBg.image);
    let blockBg = this.createSprite(0, 0, staticImgs.leaves);
    let block = this.createSprite(0, 40, staticImgs.whiteGrey);
    block.x = this.pageGroup.width / 2 - block.width / 2;
    this.pageGroup.add(blockBg);
    this.pageGroup.add(block);
    let titlePositive = this.add.text(50, 50, this.staticResource.finishChoiceSound.positive.text + ':', textStyle);
    let titleReverse = this.add.text(400, 50, this.staticResource.finishChoiceSound.reverse.text + ':', textStyle);
    block.addChild(titlePositive);
    block.addChild(titleReverse);
    block.titlePositive = titlePositive;
    block.titleReverse = titleReverse;
    return block;
  }

  renderLastPage() {
    this.clickStage = false;
    this.indicatorBtn.bntGroup.removeAll();
    let soundAddr = historyHero.pageSounds;
    let soundsArr = [soundAddr.dontForget, this.staticResource.lastPageCommon];
    let block = this.renderTemple();
    this.renderWords(block);
    this.playMultiPromiseObject(soundsArr).then(() => {
      return this.playSoundPromiseByObject(soundAddr.letsRepeatYouMiss);
    }).then(() => {
      this.triggerClick(this.paradoxPositive, this.paradoxReverse);
    });
  }

  renderWords(block) {
    this.paradoxPositive = [];
    this.paradoxReverse = [];
    let positiveIndex = 1;
    let reverseIndex = 1;
    for (let val of this.wrongData) {
      let word = this.add.text(0, 0, val.letter, textStyle);
      block.addChild(word);
      let wordFlasher = new ObjectPropertyFlasher(this, word, 'fill', [STATIC.BLACK, STATIC.LIGHT_BLUE], { duration: 500, times: 4, autoStart: false });
      word.wordFlasher = wordFlasher;
      word.isClick = 0;
      word.paradox = val.paradox;
      word.sound = val.paradox ? this.staticResource.choiceSound.reverse : this.staticResource.choiceSound.positive;
      word.inputEnabled = false;
      word.events.onInputDown.add(() => {
        this.clickStage = true;
        this.clickEvent(word, this.paradoxPositive, this.paradoxReverse, val);
      });
      if (val.paradox) {
        word.x = 400 + block.titleReverse.width - word.width;
        word.y = 50 + 50 * reverseIndex;
        reverseIndex++;
        this.paradoxReverse.push(word);
      } else {
        word.x = 50 + block.titlePositive.width - word.width;
        word.y = 50 + 50 * positiveIndex;
        positiveIndex++;
        this.paradoxPositive.push(word);
      }
    }
  }

  isAllSatisfy(arr, props) {
    return arr.every((item) => {
      return item[props];
    });
  }

  clickEvent(word, paradoxPositive, paradoxReverse, val) {
    let soundAddr = historyHero.pageSounds;
    let dataArray = word.paradox ? paradoxReverse : paradoxPositive;
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i].text === word.text) {
        dataArray.splice(i, 1);
        break;
      }
    }
    this.clickToolbar([soundAddr.clickItEachAnswer.sound], dataArray, false);
    let soundData = [val, word.sound];
    word.inputEnabled = false;
    word.isClick = 1;
    this.playMultiPromiseObject(soundData).then(() => {
      word.fill = STATIC.GREY;
      for (let i = 0; i < this.wrongData.length; i++) {
        if (this.wrongData[i].letter === word.text) {
          this.wrongData.splice(i, 1);
          break;
        }
      }
      if (word.paradox && !paradoxReverse.length) {
        this.finishPage();
      } else if (!word.paradox && !paradoxPositive.length) {
        this.clickStage = false;
        this.triggerClick(paradoxPositive, paradoxReverse);
      }
    });
  }

  triggerClick(paradoxPositive, paradoxReverse) {
    let soundAddr = historyHero.pageSounds;
    let soundNew = paradoxPositive.length ? this.staticResource.finishChoiceSound.positive : this.staticResource.finishChoiceSound.reverse;
    let dataArr = paradoxPositive.length ? paradoxPositive : paradoxReverse;
    for (let val of dataArr) {
      val.wordFlasher.start();
      val.inputEnabled = true;
    }
    let sounds = !this.clickStage ? [soundNew.sound, soundAddr.clickItEachAnswer.sound] : [soundAddr.clickItEachAnswer.sound];
    this.clickToolbar(sounds, dataArr);
  }

  clickToolbar(sounds, dataArr, bool = true) {
    this.createToolbar({
      soundData: {
        sound: sounds,
        autoPlay: bool,
        startCallback: () => {
          for (let item of dataArr) {
            if (!item.isClick) {
              new ObjectPropertyFlasher(this, item, 'fill', [STATIC.BLACK, STATIC.BLUE], { duration: 350, times: 10, autoStart: true });
            }
          }
        },
        callback: () => {
          if(this.idleWarn)
            this.idleWarn.stop();
          this.idleWarning(sounds, () => {
            for (let item of dataArr) {
              if (!item.isClick) {
                new ObjectPropertyFlasher(this, item, 'fill', [STATIC.BLACK, STATIC.BLUE], { duration: 350, times: 10, autoStart: true });
              }
            }
          }, 15);
        }
      },
      onlyShowPauseBtn: false
    });
  }

  idleWarning(obj = [this.staticResource.repeatSound, historyHero.pageSounds.clickTheRightAnswer], callback, time = 15) {
    let i = 0;
    this.idleWarn = this.createIdleWarning(time, (resolve) => {
      i++;
      if (i === 3) {
        this.util.waitByPromise(120000).then(() => {
          this.util.safeInvoke(callback);
          if (_.isArray(obj)) {
            return this.playMultiPromiseObject(obj);
          } else {
            return this.playSoundPromiseByObject(obj);
          }
        });
      } else {
        this.util.safeInvoke(callback);
        if (_.isArray(obj)) {
          return this.playMultiPromiseObject(obj).then(() => {
            resolve();
          });
        } else {
          return this.playSoundPromiseByObject(obj).then(() => {
            resolve();
          });
        }
      }
    }, undefined, 3);
    this.idleWarn.start();
  }
}

export {
  HistoryHero
};