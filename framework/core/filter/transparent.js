import Phaser from 'phaser';

function load() {
  if (Phaser.Filter.Transparent) {
    return;
  }
  Phaser.Filter.Transparent = function (game) {

    Phaser.Filter.call(this, game);

    this.uniforms.Transparent = {type: '1f', value: 1.0};

    this.fragmentSrc = [

      'precision mediump float;',

      'varying vec2       vTextureCoord;',
      'varying vec4       vColor;',
      'uniform sampler2D  uSampler;',
      'uniform float      Transparent;',

      'void main(void) {',
      'gl_FragColor = texture2D(uSampler, vTextureCoord);',
      '}'
    ];

  };

  Phaser.Filter.Transparent.prototype = Object.create(Phaser.Filter.prototype);
  Phaser.Filter.Transparent.prototype.constructor = Phaser.Filter.Transparent;
  Phaser.Filter.Transparent.prototype.forEachPixel = (pixel) => {
    // let newColor = (pixel.r * 0.3 + pixel.g * 0.59 + pixel.b * 0.11);
    // pixel.r = (255 - pixel.r) / 2.5 + pixel.r;
    // pixel.g = (255 - pixel.g) / 2.5 + pixel.g;
    // pixel.b = pixel.b / 2.0;
    return pixel;
  };

  Object.defineProperty(Phaser.Filter.Transparent.prototype, 'Transparent', {

    get: function () {
      return this.uniforms.Transparent.value;
    },

    set: function (value) {
      this.uniforms.Transparent.value = value;
    }

  });
}

class Transparent {
  static load(game) {
    load(game);
  }
}

export default Transparent;