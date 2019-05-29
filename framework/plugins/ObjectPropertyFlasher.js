import { Repeater } from './../core/Timer';
class ObjectPropertyFlasher {
  /**
   * obj: Phaser对象，这个对象的属性将会被切换
   * propertyName:对象属性名字  如alpha
   * objectPropertyValueArr:属性值的数组，对象会每隔一段时间，根据这个数组里的id切换一次属性值。循环执行
   * options:{
   * 	duration:number 每隔多久切换一次纹理
   *  times:number 切换多少次，默认是Infinity
   * }
   *  isSingleton:boolean多个对象共享一组属性值
   * */
  constructor(courseware, obj, propertyName, objectPropertyValueArr, options = {}, isSingleton = false) {
    this.objectPropertyValueArr = objectPropertyValueArr;
    this.propertyName = propertyName;
    this.isSingleton = isSingleton;
    this.interval = new Repeater(courseware, {
      duration: options.duration || 1000,
      times: options.times || Infinity,
      stop: () => {
        this.stop();
      }
    }, () => {
      this.tickIndex++;
      if (Array.isArray(obj)) {
        this.obj.forEach((x, i) => {
          if (!this.isSingleton)
            x[this.propertyName] = this.objectPropertyValueArr[i][this.tickIndex % this.objectPropertyValueArr[i].length];
          else
            x[this.propertyName] = this.objectPropertyValueArr[this.tickIndex % this.objectPropertyValueArr.length];
        });
        return;
      }
      this.obj[this.propertyName] = this.objectPropertyValueArr[this.tickIndex % this.objectPropertyValueArr.length];
    });
    this.obj = obj;
    this.tickIndex = 0;
    if (options.autoStart) {
      this.interval.start();
    }
  }

  start() {
    this.interval.start();
  }

  stop() {
    this.interval.stop();
    if (Array.isArray(this.obj)) {
      this.obj.forEach((x, i) => {
        if (!this.isSingleton)
          x[this.propertyName] = this.objectPropertyValueArr[i][0];
        else
          x[this.propertyName] = this.objectPropertyValueArr[0];
      });
      return;
    }
    this.obj[this.propertyName] = this.objectPropertyValueArr[0];
  }
}

export {
  ObjectPropertyFlasher
};