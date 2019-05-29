import Phaser from 'phaser';

function load() {
  if (Phaser.Filter.Dark) {
    return;
  }
  Phaser.Filter.Dark = function(game) {

    Phaser.Filter.call(this, game);

    this.uniforms.dark = { type: '1f', value: 1.0 };

    this.fragmentSrc = [

      'precision mediump float;',

      'varying vec2       vTextureCoord;',
      'varying vec4       vColor;',
      'uniform sampler2D  uSampler;',
      'uniform float      dark;',

      'void main(void) {',
      'gl_FragColor = texture2D(uSampler, vTextureCoord);',
      'gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.00001 * gl_FragColor.r + 0.00001* gl_FragColor.g + 0.00001 * gl_FragColor.b), dark);',
      '}'
    ];

  };

  Phaser.Filter.Dark.prototype = Object.create(Phaser.Filter.prototype);
  Phaser.Filter.Dark.prototype.constructor = Phaser.Filter.Dark;
  Phaser.Filter.Dark.prototype.forEachPixel = (pixel) => {
    let newColor = (pixel.r * 0.00001 + pixel.g *0.000013 + pixel.b * 0.00001);
    pixel.r = newColor;
    pixel.g = newColor;
    pixel.b = newColor;
    return pixel;
  };
  /**
     * The strength of the gray. 1 will make the object black and white, 0 will make the object its normal color
     * @property gray
     */
  Object.defineProperty(Phaser.Filter.Dark.prototype, 'dark', {

    get: function() {
      return this.uniforms.dark.value;
    },

    set: function(value) {
      this.uniforms.dark.value = value;
    }

  });
}

class Dark {
  static load() {
    load();
  }
}

export default Dark;