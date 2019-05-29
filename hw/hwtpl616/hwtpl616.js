import { Courseware } from '../../framework/core/Courseware';
import { CONSTANT } from '../../framework/core/Constant';
import ExitUtil from '../../framework/plugins/exitUtil';
import _ from 'lodash';
import { DomScroll } from './domScroll';
import { ExitDialog } from '../../framework/plugins/exitDialog';
import staticRes from './static-resource.json';

class Hwtpl616 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = staticRes;
      this.loadPageResources(this.data, staticRes);
      this.loadHwPublicResource();
    };

    super({}, preload, () => {
      this.initQuestionList(this.data.pages.length);
      this.createUI();
      new ExitDialog(this, { zIndex: 99 });
    });

    Object.assign(data, staticRes);
    this.pageIndex = 0;
    this.selectNumber = 0;
    this.wrongCount = 0;
    this.canSelect = true;
  }

  createUI() {
    this.createSprite(0, 0, this.data.background);
    let left = this.createSprite(28, 42, this.data.container.images[0]);
    this.createSprite(37 + left.width, 35, this.data.container.images[1]);

    const passage = new DomScroll(this, this.data, { ml: 52, pr: 21, fontSize: 18, width: 317, lineHeight: 34 });
    this.pages = [];
    let pages = this.data.isRandom ? _.shuffle(this.data.pages) : this.data.pages;
    pages.forEach((item, index) => {
      let page = new DomScroll(this, item, { sequence: index, ml: 47, pr: 27, fontSize: 16, width: 254, lineHeight: 26 }, true);
      if (!index)
        page.setDomVisible(true);
      this.pages.push(page);
    });

    passage.setScrollStyle();
    this.createQuestionBar();
    if (this.data.firstAudio.sound) {
      this.canSelect = false;
      this.util.setObjectArrayClicked(this.btnGroup.children, false);
      this.playSoundPromiseByObject(this.data.firstAudio).then(() => {
        this.canSelect = true;
        this.util.setObjectArrayClicked(this.btnGroup.children, true);
      });
    }
  }

  createQuestionBar() {
    const pages = this.data.pages;
    this.btnGroup = this.add.group();
    for (let i = 0; i < pages.length; i++) {
      let img = i ? this.data.btns.default : this.data.btns.current;
      let bar = this.createSprite(736, 56 + i * 47, img);
      bar.status = 1; //1: 未做， 2：已选择， 3：正确
      bar.sequence = i;
      bar.inputEnabled = true;
      bar.events.onInputDown.add(btn => {
        this.btnNext.visible = false;
        this.pageIndex = btn.sequence;
        this.changeBar();
      });
      let number = this.add.text(0, 0, i + 1, {
        font: CONSTANT.DEFAULT_FONT,
        fontWeight: 'bold',
        fontSize: '22px'
      });
      number.x = (bar.width - number.width) / 2;
      number.y = 3 + (bar.height - number.height) / 2;
      bar.addChild(number);
      this.btnGroup.add(bar);
    }
    this.btnNext = this.createSprite(325, 520, this.data.btns.next);
    this.btnSubmit = this.createSprite(325, 520, this.data.btns.submit);
    this.btnFinish = this.createSprite(325, 520, this.data.btns.finish);
    this.btnNext.visible = false;
    this.btnSubmit.visible = false;
    this.btnFinish.visible = false;
    this.btnNext.inputEnabled = true;
    this.btnNext.events.onInputDown.add(() => {
      this.btnNext.visible = false;
      this.getNextUnfinish();
      this.changeBar();
    });
    this.btnSubmit.inputEnabled = true;
    this.btnSubmit.events.onInputDown.add(() => {
      this.wrongCount = 0;
      this.btnSubmit.visible = false;
      this.checkAnswer();
    });
    this.btnFinish.inputEnabled = true;
    this.btnFinish.events.onInputDown.add(() => {
      this.btnFinish.visible = false;
      ExitUtil.gameOver(this);
    });
  }

  //获取下一个未做
  getNextUnfinish() {
    let children = this.btnGroup.children;
    let indexs = [];

    children.forEach((child, index) => {
      let idx = child.status === 1 ? index : -1;
      indexs.push(idx);
    });

    let i = this.pageIndex + 1;
    let next = () => {
      if (i === indexs.length) {
        i = 0;
        return next();
      } else {
        if (indexs[i] !== -1) {
          return indexs[i];
        } else {
          i += 1;
          return next();
        }
      }
    };
    this.pageIndex = next();
  }

  //submit校验答案
  checkAnswer() {
    let isFirst = true;
    let sequence = 0;
    let children = this.btnGroup.children;
    for (let i = 0; i < this.pages.length; i++) {
      let item = this.pages[i];
      if (item.status !== 3) {
        if (item.isAnswer) {
          item.cancelBind();
          item.status = 3;
          item.setBackground(item.selectId, 3);
          children[item.sequence].status = 3;
          children[item.sequence].loadTexture(this.data.btns.right.image);
        } else {
          this.answerQuestion(i, false);
          this.wrongCount++;
          item.status = 4;
          item.selectId = undefined;
          item.setBackground();
          children[item.sequence].status = 1;
          children[item.sequence].loadTexture(this.data.btns.wrong.image);
          //submit后切换到第一个错题
          if (isFirst) {
            item.setDomVisible(true);
            isFirst = false;
            sequence = item.sequence;
          }
        }
      }
    }
    //submit后切换到第一个错题
    if (!isFirst && this.pageIndex !== sequence)
      this.pages[this.pageIndex].setDomVisible(false);
    //submit后显示正误状态，不标记当前是第几题
    children[this.pageIndex].children[0].fill = this.data.color.white;
    if (this.wrongCount === 0) {
      this.playSoundPromise(this.data.rightSound.sound).then(() => {
        this.btnFinish.visible = true;
      });
    } else {
      this.playSoundPromise(this.data.wrongSound.sound);
    }
  }

  checkQuestionStatus() {
    let selectNumber = 0;
    this.pages.forEach(item => {
      //已选择+已正确
      if (item.status === 2 || item.status === 3) {
        selectNumber++;
      }
    });
    this.selectNumber = selectNumber;
  }

  changeBar() {
    let children = this.btnGroup.children;
    children.forEach(item => {
      let text = item.children[0];
      let dom = this.pages[item.sequence];
      let barImage = this.data.btns.default.image;
      if (item.sequence === this.pageIndex) {
        dom.setDomVisible(true);
        text.fill = this.data.color.black;
        item.loadTexture(this.data.btns.current.image);
      } else {
        dom.setDomVisible(false);
        if (dom.status === 1) {
          barImage = this.data.btns.default.image;
          text.fill = this.data.color.black;
        } else if (dom.status === 2) {
          barImage = this.data.btns.finished.image;
          text.fill = this.data.color.white;
        } else if (dom.status === 3) {
          barImage = this.data.btns.right.image;
          text.fill = this.data.color.white;
        } else {
          barImage = this.data.btns.wrong.image;
          text.fill = this.data.color.white;
        }
        item.loadTexture(barImage);
      }
    });
  }
}

export {
  Hwtpl616
};