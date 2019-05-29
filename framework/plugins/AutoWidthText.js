require('../phaserplugins/phaserrichtext.js');
class AutoWidthText extends Phaser.Sprite {
  constructor(game, x, y, option) {
    super(game, x, y);
    game.world.addChild(this);
    // this.add.sprite(0, 0, this.staticRes.normal.xml, 'normal_right_bottom.png');
    this.leftTopObj = game.add.sprite(0, 0, option.key, option.keyName + '_left_top.png');
    this.leftCenterObj = game.add.sprite(0, 0, option.key, option.keyName + '_left_center.png');
    this.leftBottomObj = game.add.sprite(0, 0, option.key, option.keyName + '_left_bottom.png');

    this.centerTopObj = game.add.sprite(0, 0, option.key, option.keyName + '_center_top.png');
    this.centerCenterObj = game.add.sprite(0, 0, option.key, option.keyName + '_center_center.png');
    this.centerBottomObj = game.add.sprite(0, 0, option.key, option.keyName + '_center_bottom.png');

    this.rightTopObj = game.add.sprite(0, 0, option.key, option.keyName + '_right_top.png');
    this.rightCenterObj = game.add.sprite(0, 0, option.key, option.keyName + '_right_center.png');
    this.rightBottomObj = game.add.sprite(0, 0, option.key, option.keyName + '_right_bottom.png');

    this.textObj = game.add.richtext(0, 0, option.text, option.style);
    this.centerBg = game.add.graphics(0, 0);

    this.$centerWidth = 0;
    this.$lineHeight = option.lineHeight || 0;
    this.textObj.lineHeight = this.$lineHeight;
    this.addChild(this.leftTopObj);
    this.addChild(this.leftCenterObj);
    this.addChild(this.leftBottomObj);
    this.addChild(this.centerTopObj);
    this.addChild(this.centerCenterObj);
    this.addChild(this.centerBottomObj);
    this.addChild(this.rightTopObj);
    this.addChild(this.rightCenterObj);
    this.addChild(this.rightBottomObj);
    this.addChild(this.textObj);
    this.$paddingLeft = option.paddingLeft || 0;
    this.$paddingRight = option.paddingRight || 0;
    this.$paddingTop = option.paddingLeft || 0;
    this.$paddingRight = option.paddingRight || 0;
    this.$anchor = {
      root: this,
      _x: 0,
      _y: 0,
      get x() {
        return this._x;
      },
      get y() {
        return this._y;
      },
      set x(val) {
        this._x = val;
        this.root.redraw();
      },
      set y(val) {
        this._y = val;
        this.root.redraw();
      },
      set(x, y) {
        this.x = x;
        this.y = y;
      }
    };
    this.allControlList = [this.leftTopObj, this.leftCenterObj, this.leftBottomObj,
      this.centerTopObj, this.centerBottomObj, this.centerCenterObj,
      this.rightTopObj, this.rightCenterObj, this.rightBottomObj,
      this.textObj];
    this.redraw();
  }

  get anchor() {
    return this.$anchor;
  }

  set anchor(val) {
    this.$anchor = val;
  }

  get paddingRight() {
    return this.$paddingRight;
  }

  set paddingRight(val) {
    this.$paddingRight = val;
    this.redraw();
  }

  get paddingLeft() {
    return this.$paddingLeft;
  }

  set paddingLeft(val) {
    this.$paddingLeft = val;
    this.redraw();
  }

  get centerWidth() {
    return this.$centerWidth;
  }

  set centerWidth(val) {
    this.$centerWidth = val;
    this.redraw();
  }

  get lineHeight() {
    return this.$lineHeight;
  }

  set lineHeight(val) {
    this.$lineHeight = val;
    this.textObj.lineHeight = val;
    this.redraw();
  }

