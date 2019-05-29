class Timer {
  /**
   * 当使用Phaser.State拆分逻辑，会出现注入到game的update无法对state里
   * 的内容生效，因此添加一个可选的传入参数。如果课件逻辑在state里，则传入state
   * 的loopManager实例化对象
   */
  constructor(courseware, eventObj, autoStart, loop) {
    this.loop = loop;
    this.courseware = courseware;
    this.initTime = new Date().getTime();
    this.startTime = 0;
    this.currentTime = this.lastTime = this.initTime;
    this.updateId = Symbol();
    this.update = () => {
      this.lastTime = this.currentTime;
      this.currentTime = new Date().getTime();
      if (eventObj.update && typeof eventObj.update === 'function') {
        eventObj.update();
      }
    };
    this.start = () => {
      this.startTime = this.currentTime = new Date().getTime();
      if (this.loop) {
        this.loop.add(this.update, this.updateId);
      } else {
        this.courseware.logicLoop.add(this.update, this.updateId);
      }
      this.update();
      if (eventObj.start && typeof eventObj.start === 'function') {
        eventObj.start();
      }
    };
    this.stop = () => {
      if (this.loop) {
        this.loop.remove(this.updateId);
      } else {
        this.courseware.logicLoop.remove(this.updateId);
      }
    };
    this.destroy = () => {
      this.stop();
      this.courseware = undefined;
      this.currentTime = undefined;
      this.initTime = undefined;
    };
    if (autoStart) {
      this.start();
    }
  }
}

class Repeater extends Timer {
  /**
   * 当使用Phaser.State拆分逻辑，会出现注入到game的update无法对state里
   * 的内容生效，因此添加一个可选的传入参数。如果课件逻辑在state里，则传入state
   * 的loopManager实例化对象
   */
  constructor(courseware, options = {}, repeatFunc, loop) {
    super(courseware, {
      update: () => {
        this.life += this.currentTime - this.lastTime;
        if (this.life >= this.duration) {
          this.repeat(repeatFunc);
          this.life = 0;
        }
      }
    }, options.autoStart, loop);
    this.options = options;
    this.duration = options.duration !== null ? options.duration : 1000;
    this.times = options.times !== null ? options.times : Infinity;
    if (options.runAtFirst) {
      this.life = this.duration;
    } else {
      this.life = 0;
    }

  }

  repeat(repeatFunc) {
    this.courseware.util.safeInvoke(repeatFunc);
    this.times--;
    if (this.times <= 0) {
      this.stop();
      this.courseware.util.safeInvoke(this.options.stop);
    }
  }
}

export {
  Timer,
  Repeater
};