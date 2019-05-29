import Phaser from 'phaser';
/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * This turns your displayObjects to Shinyscale.
 * @class Shiny
 * @contructor
 */


function load() {
  if (Phaser.Filter.Shiny) {
    return;
  }

  Phaser.Filter.Shiny = function (game) {

    Phaser.Filter.call(this, game);

    this.uniforms.Shiny = { type: '1f', value: 1.0 };

    this.fragmentSrc = [

      'precision mediump float;',

      'varying vec2       vTextureCoord;',
      'varying vec4       vColor;',
      'uniform sampler2D  uSampler;',
      'uniform float      Shiny;',

      'void main(void) {',
      'gl_FragColor = texture2D(uSampler, vTextureCoord);',
      'if(gl_FragColor[3]!=0.0){',
      'gl_FragColor = vec4((1.0-gl_FragColor.r)/2.0+gl_FragColor.r,(1.0-gl_FragColor.g)/2.0+gl_FragColor.g,(1.0-gl_FragColor.b)/2.0+gl_FragColor.b,gl_FragColor[3]);',
      '}',
      '}'
    ];

  };

  Phaser.Filter.Shiny.prototype = Object.create(Phaser.Filter.prototype);
  Phaser.Filter.Shiny.prototype.constructor = Phaser.Filter.Shiny;
  Phaser.Filter.Shiny.prototype.forEachPixel = (pixel) => {

    pixel.r = (255 - pixel.r) / 2.0 + pixel.r;
    pixel.g = (255 - pixel.g) / 2.0 + pixel.g;
    pixel.b = (255 - pixel.b) / 2.0 + pixel.b;
    return pixel;
  };
  /**
   * The strength of the Shiny. 1 will make the object black and white, 0 will make the object its normal color
   * @property Shiny
   */
  Object.defineProperty(Phaser.Filter.Shiny.prototype, 'Shiny', {

    get: function () {
      return this.uniforms.Shiny.value;
    },

    set: function (value) {
      this.uniforms.Shiny.value = value;
    }

  });

}
class Shiny {
  static load(game) {
    load(game);
  }
}

export default Shiny;