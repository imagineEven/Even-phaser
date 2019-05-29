import Phaser from 'phaser';
require('./PhaserRichTextNew');

class EditRichText extends Phaser.PhaserRichTextNew {
  /**
   * 基于富文本插件，含有data-index属性的标签在渲染之后可以添加事件
   * 在操作文本字符时，使用data-{attr}可以插入其他自定义属性
   * 使用方法
   * var text='<p>Who is she.she <span data-index = 1>_</span> my sister?</p>'
   * let text=new EditRichText(game, x, y, text, style, events);
   * text.activeBoxArr 就是所有活动文本对象的数组
   * text.resetHtml()  重新创建文本对象
   */
  constructor(game, x, y, text, style, events = {}) {
    super(game, x, y, text, style);
    this.eventsObj = {};
    this.registBlankEvents(events);
  }

  get activeBoxArr() {
    return this.allText.filter(text => {
      return text.data && !!(text.data.index + 1);
    });
  }

  get emptyBoxArr() { //仍然为空的空格
    return this.activeBoxArr.filter(text => {
      return text.data && !text.data.filled;
    });
  }

  registBlankEvents(events = {}) {
    Object.assign(this.eventsObj, events);
    this.activeBoxArr.forEach(box => {
      box.inputEnabled = true;
      Object.keys(this.eventsObj).forEach((eventName) => {
        box.events[eventName].add(() => {
          this.game.util.safeInvoke(this.eventsObj[eventName], box);
        });
      });
    });
  }

  //在文本变化时使用此方法重新渲染
  resetHtml(text) {
    this.text = text;
    this.redraw();
    this.registBlankEvents();
  }
}


Phaser.EditRichText = EditRichText;
Phaser.GameObjectFactory.prototype.editrichtext = function (x, y, text, style, events, group) {
  if (group === undefined) {
    group = this.world;
  }
  return group.add(new Phaser.EditRichText(this.game, x, y, text, style, events));
};