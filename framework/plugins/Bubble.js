import Phaser from 'phaser';
import $ from 'jquery';
class Bubble extends Phaser.Group {
  constructor(game, data, rate = 4 / 3) {
    super(game);
    this.graphic = new Phaser.Graphics(game);
    this.data = data;
    this.rate = rate;
    this.addChild(this.graphic);
  }

  drawBubble(colorId) {
    let bubbleData = this.data.bubble;
    let arrowData = this.data.arrow;
    this.graphic.beginFill(bubbleData[colorId]);
    if (bubbleData.type === 'rect') {
      this.graphic.drawRoundedRect(bubbleData.position.x, bubbleData.position.y,
        bubbleData.width, bubbleData.height, bubbleData.radius);
    } else {
      this.graphic.drawEllipse(bubbleData.position.x, bubbleData.position.y,
        bubbleData.width, bubbleData.height);
    }
    if (arrowData) {
      this.drawArrow(bubbleData[colorId], arrowData);
    }
    this.graphic.endFill();
    this.createText();
  }

  drawArrow(colorId, arrowData) {
    
    for (let i = 0; i < arrowData.length; i++) {
      let item = arrowData[i];
      let graphic = this.game.add.graphics();
      graphic.beginFill(colorId);
      let x = 41.29;
      let y = 0;
      graphic.moveTo(x, y);
      graphic.lineTo(x + 41.29, y + 72.25);
      graphic.lineTo(x - 41.29, y + 72.25);
      graphic.lineTo(x, y);
      graphic.anchor.set(0.5);
      this.add(graphic);
      graphic.rotation = item.rotation;
      graphic.x = item.x;
      graphic.y = item.y;
      if(item.scale){
        graphic.scale.set(item.scale);
      }
    }
  }

  createText() {
    let position = this.data.textPosition;
    let div = document.createElement('div');
    $(div).append(unescape(this.data.text)).addClass('bubbleText');
    $(document.body).append(div);
    let width = innerHeight * this.rate;
    $(div).css({
      'position': 'fixed',
      'left': (innerWidth - width) / 2 + width * position.x,
      'top': position.y * innerHeight + 'px',
      'user-select': 'none'
    });
    this.textDom = div;
  }

  clear() {
    this.graphic.clear();
  }
}

export {
  Bubble
};