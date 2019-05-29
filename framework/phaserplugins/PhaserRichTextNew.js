import $ from 'jquery';
import Phaser from 'phaser';
class PhaserRichTextNew extends Phaser.Sprite {
  constructor(game, x, y, text, style) {
    super(game, x, y, '', style);
    this.context = document.createElement('canvas').getContext('2d');
    this.allText = []; //文本列表
    this.game = game;
    this.$marginRight = 0; //右边距
    this.$marginLeft = 0; //右边距
    this.$marginTop = 0; //上边距
    this.$marginBottom = 0; //下边距
    this.$maxwidth = 0; //最大宽度
    this.$myalign = 'left'; //对齐方式
    // this.$lineSpacing = 0;
    this.eventsList = {}; //事件列表
    this.bgObj = game.add.graphics(0, 0);
    this.addChild(this.bgObj);
    this.style = style || {};

    this.$lineSpacing = this.style.lineSpacing ? this.style.lineSpacing : 0;
    this.style.shadowOffsetX = 0;
    this.$font = (this.style.font ? this.style.font : 'Century Gothic');
    this.$fontSize = (this.style.fontSize ? this.style.fontSize : '26px');
    this.$fontWeight = (this.style.fontWeight ? this.style.fontWeight : 'normal');
    this.$fontStyle = (this.style.fontStyle ? this.style.fontStyle : 'normal');
    this.$fill = (this.style.fill ? this.style.fill : '#000000');

    this.style.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize} ${this.font}`;
    this.style.shadowOffsetY = 0;
    this.style.shadowColor = 'rgba(0,0,0,1)';
    this.style.shadowBlur = 0;
    this.style.stroke = 'rgba(0,0,0,1)';
    this.style.strokeThickness = 0;

    this.$maxwidth = this.style.maxwidth;
    this.$ellipses = this.style.ellipses; //是否超出显示显示省略号
    this.$text = text;
    this.$myalign = this.style.align; //对齐方式
    this.$anchor = {
      root: this,
      _x: 0,
      _y: 0,
      get x() {
        return this._x;
      },
      get y() {
        return this._y;
      },
      set x(val) {
        this._x = val;
        this.root.redraw();
      },
      set y(val) {
        this._y = val;
        this.root.redraw();
      },
      set(x, y) {
        this.x = x;
        this.y = y;
      }
    };
    this.setHtml(text);
  }


  get fontStyle() {
    return this.$fontStyle;
  }

  set fontStyle(val) {
    this.$fontStyle = val;
    this.style.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize} ${this.font}`;
    this.redraw();
  }


  get fontWeight() {
    return this.$fontWeight;
  }

  set fontWeight(val) {
    this.$fontWeight = val;
    this.style.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize} ${this.font}`;
    this.redraw();
  }

  get fontSize() {
    return this.$fontSize;
  }

  set fontSize(val) {
    this.$fontSize = val;
    this.style.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize} ${this.font}`;
    this.redraw();
  }

  get font() {
    return this.$font;
  }

  set font(val) {
    this.$font = val;
    this.style.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize} ${this.font}`;
    this.redraw();
  }

  set myalign(val) {
    this.$myalign = val;
    this.redraw();
  }

  get myalign() {
    return this.$myalign;
  }

  get ellipses() {
    return this.$ellipses;
  }

  set ellipses(val) {
    this.$ellipses = val;
  }

  get anchor() {
    return this.$anchor;
  }

  set anchor(val) {
    this.$anchor = val;
  }

  get lineSpacing() {
    return this.$lineSpacing;
  }

  set lineSpacing(val) {
    this.$lineSpacing = val;
    this.redraw();
  }

  get text() {
    return this.$text;
  }

  set text(val) {
    this.$text = val;
  }

  setStyle(style) {
    this.$font = this.style.font;
    this.$fontSize = this.style.fontSize;
    this.$fontWeight = this.style.fontWeight;
    this.$fontStyle = this.style.fontStyle;
    this.$fill = this.style.fill;
    this.style = style;
    this.redraw();
  }

  setShadow() {

  }

  get marginBottom() {
    return this.$marginBottom;
  }

  get maxwidth() {
    return this.$maxwidth;
  }

  set maxwidth(val) {
    this.$maxwidth = val;
    this.redraw();
  }

  set marginBottom(val) {
    this.$marginBottom = val;
    this.redraw();
  }

  get marginRight() {
    return this.$marginRight;
  }

  set marginRight(val) {
    this.$marginRight = val;
    this.redraw();
  }

  get marginTop() {
    return this.$marginTop;
  }

  set marginTop(val) {
    this.$marginTop = val;
    this.redraw();
  }

  get marginLeft() {
    return this.$marginLeft;
  }

  set marginLeft(val) {
    this.$marginLeft = val;
    this.redraw();
  }

  setHtml(text) {
    this.text = text;
    this.redraw();

  }

  redraw() {
    this.textConfig = this.parseHtmlToJson(this.text);
    this.allText.forEach((text) => {
      text.destroy();
    });
    this.allText = [];
    this.bgObj.clear();

    let width = 0;
    let height = 0;
    let heightArr = [];
    let nowx = this.marginLeft;
    let nowy = this.marginTop;
    let len = this.textConfig.length;
    let widthArr = [];
    let textrowindex = 0;
    let allrowtext = {};
    let preHeight = 0;
    let wrapFlag = false;
    //换行逻辑
    let warpRowHandler = (addwidth) => {

      widthArr.push(nowx + addwidth - this.marginLeft);
      nowx = this.marginLeft;
      if (heightArr.length === 0) {
        if (wrapFlag) {
          nowy += preHeight;
        } else {
          wrapFlag = true;
        }
      } else {
        preHeight = Math.max.apply(null, heightArr) + this.marginTop + this.marginBottom;
        nowy += preHeight;
      }
      nowy += this.lineSpacing;
      height = nowy;
      heightArr = [];
      textrowindex++;
    };
    for (let i = 0; i < len; i++) {
      let config = this.textConfig[i];
      if (config.text !== '\n') {
        wrapFlag = false;
        if (!allrowtext[textrowindex]) {
          allrowtext[textrowindex] = [];
        }
        let nowtext = undefined;
        let nowStyle = JSON.parse(JSON.stringify(this.style));

        if (config.style.color && config.style.color !== '') {
          nowStyle.fill = config.style.color;
        }
        if (config.style.fontSize && config.style.fontSize !== '') {
          nowStyle.fontSize = parseInt(config.style.fontSize) <= 50 ? config.style.fontSize : '50px';
        }
        nowStyle.fontWeight = (config.style.bold ? 'bold' : 'normal');
        nowStyle.fontStyle = (config.style.italic ? 'italic' : 'normal');
        nowtext = this.game.add.text(nowx, nowy, config.text);
        nowtext.setStyle(nowStyle);
        //添加自定义数据
        nowtext.data = config.data;
        nowtext.x = nowx;
        nowtext.y = nowy;
        nowtext.setShadow(this.style.shadowOffsetX, this.style.shadowOffsetY, this.style.shadowColor, this.style.shadowBlur);
        nowtext.isUnderLine = (config.style.isUnderLine === true); //需要下划线
        this.addChild(nowtext);
        this.allText.push(nowtext);
        allrowtext[textrowindex].push(nowtext);
        $.each(this.eventsList, function (key, value) {
          nowtext.events[key].removeAll();
          nowtext.events[key].add((event) => {
            value(event);
          });
        });
        if (nowtext.text !== ' ') //fontSize偏小时，高度计算不对
          heightArr.push(nowtext.height + 3);

        let addwidth = 0;
        if (i === len - 1) {
          addwidth = nowtext.width + this.marginLeft + this.marginRight;
        } else {
          addwidth = nowtext.width + this.marginLeft + this.marginRight;
        }
        nowx += addwidth;
      } else {
        warpRowHandler(0);
      }
    }
    widthArr.push(nowx);
    if (heightArr.length !== 0) {
      height += Math.max.apply(null, heightArr) + this.marginBottom;
    } else {
      height -= this.marginTop;
    }

    if (this.maxwidth !== 0) {
      let maxWidth = Math.max.apply(null, widthArr);
      width = (maxWidth !== 0) ? maxWidth : this.maxwidth;
    } else {
      if (widthArr.length !== 0 && Math.max(widthArr) !== 0) {
        width = Math.max.apply(null, widthArr);
      } else {
        width = nowx - this.marginLeft;
      }
    }
    if (this.maxwidth !== 0) {
      if (this.myalign !== 'left') {
        for (let key in allrowtext) {
          let items = allrowtext[key];
          let nowrowwidth = 0;
          items.forEach((item) => {
            nowrowwidth += item.width + this.marginLeft + this.marginRight;
          });
          let offsetx = 0;
          if (this.myalign === 'center') {
            offsetx = (width - nowrowwidth) / 2;
          } else if (this.myalign === 'right') {
            offsetx = (width - nowrowwidth);
          }
          let maxHeight = 0;
          items.forEach((item) => {
            item.x += offsetx;
            maxHeight = Math.max(maxHeight, item.height);
          });
        }
      }
    }

    this.allText.forEach((item) => {
      item.x -= width * this.anchor.x - item.width * item.anchor.x;
      item.y -= height * this.anchor.y - item.height * item.anchor.y;
    });
    for (let key in allrowtext) {
      let items = allrowtext[key];
      let maxHeight = 0;
      items.forEach((item) => {
        if (item.text !== ' ')
          maxHeight = Math.max(maxHeight, item.height);
      });
      items.forEach(text => {
        text.y = text.y + (maxHeight - text.height);
        if (text.isUnderLine) {
          this.bgObj.lineStyle(1, parseInt(text.fill.replace('#', ''), 16));
          this.bgObj.moveTo(text.x, text.y + text.height - 2);
          this.bgObj.lineTo(text.x + text.width, text.y + text.height - 2);
        }
      });
    }
    this.bmp = this.game.make.bitmapData(width, height);
    this.loadTexture(this.bmp, true);
  }

  rgbToHex(color) {
    if (color.indexOf('#') !== -1) {
      return color;
    }
    let rgb = color.split(',');
    let r = parseInt(rgb[0].split('(')[1]);
    let g = parseInt(rgb[1]);
    let b = parseInt(rgb[2].split(')')[0]);
    let hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
  }

  parseHtmlToJson(htmlStr) {
    let rootData = $('<div>' + htmlStr + '</div>')[0];
    let isfirstP = true; //第一个p不需要换
    let getStyle = (node, preStyle) => {
      let $node = $(node);
      let attrcolor = $node.attr('color');
      let attrfont = $node.attr('face');
      let attrfontSize = $node.attr('size');
      let cssfontSize = $node.css('fontSize');
      let cssColor = $node.css('color');
      let cssFont = $node.css('fontFamily');
      let csstextDecoration = $node.css('textDecoration');
      let fontSize = (cssfontSize && cssfontSize !== '') ? cssfontSize : attrfontSize;
      if (!fontSize || fontSize === '') {
        if (!preStyle.fontSize || preStyle.fontSize === '') {
          preStyle.fontSize = (!fontSize || fontSize === '') ? '26px' : Math.ceil(parseInt(fontSize.replace('px', ''), 10)) + 'px';
        }
      } else {
        preStyle.fontSize = Math.floor(parseInt(fontSize.replace('px', ''), 10)) + 'px';
      }
      let font = (cssFont && cssFont !== '') ? cssFont : attrfont;
      if (!font || font === '') {
        if (!preStyle.font || preStyle.font === '') {
          preStyle.font = (!font || font === '') ? 'Century Gothic' : font;
        }
      } else {
        preStyle.font = font;
      }
      let color = (cssColor && cssColor !== '') ? cssColor : attrcolor;
      if (!color || color === '') {
        if (!preStyle.color || preStyle.color === '') {
          preStyle.color = (!color || color === '') ? '' : color;
        }
      } else {
        preStyle.color = color;
      }
      if (preStyle.color && preStyle.color.startsWith('rgb')) {
        preStyle.color = this.rgbToHex(preStyle.color);
      }

      let isUnderLine = csstextDecoration === 'underline';
      let isDelLine = csstextDecoration === 'line-through';
      if (csstextDecoration && csstextDecoration !== '') {
        preStyle.isUnderLine = isUnderLine;
        preStyle.isDelLine = isDelLine;
      }
    };
    let repeatFunc = (rootData, preStyle, preData) => {
      rootData.childNodes.forEach((item) => {
        let nodeName = item.nodeName.toLowerCase();
        let nowSylte = JSON.parse(JSON.stringify(preStyle));
        if (this.$fontWeight === 'bold')
          Object.assign(nowSylte, {
            bold: true
          });
        switch (nodeName) {
          case 'p': //元素
            if (!isfirstP) {
              textArr.push({
                text: '\n',
                style: {}
              });
            } else {
              isfirstP = false;
            }
            getStyle(item, nowSylte);
            repeatFunc(item, nowSylte, $(item).data());
            break;
          case 'br': //换行
            textArr.push({
              text: '\n',
              style: {}
            });
            break;
          case 'strong': //加粗
          case 'b':
            nowSylte.bold = true;
            repeatFunc(item, nowSylte, $(item).data());
            break;
          case 'i':
          case 'em': //斜体
            nowSylte.italic = true;
            repeatFunc(item, nowSylte, $(item).data());
            break;
          case 'font':
          case 'span':
            getStyle(item, nowSylte);
            repeatFunc(item, nowSylte, $(item).data());
            break;
          case 'strike': //删除线
            nowSylte.isDelLine = true;
            repeatFunc(item, nowSylte, $(item).data());
            break;
          case 'u': //下划线
            nowSylte.isUnderLine = true;
            repeatFunc(item, nowSylte, $(item).data());
            break;
          case '#text': //文本
            textArr.push({
              text: item.textContent,
              style: nowSylte,
              data: preData
            });
            break;
        }
      });
    };

    let textArr = [];
    repeatFunc(rootData, {}, textArr);
    if (textArr.length > 0) {
      if (textArr[textArr.length - 1].text === '\n') {
        textArr.pop();
      }
    }

    if (this.maxwidth !== 0) {
      let nextTxtArr = [];
      let alltext = '';
      let peizhilist = [];
      textArr.forEach((item, index) => {
        for (let i = alltext.length; i <= alltext.length + item.text.length - 1; i++) {
          peizhilist[i] = item;
          peizhilist[i].indexflag = index;
        }
        alltext += item.text;
      });
      let allLine = alltext.split('\n'); //空格分隔单词

      let nowOffsetIndex = 0;
      allLine.forEach((lineInfo) => {
        let lineWidth = 0;
        let allWord = lineInfo.split(' '); //分割出所有单词
        let nowWordOffset = 0;
        allWord.forEach((word) => {
          let chArr = word.split('');
          let nowWordWidth = 0;
          chArr.forEach((ch, index) => {
            let nowindex = nowOffsetIndex + nowWordOffset + index;
            let charWidth = this.getCharWidh(ch, peizhilist[nowindex]);
            nowWordWidth += charWidth;
          });
          let spaceIndex = nowWordOffset + chArr.length;
          let spaceWidth = 0;
          if (spaceIndex < lineInfo.length) {
            spaceWidth = this.getCharWidh(' ', peizhilist[nowOffsetIndex + spaceIndex]);
            nowWordWidth += spaceWidth;
          }
          if (lineWidth + nowWordWidth - spaceWidth > this.maxwidth) {
            if (nextTxtArr.length > 0) {
              let preTxtData = nextTxtArr[nextTxtArr.length - 1];
              if (preTxtData.text === ' ') {
                nextTxtArr.pop();
              }
            }
            //需要换行
            nextTxtArr.push({
              text: '\n',
              config: {}
            });
            lineWidth = nowWordWidth;
          } else {
            lineWidth += nowWordWidth;
          }
          chArr.forEach((ch, index) => {
            let nowindex = nowOffsetIndex + nowWordOffset + index;

            //需要换行
            nextTxtArr.push({
              text: ch,
              config: peizhilist[nowindex]
            });
          });
          if (spaceIndex < lineInfo.length) {
            nextTxtArr.push({
              text: ' ',
              config: peizhilist[nowOffsetIndex + spaceIndex]
            });
          }
          nowWordOffset += word.length + 1;
        });
        //需要换行
        nextTxtArr.push({
          text: '\n',
          config: {}
        });
        nowOffsetIndex += lineInfo.length + 1;
      });

      let lasttextArr = [];
      let preitem = undefined;
      nextTxtArr.forEach((item) => {
        if (!preitem) {
          preitem = {
            text: item.text,
            style: item.config.style,
            indexflag: item.config.indexflag,
            data: item.config.data
          };
          lasttextArr.push(preitem);
        } else {
          if (preitem.indexflag === item.config.indexflag && item.text !== '\n') {
            //若为一样则合并，且部位换行则合并
            preitem.text += item.text;
          } else {
            if (item.text !== '\n') {
              preitem = {
                text: item.text,
                style: item.config.style,
                indexflag: item.config.indexflag,
                data: item.config.data
              };
              lasttextArr.push(preitem);
            } else {
              preitem = undefined;
              lasttextArr.push({
                text: '\n',
                style: {}
              });
            }
          }
        }
      });
      //hw612 超出宽度只展示一行，后面省略号
      if (this.ellipses && lasttextArr.length > 2) {
        let txt = lasttextArr[0].text;
        lasttextArr[0].text = txt + '...';
        lasttextArr.length = 2;
      }
      //配置合并
      textArr = lasttextArr;
    }
    return textArr;
  }

  //获取一个字母的宽度
  getCharWidh(char, config) {
    let nowStyle = JSON.parse(JSON.stringify(this.style));

    if (config.style.color && config.style.color !== '') {
      nowStyle.fill = config.style.color;
    }
    if (config.style.fontSize && config.style.fontSize !== '') {
      nowStyle.fontSize = config.style.fontSize;
    }
    nowStyle.fontWeight = (config.style.bold ? 'bold' : 'normal') + ' ';
    nowStyle.fontStyle = (config.style.italic ? 'italic' : 'normal') + ' ';
    this.context.font = nowStyle.fontStyle + nowStyle.fontWeight + nowStyle.fontSize + ' ' + this.font;
    this.context.fillStyle = 'black';
    return this.context.measureText(char).width;
  }
}

Phaser.PhaserRichTextNew = PhaserRichTextNew;

Phaser.GameObjectFactory.prototype.richtextNew = function (x, y, text, style, group) {
  if (group === undefined) {
    group = this.world;
  }
  return group.add(new Phaser.PhaserRichTextNew(this.game, x, y, text, style));
};