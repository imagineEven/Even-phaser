import Phaser from 'phaser';
import staticRes from './static-resource.json';
import { LineState } from './line-state';
import { TextureFlasher } from '../../framework/plugins/TextureFlasher';
import ExitUtil from '../../framework/plugins/exitUtil';
import _ from 'lodash';
class BaseState extends Phaser.Group {
  constructor(game, data) {
    super(game);
    this.game = game;
    this.data =data;
    this.init();
  }

  init() {
    //let btn = this.game.util.createSpeakerAnimationBtn(100, 100, 'bigSpeaker', false);
    // btn.playSound(this.data.firstAudio.sound, 5).then(() => {
    //   console.log(1111);
    // })
    this.belowEgg = '';
    this.aboveEgg = '';
    this.onlyOne = false;
    this.getAllPositionArr();
    this.createAboveEgg();
    this.createBelowEgg();
    this.createOptionsImage();
    this.createSpeakersSound();
    this.bindAboveEggEvent();
    this.bindBelowEggEvent();
    this.createSubmit();
  }

  getAllPositionArr() {
    let stateLength = this.data.page.length;
    switch(stateLength) {
      case 2:
        this.optionPositonArr = staticRes.localPosition.twoOptions;
        this.speakerPositionArr = staticRes.localPosition.twoSpeakers;
        break;
      case 3:
        this.optionPositonArr = staticRes.localPosition.threeOptions;
        this.speakerPositionArr = staticRes.localPosition.threeSpeakers;
        break;
      case 4:
        this.optionPositonArr = staticRes.localPosition.fourOptions;
        this.speakerPositionArr = staticRes.localPosition.fourSpeakers;
        break;
      default:
        this.optionPositonArr = staticRes.localPosition.fiveoptions;
        this.speakerPositionArr = staticRes.localPosition.fiveSpeakers;
    }
  }

  createAboveEgg() {
    let aboveWhiteEggshell = staticRes.localPage.aboveWhiteEggshell.image;
    let aboveYellowEggshell = staticRes.localPage.aboveYellowEggshell.image;
    let aboveGrayEggshell = staticRes.localPage.aboveGrayEggshell.image;
    let whiteBg = staticRes.localPage.whiteBg.image;
    this.AboveEggGroup = this.game.add.group();
    this.optionPositonArr.forEach((position) => {
      let whiteBgSprite = this.game.createSprite(position[0], position[1], whiteBg);
      let aboveEggshell = this.game.createSprite(position[0], position[1] - 72, aboveWhiteEggshell);
      this.add(whiteBgSprite);
      this.add(aboveEggshell);
      aboveEggshell.anchor.set(0.5);
      aboveEggshell.yellowEgg = aboveYellowEggshell;
      aboveEggshell.grayEgg = aboveGrayEggshell;
      aboveEggshell.whiteEgg = aboveWhiteEggshell;
      aboveEggshell.whiteBgSprite = whiteBgSprite;
      aboveEggshell.whiteBgSprite.grayBg = staticRes.localPage.grayBg.image;
      aboveEggshell.whiteBgSprite.whiteBg = staticRes.localPage.whiteBg.image;
      aboveEggshell.oldX = whiteBgSprite.x;
      aboveEggshell.oldY = whiteBgSprite.y;
      whiteBgSprite.anchor.set(0.5);
      this.AboveEggGroup.add(aboveEggshell);
    });
  }

  createBelowEgg() {
    // let pageArr = this.data.page;
    let belowWhiteEggshell = staticRes.localPage.belowWhiteEggshell.image;
    let belowYellowEggshell = staticRes.localPage.belowYellowEggshell.image;
    let belowGrayEggshell = staticRes.localPage.belowGrayEggshell.image;
    let graySpeaker = staticRes.localPage.graySpeaker.image;
    let highLightSpeaker = staticRes.localPage.highLightSpeaker.image;
    this.belowEggGroup = this.game.add.group();
    this.speakerPositionArr.forEach((position) => {
      let speakerBtn = this.game.util.createSpeakerAnimationBtn(position[0], position[1], 'bigSpeaker', false);
      let highLightSpeakerSprite = this.game.createSprite(0, 0, highLightSpeaker);
      highLightSpeakerSprite.alpha = 0;
      highLightSpeakerSprite.anchor.set(0.5);
      let belowEggshell = this.game.createSprite(position[0], position[1] + 41, belowWhiteEggshell);
      this.add(speakerBtn);
      this.add(belowEggshell);
      this.add(highLightSpeakerSprite);
      speakerBtn.anchor.set(0.5);
      speakerBtn.addChild(highLightSpeakerSprite);
      speakerBtn.highLightSpeakerSprite = highLightSpeakerSprite;
      belowEggshell.anchor.set(0.5);
      belowEggshell.yellowEgg =  belowYellowEggshell;
      belowEggshell.grayEgg = belowGrayEggshell;
      belowEggshell.whiteEgg = belowWhiteEggshell;
      belowEggshell.speakerBtn = speakerBtn;
      belowEggshell.speakerBtn.graySpeaker = graySpeaker;
      belowEggshell.oldX = belowEggshell.x;
      belowEggshell.oldY = belowEggshell.y;
      this.belowEggGroup.add(belowEggshell);
    });
  }

