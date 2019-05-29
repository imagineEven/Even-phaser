import Phaser from 'phaser';
import _ from 'lodash';

class ContentWithScroll extends Phaser.Sprite {
  constructor(game, x, y, key, bgOptions, xScroll = {}, yScroll = {}) {
    const bgSetting = Object.assign({}, {
      backgroundColor: 0xffffff,
      backgroundAlpha: 0,
      width: game.world.width,
      height: game.world.height
    }, bgOptions);
    const graphics = game.add.graphics(0, 0);
    graphics.beginFill(bgSetting.backgroundColor, bgSetting.backgroundAlpha);
    graphics.drawRect(0, 0, bgSetting.width, bgSetting.height);
    graphics.visible = false;
    super(game, x, y, graphics.generateTexture());
    this.game = game;
    this.$content = typeof key === 'string' ? this.game.add.sprite(0, 0, key) : key;
    this.isPress = false; //是否按下
    this.thumbPress = false; //是都按下滚动条
    this.offsetx = this.offsety = 0; //由于锚点所引起的偏移量
    this.xScroll = xScroll;
    this.yScroll = yScroll;
    this.maxScrollTop = this.maxScrollLeft = 0; //超出视口内容长度
    this.masker = this.game.add.graphics(0, 0);
    this.masker.beginFill(0xffffff, 0);
    this.masker.drawRect(0, 0, this.width, this.height);
    this.$content.mask = this.masker;
    this.scrollEnd = () => {};
    this.addChild(this.$content);
    this.addChild(this.masker);
    this.createScrollBar();
    this.$anchor = {
      root: this,
      get x() {
        return this.root.anchor.x;
      },
      get y() {
        return this.root.anchor.y;
      },
      set x(val) {
        this.root.anchor.x = val;
        this.root.offsetx = this.root.width * val;
        this.root.resetPosition();
      },
      set y(val) {
        this.root.anchor.y = val;
        this.root.offsety = this.root.height * val;
        this.root.resetPosition();
      },
      set(x, y) {
        this.x = x;
        this.y = y;
      }
    };
    this.events.onScroll = new Phaser.Signal();
    this.addEvents();
  }

  resetPosition() {
    this.$content.x = -this.offsetx;
    this.$content.y = -this.offsety;
    this.masker.position.x = -this.offsetx;
    this.masker.position.y = -this.offsety;
    if (this.yScrollBarTrack) {
      this.yScrollBarTrack.x = this.yScrollBarTrack.ox - this.offsetx;
      this.yScrollBarTrack.y = this.yScrollBarTrack.oy - this.offsety;
    }
    if (this.xScrollBarTrack) {
      this.xScrollBarTrack.x = this.xScrollBarTrack.ox - this.offsetx;
      this.xScrollBarTrack.y = this.xScrollBarTrack.oy - this.offsetx;
    }
  }

  set yGrid(arr) {
    if (!Array.isArray(arr)) return;
    this._yGrid = arr;
    this.maxScrollTop = Math.max.apply(null, arr);
  }

  get yGrid() {
    return this._yGrid || [];
  }

  resetScrollBar() {
    if (this.xScrollBarThumb) {
      this.maxScrollLeft = this.$content.width - this.width;
      if (this.maxScrollLeft > 0) {
        if ('$width' in this.xScrollBarThumb) {
          this.xScrollBarThumb.$width = (this.xScrollBarTrack.width - 2 * this.xScrollBarThumb.xPadding) * this.width / this.$content.width;
        } else {
          this.xScrollBarThumb.width = (this.xScrollBarTrack.width - 2 * this.xScrollBarThumb.xPadding) * this.width / this.$content.width;
        }
        this.xScrollBarRate = (this.xScrollBarTrack.width - 2 * this.xScrollBarThumb.xPadding) / this.$content.width;
      }
    }
    if (this.yScrollBarThumb) {
      this.maxScrollTop = this.$content.height - this.height;
      if (this.maxScrollTop > 0) {
        if ('$height' in this.yScrollBarThumb) {
          this.yScrollBarThumb.$height = (this.yScrollBarTrack.height - 2 * this.yScrollBarThumb.yPadding) * this.height / this.$content.height;
        } else {
          this.yScrollBarThumb.height = (this.yScrollBarTrack.height - 2 * this.yScrollBarThumb.yPadding) * this.height / this.$content.height;
        }
        this.yScrollBarRate = (this.yScrollBarTrack.height - 2 * this.yScrollBarThumb.yPadding) / this.$content.height;
      }
    }
  }

