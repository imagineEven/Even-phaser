/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * This turns your displayObjects to Bluescale.
 * @class Blue
 * @contructor
 */
import Phaser from 'phaser';

function load() {
  if (Phaser.Filter.Blue) {
    return;
  }

  Phaser.Filter.Blue = function (game) {

    Phaser.Filter.call(this, game);

    this.uniforms.Blue = { type: '1f', value: 1.0 };

    this.fragmentSrc = [

      'precision mediump float;',

      'varying vec2       vTextureCoord;',
      'varying vec4       vColor;',
      'uniform sampler2D  uSampler;',
      'uniform float      Shiny;',

      'void main(void) {',
      'gl_FragColor = texture2D(uSampler, vTextureCoord);',
      'gl_FragColor = vec4(gl_FragColor.r/2.0,gl_FragColor.g/2.0,gl_FragColor.b,gl_FragColor[3]);',
      '}'
    ];

  };

  Phaser.Filter.Blue.prototype = Object.create(Phaser.Filter.prototype);
  Phaser.Filter.Blue.prototype.constructor = Phaser.Filter.Blue;
  Phaser.Filter.Blue.prototype.forEachPixel = (pixel) => {
    pixel.r = pixel.r / 2.0;
    pixel.g = pixel.g / 2.0 ;
    pixel.b = pixel.b / 2.0;
    return pixel;
  };
  /**
     * The strength of the gold. 1 will make the object black and white, 0 will make the object its normal color
     * @property gold
     */
  Object.defineProperty(Phaser.Filter.Blue.prototype, 'Blue', {

    get: function () {
      return this.uniforms.Blue.value;
    },

    set: function (value) {
      this.uniforms.Blue.value = value;
    }

  });
}

class Blue {
  static load() {
    load();
  }
}

export default Blue;