  createOptionsImage() {
    let pageArr = this.data.page;
    let shuffleEggArr = _.shuffle(this.AboveEggGroup.children);
    shuffleEggArr.forEach((sprite, index) => {
      let whiteBgSprite = sprite.whiteBgSprite;
      sprite.matchMark = index;
      whiteBgSprite.matchMark = index;
      let image = this.game.createSprite(0, 0, pageArr[index].image);
      this.setImgScaleToBg(image, whiteBgSprite);
      let highLight = this.game.createSprite(0, 0, staticRes.localPage.highLight.image);
      this.add(highLight);
      highLight.alpha = 0;
      image.anchor.set(0.5);
      highLight.anchor.set(0.5);
      whiteBgSprite.addChild(image);
      whiteBgSprite.addChild(highLight);
      if (pageArr[index].imageSound && pageArr[index].imageSound.sound) {
        let speakerBtn = this.game.util.createSpeakerAnimationBtn(50, 37, 'smallSpeaker');
        speakerBtn.realSound = pageArr[index].imageSound.sound;
        speakerBtn.anchor.set(0.5);
        this.add(speakerBtn);
        whiteBgSprite.addChild(speakerBtn);
        whiteBgSprite.speakerBtn = speakerBtn;
      }
      whiteBgSprite.image = image;
      whiteBgSprite.highLight = highLight;
    });
  }

  createSpeakersSound() {
    let pageArr = this.data.page;
    let shuffleSpeakerArr = _.shuffle(this.belowEggGroup.children);
    shuffleSpeakerArr.forEach((sprite, index) => {
      let speakerBtn = sprite.speakerBtn;
      sprite.matchMark = index;
      speakerBtn.matchMark = index;
      speakerBtn.realSound = pageArr[index].speakerSound.sound;
    });
  }

  bindAboveEggEvent() {
    this.AboveEggGroup.children.forEach((eggSprite) => {
      eggSprite.inputEnabled = true;
      eggSprite.events.onInputUp.add(this.aboveEggUpEvent, this);
      eggSprite.whiteBgSprite.inputEnabled = true;
      eggSprite.whiteBgSprite.events.onInputUp.add(this.whiteBgUpEvent, this);
    });
  }

  aboveEggUpEvent(event) {
    //this.game.playSoundPromise(staticRes.localSound.dindin.sound);
    event.loadTexture(event.yellowEgg);
    event.whiteBgSprite.highLight.alpha = 1;
    this.aboveEgg = event;
    if (this.belowEgg && this.aboveEgg) {
      this.createLine(this.belowEgg, this.aboveEgg);
    }
    this.changeNormalState(event.matchMark, this.AboveEggGroup.children);
  }

  whiteBgUpEvent(event) {
    if (event.speakerBtn) {
      event.speakerBtn.playSound(event.speakerBtn.realSound, 5);
    }
  }

  bindBelowEggEvent() {
    this.belowEggGroup.children.forEach((eggSprite) => {
      eggSprite.inputEnabled = true;
      eggSprite.events.onInputUp.add(this.belowEggUpEvent, this);
      eggSprite.speakerBtn.inputEnabled = true;
      eggSprite.speakerBtn.events.onInputUp.add(this.speakerBtnUpEvent, this);
    });
  }

  belowEggUpEvent(event) {
    //this.game.playSoundPromise(staticRes.localSound.dindin.sound);
    event.speakerBtn.highLightSpeakerSprite.alpha = 1;
    event.loadTexture(event.yellowEgg);
    this.belowEgg = event;
    if (this.belowEgg && this.aboveEgg) {
      this.createLine(this.belowEgg, this.aboveEgg);
    }
    this.changeNormalState(event.matchMark, this.belowEggGroup.children);
  }

  speakerBtnUpEvent(event) {
    //event.highLightSpeaker.alpha = 1;
    event.playSound(event.realSound, 5).then(() => {
    });
  }

  creategraphic(belowEgg, aboveEgg) {
    let graphic = this.game.add.graphics(0, 0);
    graphic.lineStyle(2, 0XFAEBD7);
    graphic.moveTo(belowEgg.x, belowEgg.y);
    graphic.lineTo(aboveEgg.x, aboveEgg.y);
    this.add(graphic);
    let lineInstance = new LineState({ aboveEgg, belowEgg, graphic }, this.game);
    this.belowEgg.selectState = this.aboveEgg.selectState = true;
    this.belowEgg.loadTexture(this.belowEgg.yellowEgg);
    this.aboveEgg.loadTexture(this.aboveEgg.yellowEgg);
    this.aboveEgg.whiteBgSprite.highLight.alpha = 0;
    this.belowEgg.speakerBtn.highLightSpeakerSprite.alpha = 0;
    this.belowEgg.lineInstance = this.aboveEgg.lineInstance = lineInstance;
    this.belowEgg = this.aboveEgg = '';
    this.gameOver();
  }

