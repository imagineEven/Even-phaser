import Phaser from 'phaser';

function load() {
  if (Phaser.Filter.Gold) {
    return;
  }
  Phaser.Filter.Gold = function (game) {

    Phaser.Filter.call(this, game);

    this.uniforms.Gold = { type: '1f', value: 1.0 };

    this.fragmentSrc = [

      'precision mediump float;',

      'varying vec2       vTextureCoord;',
      'varying vec4       vColor;',
      'uniform sampler2D  uSampler;',
      'uniform float      Shiny;',

      'void main(void) {',
      'gl_FragColor = texture2D(uSampler, vTextureCoord);',
      'if(gl_FragColor[3]!=0.0){',
      'gl_FragColor = vec4( (1.0 - gl_FragColor.r) / 2.5 + gl_FragColor.r , (1.0 - gl_FragColor.g) / 2.5 + gl_FragColor.g , gl_FragColor.b / 2.0 , gl_FragColor[3] );',
      '}',
      '}'
    ];

  };

  Phaser.Filter.Gold.prototype = Object.create(Phaser.Filter.prototype);
  Phaser.Filter.Gold.prototype.constructor = Phaser.Filter.Gold;
  Phaser.Filter.Gold.prototype.forEachPixel = (pixel) => {
    // let newColor = (pixel.r * 0.3 + pixel.g * 0.59 + pixel.b * 0.11);
    pixel.r = (255 - pixel.r) / 2.5 + pixel.r;
    pixel.g = (255 - pixel.g) / 2.5 + pixel.g;
    pixel.b = pixel.b / 2.0;
    return pixel;
  };
  /**
   * The strength of the gold. 1 will make the object black and white, 0 will make the object its normal color
   * @property gold
   */
  Object.defineProperty(Phaser.Filter.Gold.prototype, 'Gold', {

    get: function () {
      return this.uniforms.Gold.value;
    },

    set: function (value) {
      this.uniforms.Gold.value = value;
    }

  });
}

class Gold {
  static load() {
    load();
  }
}

export default Gold;