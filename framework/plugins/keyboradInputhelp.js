//手机键盘输入帮助类
import { ObjectPropertyFlasher } from './../../framework/plugins/ObjectPropertyFlasher';
import { CONSTANT } from '../core/Constant.js';
class KeyboradInputHelp {
  constructor(game, callback, inputEnabled = false) {
    this.game = game;
    this.inputEnabled = inputEnabled;
    this.callback = callback;
  }

  createKeyBords(x, y, bgImage = 'keyboradMainBg', isShowFX = true, isShowSpace = true, marginBottom = 0) {
    this.keyBorad = this.game.createSprite(x, y, bgImage);
    this.keyBorad.inputEnabled = true;
    this.createKeyBoradForArr(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], { x: 50, y: 10 }, this.keyBorad);
    this.createKeyBoradForArr(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], { x: 81, y: 70 + marginBottom }, this.keyBorad);
    this.createKeyBoradForArr(['z', 'x', 'c', 'v', 'b', 'n', 'm'], { x: 141, y: 130 + marginBottom * 2 }, this.keyBorad);
    if (isShowSpace) {
      this.space = this.game.createSprite(213, 190, 'spaceBg');
      this.space.hoverBg = this.game.createSprite(0, 0, 'spaceHoverBg');
      this.space.hoverBg.visible = false;
      this.space.inputEnabled = true;
      this.space.keyInfo = { key: ' ', keyCode: 32 };
      this.space.addChild(this.space.hoverBg);
      this.keyBorad.addChild(this.space);
      this.addKeyEvents([this.space]);
    }

    if (isShowFX) {
      this.up = this.game.createSprite(620, 130, 'keyboradBg');
      this.up.btnKey = 'keyUp';
      this.up.keyInfo = { key: 'ArrowUp', keyCode: 38 };

      this.down = this.game.createSprite(620, 190, 'keyboradBg');
      this.down.btnKey = 'keyDown';
      this.down.keyInfo = { key: 'ArrowDown', keyCode: 40 };

      this.left = this.game.createSprite(560, 190, 'keyboradBg');
      this.left.btnKey = 'keyLeft';
      this.left.keyInfo = { key: 'ArrowLeft', keyCode: 37 };

      this.right = this.game.createSprite(680, 190, 'keyboradBg');
      this.right.btnKey = 'keyRight';
      this.right.keyInfo = { key: 'ArrowRight', keyCode: 39 };
      this.setDirectionBtn([this.up, this.down, this.left, this.right]);
    }
  }

  hideDirection() {
    this.up.visible = false;
    this.down.visible = false;
    this.left.visible = false;
    this.right.visible = false;
  }

  showDirection() {
    this.up.visible = true;
    this.down.visible = true;
    this.left.visible = true;
    this.right.visible = true;
  }

  setDirectionBtn(keyborads) {
    keyborads.forEach((keyborad) => {
      this.keyBorad.addChild(keyborad);
      keyborad.hoverBg = this.game.createSprite(0, 0, 'keyboraHoverdBg');
      keyborad.hoverBg.visible = false;
      keyborad.btn = this.game.createSprite(31.5, 31.5, keyborad.btnKey);
      keyborad.btn.anchor.set(0.5);
      keyborad.addChild(keyborad.btn);
      keyborad.addChild(keyborad.hoverBg);
    });
    this.addKeyEvents(keyborads);
  }

  addKeyEvents(keyItems) {
    keyItems.forEach((keyItem) => {
      keyItem.inputEnabled = true;
      keyItem.events.onInputDown.add((event) => {
        if (!this.inputEnabled) return;

        if (this.callback) {
          this.callback(event.keyInfo);
        }

        keyItem.hoverBg.visible = true;
      });
      keyItem.events.onInputUp.add(() => {
        if (!this.inputEnabled) return;
        keyItem.hoverBg.visible = false;
      });
      keyItem.hoverBg.flash = new ObjectPropertyFlasher(this.game, keyItem.hoverBg, 'visible', [false, true], {
        duration: 400,
        times: 0
      });
    });

  }

  createKeyBoradForArr(keys, startXy, parent) {
    let result = [];
    keys.forEach((item, index) => {
      let keyItem = this.game.createSprite(startXy.x + index * 60, startXy.y, 'keyboradBg');
      keyItem.text = this.game.add.text(keyItem.width / 2, keyItem.height / 2, item, { fontFamily: CONSTANT.DEFAULT_FONT });
      keyItem.text.anchor.set(0.5);
      keyItem.hoverBg = this.game.createSprite(0, 0, 'keyboraHoverdBg');
      keyItem.hoverBg.visible = false;
      keyItem.keyInfo = { key: item, keyCode: item.toUpperCase().charCodeAt() };
      keyItem.addChild(keyItem.hoverBg);
      keyItem.addChild(keyItem.text);
      parent.addChild(keyItem);
      result.push(keyItem);
    });
    this.addKeyEvents(result);
    return result;
  }

  destroy() {
    this.keyBorad.destroy();
  }
}

export {
  KeyboradInputHelp
};