import $ from 'jquery';
import _ from 'lodash';
import {
  DomHwScroll
} from './domHwScroll';

const boxStyle = {
  margin: '0 auto',
  position: 'absolute',
  width: '75%',
  height: '38%',
  transform: 'translateX(-50%)',
  left: '50%',
  boxSizing: 'border-box',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%'
};
//输入框wrap样式
const singleInputWrapStyle = {
  display: 'inline-block',
  verticalAlign: 'text-top',

};
//单个输入框的样式
const singleInputStyle = {
  borderBottom: '1px solid #000',
  minWidth: '10px',
  cursor: 'text',
  height: '100%',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap'
};

const cursorStyle = {
  display: 'inline-block',
  width: '1px',
  verticalAlign: 'top',
  height: '100%',
  backgroundColor: 'blue',
  marginLeft: 2,
  animation: 'blink 1s infinite  steps(1,start)'
};
const tipsStyle = {
  color:'#ffa800',
  fontFamily:'Century Gothic',
  fontSize:28,
  display:'inline-block'
};

const errStyle = {
  color:'rgba(0,0,0,0.3)'
};
const normalStyle = {
  color:'rgba(0,0,0,1)'
};
const correctStyle = {
  color :'rgb(104 177 224)'
};
class DomTextWithInput {
  constructor(game, text, answer = [], style, callbacks, type = 2) {
    this.text = text;
    this.game = game;
    this.type = type;
    this.focus = callbacks.focus;
    this.answerRight = callbacks.answerRight;
    this.answerWrong = callbacks.answerWrong;
    this.fillDone = callbacks.fillDone;
    this.style = Object.assign(boxStyle, style);
    this.errorCount = 0;
    this.answer = answer;
    this.$fontSize = parseInt(style.fontSize) || 12;
    this.box = (new DomHwScroll('scrollContainer', this.style)).box;
    this.ruler = $('<span id="ruler" style="display:none"></span>').appendTo(this.box);
    this.currentInputIndex = 0;
    this.inputPoints = [];//记录填充点
    this.createTextWithInput();
    this.createStyleSheet();
  }

  createStyleSheet(){
    let head = document.head || document.getElementsByTagName('head')[0];
    if(!document.styleSheets.length){
      let style = document.createElement('style');
      style.type = 'text/css';
      head.appendChild(style);
    }
    let allSheet = document.styleSheets;
    //插入样式表 光标闪缩样式
    allSheet[allSheet.length-1].insertRule(`@keyframes blink {
      0%,100% {opacity:0;}
      50% {opacity:1;}
    }`, 0);
    //错误提示统一样式
    allSheet[allSheet.length-1].insertRule(`.tips {
      display:inline-block
    }`, 0);
  }

  createTextWithInput() {
    let index = 0;
    let paragraphArr = decodeURIComponent(this.text).split(/\n+/);
    paragraphArr.forEach((paragraph) => {
      let formatText = paragraph.replace(/_/g, () => {
        if(this.answer[index]){
          let inputText = this.createInput(decodeURIComponent(this.answer[index]), this.type);
          index++;
          return inputText;
        }else{
          return '_';
        }
      });
      let p = $('<div></div>').html(formatText).css({
        'marginTop':30
      });
      this.box.append(p);
    });
    this.allInputs = this.box.find('.input');
    this.allInputs.each((i, input)=>{
      $(input).data('index', i);
      this.inputPoints.push(false);
    });
  }

