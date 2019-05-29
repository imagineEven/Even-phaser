/**
* @author Mat Groves http://matgroves.com/ @Doormat23
*/

/**
* 颜色转换滤镜
* @class ColorToNewColor
* @contructor
*/
Phaser.Filter.ColorToNewColor = function (game) {

  Phaser.Filter.call(this, game);
  //色差
  this.uniforms.colorOffset = { type: '1f', value: 0.0 };
  //原始颜色
  this.uniforms.sourceColor = { type: '3f', value: { x: 1.1, y: 1.1, z: 1.1 } };

  //新颜色
  this.uniforms.newColor = { type: '3f', value: { x: 1.1, y: 1.1, z: 1.1 } };

  this.fragmentSrc = [

    'precision mediump float;',

    'varying vec2       vTextureCoord;',
    'varying vec4       vColor;',
    'uniform sampler2D  uSampler;',
    'uniform vec3 newColor;',
    'uniform vec3 sourceColor;',
    'uniform float colorOffset;',

    'void main(void) {',
    'gl_FragColor = texture2D(uSampler, vTextureCoord);',
    'float cha=(gl_FragColor.rgba.r-sourceColor.x)*(gl_FragColor.rgba.r-sourceColor.x)+(gl_FragColor.rgba.g-sourceColor.y)*(gl_FragColor.rgba.g-sourceColor.y)+(gl_FragColor.rgba.b-sourceColor.z)*(gl_FragColor.rgba.b-sourceColor.z);',
    'if(cha<=colorOffset){  ',
    'gl_FragColor=vec4(newColor.x, newColor.y, newColor.z, gl_FragColor.rgba.a);',

    '}else{',
    'gl_FragColor=vec4(gl_FragColor.r, gl_FragColor.g, gl_FragColor.b, gl_FragColor.rgba.a);',
    '}',
    '}'
  ];

};

Phaser.Filter.ColorToNewColor.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.ColorToNewColor.prototype.constructor = Phaser.Filter.ColorToNewColor;
Phaser.Filter.ColorToNewColor.prototype.forEachPixel = function (pixel) {
  let cha = (pixel.r / 255.0 - this.uniforms.sourceColor.value.x) * (pixel.r / 255.0 - this.uniforms.sourceColor.value.x)
    + (pixel.g / 255.0 - this.uniforms.sourceColor.value.y) * (pixel.g / 255.0 - this.uniforms.sourceColor.value.y)
    + (pixel.b / 255.0 - this.uniforms.sourceColor.value.z) * (pixel.b / 255.0 - this.uniforms.sourceColor.value.z);
  if (cha <= this.uniforms.colorOffset.value) {
    pixel.r = this.uniforms.newColor.value.x * 255;
    pixel.g = this.uniforms.newColor.value.y * 255;
    pixel.b = this.uniforms.newColor.value.z * 255;
  }
  return pixel;
};
/**
* 要跟换的颜色
* @property sourceColor
*/
Object.defineProperty(Phaser.Filter.ColorToNewColor.prototype, 'sourceColor', {

  get: function () {
    return this.uniforms.sourceColor.value;
  },

  set: function (value) {
    this.uniforms.sourceColor.value = value;
  }
});

/**
* 更换后的颜色
* @property newColor
*/
Object.defineProperty(Phaser.Filter.ColorToNewColor.prototype, 'newColor', {

  get: function () {
    return this.uniforms.newColor.value;
  },

  set: function (value) {
    this.uniforms.newColor.value = value;
  }
});

//色差
Object.defineProperty(Phaser.Filter.ColorToNewColor.prototype, 'colorOffset', {

  get: function () {
    return this.uniforms.colorOffset.value;
  },

  set: function (value) {
    this.uniforms.colorOffset.value = value;
  }
});

