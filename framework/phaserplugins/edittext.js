//编辑器扩展的文本类
class EditText extends Phaser.Sprite {
  constructor(game, x, y, text, style) {
    super(game, x, y);

    this.textObj = game.add.text(x, y, text, style);
    this.baseText = this.textObj.text;
    this.textObj.lineSpacing = 0;
    this.style = this.textObj.style;
    //偏移量
    // 暂时不需要
    this.$textpadding = {
      _left: 0,
      _right: 0,
      _top: 0,
      _bottom: 0,
      root: this,
      get left() {
        return this._left;
      },
      set left(val) {
        this._left = val;
        this.root.drawBgRect();
      },
      get right() {
        return this._right;
      },
      set right(val) {
        this._right = val;
        this.root.drawBgRect();
      },
      get top() {
        return this._top;
      },
      set top(val) {
        this._top = val;
        this.root.drawBgRect();
      },
      get bottom() {
        return this._bottom;
      },
      set bottom(val) {
        this._bottom = val;
        this.root.drawBgRect();
      }
    };

    //背景阴影
    // 暂时不需要
    this.$bgShadow = {
      root: this,
      _shadowColor: '#cccccc',
      get shadowColor() {
        return this._shadowColor;
      },
      set shadowColor(val) {
        this._shadowColor = val;
        this.root.drawBgRect();
      },
      _shadowX: 0,
      get shadowX() {
        return this._shadowX;
      },
      set shadowX(val) {
        this._shadowX = val;
        this.root.drawBgRect();
      },
      _shadowY: 0,
      get shadowY() {
        return this._shadowY;
      },
      set shadowY(val) {
        this._shadowY = val;
        this.root.drawBgRect();
      },
      _shadowBlur: 0,
      get shadowBlur() {
        return this._shadowBlur;
      },
      set shadowBlur(val) {
        this._shadowBlur = val;
        this.root.drawBgRect();
      },
    };

    //
    this.bgObj = game.add.graphics(0, 0);
    this.addChild(this.bgObj);
    this.$bgColor = '#ffffff'; //背景色
    this.$bgAlpha = 0;

    this.$border = 0;
    this.$bordercolor = '#ffffff';


    this.addChild(this.textObj);
    this.drawBgRect();
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
        this.root.drawBgRect();
      },
      set y(val) {
        this._y = val;
        this.root.drawBgRect();
      },
      set(x, y) {
        this.x = x;
        this.y = y;
      }
    };


  }

  get bordercolor() {
    return this.$bordercolor;
  }

  set bordercolor(val) {
    this.$bordercolor = val;
    this.drawBgRect();
  }

  get border() {
    return this.$border;
  }

  set border(val) {
    this.$border = val;
    this.drawBgRect();
  }

  get bgColor() {
    return this.$bgColor;
  }

  set bgColor(val) {

    this.$bgColor = val;
    this.drawBgRect();
  }

  get bgShadow() {
    return this.$bgShadow;
  }

  set bgShadow(val) {
    this.$bgShadow = val;
  }

  get textpadding() {
    return this.$textpadding;
  }

  set textpadding(val) {
    this.$textpadding = val;
  }

  get bgAlpha() {
    return this.$bgAlpha;
  }

  set bgAlpha(val) {

    this.$bgAlpha = val;
    this.drawBgRect();
  }


  get anchor() {
    return this.$anchor;
  }

  set anchor(val) {
    this.$anchor = val;
  }

  get fontFamily() {
    return this.textObj.fontFamily;
  }

  set fontFamily(val) {
    this.textObj.fontFamily = val;
  }

  get strokeThickness() {
    return this.textObj.strokeThickness;
  }

  set strokeThickness(val) {
    this.textObj.strokeThickness = val;
  }

  get stroke() {
    return this.textObj.stroke;
  }

  set stroke(val) {
    this.textObj.stroke = val;
  }


  get wordWrapWidth() {
    return this.textObj.wordWrapWidth;
  }

  set wordWrapWidth(val) {
    this.textObj.wordWrapWidth = val;
  }

  get wordWrap() {
    return this.textObj.wordWrap;
  }

  set wordWrap(val) {
    this.textObj.wordWrap = val;
  }

  get fill() {
    return this.textObj.fill;
  }

  set fill(val) {
    this.textObj.fill = val;
  }


  get lineSpacing() {
    return this.textObj.lineSpacing;
  }

  set lineSpacing(val) {
    this.textObj.lineSpacing = val;
    this.drawBgRect();
  }

  get fontStyle() {
    return this.textObj.fontStyle;
  }

  set fontStyle(val) {
    this.textObj.fontStyle = val;
  }

  get fontWeight() {
    return this.textObj.fontWeight;
  }

  set fontWeight(val) {
    this.textObj.fontWeight = val;
  }

  get fontSize() {
    return this.textObj.fontSize;
  }

  set fontSize(val) {
    this.textObj.fontSize = val;
  }

  get font() {
    return this.textObj.font;
  }

  set font(val) {
    this.textObj.font = val;
  }

  get text() {
    return this.textObj.text;
  }

  set text(val) {
    this.baseText = val;
    this.setText(val);
  }

  setText(txt) {
    this.textObj.setText(txt);
    this.drawBgRect();
  }

  //文本替换
  replaceText(pre, after) {
    let newtext = this.baseText.replace(pre, after);
    this.setText(newtext);
  }

  setShadow(valueX, valueY, colorValue, value) {
    this.textObj.setShadow(valueX, valueY, colorValue, value);
  }

  setStyle(style) {
    this.textObj.setStyle(style);
    this.drawBgRect();
  }

  hexToRgb(hex, alpha) {
    let rgb = {
      r: parseInt('0x' + hex.slice(1, 3)),
      g: parseInt('0x' + hex.slice(3, 5)),
      b: parseInt('0x' + hex.slice(5, 7))
    };
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
  }

  destroy() {
    this.isdestroy = true;
    this.textObj.destroy();
    this.bgObj.destroy();
    super.destroy();
  }

  //debug
  drawBgRect() {
    if (this.isdestroy) {
      return;
    }
    this.bgObj.clear();
    let bound = this.textObj.getBounds();
    let width = bound.width + this.textpadding.right + this.textpadding.left + 2;
    let height = bound.height + this.textpadding.bottom + this.textpadding.top;
    //撑开精灵的宽高
    this.bmp = this.game.make.bitmapData(width + this.bgShadow.shadowBlur, height + this.bgShadow.shadowBlur);
    let x = this.bgShadow.shadowBlur / 2;
    let y = this.bgShadow.shadowBlur / 2;
    let context = this.bmp.canvas.getContext('2d');
    if (this.$border !== 0) {
      context.lineWidth = this.border;
      context.strokeStyle = this.bordercolor;
    }
    context.fillStyle = this.hexToRgb(this.bgColor, this.bgAlpha);


    context.shadowBlur = this.bgShadow.shadowBlur;
    context.shadowColor = this.bgShadow.shadowColor;
    context.shadowOffsetX = this.bgShadow.shadowX;
    context.shadowOffsetY = this.bgShadow.shadowY;
    context.fillRect(x, y, width, height);
    context.shadowBlur = 0;
    // if (this.$border !== 0) {
    //   context.rect(x, y, width, height);
    //   context.stroke();
    // }
    context.save();
    this.loadTexture(this.bmp);
    if (this.border !== 0) {
      this.bgObj.lineStyle(this.border, parseInt(this.bordercolor.replace('#', ''), 16));
      this.bgObj.drawRect(-width * this.anchor.x, -height * this.anchor.y, width, height);
    }
    // let txtObjX = (width) * this.anchor.x - this.textObj.width * this.anchor.x;
    // let txtObjY = (height) * this.anchor.y - this.textObj.height * this.anchor.y;
    // let newx = this.textpadding.left - txtObjX;
    // let newy = this.textpadding.top - txtObjY;
    // this.textObj.x = newx+x;
    // this.textObj.y = newy+y;
    this.textObj.x=-this.bmp.width*this.anchor.x+(this.bmp.width-this.textObj.width)/2;
    this.textObj.y=-this.bmp.height*this.anchor.y+(this.bmp.height-this.textObj.height)/2;
  }

  getBounds() {
    let bound = super.getBounds();
    // let x = bound.x - this.textpadding.left;
    // let y = bound.y - this.textpadding.top;
    // let width = bound.width + this.textpadding.left + this.textpadding.right;
    // let height = bound.height + this.textpadding.top + this.textpadding.bottom;
    // return new Phaser.Rectangle(x, y, width, height);
    return bound;
  }
}

Phaser.EditText = EditText;
Phaser.GameObjectFactory.prototype.edittext = function (x, y, text, style, group) {
  if (group === undefined) { group = this.world; }
  return group.add(new Phaser.EditText(this.game, x, y, text, style));
};