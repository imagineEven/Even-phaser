import {
  Courseware
} from '../../framework/core/Courseware';
import ExitUtil from '../../framework/plugins/exitUtil';
import {
  CONSTANT
} from '../../framework/core/Constant';
require('../../framework/phaserplugins/PhaserRichTextNew');
require('../../framework/phaserplugins/contentWithScrollBar');
require('./AutoSprite');
import staticRes from './resource.json';
import _ from 'lodash';

const isBlankReg = new RegExp('\\s+\\d+\\s');

const optionBgColor = ['rgba(237, 223, 164, 0)', 'rgba(237, 223, 164, 0.8)'];

class Hwtpl615 extends Courseware {
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
    });
    this.data = Object.assign(data, staticRes);
    this.pageIndex = 0;
    this.optionsArr = new Map();
    this.origOptions = [];
  }

  createUI() {
    this.createSprite(0, 0, 'bg');
    this.page = this.createSprite(78, 60, 'coilPage');
    this.createSprite(28, 44, 'coil');
    //播放指令音频
    this.createQuestionWithOptions(this.page);
    let pro = Promise.resolve();
    if (this.data.firstAudio) {
      pro = this.playSoundPromiseByObject(this.data.firstAudio);
    }
    pro.then(() => {
      //允许拖动
      for (let value of this.optionsArr.values()) {
        value.children[1].input.enableDrag();
      }
    });
    this.submitBtn = this.createSprite(556, 436, 'submitBtn');
    this.submitBtn.visible = false;
    this.submitBtn.anchor.x = 0.5;
    this.submitBtn.events.onInputDown.add(() => {
      this.submitBtn.inputEnabled = false;
      this.submitBtn.loadTexture('submitBtnH');
      this.submitAnswer();
    });

    this.finishBtn = this.createSprite(556, 436, 'finishBtn');
    this.finishBtn.visible = false;
    this.finishBtn.anchor.x = 0.5;
    this.finishBtn.events.onInputDown.add(() => {
      this.finishBtn.visible = false;
      this.pageIndex++;
      if (this.pageIndex >= this.data.pages.length) {
        ExitUtil.gameOver(this);
        return;
      }
      this.createQuestionWithOptions(this.page);
    });
    this.page.addChild(this.submitBtn);
    this.page.addChild(this.finishBtn);
    this.createHwToolbar();
  }

  createQuestionWithOptions(page) {
    this.util.batchDestroy(this.question, ...this.optionsArr.values(), this.tmpText);
    this.createArticlePannel(page);
    this.createOptionsPanel(page);
  }

  createArticlePannel(page) {
    let origText = unescape(this.data.pages[this.pageIndex].text);
    let idx = 0;
    this.richText = origText.replace(/_+/g, () => {
      idx++;
      return this.createBlank(idx);
    });

    this.article = this.add.richtextNew(0, 0, this.richText, {
      font: CONSTANT.DEFAULT_FONT,
      fontSize: '18px',
      fill: '#333333',
      maxwidth: 360,
      align: 'left',
      lineSpacing: 10
    });

    let scrollBg = this.add.graphics(0, 0);
    scrollBg.beginFill(0xffffff, 0);
    scrollBg.drawRect(0, 0, 4, 440);

    let scrollThumb = this.add.autoSprite(0, 0, undefined, {
      bgColor: 'rgba(0,0,0,1)',
      radius: 3,
      width: 6,
      height: 60
    });
    //插入分割线
    let splitLine = this.add.graphics(0, 0);
    splitLine.beginFill(0xE0CEA9);
    splitLine.drawRect(419, 33, 1, 440);

    page.addChild(splitLine);
    let question = this.add.contentWithScroll(210, 254, this.article, {
      width: page.width,
      height: 442,
      backgroundColor: 0xffffff,
      backgroundAlpha: 0
    }, undefined, {
      yTrack: scrollBg.generateTexture(),
      yThumb: scrollThumb,
      yPadding: 4,
      yPosition: {
        x: 376,
        y: 0
      },
      yVisible: true
    });

    question.$anchor.set(this.article.width / (2 * page.width), 0.5);
    question.enableScroll();
    page.addChild(question);
    this.question = question;
  }

  //创建选项区域
  createOptionsPanel(page) {
    this.optionsArr = new Map(); //存放打乱后的选项组
    //删除重复
    this.origOptions = _.uniqBy(this.data.pages[this.pageIndex].options, (a) => {
      return a.text;
    }).map((item, index) => {
      item.index = index;
      return item;
    });
    if (this.origOptions.length > 10)
      this.origOptions.length = 10;
    let len = this.origOptions.length;
    let shuffleOptions = _.shuffle(this.origOptions);
    for (let i = 0; i < len; i++) {
      let singleGroup = this.add.group();
      //构建选项背景
      let option = this.createSprite(556, 48 + i * 40, 'optionBgH');
      option.index = shuffleOptions[i].index;
      option.ox = 556;
      option.oy = 48 + i * 40;
      option.anchor.set(0.5);
      //构建选项文本
      let text = this.add.text(0, 0, shuffleOptions[i].text, {
        font: CONSTANT.DEFAULT_FONT_18,
        fill: '#333333',
        lineSpacing: 0
      });
      let textBg = this.add.autoSprite(556, 48 + i * 40, text, {
        bgColor: optionBgColor[0],
        radius: 3,
        paddingLeft: 20,
        height: 30
      });
      text.anchor.set(textBg.width / (2 * text.width), 0.4);
      textBg.index = shuffleOptions[i].index;
      textBg.ox = 556;
      textBg.oy = 48 + i * 40;
      textBg.anchor.set(0.5);
      option.text = text;
      singleGroup.add(option);
      singleGroup.add(textBg);
      page.addChild(singleGroup);
      textBg.inputEnabled = true;
      //拖拽放下后的判断
      textBg.handleDragAfter = () => {
        this.optionJudgeFill(textBg);
      };
      textBg.events.onInputDown.add(() => {
        let lastChildren = page.getChildAt(page.children.length - 1);
        page.swapChildren(singleGroup, lastChildren);
        option.loadTexture('optionBg');
        textBg.setBgColor(optionBgColor[1]);
        this.question.enableScroll(false);
      });
      textBg.events.onInputUp.add(() => {
        this.question.enableScroll(true);
        textBg.handleDragAfter();
      });
      this.optionsArr.set(escape(text.text), singleGroup);
    }
  }

  createBlank(index) {
    return `<span style="text-decoration:underline" data-index=${index}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${index}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
  }

  wrapperAnswer(index, text) {
    text = text.replace(/\s+/g, '&nbsp;');
    return `<span style="text-decoration:underline;" data-index=${index}>${text}</span>`;
  }

  //过滤出填充的下滑线文本
  get canFillText() {
    return this.article.allText.filter(text => {
      return text.data && text.data.index + 1;
    });
  }

  //判断选项是否填充或替换 
  optionJudgeFill(option) {
    let key = this.generateKey(option.text.text);
    let optionBg = this.optionsArr.get(key).children[0];
    let matchs = this.canFillText.some(blank => {
      let idx = blank.data.index;
      if (this.checkOverlap(blank, option)) { //重合
        if (isBlankReg.test(blank.text)) { //填充
          this.richText = this.richText.replace(this.createBlank(idx), this.wrapperAnswer(idx, option.text.text));
        } else { //替换
          this.richText = this.richText.replace(this.wrapperAnswer(idx, blank.text), this.wrapperAnswer(idx, option.text.text));
          this.replacedOptionGoBack(blank);
        }
        option.alpha = optionBg.alpha = 0;
        option.setBgColor(optionBgColor[0]);
        option.inputEnabled = false;
        this.resetTextData(this.richText);
        return true;
      } else {
        return false;
      }
    });
    if (!matchs) {
      this.optionGoBack(option);
    }
  }

  //重新设置富文本中的事件与内容
  resetTextData(text) {
    this.richText = text;
    this.article.setHtml(this.richText);
    this.canFillText.forEach((text, index, blanks) => {
      this.wrapTextEvents(text, index, blanks);
    });
    this.question.resetScrollBar();
    //判断是否填满
    if (this.checkIsAllFill()) {
      this.submitBtn.visible = true;
      this.submitBtn.inputEnabled = true;
      this.submitBtn.loadTexture('submitBtn');
    } else {
      this.submitBtn.visible = false;
    }
  }

  wrapTextEvents(text, index, blanks) {
    if (!isBlankReg.test(text.text)) {
      text.ox = text.x;
      text.oy = text.y;
      text.inputEnabled = true;
      let key, dragingOption;
      text.events.onInputDown.add((t) => {
        key = this.generateKey(t.text);
        dragingOption = this.optionsArr.get(key).children[1];
        t.input.enableDrag();
        this.question.enableScroll(false);
      });
      text.events.onDragStart.add(() => {
        let lastChildren = this.page.getChildAt(this.page.children.length - 1);
        this.page.swapChildren(this.question, lastChildren);
      });
      text.events.onDragUpdate.add((t, pointer, x, y) => {
        dragingOption.x = x + this.article.x + this.question.x + t.width / 2;
        dragingOption.y = y + this.article.y + this.question.y + t.height / 2;
      });
      text.events.onDragStop.add(txt => {
        let idx = +text.data.index;
        this.question.enableScroll();
        if (txt.x > 340) {
          this.richText = this.richText.replace(this.wrapperAnswer(idx, txt.text), this.createBlank(idx));
          this.replacedOptionGoBack(text);
          this.resetTextData(this.richText);
          return;
        }
        let matchs = blanks.filter(blank => {
          return blank.text !== txt.text;
        }).some(b => {
          if (this.checkOverlap(b, txt)) {
            let textIdx = +txt.data.index;
            let blankIdx = +b.data.index;
            if (isBlankReg.test(b.text)) {
              this.richText = this.richText
                .replace(this.wrapperAnswer(textIdx, txt.text), this.createBlank(textIdx))
                .replace(this.createBlank(blankIdx), this.wrapperAnswer(blankIdx, txt.text));
            } else {
              this.richText = this.richText
                .replace(this.wrapperAnswer(textIdx, txt.text), this.createBlank(textIdx))
                .replace(this.wrapperAnswer(blankIdx, b.text), this.wrapperAnswer(blankIdx, txt.text));
              this.replacedOptionGoBack(b);
            }
            this.resetTextData(this.richText);
            return true;
          } else {
            return false;
          }
        });
        if (!matchs) {
          this.add.tween(text).to({
            x: text.ox,
            y: text.oy
          }, 200, 'Linear', true);
        }
      });
    }
  }

  //判断是否全部填满
  checkIsAllFill() {
    return !this.canFillText.filter(text => {
      return isBlankReg.test(text.text);
    }).length;
  }

  optionGoBack(textOption) {
    let key = this.generateKey(textOption.text.text);
    let option = this.optionsArr.get(key).children[0];
    this.add.tween(textOption).to({
      x: textOption.ox,
      y: textOption.oy
    }, 200, 'Linear', true).onComplete.add(() => {
      option.loadTexture('optionBgH');
      textOption.setBgColor(optionBgColor[0]);
      textOption.inputEnabled = true;
    });
  }

  generateKey(text) {
    return escape(text.replace(/\s/g, ' '));
  }

  replacedOptionGoBack(text) {
    let key = this.generateKey(text.text);
    let option = this.optionsArr.get(key).children[0],
      textOption = this.optionsArr.get(key).children[1];
    textOption.alpha = 1;
    this.add.tween(textOption).to({
      x: textOption.ox,
      y: textOption.oy
    }, 200, 'Linear', true).onComplete.add(() => {
      option.loadTexture('optionBgH');
      option.alpha = 1;
      textOption.inputEnabled = true;
    });
  }

  submitAnswer() {
    let errorBlanks = {};
    //过滤错误选项
    this.canFillText.forEach((text, index) => {
      let t = text.text.replace(/\s/g, ' ');
      if (t !== this.origOptions[index].text) {
        errorBlanks[index] = text;
      }
    });
    this.submitBtn.visible = false;
    if (Object.keys(errorBlanks).length !== 0) {
      this.playSoundPromise('wrongSound');
      this.answerQuestion(this.pageIndex, false);
      for (let i in errorBlanks) {
        let text = errorBlanks[i];
        this.richText = this.richText.replace(this.wrapperAnswer(+i + 1, text.text), this.createBlank(+i + 1));
        this.replacedOptionGoBack(text);
      }
      this.article.setHtml(this.richText);
    } else {
      this.canFillText.forEach((text) => {
        text.inputEnabled = false;
      });
      for (let value of this.optionsArr.values()) {
        value.children[0].inputEnabled = false;
      }
      this.finishBtn.visible = true;

      this.playSoundPromise('correctSound').then(() => {
        this.finishBtn.inputEnabled = true;
      });
    }
  }
}

export {
  Hwtpl615
};