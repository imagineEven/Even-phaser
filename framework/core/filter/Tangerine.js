import Phaser from 'phaser';

function loadTangerine() {
  if (Phaser.Filter.Tangerine) {
    return;
  }
  Phaser.Filter.Tangerine = function(game) {

    Phaser.Filter.call(this, game);

    this.uniforms.Tangerine = { type: '1f', value: 1.0 };

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

  Phaser.Filter.Tangerine.prototype = Object.create(Phaser.Filter.prototype);
  Phaser.Filter.Tangerine.prototype.constructor = Phaser.Filter.Tangerine;
  Phaser.Filter.Tangerine.prototype.forEachPixel = (pixel) => {
    // let newColor = (pixel.r * 0.3 + pixel.g * 0.59 + pixel.b * 0.11);
    pixel.r = (255 - pixel.r) / 2.5 + pixel.r;
    pixel.g = (255 - pixel.g) / 2.5 + pixel.g;
    pixel.b = pixel.b / 2.0;
    return pixel;
  };
  /**
     * The strength of the Tangerine. 1 will make the object black and white, 0 will make the object its normal color
     * @property Tangerine
     */
  Object.defineProperty(Phaser.Filter.Tangerine.prototype, 'Tangerine', {

    get: function() {
      return this.uniforms.Tangerine.value;
    },

    set: function(value) {
      this.uniforms.Tangerine.value = value;
    }

  });
}

class Tangerine {
  static load() {
    loadTangerine();
  }
}

export default Tangerine;