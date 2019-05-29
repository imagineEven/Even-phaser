import Phaser from 'phaser';
let _symbol = {
  color: Symbol()
};
const colorLevel = {
  Green: Symbol('green'),
  White: Symbol('white'),
  Pendding: Symbol('pendding')
};
class IndicatorHwBnt {
  constructor(game, num, {
    distance = 20,
    width = 400,
    height = 580
  } = {}) {
    if (game instanceof Phaser.State) {
      this.game = game.game;
    } else {
      this.game = game;
    }
    this.game.indicatorBnt = this;
    this.num = num;
    if (this.num === 1) {
      return;
    }
    this.bntGroup = this.game.add.group();
    this.game.initQuestionList(num);
    for (let i = 0; i < this.num; i++) {
      let point = this.game.add.sprite(0, 0, !i ? 'ringPoint' : 'whitePoint');
      point.anchor.setTo(0.5, 0.5);
      point.x = distance * i;
      point.y = height;
      point[_symbol.color] = 'white';
      this.bntGroup.addChild(point);
    }
    this.bntGroup.x = width - (distance * (this.num - 1) / 2);
  }

  setVisible(...args) {
    if(!this.bntGroup) return;
    this.bntGroup.visible = true;
    args.forEach(arg => {
      if (arg.visible === true && this.checkOverlap(arg))
        this.bntGroup.visible = false;
    });
  }

  checkOverlap(sprite) {
    let overlap = false;
    let spriteBounds = sprite.getBounds();
    let children = this.bntGroup.children;

    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      let compareResult = Phaser.Rectangle.intersects(spriteBounds, child.getBounds());
      if (compareResult) {
        overlap = true;
        break;
      }
    }
    return overlap;
  }

  changeBtnColor(index) {
    this.game.world.bringToTop(this.bntGroup);
    if (this.num === 1) {
      return;
    }
    const colorState = this.getColorState();
    this.setBtnColor(index - 1, colorState.Green);
    this.setBtnColor(index, colorState.Pendding);
  }

  BtnColorFinish(pageNum) {
    if (pageNum) {
      for (let i = 0; i < pageNum; i++) {
        this.changeBtnColor(i, false);
      }
    }
  }

  setBtnColor(index, colorSymbol) {
    if (index >= this.num) {
      return;
    }
    let child = this.bntGroup.children[index];
    child[_symbol.color] = colorSymbol;
    switch (colorSymbol) {
      case colorLevel.Pendding:
        child.loadTexture('ringPoint');
        break;
      case colorLevel.Green:
        child.loadTexture('greenPoint');
        break;
      case colorLevel.White:
        child.loadTexture('whitePoint');
        break;
      default:
        child.loadTexture('whitePoint');
    }
  }


  getColorState() {
    return colorLevel;
  }

  getColor(index) {
    if (index >= this.num) {
      return;
    }
    return this.bntGroup.children[index][_symbol.color];
  }
}
export {
  IndicatorHwBnt
};