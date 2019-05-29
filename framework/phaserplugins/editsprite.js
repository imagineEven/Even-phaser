//编辑器扩展的文本类
class EditSprite extends Phaser.Sprite {
  constructor(game, x, y, key) {
    super(game, x, y);
    this.image = game.add.sprite(0, 0, key);
    this.addChild(this.image);
    this.$trueWidth = 0;
    this.$trueHeight = 0;
    this.$scaleType = '等比'; //拉伸或等比
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
    this.redraw();
  }

  get scaleType() {
    return this.$scaleType;
  }

  set scaleType(val) {
    this.$scaleType = val;
    this.redraw();
  }

  get anchor() {
    return this.$anchor;
  }

  set anchor(val) {
    this.$anchor = val;
  }

  loadTexture(key) {
    this.image.loadTexture(key);
    this.redraw();
  }

  get ikey() {
    return this.image.key;
  }

  set ikey(val) {
    this.image.key = val;
  }

  redraw() {
    this.image.scale.set(1, 1);
    let width = (this.trueWidth === 0 ? this.image.width : this.trueWidth);
    let height = (this.trueHeight === 0 ? this.image.height : this.trueHeight);
    this.bmp = this.game.make.bitmapData(width, height);
    super.loadTexture(this.bmp);

    if (this.scaleType === '等比') {
      if (width < this.image.width || height < this.image.height) {
        let bili = 0;
        if (this.image.width > this.image.height) {
          //宽比高多
          bili = width / this.image.width;
        }
        else {
          bili = height / this.image.height;
        }
        if (width < this.image.width * bili) {
          bili *= width / (this.image.width * bili);
        }
        if (height < this.image.height * bili) {
          bili *= height / (this.image.height * bili);
        }
        this.image.scale.set(bili);

      }
    }
    else {
      let x = width / this.image.width;
      let y = height / this.image.height;
      this.image.scale.set(x, y);
    }

    this.image.x = (width - this.image.width) / 2;
    this.image.y = (height - this.image.height) / 2;
    this.image.x -= this.anchor.x * width;
    this.image.y -= this.anchor.y * height;
  }

  get trueWidth() {
    return this.$trueWidth;
  }

  set trueWidth(val) {
    this.$trueWidth = val;
    this.redraw();
  }

  get trueHeight() {
    return this.$trueHeight;
  }

  set trueHeight(val) {
    this.$trueHeight = val;
    this.redraw();
  }
}

Phaser.EditSprite = EditSprite;
Phaser.GameObjectFactory.prototype.editsprite = function (x, y, key) {

  return this.world.add(new Phaser.EditSprite(this.game, x, y, key));
};