import { Repeater } from './../core/Timer';
class TextColorFlasher {
  /*
   * text: Phaser.Text对象，这个文字对象的颜色将会被切换
   * colorArr:颜色数组，颜色会每隔一段时间，根据这个数组进行切换。循环执行
   * options:{
   * 	duration:number 每隔多久切换一次纹理
   *  times:number 切换多少次，默认是Infinity
   * },
   * loop:LoopManager  可选，当使用Phaser.State拆分逻辑，会出现注入到game的update无法对state里
   * 的内容生效，因此添加一个可选的传入参数。如果课件逻辑在state里，则传入state
   * 的loopManager实例化对象
   * */
  constructor(courseware, text, colorArr, options = {}, loop) {
    this.colorArr = colorArr;
    if (options.runAtFirst === undefined) {
      options.runAtFirst = true;
    }
    this.interval = new Repeater(courseware, {
      duration: options.duration || 1000,
      runAtFirst: options.runAtFirst,
      times: options || Infinity
    }, () => {
      this.tickIndex++;
      this.text.fill = colorArr[this.tickIndex % colorArr.length];
    }, loop);
    this.text = text;
    this.tickIndex = 0;
    this.state = Symbol.for('stop');
    if (options.autoStart) {
      this.interval.start();
    }
  }

  start() {
    this.state = Symbol.for('start');
    this.interval.start();
  }

  stop() {
    this.state = Symbol.for('stop');
    this.interval.stop();
    this.text.fill = this.colorArr[0];
  }
}

export {
  TextColorFlasher
};