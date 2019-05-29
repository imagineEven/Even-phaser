import Phaser from 'phaser';
import { CONSTANT } from './../core/Constant';
import { Options } from './../core/Options';
import $ from 'jquery';

class ProgressBtns extends Phaser.Group {
  constructor(game, num) {
    super(game);
    this.game = game;
    this.initBtns(num);
  }

  initBtns(num) {
    this.btnArr = [];
    this.position.set(775, 40);
    for (let i = 0; i < num; i++) {
      let dot = new Phaser.Image(this.game, 0, i * 36, 'normalBtn');
      dot.id = i;
      dot.anchor.set(0.5);
      this.addChild(dot);
      let text = new Phaser.Text(this.game, 0, 0, i + 1 < 10 ? '0' + (i + 1) : i + 1, {
        'font': '12px Century Gothic',
        'fill': '#000'
      });
      text.anchor.set(0.5, 0.38);
      dot.addChild(text);
      dot.state = CONSTANT.NORMAL;
      dot.isFinished = false;
      this.btnArr.push(dot);
    }
    this.btnArr[0].state = CONSTANT.CURRENT;
    this.btnArr[0].loadTexture('currentBtn');
    this.btnArr[0].children[0].fill = '#ffffff';
    this.currentId = 0;
  }

  setEnabled(boolArg) {
    this.game.util.setObjectArrayClicked(this.btnArr, boolArg);
  }

  setClickEvent(onClick) {
    for (let item of this.btnArr) {
      item.events.onInputDown.add((btn) => {
        this.commonBtnClick(btn.id);
        onClick(btn);
      });
    }
  }

  commonBtnClick(id) {
    for (let item of this.btnArr) {
      item.state = CONSTANT.NORMAL;
    }
    this.currentId = id;
    this.btnArr[id].state = CONSTANT.CURRENT;
    for (let item of this.btnArr) {
      if (item.state === CONSTANT.NORMAL) {
        if (item.isFinished) {
          item.loadTexture('finishedBtn');
          item.children[0].fill = '#ffffff';
        } else {
          item.loadTexture('normalBtn');
          item.children[0].fill = '#000000';
        }
      } else {
        item.loadTexture('currentBtn');
        item.children[0].fill = '#ffffff';
      }
    }
  }
}

class LeftAndRightDomBtn {
  constructor(rate) {
    this.resource = {
      left: 'e6ba6a3e149e7841de8ccb0df561c79d.png',
      right: '779725b94b90f45868f0b76cbc4f6c6e.png',
      leftDisable: '29371e5886d2b40c52425fabe5e61565.png',
      rightDisable: '49f1dfc16527cb4ed282b2686d64f933.png'
    };
    this.rate = rate;
    let url = Options.baseUrl + Options.pathImage;
    this.leftBtn = this.createBtn(url + this.resource.leftDisable, 'progressLeftBtn');
    this.rightBtn = this.createBtn(url + this.resource.right, 'progressRightBtn');
  }

  setBtnDisable() {
    $(this.leftBtn).css('pointer-events', 'none');
    $(this.rightBtn).css('pointer-events', 'none');
  }

  createBtn(url, id) {
    $(document.body).append(`<img src=${url} id='${id}'/>`);
    let $btn = $(`#${id}`);
    $btn.css({
      'position': 'fixed',
      'transform': 'translate(-50%,-50%)',
      'top': '50%'
    });
    let halfWidth = window.innerWidth / 2;
    let canvasHalfWidth = window.innerHeight * this.rate / 2;
    if (id === 'progressLeftBtn') {
      $btn.css({
        'left': (halfWidth / 1.08 - canvasHalfWidth) + 'px'
      });
    } else {
      $btn.css({
        'left': (halfWidth * 1.08 + canvasHalfWidth) + 'px'
      });
    }
    return $btn[0];
  }

  checkClickable(pageId = 0, pageLength) {
    let baseUrl = Options.baseUrl + Options.pathImage;
    let resources = this.resource;
    if (pageId === 0) {
      this.leftBtn.src = baseUrl + resources.leftDisable;
      $(this.leftBtn).css({
        'pointer-events': 'none'
      });
    } else {
      this.leftBtn.src = baseUrl + resources.left;
      $(this.leftBtn).css({
        'pointer-events': 'auto'
      });
    }
    if (pageId >= pageLength - 1) {
      this.rightBtn.src = baseUrl + resources.rightDisable;
      $(this.rightBtn).css({
        'pointer-events': 'none'
      });
    } else {
      this.rightBtn.src = baseUrl + resources.right;
      $(this.rightBtn).css({
        'pointer-events': 'auto'
      });
    }
  }
}

export {
  ProgressBtns,
  LeftAndRightDomBtn
};