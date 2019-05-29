import {
  Options
} from './../core/Options';
import {
  Repeater
} from './../core/Timer';
import {
  NotFunctionError
} from './../error/NotFunctionError';
import _ from 'lodash';
import {
  CommonRegex
} from './CommonRegex.js';
import publicResources from './../../json/publicResources.json';
import {
  ObjectPropertyFlasher
} from './../../framework/plugins/ObjectPropertyFlasher';



const speaker = {
  bigSpeaker: 'e3d8e2b919206fa1eeda5f5e933a966b',
  smallSpeaker: '0da32a6d7738e5e98dd2206e9c344547',
  otherSpeaker: '4ba5301ff3fee83a6319e7ecbb11bf35',
  optionSpeaker: 'c30ed0889285694b9e3a92c21e67a4e3',
  greenSpeaker: '136fdeafe022a20bf1fb06fe577caeac',
  circleSpeaker: 'df5e6d8078ab049a5976d49eec12c240',
  yellowSpeaker: '475d131494bb40a17a3f65dcf3a52165'
};

class Util {
  constructor(game) {
    this.game = game;
  }

  loadResourcesByDefaultUrl(obj, functionName = 'image') {
    if (obj instanceof Array === true) {
      for (let i of obj) {
        this.game.load[functionName](i, this.fullUrl(i, functionName));
      }
      return;
    }
    for (let i in obj) {
      this.game.load[functionName](i, this.fullUrl(obj[i], functionName));
    }
  }

  loadPublicResources() {
    this.game.load.baseUrl = Options.baseUrl + Options.pathImage;
    this.loadResourcesByDefaultUrl(publicResources.images || {}, 'image');
    this.loadResourcesByDefaultUrl(publicResources.audios || {}, 'audio');
  }

  wait(time, func, loop) {
    let timer = new Repeater(this.game, {
      duration: time,
      times: 1
    }, func, loop);
    timer.start();
    if (loop) {
      loop.add(timer.update, timer.updateId);
    }
  }

