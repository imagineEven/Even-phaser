import { Pen } from './Pen';

class Drawboard {
  /**
     * backImageName: string 背景图片的id，事件会添加在这个背景图片上，
     * 这个背景图片就是绘图区域大小
     * options：{
     * 	x:画板的x坐标，默认0
     *  y:画板的y坐标，默认0
     *  color:画笔颜色，默认黑色
     *  thickness:画笔粗细，默认20
     * }
     */
  constructor(courseware, backImageName,
    options = {
      x: 0,
      y: 0,
      color: 0x000000,
      thickness: 20
    }) {
    this.courseware = courseware;
    this.backImage = courseware.add.image(options.x, options.y,
      backImageName);
    this.graphic = courseware.add.graphics(options.x, options.y);
    this.isDown = false;
    this.courseware = courseware;
    this.oldPoint = undefined;
    this.pen = new Pen(options.color, options.thickness);
    this.setDrawEvent(courseware, options.y, options.y);
    this.graphicArr = [];
    this.graphicArr.push(this.graphic);
    this.drawLength = 0;
  }

  onDrawOut() {}

  //将画版设置到画面中心
  putToCenter() {
    this.backImage.position.set(
      (this.courseware.width - this.backImage.width) / 2,
      (this.courseware.height - this.backImage.height) / 2
    );
    this.graphic.position.set(
      (this.courseware.width - this.backImage.width) / 2,
      (this.courseware.height - this.backImage.height) / 2);
  }

  //添加画图事件，new的时候会自动调用这个函数，通常不需要手动执行
  setDrawEvent(courseware) {
    this.backImage.events.onInputDown.add(() => {
      this.isDown = true;
      this.oldPoint = this.backImage.input.downPoint;
      this.oldPoint.x -= this.backImage.position.x;
      this.oldPoint.y -= this.backImage.position.y;
      this.graphic.lineStyle(this.pen.thickness, this.pen.color, 1);
      this.graphic.beginFill(this.pen.color);
      this.graphic.drawCircle(this.oldPoint.x, this.oldPoint.y, 1);
      this.graphic.endFill();
    });
    this.backImage.events.onInputUp.add(() => {
      this.isDown = false;
      this.oldPoint = undefined;
    });
    this.backImage.events.onInputOut.add(() => {
      this.isDown = false;
      this.oldPoint = undefined;
    });
    courseware.input.addMoveCallback((pointer, x, y) => {
      if (!this.isDown) {
        return;
      }
      x -= this.backImage.position.x;
      y -= this.backImage.position.y;
      this.graphic.lineStyle(this.pen.thickness, this.pen.color, 1);
      this.graphic.beginFill(this.pen.color);
      this.graphic.moveTo(this.oldPoint.x, this.oldPoint.y);
      this.graphic.lineTo(x, y);
      this.graphic.drawCircle(x, y, 1);
      this.graphic.endFill();
      this.drawLength += courseware.util.getDistance({ x, y }, this.oldPoint);
      this.oldPoint.x = x;
      this.oldPoint.y = y;

      if (!courseware.util.inRectArea(this.oldPoint, { x: 0, y: 0 }, this.backImage.width, this.backImage.height)) {
        this.onDrawOut();
      }
    });
  }

  //添加新的graphic，之后的绘图会画在新的graphic上，不会清除之前graphic的内容
  addNewGraphic(courseware) {
    let graphic = courseware.add.graphics(this.graphic.position.x, this.graphic
      .position.y);
    this.graphic = graphic;
    this.graphicArr.push(this.graphic);
  }

  //将画板设为可用
  setEnabled(enable) {
    this.backImage.inputEnabled = enable;
  }

  //清除当前graphic的内容
  clear() {
    this.graphic.clear();
  }

  //清除所有graphic的内容
  clearAll() {
    for (let item of this.graphicArr) {
      item.clear();
    }
  }

  destroy() {
    this.backImage.destroy();
    for (let item of this.graphicArr) {
      item.destroy();
    }
    this.courseware = undefined;
    this.oldPoint = undefined;
    this.pen = undefined;
  }
}

export {
  Drawboard
};