  createLine(belowEgg, aboveEgg) {
    this.game.playSoundPromise(staticRes.localSound.connection.sound);
    if (belowEgg.lineInstance && aboveEgg.lineInstance) {
      belowEgg.lineInstance.destroyLine();
      if (aboveEgg.lineInstance) {
        aboveEgg.lineInstance.destroyLine();
        this.creategraphic(belowEgg, aboveEgg);
      } else {
        this.belowEgg = this.aboveEgg = '';
        this.gameOver();
      }
    } else if (belowEgg.lineInstance) {
      belowEgg.lineInstance.destroyLine();
      this.creategraphic(belowEgg, aboveEgg);
    } else if (aboveEgg.lineInstance) {
      aboveEgg.lineInstance.destroyLine();
      this.creategraphic(belowEgg, aboveEgg);
    } else {
      this.creategraphic(belowEgg, aboveEgg);
    }
  }
  
  createSubmit() {
    this.submit = this.game.createSprite(400, 494, staticRes.localPage.yellowSubmit.image);
    this.next = this.game.createSprite(400, 494, staticRes.localPage.next.image);
    this.add(this.submit);
    this.add(this.next);
    this.submit.visible = false;
    this.next.visible = false;
    this.next.finish = staticRes.localPage.finish.image;
    this.submit.anchor.set(0.5);
    this.next.anchor.set(0.5);
    this.submit.yellowSubmit = staticRes.localPage.yellowSubmit.image;
    this.submit.greenSubmit = staticRes.localPage.greenSubmit.image;
    this.submit.Flasher = new TextureFlasher(this.game, this.submit, [this.submit.yellowSubmit, this.submit.greenSubmit], { duration: 300 });
    this.submit.inputEnabled = true;
    this.submit.events.onInputUp.add(this.submitUpEvent, this);
  }

  submitUpEvent() {
    this.changeAllClickPower(false);
    if (this.judgeCorrent()) {
      this.game.playSoundPromise(staticRes.localSound.correct.sound);
      this.submit.Flasher.stop();  
      this.game.changePages();
    } else {
      this.submit.Flasher.stop();
      this.submit.visible = false;
      this.game.playSoundPromise(staticRes.localSound.wrong.sound);
      this.game.answerQuestion(this.game.pagesIndex, false);
      this.AboveEggGroup.children.forEach(item => {
        if (!item.matchCorrect) {
          item.lineInstance.showErrLine().then(() => {
            if (!this.onlyOne) {
              this.destroyAllSeletcState();
            }
          });
        }
      });
    }
  }

  handleFinish() {
    this.submit.visible = false;
    this.next.visible = true;
    this.next.loadTexture(this.next.finish);
    this.next.inputEnabled = true;
    this.next.events.onInputUp.add(() => {
      ExitUtil.gameOver(this.game);
    });
  }

  handleNext() {
    this.submit.visible = false;
    this.next.visible = true;
    this.next.inputEnabled = true;
    this.next.events.onInputUp.add(() => {
      this.game.nextPages();
    });
  }

  destroyAllSeletcState() {
    this.AboveEggGroup.children.forEach(item => {
      item.lineInstance ? item.lineInstance.destroyLine() : undefined;
      item.matchCorrect = false;
    });
    this.changeAllClickPower(true);
  }

  judgeCorrent() {
    let allCorect = true;
    this.AboveEggGroup.children.forEach(item => {
      if (!item.matchCorrect) {
        allCorect = false;
      }
    });
    return allCorect;
  }

  changeAllClickPower(power, isall = true ) {
    if (isall) {
      this.game.util.setObjectArrayClicked(this.AboveEggGroup.children, power);
      this.game.util.setObjectArrayClicked(this.belowEggGroup.children, power);
    }
    this.AboveEggGroup.children.forEach(item => {
      item.whiteBgSprite.inputEnabled = power;
    });
    this.belowEggGroup.children.forEach(item => {
      item.speakerBtn.inputEnabled = power;
    });
  }

  gameOver() {
    if (this.checkGameOver()) {
      this.submit.visible = true;
      this.submit.Flasher.start();
    } else {
      this.submit.visible = false;
      this.submit.Flasher.stop();
    }
  }

  checkGameOver() {
    let over = true;
    this.AboveEggGroup.children.forEach(item => {
      if (!item.lineInstance) {
        over = false;
      }
    });
    return over;
  }

  changeNormalState(mark, arr) {
    arr.forEach(item => {
      if (item.matchMark !== mark) {
        item.selectState ? undefined : item.loadTexture(item.whiteEgg);
        if (item.whiteBgSprite) {
          item.whiteBgSprite.selectState ? undefined : item.whiteBgSprite.highLight.alpha = 0;
        } else if (item.speakerBtn.highLightSpeakerSprite) {
          item.speakerBtn.highLightSpeakerSprite.alpha = 0;
        }
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

export { BaseState };