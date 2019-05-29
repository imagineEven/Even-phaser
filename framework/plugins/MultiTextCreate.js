import {
  TextParser
} from './TextParser';
import {
  CommonRegex
} from './../util/CommonRegex.js';
class MultiTextCreate {
  /**
     * 创建文本，并且每个单词都是一个字符串。
     * //needSingle 如果单引号是一个单独的对象则为true
     * 使用方法，第一次：创建一个 MultiTextCreate的示例,文本就会创建并显示在页面中
     * var text='Where I am?'
     * let text=new MultiTextCreate(game,group,{x:0,y:0},style,needSingle,inputDownCallback,inputUpCallback);
     * text.wordTextArr 就是所有单词对象的数组
     * text.reCreate()  重新创建文本对象
     */
  constructor(game, group, text, position, style, needSingle, inputDownCallback, inputUpCallback) {
    this.game = game;
    this.text = text;
    this.x = position.x;
    this.y = position.y;
    this.group = group;
    this.style = style || {};
    this.needSingle = needSingle;
    this.create();
    this.inputDownCallback = inputDownCallback;
    this.inputUpCallback = inputUpCallback;
    this.bindClickEvent();
  }

  create() {
    this.wordTextArr = [];
    this.sentenceArr = [];
    this.sentence = [];
    let arr = this.text.split('\n');
    let wordHeight = 0;

    for (let i = 0; i < arr.length; i++) {
      let wordArr = arr[i].split(' ');
      let wordPositionX = this.x;
      let wordPositionY = this.y + wordHeight * i;
      for (let j = 0; j < wordArr.length; j++) {
        let word = wordArr[j];
        let isWeight = this.checkIsFontWeight(word);
        if (isWeight) {
          word = word.replace(/\*/g, '');
        }
        if (!CommonRegex.textFilter.test(word)) {
          let resultArr = this.createWord(word, wordPositionX, wordPositionY, isWeight, true);
          wordHeight = wordHeight || resultArr[1];
          wordPositionX = resultArr[0];
        } else {
          let resultArr = this.createWordContainSymbol(word, wordPositionX, wordPositionY, isWeight);
          wordHeight = wordHeight || resultArr[1];
          wordPositionX = resultArr[0];
        }
      }
    }
  }

  add(word) {
    if (this.group) {
      this.group.add(word);
    }
  }

  createWord(word, x, y, isWeight, needSpace) {
    let lineHeight = 0;
    let wordArr = TextParser.ParseWordBySingle(word, this.needSingle);

    if (needSpace)
      wordArr[wordArr.length - 1] += ' ';

    wordArr.forEach((w) => {
      if (w === ': ') {
        x = x + 3.5;
      }
      let wordSprite = this.game.add.text(x, y, w, this.style);
      x += wordSprite.width;
      this.add(wordSprite);
      this.wordTextArr.push(wordSprite);
      wordSprite.index = this.sentenceArr.length;
      if (CommonRegex.sentenceFilter.test(word)) {
        this.sentence.push(wordSprite);
        this.sentenceArr.push(this.sentence);
        this.sentence = [];
      } else {
        this.sentence.push(wordSprite);
      }
      if (isWeight) {
        wordSprite.fontWeight = 'bold';
      }
      if (!this.style.lineHeight) {
        lineHeight = wordSprite.height > lineHeight ? wordSprite.height : lineHeight;
      } else {
        lineHeight = this.style.lineHeight;
      }
    });

    return [x, lineHeight];
  }

  createWordContainSymbol(word, x, y, isWeight) {
    let parserWord = TextParser.ParseSymbol(word);
    let wordArr = parserWord.wordArr;
    let height = 0;

    wordArr.forEach(e => {
      let weight = e === parserWord.wordWithOutPunctuation ? isWeight : false;
      let result = this.createWord(e, x, y, weight, false);
      x = result[0];
      height = height > result[1] ? height : result[1];
    });

    return [x, height];
  }

  bindClickEvent() {
    if ((typeof this.inputDownCallback !== 'function' || this.inputDownCallback === undefined) && (typeof this.inputUpCallback !== 'function' || this.inputDownCallback === undefined))
      return;
    this.wordTextArr.forEach((e, i) => {
      e.inputEnabled = true;
      e.index = i;
      if (typeof this.inputDownCallback === 'function') {
        e.events.onInputDown.add(this.inputDownCallback, this.game);
      }
      if (typeof this.inputUpCallback === 'function') {
        e.events.onInputUp.add(this.inputUpCallback, this.game);
      }
    });
  }

  reCreate(text, x, y, style, needSingle) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.style = style ? style : this.style;
    this.needSingle = needSingle;
    this.create();
    this.bindClickEvent();
  }

  checkIsFontWeight(word) {
    return word.includes('*');
  }
}

export {
  MultiTextCreate
};