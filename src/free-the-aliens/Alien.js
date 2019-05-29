import BaseSprite from '../../framework/core/BaseSprite';
import Btn from '../../framework/plugins/display/btn';
import EVENT from '../../framework/core/events/status-enum';
import { CONSTANT } from '../../framework/core/Constant';
let _symbol = {
  count: Symbol(),
  point: Symbol(),
  board: Symbol(),
  alien: Symbol(),
  word: Symbol(),
  parent: Symbol(),
  cap: Symbol(),
  text: Symbol(),
  clearEvent: Symbol(),
  callback: Symbol(),
  btn: Symbol()
};

class Alien extends BaseSprite {
  constructor(_parent, _data, _target) {
    super(_parent);

    this[_symbol.parent] = _target;
    this[_symbol.count] = 0;
    this[_symbol.cap] = _data.cap;
    this[_symbol.point] = {
      x: this.cap.point.x,
      y: this.cap.point.y + this.game.height * 0.135
    };
    this[_symbol.callback] = _data.callback;
    this[_symbol.word] = _data.word;
    let text = this.game.add.text(this.point.x, this.point.y, this.word);
    text.anchor.x = 0.5;
    text.anchor.y = 1;
    text.align = 'center';
    text.font = CONSTANT.DEFAULT_FONT;
    text.fontWeight = 'bold';
    text.fontSize = 56;
    text.fill = '#000000';
    this[_symbol.text] = text;
    this.group = this.game.add.group();
    this.group.x = this.point.x;
    this.group.y = this.point.y;
    this[_symbol.alien] = this.game.add.sprite(0, 0, _data.alien);
    this[_symbol.board] = this.game.add.sprite(0, 0, _data.board);
    this[_symbol.board].anchor.x = 0.5;
    this[_symbol.board].anchor.y = 1;
    this[_symbol.alien].anchor.x = 0.5;
    this[_symbol.alien].anchor.y = 1;
    this[_symbol.alien].visible = false;
    this.group.add(this[_symbol.alien]);
    this.group.add(this[_symbol.board]);
    this.addChild(this.group);
    let textBtn = new Btn();
    textBtn.normal = text;
    this[_symbol.btn] = textBtn;
    this.addChild(textBtn);
    this[_symbol.clearEvent] = this.game.time.events.loop(_data.time, this.clear, this);
    this.enable(true);
  }

  enable(bl) {
    this[_symbol.board].inputEnabled = bl;
    this[_symbol.board].input.pixelPerfectClick = true;
    this[_symbol.board].events.onInputDown.add(this.onClick, this);
  }

  destroy() {

    this[_symbol.btn].destroy();
    this[_symbol.board].destroy();
    this[_symbol.alien].destroy();
    this.group.destroy();
  }

  rightStyle() {
    this[_symbol.text].visible = false;
    this[_symbol.board].visible = false;
    this[_symbol.alien].visible = true;
    this[_symbol.clearEvent] = this.game.time.events.loop(25, this.moveAlien, this);
  }

  moveAlien() {
    this[_symbol.alien].y += 15;
    if (this[_symbol.alien].y > this.game.height) {
      this.game.time.events.remove(this[_symbol.clearEvent]);
      this.complete(EVENT.MOVE_COMPLETE);
    }
  }

  onClick() {
    this.enable(false);
    this.game.time.events.remove(this[_symbol.clearEvent]);
    this[_symbol.alien].visible = true;
    this.complete('click');
  }

  clear() {
    this.game.time.events.remove(this[_symbol.clearEvent]);
    this.complete('clear');
  }

  complete(type) {
    this[_symbol.parent].destroyAlien(this, type);
  }

  get point() {
    return this[_symbol.point];
  }

  get word() {
    return this[_symbol.word];
  }

  get cap() {
    return this[_symbol.cap];
  }
}

export default Alien;