/**
 * content: 富文本内容
 * scroll: DOM id，posX
 * canClicked: 滚动区域内是否有input事件
 * 滑块：色值#000000   RGB:0 0 0   不透明度：10%   滚动条距离上下、左侧的间距为4px
 */
class ScrollBar {
  constructor(game, data, content, scroll) {
    this.game = game;
    this.data = data;
    this.scroll = scroll;
    this.content = content;
    this.game.scrollBar = this;
    this.t1 = 0;
    this.t2 = 0;
    this.timer = null;
    this.initContent();
  }

  initContent() {
    this.handleHeight = 170 * 210 / this.content.height;

    this.leftPanel = this.game.add.graphics();
    this.leftPanel.beginFill(0xD3E9F0, 0);
    this.leftPanel.drawRect(this.scroll.rectX, this.scroll.rectY, 540, this.content.height);
    this.leftPanel.addChild(this.content);

    this.scrollPanel = this.game.add.sprite(0, this.scroll.rectY - 16, this.data.img_scroll_bar.image);//20
    this.scrollPanel.alpha = 0;
    this.scrollPanel.height = 202;//210

    this.bmd = this.game.add.bitmapData(6, this.handleHeight);
    this.drawRoundedRect(this.bmd.ctx, 0, 0, 6, this.handleHeight, 6);
    this.bmd.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    this.bmd.ctx.fill();
    this.handle = this.game.add.sprite(0, this.scroll.rectY - 16, this.bmd);//20
    
    this.scrollPanel.x = this.scroll.scrollX - this.handle.width;
    this.handle.x = this.scroll.scrollX - this.handle.width - 4;//0
    this.handle.alpha = 0.1;

    this.startY = this.scroll.rectY - 16;//20

    this.calcDis();
    this.createScrollArea();
  }

  drawRoundedRect(ctx, x, y, w, h, r) {
    let minSize = Math.min(w, h);
    if (r > minSize / 2) r = minSize / 2;
    // 开始绘制
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  clearScroll() {
    this.leftPanel.destroy();
    this.scrollPanel.destroy();
    this.handle.destroy();
    this.inner.parentNode.removeChild(this.inner);
    this.mid.parentNode.removeChild(this.mid);
  }

  createScrollArea() {
    this.out = document.getElementById('CoursewareDiv');
    this.mid = document.createElement('div');
    this.mid.id = this.scroll.id;
    this.mid.style.width = '540px';
    this.mid.style.height = '170px';
    this.mid.style.marginTop = this.scroll.rectY + 'px';
    this.mid.style.marginLeft = this.scroll.rectX + 'px';
    this.mid.style.opacity = 0;
    this.mid.style.overflowX = 'hidden';
    this.mid.style.overflowY = 'scroll';
    this.mid.style.pointerEvents = this.scroll.canClicked ? 'none' : 'auto';
    this.out.appendChild(this.mid);

    this.inner = document.createElement('div');
    this.inner.style.width = '540px';
    this.inner.style.height = (this.leftPanel.height) + 'px';
    this.mid.appendChild(this.inner);
    this.canScroll = true;
    //鼠标滚轮滚动
    this.mid.onscroll = () => {
      if (!this.canScroll) {
        return;
      }
      this.realHeight = this.scrollHeight * 170 / this.leftPanel.height;
      let barRadio = this.realHeight / this.handle.height;
      let updateY = this.mid.scrollTop;
      let barY = this.startY + updateY * barRadio * this.scrollHeight / this.leftPanel.height;
      if (this.mid.scrollHeight - this.mid.scrollTop - 170 <= 0) {
        updateY = this.leftPanel.height - 170;
        barY = 202 - this.handle.height + this.startY;//210
      } else if (this.mid.scrollTop === 0) {
        updateY = 0;
        barY = this.startY;
      }
      this.leftPanel.y = -updateY;
      this.handle.y = barY;

      this.handle.alpha = 0.2;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.isScrollEnd();
      }, 300);
      this.t1 = this.handle.y;
    };
  }

  isScrollEnd() {
    this.t2 = this.handle.y;
    if (this.t2 === this.t1) {
      this.handle.alpha = 0.1;
    }
  }

  calcDis() {
    this.scrollHeight = 202;//210
    this.scrollRatio = (this.scrollHeight - this.handleHeight) / (this.content.height - 170);
  }

  //拖拽滚动条滚动
  dragUpdate(handle) {
    let diffY = (handle.y - this.startY) * this.leftPanel.height / this.scrollHeight;
    handle.x = this.scroll.scrollX - handle.width;
    if (this.leftPanel.height > 170 && this.leftPanel.height < 190) {
      diffY = 0;
    }
    if (handle.y + handle.height >= this.startY + 210) {
      handle.y = 210 - handle.height + this.startY;
      diffY = this.leftPanel.height - 170;
    }
    if (handle.y - this.startY <= 0) {
      handle.y = this.startY;
      diffY = 0;
    }
    this.leftPanel.y = -diffY;
  }
}

export {
  ScrollBar
};
