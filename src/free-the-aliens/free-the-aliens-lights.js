import BaseSprite from '../../framework/core/BaseSprite';
import { SilPlayer } from '../../framework/plugins/SilPlayer';
import AssetJson from './AssetJson';

let _symbol = {
  topLeft: Symbol(),
  topRight: Symbol(),
  bottomLeft: Symbol(),
  bottomRight: Symbol()
};


class FreeTheAliensLights extends BaseSprite {
  constructor() {
    super();
    this[_symbol.bottomLeft] = new SilPlayer(this.game, AssetJson.base.json.lightBottom, {
      x: 0,
      y: 0.847 * this.game.height,
      playSpeed: 100,
      autoPlay: true,
      isLoop: true,
      isBigAnimation: 1
    });
    this[_symbol.bottomRight] = new SilPlayer(this.game, AssetJson.base.json.lightBottom, {
      x: this.game.width,
      y: 0.847 * this.game.height,
      playSpeed: 100,
      autoPlay: true,
      isLoop: true,
      isBigAnimation: 1
    });
    this[_symbol.bottomRight].width *= -1;
    this[_symbol.topLeft] = new SilPlayer(this.game, AssetJson.base.json.lightTop, {
      x: 0,
      y: 0,
      playSpeed: 100,
      autoPlay: true,
      isLoop: true,
      isPixelPerfectClick: true,
      isBigAnimation: 1
    });
    this[_symbol.topRight] = new SilPlayer(this.game, AssetJson.base.json.lightTop, {
      x: this.game.width,
      y: 0,
      playSpeed: 100,
      autoPlay: true,
      isLoop: true,
      isPixelPerfectClick: true,
      isBigAnimation: 1
    });
    this[_symbol.topRight].width *= -1;
  }
}

export default FreeTheAliensLights;