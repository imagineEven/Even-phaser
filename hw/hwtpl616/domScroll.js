import $ from 'jquery';
import _ from 'lodash';

const hide = {
  display: 'none'
};
const show = {
  display: 'block'
};
const base = {
  margin: '15px 0',
  padding: '14px',
  width: '218px', //226-15*2-8
  fontSize: '18px',
  backgroundColor: '#FFFFFF',
  border: '4px solid #FFFFFF',
  borderRadius: '8px',
  lineHeight: '28px'
};
const normal = {
  border: '4px solid #FFFFFF'
};
const select = {
  border: '4px solid #F9CD16'
};
const right = {
  border: '4px solid #6EC92B'
};

class DomScroll {
  constructor(game, data, style = {}, isQuestion = false) {
    this.game = game;
    this.data = data;
    this.style = style;
    this.isQuestion = isQuestion;
    this.container = $('#CoursewareDiv');
    this.status = 1;//1: 未做， 2：已选择， 3：正确， 4：错误
    this.isAnswer = false;
    this.domId = 'question_' + this.style.sequence;
    this.sequence = this.style.sequence;
    this.t1 = 0;
    this.t2 = 0;
    this.timer = null;
    this.createDom();
  }

  setDomVisible(visible) {
    if (visible)
      $(this.divbox).css(show);
    else
      $(this.divbox).css(hide);
  }

  createDom() {
    this.mt = - (this.style.lineHeight - this.style.fontSize) / 2;
    let domId = this.isQuestion ? this.domId : 'passage';
    this.divbox = $('<div id=' + domId + '></div>');
    $(this.divbox).css({
      'float': 'left',
      'padding-right': this.style.pr + 'px',
      'margin-left': this.style.ml + 'px',
      'margin-top': '67px',
      'width': this.style.width + 'px',
      'height': '452px',
      'overflow': 'hidden',
      'overflow-y': 'auto',
      'pointer-events': 'auto'
    });
    if (!this.isQuestion) {
      this.divbox.append(unescape(this.data.passage));
      this.container.append(this.divbox);
      $(this.divbox).css({
        'line-height': this.style.lineHeight + 'px'
      });
      $(this.divbox).find('p').css({
        'margin': 0,
        'padding': 0
      });
    } else {
      this.createQuestion();
    }

    document.getElementById(domId).onscroll = () => {
      this.setScrollStyle(domId, 0.2);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.isScrollEnd(domId);
      }, 300);
      this.t1 = document.getElementById(domId).scrollTop;
    };
  }

  isScrollEnd(domId) {
    this.t2 = document.getElementById(domId).scrollTop;
    if (this.t2 === this.t1) {
      this.setScrollStyle(domId, 0.1);
    }
  }

  createQuestion() {
    $(this.divbox).css(hide);
    let titleBox = $('<div></div>').css({
      marginBottom: '14px'
    });
    titleBox.append(unescape(this.data.question));
    this.divbox.append(titleBox);

    let options = this.data.options;
    //后台设置第一个为正确答案
    options[0].isAnswer = true;
    options = _.shuffle(options);
    options.forEach((item, index) => {
      let optionBox = $('<div class="option-box" data-domid=' + (index + 1) + ' data-isAnswer=' + item.isAnswer + '></div>').css(base);
      optionBox.append(unescape(item.text));
      optionBox.on('click', event => {
        if (this.game.canSelect)
          this.clickHandle(event);
      });
      this.divbox.append(optionBox);
    });
    this.container.append(this.divbox);
    $(this.divbox).find('p').css({
      'margin': 0,
      'padding': 0
    });
  }

  clickHandle(event) {
    let dataset = event.currentTarget.dataset;
    let isAnswer = event.currentTarget.dataset.isanswer;
    this.setBackground(dataset.domid);
    this.selectId = dataset.domid;
    this.status = 2;
    this.isAnswer = isAnswer === 'true' ? true : false;
    this.game.btnGroup.children[this.sequence].status = 2;
    this.game.checkQuestionStatus();
    if (this.game.selectNumber === this.game.data.pages.length) {
      this.game.btnSubmit.visible = true;
    } else {
      this.game.btnNext.visible = true;
    }
  }

  cancelBind() {
    let dom = $('#' + this.domId).find('.option-box');
    for (let i = 0; i < dom.length; i++) {
      $(dom[i]).off('click');
    }
  }

  setBackground(domid = undefined, status = 2) {
    let style = status === 2 ? select : right;
    let dom = $('#' + this.domId).find('.option-box');
    for (let i = 0; i < dom.length; i++) {
      let domId = dom[i].dataset.domid;
      if (domId === domid) {
        $(dom[i]).css(style);
      } else {
        $(dom[i]).css(normal);
      }
    }
  }

  setScrollStyle(domId, alpha) {
    let head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');
    style.type = 'text/css';
    head.appendChild(style);
    let allSheet = document.styleSheets;

    allSheet[allSheet.length - 1].insertRule('::-webkit-scrollbar { width: 6px; height: 16px; background-color: #F4EBE5); }', 1);
    allSheet[allSheet.length - 1].insertRule('::-webkit-scrollbar-track { margin: 20px 0; width: 6px; border-radius: 4px; background-color: rgba(224,224,224, 0); }', 2);
    allSheet[allSheet.length - 1].insertRule('::-webkit-scrollbar-thumb { width: 6px; border-radius: 4px; background-color: rgba(0,0,0, 0.1); }', 3);

    let len = allSheet[allSheet.length - 1].cssRules.length;
    if (domId) {
      allSheet[allSheet.length - 1].insertRule('#' + domId + '::-webkit-scrollbar-thumb { width: 6px; border-radius: 4px; background-color: rgba(0,0,0, ' + alpha + '); }', len);
      if (len > 5) {
        allSheet[allSheet.length - 1].deleteRule(5);
      }
    }
  }
}

export {
  DomScroll
};