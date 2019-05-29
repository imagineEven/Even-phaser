import Phaser from 'phaser';

class PageBnt {
  constructor(game, num, { distance = 20, width = 400, height = 580 } = {}) {
    if (game instanceof Phaser.State) {
      this.game = game.game;
    } else {
      this.game = game;
    }
    this.num = num;
    this.pageIndex = 0;
    this.bntGroup = this.game.add.group();
    for (let i = 0; i < this.num; i++) {
      let point = this.game.add.sprite(0, 0, 'normalPoint');
      point.anchor.setTo(0.5, 0.5);
      point.x = distance * i;
      point.y = height;
      point.isComplete = false;
      point.nowstate = 0;
      this.bntGroup.addChild(point);
    }
    this.bntGroup.x = width - (distance * (this.num - 1) / 2);

    this.game.input.onDown.add(() => {
      this.startXy = { x: this.game.input.activePointer.x, y: this.game.input.activePointer.y };
    });
    this.game.input.onUp.add(() => {
      this.endXy = { x: this.game.input.activePointer.x, y: this.game.input.activePointer.y };
      if (this.startXy !== undefined) {
        if (this.endXy.x - this.startXy.x > 250) {
          this.onMoveRight.dispatch(this);
        }
        if (this.endXy.x - this.startXy.x < -250) {
          this.onMoveLeft.dispatch(this);
        }
        this.startXy = undefined;
      }
    });

    this.onMoveLeft = new Phaser.Signal();

    this.onMoveRight = new Phaser.Signal();
  }

  //设置点的状态(0:默认 1:当前 2:已完成)
  setPointState(index, state) {
    let children = this.bntGroup.children;
    let stateStr = ['normalPoint', 'currentPoint', 'completePoint'];
    children[index].state = state;
    children[index].loadTexture(stateStr[state]);
  }

  //获取指定节点的状态
  getPointState(index) {
    return this.bntGroup.children[index];
  }
}

export {
  PageBnt
};