import _ from 'lodash';
import { CommonRegex } from './../util/CommonRegex.js';
let TextParser = (function() {
  class TextParser {
    /**
     * @method TextParser.ParseSymbol
     * 将带符号的字符串转换成字符串数组，并在数组的最后一项加上空格
     * 如："It's   返回['"','It\'s ']
     * 如 Im" 返回['Im','" ']
     * @param {String} text 
     * return Object
     * {
     * wordWithOutPunctuation:除掉符号的单词
     * wordArr:分割后的字符串数组
     * };
     */
    static ParseSymbol(text) {
      if (/—/.test(text)) {
        let strArr = text.split('—');
        let newArr = [];
        let arr;
        strArr.forEach((v, i) => {
          arr = i !== strArr.length - 1 ? [v, '—'] : [v + ' '];
          newArr = newArr.concat(arr);
        });
        return {
          'wordWithOutPunctuation': _.trim(text),
          'wordArr': newArr
        };
      }
      if (CommonRegex.textFilterTime.test(text)) {
        return {
          'wordWithOutPunctuation': _.trim(text),
          'wordArr': [text + ' ']
        };
      }
      if (_.trim(text).length === 1) {
        return {
          'wordWithOutPunctuation': _.trim(text),
          'wordArr': [text + ' ']
        };
      }
      let regWord = /([\w-]+'?[\w]{0,})/;
      let wordWithOutPunctuation = regWord.exec(text)[0];
      let punctuation = CommonRegex.textFilter.exec(text)[0];
      let index = text.indexOf(wordWithOutPunctuation);

      let wordArr = [];
      for (let i = 0; i < punctuation.length; i++) {
        wordArr.push(punctuation[i]);
      }
      if (index !== 0) {
        wordArr.push(wordWithOutPunctuation);
      } else {
        wordArr.splice(0, 0, wordWithOutPunctuation);
      }
      if (index !== 0 && text.length > (wordWithOutPunctuation.length + index)) {
        text = text.replace(punctuation, '');
        punctuation = CommonRegex.textFilter.exec(text)[0];
        for (let i = 0; i < punctuation.length; i++) {
          wordArr.push(punctuation[i]);
        }
      }
      wordArr[wordArr.length - 1] = wordArr[wordArr.length - 1] + ' ';
      return {
        'wordWithOutPunctuation': _.trim(wordWithOutPunctuation),
        'wordArr': wordArr
      };
    }

    /**
     * @method TextParser.ParseWordBySingle
     * 根据需要解析带单引号的单词
     * @param {String} word 
     * @param {bool} needSingle 
     * return Array
     */
    static ParseWordBySingle(word, needSingle) {
      let wordArr = [];
      if (needSingle && word.indexOf('\'') !== -1) {
        wordArr = word.split('\'');
        if (wordArr[wordArr.length - 1] === '') {
          wordArr.splice(wordArr.length - 1);
        }
        if (wordArr.length > 1) {
          wordArr.splice(1, 0, '\'');
        } else {
          wordArr.push('\'');
        }
      } else {
        wordArr.push(word);
      }
      return wordArr;
    }
  }
  return TextParser;
})();

export {
  TextParser
};