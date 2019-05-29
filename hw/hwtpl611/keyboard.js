//手机键盘输入帮助类
import { ObjectPropertyFlasher } from '../../framework/plugins/ObjectPropertyFlasher';
import { CONSTANT } from '../../framework/core/Constant.js';
import keyboardRes from './keyboard.json';
/*
  keyCode 100-200 lowercase
  keyCode 200-300 uppercase
  keyCode 300-400 spotcase
  keyCode 400-500 specialcase
*/

let operation = {
  shiftUpper: 'shiftUpper',
  number: 'number',
  shiftLower: 'shiftLower',
  disapplear: 'disapplear'
}


class Keyboard {
  constructor(game, callback, afterHide, inputEnabled = false) {
    this.game = game;
    this.inputEnabled = inputEnabled;
    this.callback = callback;
    this.afterHide = afterHide;
    this.upperState = 0;
    this.allKeyBoardArr = [];
    this.allGroup = this.game.add.group();
  }

  createKeyBords(x, y) {
    this.$x = x;
    this.$y = y;
    this.createLowercase(x, y)
    this.createUppercase(x, y)
    this.createspotcase(x, y)
    this.allVisibleIsfalse()
    this.initPosition(280, 0);
  }

  initPosition(variable, time) {
    this.allKeyBoardArr.forEach(item => {
      this.game.add.tween(item).to({
        x: 0, y: variable
      }, time, 'Linear', true)
    })
  }

  createLowercase(x, y) {
    this.lowercase = this.game.add.group();
    let keyBorad = this.game.createSprite(x, y, keyboardRes.keyboardBg);
    this.lowercase.add(keyBorad);
    this.createKeyBoradForArrEven(keyboardRes.lowercase.oneline, { x: 19, y: 8 }, keyBorad, this.lowercase);
    this.createKeyBoradForArrEven(keyboardRes.lowercase.twoline, { x: 58, y: 76 }, keyBorad, this.lowercase);
    this.createKeyBoradForArrEven(keyboardRes.lowercase.threeline, { x: 20, y: 144 }, keyBorad, this.lowercase);
    this.createKeyBoradForArrEven(keyboardRes.lowercase.foreline, { x: 20, y: 210 }, keyBorad, this.lowercase);
    this.allKeyBoardArr.push(this.lowercase);
  }

  createUppercase(x, y) {
    this.uppercase = this.game.add.group();
    let keyBorad = this.game.createSprite(x, y, keyboardRes.keyboardBg);
    this.uppercase.add(keyBorad);
    this.createKeyBoradForArrEven(keyboardRes.uppercase.oneline, { x: 19, y: 8 }, keyBorad, this.uppercase);
    this.createKeyBoradForArrEven(keyboardRes.uppercase.twoline, { x: 58, y: 76 }, keyBorad, this.uppercase);
    this.createKeyBoradForArrEven(keyboardRes.uppercase.threeline, { x: 20, y: 144 }, keyBorad, this.uppercase);
    this.createKeyBoradForArrEven(keyboardRes.uppercase.foreline, { x: 20, y: 210 }, keyBorad, this.uppercase);
    this.allKeyBoardArr.push(this.lowercase);
  }

  createspotcase(x, y) {
    this.spotcase = this.game.add.group();
    let keyBorad = this.game.createSprite(x, y, keyboardRes.keyboardBg);
    this.spotcase.add(keyBorad);
    this.createKeyBoradForArrEven(keyboardRes.spotcase.oneline, { x: 19, y: 8 }, keyBorad, this.spotcase);
    this.createKeyBoradForArrEven(keyboardRes.spotcase.twoline, { x: 58, y: 76 }, keyBorad, this.spotcase);
    this.createKeyBoradForArrEven(keyboardRes.spotcase.threeline, { x: 20, y: 144 }, keyBorad, this.spotcase);
    this.createKeyBoradForArrEven(keyboardRes.spotcase.foreline, { x: 20, y: 210 }, keyBorad, this.spotcase);
    this.allKeyBoardArr.push(this.lowercase);
  }

  toggleCase(val) {
    switch (val) {
      case 0:
        this.allVisibleIsfalse();
        this.lowercase.visible = true;
        this.allKeyBoardArr.splice(0, 1, this.lowercase)
        break;
      case 1:
        this.allVisibleIsfalse();
        this.uppercase.visible = true;
        this.allKeyBoardArr.splice(1, 1, this.uppercase)
        break;
      default:
        this.allVisibleIsfalse();
        this.spotcase.visible = true;
        this.allKeyBoardArr.splice(2, 1, this.spotcase)
        break;
    }
  }

  switchKeyBoards() {
    let showKeyBoardArr = this.allKeyBoardArr.filter(item => item.visible === true);
    if (showKeyBoardArr[0]) {
      this.initPosition(280, 500)
      this.game.util.waitByPromise(500).then(() => {
        this.allVisibleIsfalse();
      })
    } else {
      this.lowercase.visible = true;
      this.initPosition(0, 500)
    }
  }

  allVisibleIsfalse() {
    this.lowercase.visible = false;
    this.uppercase.visible = false;
    this.spotcase.visible = false;
  }


  addKeyEvnets(keyItems) {
    keyItems.forEach((keyItem) => {
      keyItem.inputEnabled = true;
      keyItem.events.onInputDown.add((event) => {
        keyItem.hoverBg.visible = true;
      });

      keyItem.events.onInputUp.add((event) => {
        keyItem.hoverBg.visible = false;
        this.judgeShiftLogic(event);
      });
    })
  }

  judgeShiftLogic(event) {
    if (this.upperState === 1 && event.keyInfo.key !== operation.number && event.keyInfo.key !== operation.disapplear) {
      this.handleUpEvent(event)
      this.toggleCase(0);
      this.upperState = 0;
    } else if (event.keyInfo.key === operation.shiftUpper && this.upperState !== 1) {
      this.upperState = 1;
      this.handleUpEvent(event)
    } else {
      this.handleUpEvent(event)
    }
  }

  handleUpEvent(event) {
    switch (event.keyInfo.key) {
      case operation.shiftUpper:
        this.toggleCase(1);
        break;
      case operation.number:
        this.toggleCase(2);
        break;
      case operation.shiftLower:
        this.toggleCase(0);
        break;
      case operation.disapplear:
        this.switchKeyBoards();
        this.afterHide()
        break;
      default:
        this.callback(event.keyInfo)
        break;
    }
  }

  createKeyBoradForArrEven(keys, startXy, parent, myGroup) {
    let result = [];
    keys.forEach((item, index) => {
      let spacingLength = '';
      if (item.length) {
        index === 0 ? spacingLength = startXy.x : spacingLength = item.length + 18 + (result[index - 1].x);
      } else {
        index === 0 ? spacingLength = startXy.x : spacingLength = 78 + (result[index - 1].x);
      }
      let keyItem = this.game.createSprite(spacingLength, startXy.y, item.image);
      let positionXy = item.keyCode > 400 && item.keyCode < 500 ? { x: 0, y: 0 } : { x: -30, y: -80 };
      keyItem.hoverBg = this.game.createSprite(positionXy.x, positionXy.y, item.children.image);
      keyItem.hoverBg.visible = false;
      keyItem.keyInfo = { key: item.key, keyCode: item.keyCode };
      myGroup.add(keyItem);
      parent.addChild(keyItem);
      keyItem.addChild(keyItem.hoverBg);
      result.push(keyItem);
    });
    this.addKeyEvnets(result)
  }

}

export {
  Keyboard
};