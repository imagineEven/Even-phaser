import { Repeater } from './../core/Timer';
class TextureFlasher {
  /**
     * obj: Phaser图片对象，这个图片对象的纹理将会被切换
     * textureNames:纹理id的数组，图片会每隔一段时间，根据这个数组里的id切换一次纹理。循环执行
     * options:{
     * 	duration:number 每隔多久切换一次纹理
     *  times:number 切换多少次，默认是Infinity
     * }
     * */
  constructor(courseware, obj, textureNames, options = {}, loop) {
    this.textureNames = textureNames;
    if (options.runAtFirst === undefined) {
      options.runAtFirst = true;
    }
    this.interval = new Repeater(courseware, {
      duration: options.duration || 1000,
      runAtFirst: options.runAtFirst,
      times: options.times || Infinity,
      stop: () => {
        this.stop();
      }
    }, () => {
      this.tickIndex++;
      if (this.obj && this.obj.game) {
        this.obj.loadTexture(textureNames[this.tickIndex % textureNames.length]);
      }
    }, loop);
    this.obj = obj;
    this.tickIndex = 0;
    this.state = Symbol.for('stop');
    if (options.autoStart) {
      this.start();
    }
  }

  start() {
    this.state = Symbol.for('start');
    this.interval.start();
  }

  stop(num = 0) {
    this.state = Symbol.for('stop');
    this.interval.stop();
    if (this.obj && this.obj.game) {
      this.obj.loadTexture(this.textureNames[num]);
    }
  }
}

export {
  TextureFlasher
};