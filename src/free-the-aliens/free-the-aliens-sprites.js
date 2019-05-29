import BaseSprite from '../../framework/core/BaseSprite';
import AssetJson from './AssetJson';
import { SilPlayer } from '../../framework/plugins/SilPlayer';

let _symbol = {
  list: Symbol()
};

function clear(sprite) {
  sprite.destroy();
}

const yPoint = [0.02, 0.1, 0.12, 0.1, 0.2, 0.05, 0.07, 0.1, 0.15, 0.12, 0.09, 0.07];

class FreeTheAliensSprites extends BaseSprite {
  constructor() {
    super();
    this[_symbol.list] = [];
  }

  //清空当前显示精灵
  clear() {
    this[_symbol.list].forEach(clear, this);
  }

  //重新显示精灵，了解需求中
  reShow() {
    this.clear();
    this.create(0, 0, AssetJson.base.image.light);
    AssetJson.base.sprite.forEach(this.addSprite, this);
  }

  addSprite(key, index) {
    let sprite = new SilPlayer(this.game, key, {
      x: index === 2 ? 0.86 * this.game.width : (0.05 * index * this.game.width + (index ? 0.1 * this.game.width : 0)),
      y: (0.55 - yPoint[index]) * this.game.height,
      playSpeed: 19,
      autoPlay: true,
      isLoop: true
    });
    this.addChild(sprite);
    this[_symbol.list].push(sprite);
  }
}

export default FreeTheAliensSprites;