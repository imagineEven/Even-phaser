import $ from 'jquery';
class AnimationHelp {
  constructor(dom, key, speed) {
    this.imageAttribute = {};
    this.nodeChildrens = '';
    this.lastTime = 0;
    this.nowFramesIndex = 0;
    this.baseWidth=100;
    this.dom = dom;
    this.speed = speed;
    this.imageUrl = 'http://review.4006688991.com/pixi/asset/image/' + key + '.png';
    let oDiv = document.createElement('div');
    dom.appendChild(oDiv);
    this.oDiv = oDiv;
    this.dataPro = new Promise((resolve) => {
      $.get('http://review.4006688991.com/pixi/asset/txt/' + key + '.xml', result => {
        this.nodeChildrens = $(result).find('SubTexture');
        this.imageAttribute.height = $(this.nodeChildrens[0]).attr('height');
        this.imageAttribute.width = $(this.nodeChildrens[0]).attr('width');
        this.imageAttribute.childrens = [];
        let arr = [].slice.call(this.nodeChildrens);
        for (let item of arr) {
          let value = [];
          value.push(item.attributes.x.value);
          value.push(item.attributes.y.value);
          this.imageAttribute.childrens.push(value);
        }
        resolve();
      });
    }).then(() => {
      this.start();
    });

  }

  stop() {
    cancelAnimationFrame(this.animationId);
  }

  start() {
    this.stop();
    this.dataPro.then(() => {
      $(this.oDiv).html('');
      let divCss = {
        height: this.imageAttribute.height + 'px',
        width: this.imageAttribute.width + 'px',
        overflow: 'hidden',
        zoom: (this.baseWidth / (this.imageAttribute.width > this.imageAttribute.height ? this.imageAttribute.width : this.imageAttribute.height))
      };
      $(this.oDiv).css(divCss);
      this.img = document.createElement('img');
      this.img = $(this.img);
      $(this.img).attr('src', this.imageUrl);
      $(this.oDiv).append(this.img);
      this.repeatAnimation();
    });
  }

  repeatAnimation() {
    this.lastTime++;
    let that = this;
    that.animationId = requestAnimationFrame(function fn() {
      that.rander();
      that.animationId = requestAnimationFrame(fn);
    });
  }

  rander() {

    if (this.lastTime % this.speed === 0) {
      if (this.imageAttribute.childrens.length <= this.nowFramesIndex) {
        this.nowFramesIndex = 0;
      }
      let x = this.imageAttribute.childrens[this.nowFramesIndex][0];
      let y = this.imageAttribute.childrens[this.nowFramesIndex][1];
      this.img.css('transform', `translate(-${x}px, -${y}px)`);
      this.nowFramesIndex++;
    }
    this.lastTime++;
  }
}

export {
  AnimationHelp
};