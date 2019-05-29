import Phaser from 'phaser';
import _ from 'lodash';
class AutoSprite extends Phaser.Sprite {
  constructor(game, x, y, text, option = {}) {
    super(game, x, y);
    this.game = game;
    this.text = text;
    this.option = option;
    this.draw();
    this.createText();
  }

  createText() {
    if (this.text) {
      this.text.x = this.option.paddingLeft || 0;
      this.text.y = this.option.paddingTop || 0;
      this.addChild(this.text);
    }
  }

  draw(option) {
    const {
      radius,
      bgColor,
      paddingLeft = 0,
      paddingTop = 0,
      height,
      width
    } = Object.assign(this.option, option);
    let bgWidth = width === undefined ? this.text.width + paddingLeft * 2 : width;
    let bgHeight = height === undefined ? this.text.height + paddingTop * 2 : height;
    this.bmd = this.game.add.bitmapData(bgWidth, bgHeight);
    this.drawRoundedRect(this.bmd.ctx, 0, 0, bgWidth, bgHeight, radius);
    this.bmd.ctx.fillStyle = bgColor;
    this.bmd.ctx.fill();
    this.loadTexture(this.bmd);
  }

  drawImage(key) {
    let img = key;
    if (_.isString(key) || key.baseTexture) {
      img = this.game.add.sprite(key);
    }
    let {
      radius
    } = this.option;
    this.bmd = this.game.add.bitmapData(this.width, this.height);
    this.bmd.draw(img, 0, 0);
    this.drawRoundedRect(this.bmd.ctx, 0, 0, this.width, this.height, radius);
    this.bmd.ctx.fill();
  }

  setBgColor(color) {
    this.draw({
      bgColor: color
    });
  }

  set $width(w) {
    this.draw({
      width: w
    });
  }

  get $width(){
    return this.width;
  }

  set $height(h) {
    this.draw({
      height: h
    });
  }

  get $height(){
    return this.height;
  }

  getBgWithColor(color) {
    let {
      radius
    } = this.option;
    let bmd = this.game.add.bitmapData(this.width, this.height);
    this.game.util.drawRoundedRect(bmd.ctx, 0, 0, this.width, this.height, radius);
    bmd.ctx.fillStyle = color;
    bmd.ctx.fill();
    return bmd;
  }

  drawRoundedRect(ctx, x, y, w, h, r) {
    let minSize = Math.min(w, h);
    if (r > minSize / 2) r = minSize / 2;
    // 开始绘制
    ctx.beginPath();
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

Phaser.AutoSprite = AutoSprite;
Phaser.GameObjectFactory.prototype.autoSprite = function (
  x,
  y,
  text,
  option,
  group
) {
  if (group === undefined) {
    group = this.world;
  }
  return group.add(
    new Phaser.AutoSprite(
      this.game,
      x,
      y,
      text,
      option
    )
  );
};