import AssetJson from './AssetJson';
import Cap from './Cap';
import Alien from './Alien';
import BaseSprite from '../../framework/core/BaseSprite';
import { CONSTANT } from '../../framework/core/Constant';
import MODULE from '../../framework/core/events/module-enum';
import EVENT from '../../framework/core/events/status-enum';

let _symbol = {
  data: Symbol(),
  container: Symbol(),
  allCapObject: Symbol(),
  usedCap: Symbol(),
  gameTime: Symbol(),
  parent: Symbol(),
  callback: Symbol(),
  aliens: Symbol(),
  status: Symbol()
};

function clear(element) {
  element.destroy();
}

class SpaceShip extends BaseSprite {

  constructor(_parent, _target, _callback) {
    super(_parent);
    this[_symbol.parent] = _target;
    this[_symbol.callback] = _callback;
    this[_symbol.container] = [];
    this[_symbol.allCapObject] = [];
    this[_symbol.usedCap] = [];
    this[_symbol.aliens] = [];
    this.view(AssetJson.base.imageLabel);
  }

  view(_array) {
    _array.forEach(this.addContainer, this);
  }

  addContainer(_element, _index) {
    let label = this.game.add.sprite(0, 0, AssetJson.base.image[_element]);
    label.name = 'label' + _index;
    this.container.push(label);
    this.addChild(label);
    this.addCapList(AssetJson.base.caps[_index]);
  }

  addCapList(_array) {
    _array.forEach(this.addCap, this);
  }

  addCap(_element) {
    let index = this.container.length - 1;
    let cap = new Cap(AssetJson.caps[_element]);
    this.container[index].addChild(cap);
    cap.containerId = index;
    cap.inputEnabled = true;
    cap.element = _element;
    this.cap.push(cap);
  }

  startGame() {
    this.addAlien();
    this[_symbol.status] = CONSTANT.START;
    this[_symbol.gameTime] = this.game.time.events.loop(AssetJson.privateData.frequency, this.addAlien, this);
  }

  stopGame() {
    this[_symbol.status] = CONSTANT.STOP;
    this.game.time.events.remove(this[_symbol.gameTime]);
    this[_symbol.aliens].forEach(this.destroyAnAlien, this);
    this[_symbol.aliens] = [];
    this.usedCap.forEach(this.stopCap, this);
  }

  destroyAnAlien(_alien) {
    _alien.destroy();
  }

  stopCap(_cap) {
    _cap.close('closeAnCap', this, _cap);
  }

  closeAnCap(_cap) {
    this.moveArrayValue(_cap, this.usedCap, this.cap);
    if (this.usedCap.length === 0) {
      this[_symbol.parent][this[_symbol.callback]]('spaceShipOverComplete');
    }
  }

  addAlien() {
    if (this.usedCap.length > AssetJson.privateData.max) {
      return;
    }
    let alienIndex = Math.floor(Math.random() * AssetJson.alien.length);
    let wordIndex = Math.floor(Math.random() * AssetJson.privateData.letters.length);
    let qusitionList = this.game.buriedPointData.qusitionList;

    let capIndex = Math.floor(Math.random() * this.cap.length);
    let cap = this.cap[capIndex];
    let alienData = {
      alien: AssetJson.alien[alienIndex].alien,
      board: AssetJson.alien[alienIndex].board,
      cap: cap,
      time: AssetJson.privateData.life,
      word: AssetJson.privateData.letters[wordIndex],
      callback: this.destroyAlien
    };
    if (alienData.word === AssetJson.privateData.letter.letter) {
      qusitionList.push({ 'errCount': 1 });
    }
    cap.open('createAlien', this, alienData);
  }

  createAlien(_data) {
    if (this[_symbol.status] === CONSTANT.STOP) {
      _data.cap.stopGame();
      return;
    }
    let alien = new Alien(this.container[_data.cap.containerId - 1], _data, this);
    this.container[_data.cap.containerId - 1].addChild(alien);
    this[_symbol.aliens].push(alien);
    this.moveArrayValue(_data.cap, this.cap, this.usedCap);
  }

  spriteAlien(_alien) {
    let index = this[_symbol.aliens].indexOf(_alien);
    this[_symbol.aliens].splice(index, 1);
  }

  destroyAlien(_target, _type) {
    let cap = _target.cap;
    switch (_type) {
      case 'click':
        if (_target.word === AssetJson.privateData.letter.letter) {
          for (let item of this.game.buriedPointData.qusitionList) {
            if (item.errCount) {
              item.errCount = 0;
              break;
            }
          }
          this.dispatchEventAfterAudio([AssetJson.privateData.letter.sound], undefined, undefined, true);
          _target.rightStyle();
          this.dispatchEvent(MODULE.GAME, EVENT.ANSWER_RIGHT);
          this[_symbol.parent][this[_symbol.callback]](CONSTANT.ADD_SCORE);
        } else {
          this.dispatchEvent(MODULE.GAME, EVENT.ANSWER_WRONG);
          this.dispatchEventAfterAudio([AssetJson.base.sound.wrong]);
          cap.close('releaseCap', this, cap);
          _target.destroy();
          this.spriteAlien(_target);
        }
        break;
      default:
        cap.close('releaseCap', this, cap);
        _target.destroy();
        this.spriteAlien(_target);
        break;
    }
  }

  releaseCap(_cap) {
    this.moveArrayValue(_cap, this.usedCap, this.cap);
  }

  initCap() {
    this.usedCap.forEach(this.releaseCap, this);
    this.cap.forEach(clear, this);
    this[_symbol.container].forEach(clear, this);
    this[_symbol.allCapObject] = [];
    this[_symbol.usedCap] = [];
    this[_symbol.aliens] = [];
    this.view(AssetJson.base.imageLabel);
  }

  get cap() {
    return this[_symbol.allCapObject];
  }

  get usedCap() {
    return this[_symbol.usedCap];
  }

  get container() {
    return this[_symbol.container];
  }

  moveArrayValue(_element, _array, _target) {
    _target.push(_element);
    let index = _array.indexOf(_element);
    _array.splice(index, 1);
  }
}

export default SpaceShip;