  moveContentByYStep(step) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.alignTween) {
      this.alignTween.stop(true);
    }
    this.yScrollBarThumb.alpha = 0.2;
    if (step > 0 && this.$content.y + step + this.offsety >= 0) {
      this.$content.y = -this.offsety;
    } else if (step < 0 && this.$content.y + step <= -this.maxScrollTop - this.offsety) {
      this.$content.y = -this.maxScrollTop - this.offsety;
    } else {
      this.$content.y += step;
    }
    this.yScrollBarThumb.y = (-this.$content.y - this.offsety) * this.yScrollBarRate + this.yScrollBarThumb.yPadding;
    this.events.onScroll.dispatch(this, -this.offsety - this.$content.y);
    this.timer = setTimeout(() => {
      this.yScrollBarThumb.alpha = 0.1;
    }, 300);
  }

  moveContentByXStep(step) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.xScrollBarTrack.visible = true;
    if (step > 0 && this.$content.x + step + this.offsetx >= 0) {
      this.$content.x = -this.offsetx;
    } else if (step < 0 && this.$content.x + step <= -this.maxScrollLeft - this.offsetx) {
      this.$content.x = -this.maxScrollLeft - this.offsetx;
    } else {
      this.$content.x += step;
    }
    this.xScrollBarThumb.x = (-this.$content.x - this.offsetx) * this.xScrollBarRate + this.xScrollBarThumb.xPadding;
    this.events.onScroll.dispatch(this, -this.offsetx - this.$content.x);
    let {
      xVisible = true
    } = this.xScroll;
    if (xVisible) return;
    this.timer = setTimeout(() => {
      this.yScrollBarThumb.alpha = 0.1;
    }, 500);
  }

  enableScroll(needScroll = true) {
    if (needScroll) {
      this.game.input.mouse.mouseWheelCallback = () => {
        let pointerX = this.game.input.mousePointer.x,
          pointerY = this.game.input.mousePointer.y;
        let isContain = Phaser.Rectangle.contains(this.getBounds(), pointerX, pointerY);
        if (this.maxScrollTop > 0 && isContain) {
          this.game.input.mouse.wheelDelta === Phaser.Mouse.WHEEL_UP ? this.moveContentByYStep(20) : this.moveContentByYStep(-20);
        }
      };
      this.game.input.onDown.removeAll();
      this.game.input.onUp.removeAll();
      this.game.input.onDown.add((pointer) => {
        this.previousPoint = pointer;
        let isContain = Phaser.Rectangle.contains(this.getBounds(), this.previousPoint.x, this.previousPoint.y);
        if (isContain)
          this.isPress = true;
      });
      this.game.input.onUp.add(() => {
        this.isPress = false;
      });
    } else {
      this.isPress = false;
      this.game.input.mouse.mouseWheelCallback = () => {};
      this.game.input.onDown.removeAll();
      this.game.input.onUp.removeAll();
    }
  }

  addEvents() {
    this.game.input.addMoveCallback((pointer, x, y) => {
      if (this.isPress) {
        if (this.maxScrollTop > 0) {
          this.moveContentByYStep(y - this.previousPoint.y);
        }
        if (this.maxScrollLeft > 0) {
          this.moveContentByXStep(x - this.previousPoint.x);
        }
      }
      if (this.thumbPress) {
        if (this.maxScrollTop > 0) {
          this.moveContentByYStep((this.previousPoint.y - y) / this.yScrollBarRate);
        }
        if (this.maxScrollLeft > 0) {
          this.moveContentByXStep((this.previousPoint.x - x) / this.xScrollBarRate);
        }
      }
      this.previousPoint = {
        x: x,
        y: y
      };
    });
    //滚动条处理
    if (this.yScrollBarThumb) {
      this.yScrollBarThumb.inputEnabled = true;
      this.yScrollBarThumb.events.onInputDown.add((e) => {
        this.previousPoint = e.input.downPoint;
        this.thumbPress = true;
      });
      this.yScrollBarThumb.events.onInputUp.add(() => {
        this.thumbPress = false;
      });
    }
    if (this.xScrollBarThumb) {
      this.xScrollBarThumb.inputEnabled = true;
      this.xScrollBarThumb.events.onInputDown.add(e => {
        this.previousPoint = e.input.downPoint;
        this.thumbPress = true;
      });
      this.xScrollBarThumb.events.onInputUp.add(() => {
        this.thumbPress = false;
      });
    }
  }

  destroy() {
    this.game.input.onDown.removeAll();
    this.game.input.onUp.removeAll();
    super.destroy();
  }

  //创建scrollbar
  createScrollBar() {
    this.xScrollBarTrack && this.xScrollBarTrack.destroy();
    this.yScrollBarTrack && this.yScrollBarTrack.destroy();
    let initPosition = {
      x: 0,
      y: 0
    };
    let {
        xTrack,
        xThumb,
        xPadding = 0,
        xPosition = initPosition,
        xVisible = true,
      } = this.xScroll, {
        yTrack,
        yThumb,
        yPadding = 0,
        yPosition = initPosition,
        yVisible = true,
      } = this.yScroll;
    if (xTrack && xThumb) {
      this.maxScrollLeft = this.$content.width - this.width;
      if (this.maxScrollLeft > 0) {
        this.xScrollBarTrack = _.isString(xTrack) || xTrack.baseTexture ? this.game.add.sprite(xPosition.x, xPosition.y, xTrack) : xTrack;
        //定位滚动条内容部分
        this.xScrollBarThumb = _.isString(xThumb) || xThumb.baseTexture ? this.game.add.sprite(0, 0, xThumb) : xThumb;
        if ('$width' in this.xScrollBarThumb) {
          this.xScrollBarThumb.$width = (this.xScrollBarTrack.width - 2 * xPadding) * this.width / this.$content.width;
        } else {
          this.xScrollBarThumb.width = (this.xScrollBarTrack.width - 2 * xPadding) * this.width / this.$content.width;
        }
        this.xScrollBarThumb.x = xPadding;
        this.xScrollBarThumb.y = this.xScrollBarTrack.height / 2;
        this.xScrollBarThumb.anchor.y = 0.5;
        this.xScrollBarTrack.addChild(this.xScrollBarThumb);
        this.xScrollBarThumb.xPadding = xPadding;
        this.xScrollBarRate = (this.xScrollBarTrack.width - 2 * xPadding) / this.$content.width;
        this.xScrollBarTrack.ox = xPosition.x;
        this.xScrollBarTrack.oy = xPosition.y;
        this.addChild(this.xScrollBarTrack);
        this.xScrollBarTrack.visible = xVisible;
      }
    }
    if (yTrack && yThumb) {
      this.maxScrollTop = this.$content.height - this.height;
      if (this.maxScrollTop > 0) {
        this.yScrollBarTrack = _.isString(yTrack) || yTrack.baseTexture ? this.game.add.sprite(yPosition.x, yPosition.y, yTrack) : yTrack;
        //定位滚动条内容部分
        this.yScrollBarThumb = _.isString(yThumb) || yThumb.baseTexture ? this.game.add.sprite(0, 0, yThumb) : yThumb;
        if ('$height' in this.yScrollBarThumb) {
          this.yScrollBarThumb.$height = (this.yScrollBarTrack.height - 2 * yPadding) * this.height / this.$content.height;
        } else {
          this.yScrollBarThumb.height = (this.yScrollBarTrack.height - 2 * yPadding) * this.height / this.$content.height;
        }
        this.yScrollBarThumb.x = this.yScrollBarTrack.width / 2;
        this.yScrollBarThumb.y = yPadding;
        this.yScrollBarThumb.anchor.x = 0.5;
        this.yScrollBarTrack.addChild(this.yScrollBarThumb);
        this.yScrollBarThumb.yPadding = yPadding;
        this.yScrollBarRate = (this.yScrollBarTrack.height - 2 * yPadding) / this.$content.height;
        this.yScrollBarTrack.x = this.yScrollBarTrack.ox = yPosition.x;
        this.yScrollBarTrack.y = this.yScrollBarTrack.oy = yPosition.y;
        this.addChild(this.yScrollBarTrack);
        this.yScrollBarThumb.alpha = 0.1;
      }
    }
  }

  //定位滚动条位置
  setScrollTop(y, duration = 300) {
    let pro = Promise.resolve();
    let offsetY = y < 0 ? 0 : y > this.maxScrollTop ? this.maxScrollTop : y;
    this.alignTween = this.game.add.tween(this.$content).to({
      y: -offsetY - this.offsety
    }, duration, 'Linear', true);
    pro = pro.then(() => {
      return new Promise((resolve, reject) => {
        this.alignTween.onComplete.add(resolve);
      });
    });
    if (this.yScrollBarThumb) {
      this.yScrollBarThumb.y = offsetY * this.yScrollBarRate;
    }
    return pro;
  }

  getScrollTop() {
    return -this.$content.y + this.offsety;
  }

  set scrollTop(y) {
    let offsetY = y < 0 ? 0 : y > this.maxScrollTop ? this.maxScrollTop : y;
    this.$content.y = -offsetY - this.offsety;
  }

  setScrollLeft(x, duration = 300) {
    let offsetx = x < 0 ? 0 : x > this.maxScrollLeft ? this.maxScrollLeft : x;
    this.game.add.tween(this.$content).to({
      x: -offsetx - this.offsetx
    }, duration, 'Linear', true);
    if (this.xScrollBarThumb) {
      this.xScrollBarThumb.x = offsetx * this.xScrollBarRate;
    }
  }

  set scrollLeft(x) {
    let offsetx = x < 0 ? 0 : x > this.maxScrollLeft ? this.maxScrollLeft : x;
    this.$content.x = -offsetx - this.offsetx;
  }

  getScrollLeft() {
    return -this.$content.x + this.offsetx;
  }

  setXScrollBarPosition(x, y) {
    if (!this.xScrollBarTrack) {
      throw new Error('未配置x方向滚动条');
    }
    this.xScrollBarTrack.x = x;
    this.xScrollBarTrack.y = y;
  }

  setYScrollBarPosition(x, y) {
    if (!this.yScrollBarTrack) {
      throw new Error('未配置y方向滚动条');
    }
    this.yScrollBarTrack.x = x;
    this.yScrollBarTrack.y = y;
  }
}

Phaser.ContentWithScroll = ContentWithScroll;
Phaser.GameObjectFactory.prototype.contentWithScroll = function (
  x,
  y,
  key,
  bgOptions,
  xScroll,
  yScroll,
  group
) {
  if (group === undefined) {
    group = this.world;
  }
  return group.add(
    new Phaser.ContentWithScroll(
      this.game,
      x,
      y,
      key,
      bgOptions,
      xScroll,
      yScroll
    )
  );
};