  setNewBg(key, keyName, newOption = false, offsetX = 0) {
    this.leftTopObj.loadTexture(key, keyName + '_left_top.png');
    this.leftCenterObj.loadTexture(key, keyName + '_left_center.png');
    this.leftBottomObj.loadTexture(key, keyName + '_left_bottom.png');

    this.centerTopObj.loadTexture(key, keyName + '_center_top.png');
    this.centerCenterObj.loadTexture(key, keyName + '_center_center.png');
    this.centerBottomObj.loadTexture(key, keyName + '_center_bottom.png');

    this.rightTopObj.loadTexture(key, keyName + '_right_top.png');
    this.rightCenterObj.loadTexture(key, keyName + '_right_center.png');
    this.rightBottomObj.loadTexture(key, keyName + '_right_bottom.png');
    this.redraw(newOption, offsetX);
  }


  setText(text) {
    this.textObj.setHtml(text);
    this.redraw();
  }


  redraw(newOption, offsetX) {
    //绘制方法
    this.centerTopObj.scale.set(1, 1);
    this.centerBottomObj.scale.set(1, 1);
    this.leftCenterObj.scale.set(1, 1);


    let centerWidth = this.paddingLeft + this.paddingRight + this.textObj.width;
    if (this.centerWidth !== 0) {
      centerWidth = this.paddingLeft + this.centerWidth + this.paddingRight;
    }
    let centerHeight = this.textObj.height;

    this.leftTopObj.x = 0;
    this.leftTopObj.y = 0;
    this.centerTopObj.x = this.leftTopObj.width;
    this.centerTopObj.y = 0;
    this.centerTopObj.width = centerWidth;
    this.rightTopObj.x = this.leftTopObj.width + this.centerTopObj.width;
    this.rightTopObj.y = 0;
    this.leftCenterObj.x = 0;
    this.leftCenterObj.y = this.leftTopObj.height;
    this.leftCenterObj.height = centerHeight;

    this.leftBottomObj.x = 0;
    this.leftBottomObj.y = this.leftTopObj.height + this.leftCenterObj.height;
    this.centerBottomObj.x = this.leftTopObj.width;
    this.centerBottomObj.y = this.leftTopObj.height + this.leftCenterObj.height;
    this.centerBottomObj.width = centerWidth;
    this.rightBottomObj.x = this.leftTopObj.width + this.centerTopObj.width;
    this.rightBottomObj.y = this.leftTopObj.height + this.leftCenterObj.height;

    this.rightCenterObj.x = this.leftTopObj.width + this.centerTopObj.width;
    this.rightCenterObj.y = this.leftTopObj.height;
    this.rightCenterObj.height = centerHeight;

    this.centerCenterObj.x = this.leftTopObj.width;
    this.centerCenterObj.y = this.leftTopObj.height;
    this.centerCenterObj.height = centerHeight;
    this.centerCenterObj.width = centerWidth;

    let width = this.leftTopObj.width + this.centerTopObj.width + this.rightTopObj.width;
    let height = this.leftTopObj.height + this.leftCenterObj.height + this.leftBottomObj.height;
    this.bmp = this.game.make.bitmapData(width, height);
    // let context = this.bmp.canvas.getContext('2d');
    // context.fillStyle = 'black';
    // context.fillRect(0, 0, width, height);
    this.loadTexture(this.bmp);
    if (newOption) {
      this.textObj.anchor.set(0.5, 0.5);
      if (offsetX && offsetX === 3) {
        this.textObj.x = centerWidth/2 + this.leftTopObj.width/2 + this.paddingLeft - 3;
      } else if (offsetX && offsetX === 2) {
        this.textObj.x = centerWidth/2 + this.leftTopObj.width/2 + this.paddingLeft + 2;
      } else {
        this.textObj.x = centerWidth/2 + this.leftTopObj.width/2 + this.paddingLeft;
      }
      this.textObj.y = this.leftTopObj.height + centerHeight/2;
    } else {
      this.textObj.x = this.leftTopObj.width + this.paddingLeft;
      this.textObj.y = this.leftTopObj.height;
    }
    this.allControlList.forEach((item) => {
      item.x -= this.anchor.x * width;
      item.y -= this.anchor.y * height;
    });
  }
}

export {
  AutoWidthText
};