import { Courseware } from '../../framework/core/Courseware';
require('../../framework/phaserplugins/phaserrichtext');
import StaticRes from './static-resource.json';
import { BaseState } from './base-state.js';
import { IndicatorHwBnt } from '../../framework/plugins/IndicatorHwBnt';

class Hwtpl608 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.util.loadSpeakerBtn();
      this.loadPageResources(data, StaticRes);
      this.data = Object.assign(data, StaticRes);
      this.loadHwPublicResource();
    };

    super({}, preload, () => {
      this.pagesIndex = 0;
      this.createUI();
      this.indicatorHwBnt = new IndicatorHwBnt(
        this,
        this.data.pages.length,
        { distance: 20, height: 580 }
      );
    });
  }

  createUI() {
    if (this.data.firstAudio.sound) {
      this.playSoundPromise(this.data.firstAudio.sound);
    }
    this.initQuestionList(this.data.pages.length);
    this.createSprite(0, 0, this.data.localPage.bg);
    this.createHwToolbar();
    this.BaseStateInstance = new BaseState(this, this.data.pages[this.pagesIndex]);
  }

  changePages() {
    this.BaseStateInstance.changeAllClickPower(true, false);
    if (this.pagesIndex + 1 === this.data.pages.length) {
      this.BaseStateInstance.handleFinish();
    } else {
      this.BaseStateInstance.handleNext();
    }
  }

  nextPages() {
    this.BaseStateInstance.belowEggGroup.removeAll();
    this.BaseStateInstance.AboveEggGroup.removeAll();

    this.BaseStateInstance.removeAll();
    this.pagesIndex = this.pagesIndex + 1;
    this.BaseStateInstance = new BaseState(this, this.data.pages[this.pagesIndex]);
    this.indicatorHwBnt.changeBtnColor(this.pagesIndex);
  }
}

export {
  Hwtpl608
};