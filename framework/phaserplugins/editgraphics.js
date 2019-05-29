
import BaseSprite from './basesprite';
//编辑器扩展的文本类
class EditGraphics extends BaseSprite {
  constructor(game, x, y, width, height, color, radius, sharptype = 0) {
    super(game, x, y);
    this.$width = width;
    this.$height = height;
    this.$color = color;
    this.$radius = radius;
    this.$sharptype = sharptype; //0:矩形 1:圆形 2:椭圆 3:三角形
    this.$border = 0;
    this.$bordercolor = '#ffffff';
    this.bgObj = game.add.graphics(0, 0);
    this.addChild(this.bgObj);
    this.$anchor = {
      textObj: this.textObj,
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
    //边框的phaser
    this.redraw();
  }


  get bordercolor() {
    return this.$bordercolor;
  }

  set bordercolor(val) {
    this.$bordercolor = val;
    this.redraw();
    this.parentReDraw();
  }

  get border() {
    return this.$border;
  }

  set border(val) {
    this.$border = val;
    this.redraw();
    this.parentReDraw();
  }

  get anchor() {
    return this.$anchor;
  }

  set anchor(val) {
    this.$anchor = val;
  }

  get sharpWidth() {
    return this.$width;
  }

  set sharpWidth(val) {
    this.$width = val;
    this.redraw();
    this.parentReDraw();
  }

  get sharptype() {
    return this.$sharptype;
  }

  set sharptype(val) {
    this.$sharptype = val;
    this.redraw();
    this.parentReDraw();
  }


  get sharpHeight() {
    return this.$height;
  }

  set sharpHeight(val) {
    this.$height = val;
    this.redraw();
    this.parentReDraw();
  }

  get sharpRadius() {
    return this.$radius;
  }

  set sharpRadius(val) {
    this.$radius = val;
    this.redraw();
    this.parentReDraw();
  }

  get sharpColor() {
    return this.$color;
  }

  set sharpColor(val) {
    this.$color = val;
    this.redraw();
    this.parentReDraw();
  }

  //debug
  redraw() {
    if (this.isDestroy) {
      return;
    }
    if (this.Rect) {
      this.Rect.clear();
      //this.Rect.lineStyle(8, 0xffd900);
    }
    if (this.fram) {
      this.fram.clear();
    }
    this.bgObj.clear();
    let width = this.$width;
    let height = this.$height;
    this.bmp = this.game.make.bitmapData(width + this.border, height + this.border);
    //let context = this.bmp.canvas.getContext('2d');
    // context.fillStyle = 'rgba(255,0,0,1)';
    // context.fillRect(0, 0, this.bmp.width, this.bmp.height);
    // context.save();
    if (isNaN(this.sharpColor)) {
      this.bgObj.beginFill(parseInt(this.sharpColor.replace('#', ''), 16));
    } else {
      this.bgObj.beginFill(this.sharpColor);
    }
    this.bgObj.lineStyle(this.border, parseInt(this.bordercolor.replace('#', ''), 16));
    let truex = 0 - width * (this.anchor.x) + this.border / 2;
    let truey = 0 - height * (this.anchor.y) + this.border / 2;
    if (this.sharptype === 0) {
      if (this.sharpRadius === 0) {
        this.Rect = this.bgObj.drawRect(truex, truey, width, height);
      }
      else {
        this.Rect = this.bgObj.drawRoundedRect(truex, truey, width, height, this.sharpRadius);
      }
    }
    else if (this.sharptype === 1) { //圆形
      this.bgObj.drawCircle(truex + width / 2, truey + width / 2, width);
    }
    else if (this.sharptype === 2) { //椭圆
      this.bgObj.drawEllipse(truex + this.bmp.width / 2, truey + this.bmp.height / 2, width / 2, height / 2);
    } else if (this.sharptype === 3) { //三角形
      let path = [
        { x: truex, y: truey + height },
        { x: truex + width, y: truey + height },
        { x: (truex + truex + width) / 2, y: truey + height - Math.sqrt((width) * (width) - (width / 2 * width / 2)) }
      ];
      this.bgObj.drawPolygon(path);
    }

    this.loadTexture(this.bmp);
  }

  destroy() {
    this.isDestroy = true;
    super.destroy();
  }

}

Phaser.EditGraphics = EditGraphics;
Phaser.GameObjectFactory.prototype.editgraphics = function (x, y, width, height, color, radius, sharptype, group) {
  if (group === undefined) { group = this.world; }
  return group.add(new Phaser.EditGraphics(this.game, x, y, width, height, color, radius, sharptype));
};