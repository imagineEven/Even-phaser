class PhaserRichText extends Phaser.Sprite {
  constructor(game, x, y, text, style) {
    super(game, x, y);
    this.context = document.createElement('canvas').getContext('2d');
    this.allText = [];//文本列表
    this.game = game;
    this.$marginRight = 0;//右边距
    this.$marginLeft = 0;//右边距
    this.$marginTop = 0;//上边距
    this.$marginBottom = 0;//下边距
    this.$maxwidth = 0; //最大宽度
    this.$myalign = 'left'; //对齐方式
    this.$lineSpacing = 0;
    this.eventsList = {};//事件列表
    this.bgObj = game.add.graphics(0, 0);
    this.addChild(this.bgObj);
    this.style = style ? style : {};

    this.style.shadowOffsetX = 0;
    this.$font = (this.style.font ? '\'' + this.style.font + '\'' : '\'Century Gothic\'');
    this.$fontSize = (this.style.fontSize ? this.style.fontSize : '26px');
    this.$fontWeight = (this.style.fontWeight ? this.style.fontWeight : 'normal');
    this.$fontStyle = (this.style.fontStyle ? this.style.fontStyle : 'normal');
    this.$fill = (this.style.fill ? this.style.fill : '#000000');
    this.$lineHeight = 0;
    this.style.shadowOffsetY = 0;
    this.style.shadowColor = 'rgba(0,0,0,1)';
    this.style.shadowBlur = 0;
    this.style.stroke = 'rgba(0,0,0,1)';
    this.style.strokeThickness = 0;
    this.$text = text;
    this.$myalign = 'left'; //对齐方式
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

  parentReDraw() {

  }

  get lineHeight() {
    return this.$lineHeight;
  }

  set lineHeight(val) {
    this.$lineHeight = val;
    this.redraw();
    this.parentReDraw();
  }


  get fill() {
    return this.$fill;
  }

  set fill(val) {
    this.$fill = val;
    this.style.fill = val;
    this.redraw();
    this.parentReDraw();
  }

  get fontStyle() {
    return this.$fontStyle;
  }

  set fontStyle(val) {
    this.$fontStyle = val;
    this.style.fontStyle = val;
    this.redraw();
    this.parentReDraw();
  }


  get fontWeight() {
    return this.$fontWeight;
  }

  set fontWeight(val) {
    this.$fontWeight = val;
    this.style.fontWeight = val;
    this.redraw();
    this.parentReDraw();
  }

  get fontSize() {
    return this.$fontSize;
  }

  set fontSize(val) {
    this.$fontSize = val;
    this.style.fontSize = val;
    this.redraw();
    this.parentReDraw();
  }

  get font() {
    return this.$font;
  }

  set font(val) {
    this.$font = val;
    this.style.font = val;
    this.redraw();
    this.parentReDraw();
  }

  set myalign(val) {
    this.$myalign = val;
    this.redraw();
  }

  get myalign() {
    return this.$myalign;
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
    this.parentReDraw();
  }

  get text() {
    return this.$text;
  }

  set text(val) {
    this.$text = val;
    this.parentReDraw();
  }

  setStyle(style) {
    this.style = style;
    this.$font = (this.style.font ? '\'' + this.style.font + '\'' : this.$font);
    this.$fontSize = (this.style.fontSize ? this.style.fontSize : this.$fontSize);
    this.$fontWeight = (this.style.fontWeight ? this.style.fontWeight : this.$fontWeight);
    this.$fontStyle = (this.style.fontStyle ? this.style.fontStyle : this.$fontStyle);
    this.$fill = this.style.fill ? this.style.fill : this.$fill;
    this.redraw();
    this.parentReDraw();
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
    this.parentReDraw();
  }

  set marginBottom(val) {
    this.$marginBottom = val;
    this.redraw();
    this.parentReDraw();
  }

  get marginRight() {
    return this.$marginRight;
  }

  set marginRight(val) {
    this.$marginRight = val;
    this.redraw();
    this.parentReDraw();
  }

  get marginTop() {
    return this.$marginTop;
  }

  set marginTop(val) {
    this.$marginTop = val;
    this.redraw();
    this.parentReDraw();
  }

  get marginLeft() {
    return this.$marginLeft;
  }

  set marginLeft(val) {
    this.$marginLeft = val;
    this.redraw();
    this.parentReDraw();
  }

  setHtml(text, isreplace) {
    text = unescape(text);  //解码
    if (!isreplace) {
      this.basetext = text;
      this.text = text;
    } else {
      this.text = text;
    }
    this.redraw();
    this.parentReDraw();
  }

  replaceText(pre, after) {
    let newtext = this.basetext.replace(pre, after);
    this.setHtml(newtext, true);
  }

  redraw() {
    if (this.isDestroy) {
      return;
    }
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
          nowStyle.fontSize = config.style.fontSize;
        }
        nowStyle.fontWeight = (config.style.bold ? 'bold' : this.fontWeight);
        nowStyle.fontStyle = (config.style.italic ? 'italic' : this.fontStyle);

        nowStyle.font = `${nowStyle.fontStyle} ${nowStyle.fontWeight} ${nowStyle.fontSize} ${nowStyle.font}`;
        nowtext = this.game.add.text(nowx, nowy, config.text);
        nowtext.setStyle(nowStyle);

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

        let nowHeight = nowtext.height;
        if (this.lineHeight !== 0 && nowtext.fontSize) {
          let fontStr = nowtext.fontSize + '';
          let nowFontSize = 0;
          if (fontStr.indexOf('pt') !== -1) {
            nowFontSize = Math.ceil(parseFloat(fontStr.replace('pt', '')) / 0.75);
          } else if (fontStr.indexOf('px') !== -1) {
            nowFontSize = Math.ceil(parseFloat(fontStr.replace('px', '')));
          } else {
            nowFontSize = nowtext.fontSize;
          }
          nowHeight = (nowFontSize > this.lineHeight ? nowFontSize : this.lineHeight);
          if (nowFontSize < this.lineHeight) {
            nowtext.y += (this.lineHeight - nowFontSize) / 2;
          }
        }
        heightArr.push(nowHeight);

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

    if (!this.maxwidth) {
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
        maxHeight = Math.max(maxHeight, item.height);
      });
      items.forEach(text => {
        text.y = text.y + (maxHeight - text.height);
        if (text.isUnderLine) {
          this.bgObj.lineStyle(2, parseInt(text.fill.replace('#', ''), 16));
          this.bgObj.moveTo(text.x, text.y + text.height - 2);
          this.bgObj.lineTo(text.x + text.width, text.y + text.height - 2);
        }
      });
    }
    this.bmp = this.game.make.bitmapData(width, height);
    // let context = this.bmp.canvas.getContext('2d');
    // context.fillStyle = 'rgba(255,255,0,0.8)';
    // context.fillRect(0, 0, width, height);
    // context.save();
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
          preStyle.fontSize = (!fontSize || fontSize === '') ? this.fontSize : Math.ceil(parseInt(fontSize.replace('px', ''), 10) * (9 / 12)) + 'pt';
        }
      } else {
        preStyle.fontSize = Math.floor(parseInt(fontSize.replace('px', ''), 10) * (9 / 12)) + 'pt';
      }
      let font = (cssFont && cssFont !== '') ? cssFont : attrfont;
      if (!font || font === '') {
        if (!preStyle.font || preStyle.font === '') {
          preStyle.font = (!font || font === '') ? this.font : font;
        }
      } else {
        preStyle.font = font;
      }
      let color = (cssColor && cssColor !== '') ? cssColor : attrcolor;
      if (!color || color === '') {
        if (!preStyle.color || preStyle.color === '') {
          preStyle.color = (!color || color === '') ? this.fill : color;
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
    let repeatFunc = (rootData, preStyle) => {
      rootData.childNodes.forEach((item) => {
        let nodeName = item.nodeName.toLowerCase();
        let nowSylte = JSON.parse(JSON.stringify(preStyle));

        switch (nodeName) {
          case 'p': //元素
            if (!isfirstP) {
              textArr.push({ text: '\n', style: {} });
            } else {
              isfirstP = false;
            }
            getStyle(item, nowSylte);
            repeatFunc(item, nowSylte);
            break;
          case 'br': //换行
            textArr.push({ text: '\n', style: {} });
            break;
          case 'strong'://加粗
          case 'b':
            nowSylte.bold = true;
            repeatFunc(item, nowSylte);
            break;
          case 'i':
          case 'em': //斜体
            nowSylte.italic = true;
            repeatFunc(item, nowSylte);
            break;
          case 'font':
          case 'span':
            getStyle(item, nowSylte);
            repeatFunc(item, nowSylte);
            break;
          case 'strike': //删除线
            nowSylte.isDelLine = true;
            repeatFunc(item, nowSylte);
            break;
          case 'u': //下划线
            nowSylte.isUnderLine = true;
            repeatFunc(item, nowSylte);
            break;
          case '#text': //文本
            textArr.push({ text: item.textContent, style: nowSylte });
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
            spaceWidth = this.getCharWidh(' ', peizhilist[spaceIndex]);
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
            nextTxtArr.push({ text: '\n', config: {} });
            lineWidth = nowWordWidth;
          } else {
            lineWidth += nowWordWidth;
          }
          chArr.forEach((ch, index) => {
            let nowindex = nowOffsetIndex + nowWordOffset + index;
            //需要换行
            nextTxtArr.push({ text: ch, config: peizhilist[nowindex] });
          });
          if (spaceIndex < lineInfo.length) {
            nextTxtArr.push({ text: ' ', config: peizhilist[spaceIndex] });
          }
          nowWordOffset += word.length + 1;
        });
        //需要换行
        nextTxtArr.push({ text: '\n', config: {} });
        nowOffsetIndex += lineInfo.length + 1;
      });

      let lasttextArr = [];
      let preitem = undefined;
      nextTxtArr.forEach((item) => {
        if (!preitem) {
          preitem = { text: item.text, style: item.config.style, indexflag: item.config.indexflag };
          lasttextArr.push(preitem);
        } else {
          if (preitem.indexflag === item.config.indexflag && item.text !== '\n') {
            //若为一样则合并，且部位换行则合并
            preitem.text += item.text;
          } else {
            if (item.text !== '\n') {
              preitem = { text: item.text, style: item.config.style, indexflag: item.config.indexflag };
              lasttextArr.push(preitem);
            } else {
              preitem = undefined;
              lasttextArr.push({ text: '\n', style: {} });
            }
          }
        }
      });

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
    if (nowStyle.fontSize.indexOf('pt') !== -1) {
      nowStyle.fontSize = Math.ceil(parseFloat(nowStyle.fontSize.replace('pt', '')) * 4 / 3) + 'px';
    }
    nowStyle.fontWeight = (config.style.bold ? 'bold' : this.fontWeight) + ' ';
    nowStyle.fontStyle = (config.style.italic ? 'italic' : this.fontStyle) + ' ';
    this.context.font = nowStyle.fontStyle + 'normal ' + nowStyle.fontWeight + nowStyle.fontSize + ' ' + this.font;
    this.context.fillStyle = 'black';
    return this.context.measureText(char).width;
  }

  destroy() {
    this.isDestroy = true;
    super.destroy();
  }
}

Phaser.PhaserRichText = PhaserRichText;

Phaser.GameObjectFactory.prototype.richtext = function (x, y, text, style, group) {
  if (group === undefined) {
 group = this.world; 
}
  return group.add(new Phaser.PhaserRichText(this.game, x, y, text, style));
};


