import Btn from './btn';
import PropertyFlasher from '../property-flasher';

let _symbol = {
  flash: Symbol(),
  prompt: Symbol(),
  flasher: Symbol()
};

class BtnFlashBgPrompt extends Btn {
  constructor() {
    super();
  }

  get flash() {
    return this[_symbol.flash];
  }

  set flash(sprite) {
    if (this.flash) {
      this.removeChild(this.flash);
    }
    this[_symbol.flash] = sprite;
    this.addChildAt(this.flash, 0);
    this.flash.visible = false;
    this[_symbol.flasher] = new PropertyFlasher(this.flash, 'visible', true, 300);
    this[_symbol.flasher].isStop = true;
  }

  get prompt() {
    return this[_symbol.prompt];
  }

  set prompt(bl) {
    if (!this[_symbol.flasher]) {
      return;
    }
    if (bl) {
      this[_symbol.flasher].play(this.stopCallback, this);
    } else {
      this[_symbol.flasher].stop();
    }
  }

  stopCallback() {
    this.flash.visible = false;
  }
}

export default BtnFlashBgPrompt;