  /**
   * 
   * @param {string} text 答案文本
   * @param {number} type 题目类型
   */
  createInput(text, type) {
    let temp = $('<div style="display:inline-block"></div>');
    let singleLetterWidth = this.ruler.text('W').width();
    let trimText = $.trim(text), singleSentenceWidth = this.ruler.text(trimText).width();
    let inputWrap = $('<div class="inputWrap"></div>').css(singleInputWrapStyle).css({
      minWidth: singleSentenceWidth*1.5,
      lineHeight:this.$fontSize+'px' 
    });
    let input = $('<div class=\'input\'></div').css(singleInputStyle).css({
      height: this.$fontSize,
      lineHeight: this.$fontSize + 'px',
    }).attr({
      'data-answer':trimText
    });
    let inputTips = $(`<span class="tips">${trimText}</span>`).css(tipsStyle).hide();
    switch (type) {
      case 1:
        _.split($.trim(text), '').forEach((letter) => {
          let inputWrap = $('<div class="inputWrap"></div>').css(singleInputWrapStyle);
          if(/\s/.test(letter)){
            inputWrap.append('<div>&nbsp;</div>');
          }else{
            let inputTips = $(`<span>${letter}</span>`).css(tipsStyle).hide();
            let input = $('<div class=\'input\'></div').css(singleInputStyle);
            inputWrap.css({
              'marginLeft': 2,
              'lineHeight': this.$fontSize + 'px',
              'width': singleLetterWidth,
              'textAlign':'center'
            });
            input.attr({
              'maxLength': 1,
              'data-answer': letter,
            }).css({
              'height': this.$fontSize,
              'textAlign':'center'
            });
            inputWrap.append(input);
            inputWrap.append(inputTips);
          }
          temp.append(inputWrap);
        });
        break;
      case 2:
        text.split(/\s+/g).forEach((word) => {
          let SGWidth = this.ruler.text(word).width();
          let inputWrap = $('<div class="inputWrap"></div>').css(singleInputWrapStyle);
          let inputTips = $(`<span class="tips" style="margin-left:4px">${word}</span>`).css(tipsStyle).hide();
          let input = $('<div class=\'input\'></div').css(singleInputStyle);
          inputWrap.css({
            'marginLeft': 2,
            'lineHeight': this.$fontSize + 'px',
            'minWidth': SGWidth*1.5
          });
          input.attr({
            'data-answer': word
          }).css({
            'height': this.$fontSize,
            'marginLeft': 4
          });
          inputWrap.append(input);
          inputWrap.append(inputTips);
          temp.append(inputWrap);
        });
        break;
      default:
        inputWrap.append(input);
        inputWrap.append(inputTips);
        temp.append(inputWrap);
    }
    return temp.prop('outerHTML');
  }

  addEvents() {
    if(this.finished) return;
    this.allInputs.click((e) => {
      let target = $(e.target);
      let input = $(e.currentTarget);
      //判断改词组下字母是否都为空
      let inputContainer = input.parent().parent(), inputs = inputContainer.find('.input');
      let isEmpty = !inputs.text();
      if(isEmpty){
        input = inputs.eq(0);
      }
      if(input.data('done')){
        return;
      }
      this.currentInputIndex = +input.data('index');
      if (!this.cursor) {
        this.cursor = $('<span class="cursor"></span>').css(cursorStyle);
        this.focus(this);
      }
      if (target.hasClass('letter')) {
        this.cursor.insertAfter(target);
      } else {
        input.append(this.cursor);
      }
    });
  }

  //光标移动到下一个词组
  moveCursor(step) {
    if (!this.cursor) return;
    if (step > 0) {
      let nextNode = this.cursor.next();
      if (nextNode.length) {
        this.cursor.insertAfter(nextNode);
      } else {
        //跳到下一个词组
        this.currentInputIndex++;
        if (this.currentInputIndex > this.allInputs.length - 1) {
          this.currentInputIndex = this.allInputs.length - 1;
          return;
        }
        this.allInputs.eq(this.currentInputIndex).prepend(this.cursor);
      }
    } else {
      let prevNode = this.cursor.prev();
      if (prevNode.length) {
        this.cursor.insertBefore(prevNode);
      } else {
        this.currentInputIndex--;
        if (this.currentInputIndex < 0) {
          this.currentInputIndex = 0;
          return;
        }
        this.allInputs.eq(this.currentInputIndex).append(this.cursor);
      }
    }
  }

  space(){
    let wrap = this.cursor.parent(),
      maxLen = wrap.attr('maxLength');
    wrap.css(normalStyle);
    if (wrap.children('.letter').length >= +maxLen) {
      return;
    }
    $('<span class="letter">&nbsp;</span>').insertBefore(this.cursor);
    this.fillDone(this.inputPoints.indexOf(false)<0);
  }

