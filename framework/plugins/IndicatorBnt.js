import Phaser from 'phaser';
let _symbol = {
  color: Symbol()
};
const colorLevel = {
  Green: Symbol('green'),
  White: Symbol('white'),
  Yellow: Symbol('yellow'),
  Red: Symbol('red')
};
class IndicatorBnt {
  constructor(game, num, { distance = 30, width = 400, height = 580 } = {}) {
    if (game instanceof Phaser.State) {
      this.game = game.game;
    } else {
      this.game = game;
    }
    this.game.indicatorBnt = this;
    this.num = num;
    this.bntGroup = this.game.add.group();
    this.game.initQuestionList(num);
    for (let i = 0; i < this.num; i++) {
      let point = this.game.add.sprite(0, 0, 'whitepoint');
      point.anchor.setTo(0.5, 0.5);
      point.x = distance * i;
      point.y = height;
      point[_symbol.color] = 'white';
      this.bntGroup.addChild(point);
    }
    this.bntGroup.x = width - (distance * (this.num - 1) / 2);
  }

  set(index, color) {
    if (index >= this.num) {
      return;
    }
    let child = this.bntGroup.children[index];
    child[_symbol.color] = color;
    switch (color) {
      case 'yellow':
        child.loadTexture('yellowpoint');
        this.game.answerQuestion(index, false);
        break;
      case 'white':
        child.loadTexture('whitepoint');
        break;
      case 'red':
        child.loadTexture('redpoint');
        this.game.answerQuestion(index, false);
        break;
      case 'green':
        child.loadTexture('greenpoint');
        this.game.answerQuestion(index, true);
        break;
      default:
        child.loadTexture('whitepoint');
    }
  }

  setBtnColor(index, colorSymbol) {
    if (index >= this.num) {
      return;
    }
    let child = this.bntGroup.children[index];
    child[_symbol.color] = colorSymbol;
    switch (colorSymbol) {
      case colorLevel.Yellow:
        child.loadTexture('yellowpoint');
        this.game.answerQuestion(index, false);
        break;
      case colorLevel.White:
        child.loadTexture('whitepoint');
        break;
      case colorLevel.Red:
        child.loadTexture('redpoint');
        this.game.answerQuestion(index, false);
        break;
      case colorLevel.Green:
        child.loadTexture('greenpoint');
        this.game.answerQuestion(index, true);
        break;
      default:
        child.loadTexture('whitepoint');
    }
  }

  static get getColorState() {
    return colorLevel;
  }

  getColor(index) {
    if (index >= this.num) {
      return;
    }
    return this.bntGroup.children[index][_symbol.color];
  }

  answerRight(index) {
    if (index >= this.num) {
      return;
    }
    if (this.getColor(index) !== 'white') {
      this.set(index, 'yellow');
      this.game.answerQuestion(index, false);
    } else {
      this.set(index, 'green');
      this.game.answerQuestion(index, true);
    }
  }

  answerWrong(index) {
    if (index >= this.num) {
      return;
    }
    this.set(index, 'red');
    this.game.answerQuestion(index, false);
  }
}
export {
  IndicatorBnt
};