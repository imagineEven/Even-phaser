import BaseSprite from './BaseSprite';

let _symbol = {};

function addFrame(frame) {
  if (_symbol.hasOwnProperty(frame.name)) {
    _symbol[frame.name] = Symbol();
  }
  this[_symbol[frame.name]] = this.getTexture(frame.key);
}

class SpriteTexturePack extends BaseSprite {
  constructor(framesArray) {
    super();
    framesArray.forEach(addFrame, this);
  }

  goto(frameName) {
    this.texture = this[_symbol[frameName]] ? this[_symbol[frameName]] : null;
  }
}

export default SpriteTexturePack;