  enter(){
    this.currentInputIndex++;
    if(this.currentInputIndex>this.allInputs.length-1){
      this.currentInputIndex = this.allInputs.length-1;
      return;
    }
    this.allInputs.eq(this.currentInputIndex).append(this.cursor);
  }

  backSpace() {
    if (!this.cursor) return;
    let prev = this.cursor.prev();
    if (prev.length) {
      prev.remove();
      if(!this.cursor.prev().length){
        this.inputPoints[this.currentInputIndex] = false;
      }
      //恢复颜色
      this.cursor.parent().css(normalStyle);     
    } else {
      //判断是否到达删除整个单词 
      if(this.allInputs.eq(this.currentInputIndex).parent().index()===0) return;
      this.currentInputIndex--;
      if (this.currentInputIndex < 0) {
        this.currentInputIndex=0;
        return;
      } 
      this.allInputs.eq(this.currentInputIndex).append(this.cursor);
    }
    this.fillDone(this.inputPoints.indexOf(false)<0);
  }

  //输入字符
  inputText(str) {
    if (!this.cursor) return;
    let wrap = this.cursor.parent(),
      maxLen = wrap.attr('maxLength');
    wrap.css(normalStyle);
    if (wrap.children('.letter').length >= +maxLen) {
      return;
    }
    $(`<span class="letter">${str}</span>`).insertBefore(this.cursor);
    this.inputPoints[wrap.data('index')] = true;
    if (wrap.children('.letter').length === +maxLen && this.type === 1) {
      this.moveCursor(1);
    }
    //判断是否都已填完
    this.fillDone(this.inputPoints.indexOf(false)<0);
  }

  //验证答案
  authencationAnswer(){
    let errInputArr = [];
    let inputContainer;
    this.allInputs.each((index, input)=>{
      let $input = $(input), text = $.trim($input.text()).replace(/\s+/g, ' ');//空格处理
      if(text!==$input.data('answer')){
        $input.css(errStyle);
        let nowInputContainer = $input.parent().parent();
        if(!nowInputContainer.is(inputContainer)){
          errInputArr.push(nowInputContainer);
        }
        inputContainer = nowInputContainer;
      }else{
        $input.css(correctStyle).data('done', true);
      }
    });
    if(!errInputArr.length){
      this.answerRight(this);
      this.finished = true;
      this.allInputs.each((i, input)=>{
        $(input).css(normalStyle).next().hide();
      });
    }else{
      this.answerWrong();
      if(!this.errorCount){//第一次答错
        
      }else if(this.errorCount===1){//第二次答错
        let pro = Promise.resolve();
        for(let i =0;i<errInputArr.length;i++){
          pro = pro.then(()=>{
            let errInputContainer = errInputArr[i], inputs = errInputContainer.find('.input');
            inputs.next().show();
            let errInputTop = inputs.eq(0).next().position().top;
            let boxScrollTop = this.box.scrollTop();
            let boxHeight = this.box.height();
            //判断是否超出答题视野
            if(errInputTop<boxScrollTop||errInputTop>boxScrollTop+boxHeight){
              this.box.animate({
                scrollTop:errInputTop-boxHeight/2
              }, 500, 'linear');
            }
            return this.game.util.waitByPromise(2000).then(()=>{
              inputs.next().hide();
            });
          });
        }
      }else{
        errInputArr.forEach((inputContaine)=>{
          inputContaine.find('.input').next().show();
        });
      }
      this.errorCount ++;
    }
  }

  setStyle(style){
    this.box.css(style);
  }

  removeCursor(){
    this.cursor.remove();
    this.cursor = null;
  }

  destory(){
    this.box.remove();
  }

  removeEvents(){
    this.allInputs.off();
  }

  setEnable(b){
    if(b){
      this.addEvents();
    }else{
      this.removeEvents();
    }
  }
}

export {
  DomTextWithInput
};