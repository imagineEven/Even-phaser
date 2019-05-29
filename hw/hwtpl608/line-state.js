import { TextureFlasher } from '../../framework/plugins/TextureFlasher';
class LineState {
  constructor(obj, game) {
    this.obj = obj;
    this.aboveEgg = this.obj.aboveEgg;
    this.belowEgg = this.obj.belowEgg;
    this.line = this.obj.graphic;
    this.game = game;
    if (this.aboveEgg.matchMark == this.belowEgg.matchMark) {
      this.aboveEgg.matchCorrect = true;
    } else {
      this.aboveEgg.matchCorrect = false;
    }
  }

  aboveEgg() {
    return this.obj.aboveEgg;
  }
  
  belowEgg() {
    return this.obj.belowEgg;
  }

  line() {
    return this.obj.graphic;
  }

  destroyLine() {
    this.line.destroy();
    this.belowEgg.loadTexture(this.belowEgg.whiteEgg);
    this.aboveEgg.loadTexture(this.aboveEgg.whiteEgg);
    this.aboveEgg.whiteBgSprite.highLight.alpha = 0;
    this.belowEgg.speakerBtn.highLightSpeakerSprite.alpha = 0;
    this.belowEgg.lineInstance ? this.belowEgg.lineInstance = undefined : undefined;
    this.aboveEgg.lineInstance ? this.aboveEgg.lineInstance = undefined : undefined;
    this.aboveEgg.selectState = this.aboveEgg.selectState = false;
    this.belowEgg.selectState = this.belowEgg.selectState = false;
  }

  showErrLine() {
    this.belowEgg.loadTexture(this.belowEgg.grayEgg);
    this.aboveEgg.loadTexture(this.aboveEgg.grayEgg);
    //this.line.destroy();
    this.createYellowLine();
    new TextureFlasher(this.game, this.belowEgg, [this.belowEgg.yellowEgg, this.belowEgg.grayEgg], { duration: 300, times: 4, autoStart: true});
    new TextureFlasher(this.game, this.aboveEgg, [this.aboveEgg.yellowEgg, this.aboveEgg.grayEgg], { duration: 300, times: 4, autoStart: true});
    this.createGrayLine();
    this.createGrayShade();
    return this.game.util.waitByPromise(300).then(() => {
      this.createYellowLine();
      this.grayBgSprite.alpha = 0;
      this.graySpeaker.alpha = 0;
      return this.game.util.waitByPromise(300);
    }).then(() => {
      this.createGrayLine();
      this.grayBgSprite.alpha = 0.5;
      this.graySpeaker.alpha = 0.5;
      return this.game.util.waitByPromise(300);
    }).then(() => {
      this.createYellowLine();
      this.grayBgSprite.destroy();
      this.graySpeaker.destroy();
      return this.game.util.waitByPromise(300);
    });
  }

  createGrayShade() {
    this.grayBgSprite = this.game.createSprite(0, 0, this.aboveEgg.whiteBgSprite.grayBg);
    this.grayBgSprite.anchor.set(0.5);
    this.grayBgSprite.alpha = 0.5;
    this.aboveEgg.whiteBgSprite.addChild(this.grayBgSprite);

    this.graySpeaker = this.game.createSprite(0, 0, this.belowEgg.speakerBtn.graySpeaker);
    this.graySpeaker.anchor.set(0.5);
    this.graySpeaker.alpha = 0.5;
    this.belowEgg.speakerBtn.addChild(this.graySpeaker);
  }

  createYellowLine() {
    // create gray line
    this.line.destroy();
    let graphic = this.game.add.graphics(0, 0);
    graphic.lineStyle(2, 0Xfff45c);
    graphic.moveTo(this.belowEgg.x, this.belowEgg.y);
    graphic.lineTo(this.aboveEgg.x, this.aboveEgg.y);
    this.line = graphic;
    return graphic;
  }

  createGrayLine() {
    // create yellow line
    this.line.destroy();
    let graphic = this.game.add.graphics(0, 0);
    graphic.lineStyle(2, 0X999237);
    graphic.moveTo(this.belowEgg.x, this.belowEgg.y);
    graphic.lineTo(this.aboveEgg.x, this.aboveEgg.y);
    this.line = graphic;
    return graphic;
  }
}

export {
  LineState
};
