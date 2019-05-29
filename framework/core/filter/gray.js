import Phaser from 'phaser';

function load() {
  if (Phaser.Filter.Gray) {
    return;
  }
  Phaser.Filter.Gray = function (game) {

    Phaser.Filter.call(this, game);

    this.uniforms.gray = {type: '1f', value: 1.0};

    this.fragmentSrc = [

      'precision mediump float;',

      'varying vec2       vTextureCoord;',
      'varying vec4       vColor;',
      'uniform sampler2D  uSampler;',
      'uniform float      gray;',

      'void main(void) {',
      'gl_FragColor = texture2D(uSampler, vTextureCoord);',
      'gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126 * gl_FragColor.r + 0.7152 * gl_FragColor.g + 0.0722 * gl_FragColor.b), gray);',
      '}'
    ];

  };

  Phaser.Filter.Gray.prototype = Object.create(Phaser.Filter.prototype);
  Phaser.Filter.Gray.prototype.constructor = Phaser.Filter.Gray;
  Phaser.Filter.Gray.prototype.forEachPixel = (pixel) => {
    let newColor = (pixel.r * 0.3 + pixel.g * 0.59 + pixel.b * 0.11);
    pixel.r = newColor;
    pixel.g = newColor;
    pixel.b = newColor;
    return pixel;
  };
  Object.defineProperty(Phaser.Filter.Gray.prototype, 'gray', {

    get: function () {
      return this.uniforms.gray.value;
    },

    set: function (value) {
      this.uniforms.gray.value = value;
    }

  });
}

class Gray {
  static load() {
    load();
  }
}

export default Gray;