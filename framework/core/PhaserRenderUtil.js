import Phaser from 'phaser';
import _ from 'lodash';


const cacheKey = 'phaserRenderType2.0';
const extArr = ['OES_texture_half_float', 'OES_texture_half_float_linear', 'EXT_texture_filter_anisotropic'];
class PhaserRenderUtil {
  static getPhaserRender(render) {
    if (render === Phaser.CANVAS) {
      return render;
    }
    let cache = window.localStorage[cacheKey];
    if (cache) {
      if (parseInt(cache) === 1) {
        return Phaser.CANVAS;
      }
      return Phaser.AUTO;
    }

    if (Phaser.Device.windows) {
      return Phaser.AUTO;
    }

    let canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl');
    if (!gl) {
      window.localStorage[cacheKey] = 0;
      return Phaser.AUTO;
    }
    let exts = gl.getSupportedExtensions();
    let result = _.intersection(exts, extArr);
    if (result.length !== extArr.length) {
      window.localStorage[cacheKey] = 1;
      return Phaser.CANVAS;
    } else {
      window.localStorage[cacheKey] = 0;
      return Phaser.AUTO;
    }
  }
}

export default PhaserRenderUtil;