  waitByPromise(time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve();
      }, time);
    });
  }

  checkFileExt(name, type) {
    let checkList = ['.jpg', '.png', '.bmp', '.gif', '.jpeg'];
    let extName = '.png';
    if (type === 'audio') {
      checkList = ['.mp3', '.mp4', '.ogg', '.wav', '.webm'];
      extName = '.mp3';
    } else if (type === 'video') {
      checkList = ['.ts'];
      extName = '.ts';
    }
    let isChecked = false;
    for (let item of checkList) {
      if (_.endsWith(name, item)) {
        isChecked = true;
        break;
      }
    }
    if (isChecked) {
      return name;
    }
    return name + extName;
  }

  fullUrl(name, type) {
    let path = '';
    switch (type) {
      case 'audio':
        path = Options.pathAudio;
        break;
      case 'video':
        path = Options.pathVideo;
        break;
      default:
        path = Options.pathImage;
        break;
    }
    return Options.baseUrl + path + this.checkFileExt(name, type);
  }

  fullTxtUrl(name) {
    return Options.baseUrl + Options.pathTxt + name;
  }

  functionGuard(func) {
    if (typeof func !== 'function') {
      throw new NotFunctionError('This is not a function.');
    }
  }

  setObjectArrayClicked(objectArr, canClicked, skipIndex) {
    skipIndex = skipIndex === undefined ? -1 : skipIndex;
    objectArr.forEach((e, i) => {
      if (i !== skipIndex) {
        e.inputEnabled = canClicked;
      }
    });
  }

  CreatePageSizeOnBottom(group, pageCount, position, {
    fontSize = '15pt',
    fill = '#000',
    font = 'Century Gothic',
    fontWeight = 'bold'
  } = {}) {
    let style = {
      'fontSize': fontSize,
      'fill': fill,
      'font': font,
      'fontWeight': fontWeight
    };
    let hasPosition = true;
    if (position === undefined) {
      hasPosition = false;
    }
    let currentText = this.game.add.text(0, 0, '1', style);
    let pageCountText = this.game.add.text(0, 0, ' /' + pageCount, style);
    group.add(currentText);
    group.add(pageCountText);
    if (hasPosition) {
      currentText.x = position.x;
      currentText.y = position.y;
      pageCountText.y = position.y;
      pageCountText.x = position.x + currentText.width;
      return currentText;
    }
    let width = currentText.width + pageCountText.width;
    currentText.anchor.set(0.5);
    currentText.x = (this.game.width - width) / 2 + currentText.width / 2;
    currentText.y = this.game.height - currentText.height + 10;
    pageCountText.x = currentText.x + currentText.width / 2 + pageCountText.width / 2 - 4;
    pageCountText.anchor.set(0.5);
    pageCountText.y = this.game.height - currentText.height + 10;
    return currentText;
  }

  setObjectArrayClickedByChecker(objectArr, checkerFunc) {
    objectArr.forEach((obj) => {
      obj.inputEnabled = checkerFunc(obj);
    });
  }

  //将纯数字数组转成x,y坐标的对象数组
  numArrToXYArr(arr) {
    let res = [];
    for (let i = 0; i < arr.length; i += 2) {
      let x = arr[i];
      let y = arr[i + 1];
      res.push({
        x: x,
        y: y
      });
    }
    return res;
  }

  getVectorAngle(vec) {
    if (vec.y > 0) {
      let xb = this.getDistance(vec, {
        x: 0,
        y: 0
      });
      let angle = Math.asin(vec.x / xb);
      return -angle + Math.PI / 2;
    } else {
      let xb = this.getDistance(vec, {
        x: 0,
        y: 0
      });
      let angle = Math.asin(vec.x / xb);
      return angle - Math.PI / 2;
    }
  }

  getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (
      p1.y -
      p2.y));
  }

  safeInvoke(func, ...theArgs) {
    if (func && typeof func === 'function') {
      func(theArgs);
    }
  }

  objToKeyValueArr(obj) {
    let arr = [];
    for (let i in obj) {
      arr.push({
        key: i,
        value: obj[i]
      });
    }
    return arr;
  }

  /**
   * Method draws a polygon
   *
   * @method Util.drawPolygon
   * @param coordinateArr {Object[]}Position two dimensional color of the line to draw, will update the objects stored style
   * @param {Number}Position.x - The position x of the coordinate
   * @param {Number}Position.y - The position y of the coordinate
   * @param callbacks {map}  key is event,value is handler
   * @param style object which sets the style of the polygon 
   *        {
   *          lineColor {Number} hex value of the line color of the polygon
   *          lineAlpha {Number} alpha of the line to draw, will update the objects stored style
   *          lineWidth {Number} width of the line to draw, will update the objects stored style
   *          fillColor {Number} hex value of the fill color of the polygon
   *          fillAlpha {Number}  value of the fill alpha of the polygon
   *        }
   * @return {Graphics}
   */
  drawPolygon(
    coordinateArr,
    callbacks,
    style = {
      lineColor: 0X00000,
      lineAlpha: 1,
      lineWidth: 0,
      fillColor: 0x000000,
      fillAlpha: 1,
      position: {
        x: 0,
        y: 0
      }
    }
  ) {
    if (!coordinateArr || coordinateArr.length === 0) {
      throw new NotFunctionError('The coordinateArr is required');
    }
    let graphics = this.game.add.graphics();
    graphics.beginFill(style.fillColor, style.fillAlpha);
    graphics.lineStyle(style.lineWidth, style.lineColor, style.lineAlpha);
    let beginPoint = coordinateArr[0];
    graphics.moveTo(beginPoint.x, beginPoint.y);
    for (let i = 0; i < coordinateArr.length; i++) {
      let position = coordinateArr[i];
      graphics.lineTo(position.x, position.y);
    }
    graphics.lineTo(beginPoint.x, beginPoint.y);
    for (let evt in callbacks) {
      graphics.events[evt].add(callbacks[evt]);
    }
    return graphics;
  }

  /**
   * 依次高亮单词，其中标点符号将会过滤掉
   *
   * @method Util.highlightWordForEach
   * @param wordTextArr {Text[]}文本对象数组
   * @param wordTimeArr {Number[]} 时间数组
   * @param textColorArr {Arrary} 颜色数组，第一项为普通颜色，第二项为高亮颜色
   * @param callback 回调函数
   * @param isNotSign 标点符号高亮
   * return promise
   */
  highlightWordForEach(wordTextArr, wordTimeArr, textColorArr, callback = undefined, isNotSign = true) {
    let promise = Promise.resolve();
    let index = 0;
    wordTextArr.forEach((item) => {

      if (isNotSign) {
        if (CommonRegex.textFilter.test(_.trim(item.text))) {
          if (!CommonRegex.textFilterTime.test(_.trim(item.text))) {
            return;
          }
        }
      }
      let time = wordTimeArr[index];
      promise = promise.then(() => highlightWordPromise(item, time));
      index++;
    });
    let lightColor;
    let commonColor;
    let isArray = Array.isArray(textColorArr);

    if (isArray) {
      lightColor = textColorArr[1];
      commonColor = textColorArr[0];
    } else {
      lightColor = textColorArr;
    }

    let highlightWordPromise = (word, time) => {
      if (!isArray) {
        commonColor = word.fill;
      }
      word.fill = lightColor;
      return new Promise((resolve) => {
        setTimeout(() => {
          word.fill = commonColor;
          return resolve();
        }, time);
      });
    };

    if (callback) {
      promise = promise.then(callback);
    }
    return promise;
  }

  highlightSentenceForEach(sentenceArr, sentenceTimeArr, textColorArr, callback = undefined) {
    let promise = Promise.resolve();
    let index = 0;
    sentenceArr.forEach((item) => {
      let time = sentenceTimeArr[index];
      promise = promise.then(() => highlightWordPromise(item, time));
      index++;
    });
    let lightColor;
    let commonColor;
    let isArray = Array.isArray(textColorArr);

    if (isArray) {
      lightColor = textColorArr[1];
      commonColor = textColorArr[0];
    } else {
      lightColor = textColorArr;
    }

    let highlightWordPromise = (sentence, time) => {
      if (!isArray) {
        commonColor = sentence[0].fill;
      }
      sentence.forEach(word => {
        word.fill = lightColor;
      });
      return new Promise((resolve) => {
        setTimeout(() => {
          sentence.forEach(word => {
            word.fill = commonColor;
          });
          return resolve();
        }, time);
      });
    };

    if (callback) {
      promise = promise.then(callback);
    }
    return promise;
  }

  /**
   * 依次高亮字母
   *
   * @method Util.highlightCharForEach
   * @param wordText {Text}文本对象
   * @param wordConfigArr {Number[{ time,color,step,before,after,sound}]} 配置数组 
   * @param callback 回调函数
   * @param step 步长
   * return promise
   */
  highlightCharForEach(game, wordObj, wordConfigArr, defualtColor, defaultStep = 1, callback = undefined) {
    let nowCharIndex = 0;
    let hightChar = (nowindex = 0) => {
      let wordConfig = wordConfigArr[nowindex];
      let nowStep = wordConfig.step || defaultStep; //步伐
      let nowColor = wordConfig.color || defualtColor; //激活颜色
      let nextColor = wordConfig.scolor || wordObj.fill; //初始颜色
      let beforePro = Promise.resolve();
      if (wordConfig.before !== undefined) {
        beforePro = beforePro.then(() => {
          return wordConfig.before(wordObj, nowindex);
        });
      }
      return beforePro.then(() => {
        return this.waitByPromise(wordConfig.time).then(() => {
          wordObj.clearColors();
          if (nowCharIndex <= wordObj._text.length) {
            wordObj.addColor(nowColor, nowCharIndex);
            wordObj.addColor(nextColor, nowCharIndex + nowStep);
            nowCharIndex += nowStep;
            let afterPro = Promise.resolve();
            if (wordConfig.sound !== undefined) {
              afterPro.then(() => {
                return game.playSoundPromise(wordConfig.sound);
              });
            }
            if (wordConfig.after !== undefined) {
              afterPro.then(() => {
                return wordConfig.after(wordObj, nowindex);
              });
            }
            return afterPro.then(() => {
              if (nowindex + 1 < wordConfigArr.length) {
                return hightChar(nowindex + 1);
              }
            });
          }
        });
      });

    };
    let promise = hightChar();
    if (callback) {
      promise = promise.then(callback);
    }
    return promise;
  }

  inCircleArea(objPosition, circlePoint, radius) {
    return radius >= this.getDistance(objPosition, circlePoint);
  }

  inRectArea(objPosition, topLeftPoint, width, height) {
    let between1 = objPosition.x >= topLeftPoint.x && objPosition.x <=
      topLeftPoint.x + width;
    let between2 = objPosition.y >= topLeftPoint.y && objPosition.y <=
      topLeftPoint.y + height;
    return between1 && between2;
  }

  inPictureArea(objPosition, picture) {
    let width = picture.width;
    let height = picture.height;
    let anchorX = picture.anchor.x;
    let anchorY = picture.anchor.y;
    let position = {
      x: picture.position.x - anchorX * width,
      y: picture.position.y - anchorY * height
    };
    return this.inRectArea(objPosition, position, width, height);
  }

  rndInt(max) {
    return Math.floor(Math.random() * max);
  }

  destroyAll() {
    this.game.world.removeAll(true);
  }

  clearGroup(group) {
    group.removeAll(true);
  }

  batchDestroy(...args) {
    for (let item of args) {
      if (!item)
        continue;
      if (_.isArray(item)) {
        for (let obj of item) {
          if (obj)
            obj.destroy();
        }
      } else {
        item.destroy();
      }
    }
  }

  loadSpeakerBtn() {
    for (let key in speaker) {
      this.game.loadAtlasJSONHash(speaker[key]);
    }
  }

  createSpeakerAnimationBtn(x, y, key, needFlash = true) {
    let speakerJson = speaker[key];
    let btnName = 'speaker';
    let btn = this.createAnimationBtn(x, y, speakerJson, btnName);

    // 10/15需求 题干音频闪烁效果提示点击
    if (needFlash && key === 'bigSpeaker') {
      btn.flash = new ObjectPropertyFlasher(this.game, btn, 'alpha', [1, 0.5], {
        duration: 500
      });
      btn.flash.start();
    }
    btn.playSound = (sound, frameRate) => {
      if (needFlash && key === 'bigSpeaker')
        btn.flash.stop();
      return btn.playAnimation(sound, frameRate, [0, 1, 2, 2, 1, 0]);
    };
    btn.stop = (invokePendingPromise = true) => {
      btn.animations.currentAnim && btn.animations.currentAnim.stop(true);
      this.game.soundStopAll(invokePendingPromise);
    };
    return btn;
  }

  createAnimationBtn(x, y, key, framesName) {
    let btn = this.game.add.sprite(x, y, key);
    btn.name = framesName;
    btn.playAnimation = (sound, frameRate, frames) => {
      return this.playSoundWithAnimation(sound, btn, frames, frameRate);
    };
    return btn;
  }

  playSoundWithAnimation(sound, sprite, frames, frameRate, loop = true) {
    let animation = sprite.animations.add(sprite.name, frames, frameRate, loop);
    animation.play(sprite.name);
    return this.game.playSoundPromiseByObject(sound)
      .then(() => {
        animation.stop(true);
      });
  }

  splitSentenceToWordArr(sentence) {
    let result = [];
    let sentenceArr = sentence.split('\n');
    for (let line of sentenceArr) {
      result.push(line.split(' '));
    }
    return result;
  }

  makeSplitSetence(paragraph, position, lineHeight, style, parent = this.world) {
    let setenceWordArr = [];
    setenceWordArr.boldTextArr = [];
    let lines = paragraph.split('\n');
    let spaceText = this.game.add.text(0, 0, ' ', style);
    for (let i = 0; i < lines.length; i++) {
      let origArr = lines[i].split(' ');
      let arr = [];
      origArr.forEach((word) => {
        let punctuation = word.match(CommonRegex.textFilter);
        if (punctuation) {
          let tempArr = [];
          word.split('').forEach((letter) => {
            if (CommonRegex.textFilter.test(letter)) {
              tempArr.length > 0 ? arr.push(tempArr.join('')) : '';
              arr.push(letter);
              tempArr = [];
            } else {
              tempArr.push(letter);
            }
          });
        } else {
          arr.push(word);
        }
      });
      let currentWord;
      let wx = position.x;
      let wy = position.y + i * lineHeight;
      for (let wordInfo of arr) {
        if (wordInfo.indexOf('//') > -1) {
          wordInfo = wordInfo.substr(2, wordInfo.length - 2);
          currentWord = this.game.add.text(0, 0, wordInfo, style);
          currentWord.fontWeight = 'bolder';
        } else if (wordInfo.indexOf('{{') > -1) {
          wordInfo = wordInfo.substr(2, wordInfo.length - 4);
          currentWord = this.game.add.text(0, 0, wordInfo, style);
          setenceWordArr.boldTextArr.push(currentWord);
          currentWord.fontWeight = 'bolder';
        } else {
          currentWord = this.game.add.text(0, 0, wordInfo, style);
        }

        if (!wordInfo.replace(CommonRegex.textFilter, '')) {
          currentWord.position.y = wy;
          currentWord.position.x = wx - spaceText.width;
          wx += currentWord.width;
        } else {
          currentWord.position.y = wy;
          currentWord.position.x = wx;
          wx += currentWord.width + spaceText.width;
        }
        parent.addChild(currentWord);
        setenceWordArr.push(currentWord);
      }
    }
    return setenceWordArr;
  }

  /**
   *设置图片相对背景图片比例
   *
   * @param {*} picImg 显示的图片
   * @param {*} bg 背景图
   * @param {*} scale 背景图
   * @memberof MonsterAndRubbish
   */
  setImgScaleToBg(picImg, bg, scale = 0.85) {
    let finishPerx = 1;
    let finishPerY = 1;
    if (Math.abs(picImg.width) > bg.width * scale) {
      finishPerx = Math.abs(scale * bg.width / picImg.width);
    }
    if (Math.abs(picImg.height) > bg.height * scale) {
      finishPerY = Math.abs(scale * bg.height / picImg.height);
    }
    picImg.scale.set(Math.min(finishPerx, finishPerY));
  }

  //创建居中对齐图片
  createImageWithBg(game, bgKey, imageKey, scale) {
    let bg = game.add.sprite(0, 0, bgKey),
      image = game.add.sprite(bg.width / 2, bg.height / 2, imageKey);
    image.anchor.set(0.5);
    bg.addChild(image);
    this.setImgScaleToBg(image, bg, scale);
    return bg;
  }

  // 创建相框图
  createThumbNailWithBorder(x, y, key, {
    margin = 10,
    backgroundAlpha = 1,
    backgroundColor = 0xffffff,
    borderColor = 0xffffff,
    borderAlpha = 1,
    radius = 10,
    width,
    height
  } = {}) {
    let img = key;
    if (_.isString(key)) {
      img = this.game.add.sprite(margin, margin, key);
    } else {
      img.x = img.y = margin;
    }
    //缩放图片
    let rate = Math.min((width - margin * 2) / img.width, (height - margin * 2) / img.height);
    img.scale.set(rate);
    // img.width = parseInt(img.width);
    // img.height = parseInt(img.height);
    let borderWidth = img.width + 2 * margin,
      borderHeight = img.height + 2 * margin;

    //绘制相框边框
    let borderGraphics = this.game.add.graphics(x, y);
    borderGraphics.beginFill(borderColor, borderAlpha);
    borderGraphics.drawRoundedRect(0, 0, borderWidth, borderHeight, radius);
    borderGraphics.endFill();
    //绘制相框背景
    let bgGraphics = this.game.add.graphics(margin, margin);
    bgGraphics.beginFill(backgroundColor, backgroundAlpha);
    bgGraphics.drawRoundedRect(0, 0, img.width, img.height, radius - margin);
    bgGraphics.endFill();
    //绘制圆角遮罩
    let imgMask = this.game.add.graphics(margin, margin);
    imgMask.beginFill(0xffffff, 1);
    imgMask.drawRoundedRect(0, 0, img.width - 1, img.height - 1, radius - margin);
    imgMask.endFill();
    img.mask = imgMask;
    bgGraphics.addChild(img);
    bgGraphics.addChild(imgMask);
    borderGraphics.addChild(bgGraphics);
    return borderGraphics;
  }
}

export {
  Util
};