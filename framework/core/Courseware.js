import Phaser from 'phaser';
import {
  Util
} from './../util/Util';
import {
  Options
} from './Options';
import {
  LoopManager
} from './LoopManager';
import {
  Toolbar
} from '../plugins/Toolbar';
import {
  IdleWarning
} from '../plugins/IdleWarning';
import {
  VCVideoPlayer
} from '../video/VCVideoPlayer';
import ReadJsonAsset from '../plugins/ReadJsonAsset';
import $ from 'jquery';
import Pattern from './Pattern';
import _ from 'lodash';
import PhaserRenderUtil from './PhaserRenderUtil';
import {
  Device
} from '../device/Device';
import hwPublicJson from '../public/hwPublicJson.json';
import HwToolBar from '../plugins/HwToolBar';
require('../../stylesheets/common.css');
const WebFont = require('webfontloader');
WebFont.load({
  custom: {
    families: ['Century Gothic', 'Century Gothic-Bold'],
  },
  timeout: 1000
});
let classFactory = {
  registeredTypes: new Map(),

  getInstance(clazzInfo, ...option) {
    if (this.registeredTypes.has(clazzInfo.clazzName)) {
      return this.registeredTypes.get(clazzInfo.clazzName);
    }
    let instance = new clazzInfo.clazz(...option);
    this.registeredTypes.set(clazzInfo.clazzName, instance);
    return instance;
  }
};
const clazzInfo = {
  toolBar: {
    clazzName: Symbol.for('ToolBar'),
    clazz: Toolbar
  },
  videoPlayer: {
    clazzName: Symbol.for('VideoPlayer'),
    clazz: VCVideoPlayer
  },
  idleWarning: {
    clazzName: Symbol.for('IdleWarning'),
    clazz: IdleWarning
  },
  hwToolBar: {
    clazzName: Symbol.for('HwToolBar'),
    clazz: HwToolBar
  }
};
window.plusVPlayers = [];
let currentSounds = [];
let allSounds = [];
//用作私有方法名称
const stopSoundMethod = Symbol('stop');
let isPause = false;
class Courseware extends Phaser.Game {
  constructor({
    width = Options.renderOptions.width,
    height = Options.renderOptions.height
  } = {},
  preload, create, update, render, dom = '', transparent = false, PhaserRender = Phaser.AUTO) {
    window['console'].log('%c V2.0 \u2665\u2665 ', 'color: #ffffff; background: #871905;');
    PhaserRender = PhaserRenderUtil.getPhaserRender(PhaserRender);
    super(width, height, PhaserRender, dom, {
      preload: () => {
        this.listenProgress();
        this.load.crossOrigin = true;
        this.util.loadPublicResources();
        this.util.safeInvoke(preload);
      },
      create: () => {
        this.currentScale = window.innerHeight / height;
        this.scale.pageAlignHorizontally = true; //水平居中
        this.scale.pageAlignVertically = true;
        this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;

        this.mainBox = document.createElement('div');
        this.mainBox.id = 'CoursewareDiv';

        this.buriedPointData = {
          gameStartTime: new Date(), //游戏开始时间
          gameEndTime: new Date(), //游戏结束时间
          qusitionList: [] //问题列表
        }; //埋点数据
        if (dom) {
          this.util.safeInvoke(create);
          return;
        }
        this.scale.setUserScale(this.currentScale, this.currentScale);
        document.body.appendChild(this.mainBox);
        $(this.mainBox).css({
          'width': width,
          'height': height,
          'transform': 'translate(-50%,-50%) scale(' + this.currentScale + ')',
          'top': '50%',
          'left': '50%',
          'position': 'fixed',
          'pointer-events': 'none',
        });
        $(window).resize(() => {
          selfAdaptionWindow();
        });
        $(() => {
          selfAdaptionWindow();
        });
        //自适应函数
        let selfAdaptionWindow = () => {
          this.currentScale = window.innerWidth / window.innerHeight > 4 / 3 ? window.innerHeight /
            height : window.innerWidth / width;
          this.scale.setUserScale(this.currentScale, this.currentScale);
          $(this.mainBox).css({
            'transform': 'translate(-50%,-50%) scale(' + this.currentScale + ')'
          });
        };
        this.util.safeInvoke(create);
        //创建ios遮罩
        if (this.isIos && !window.plus) {
          this.masker = this.createSprite(0, 0, 'iosMasker');
          this.masker.inputEnabled = true;
          this.masker.events.onInputDown.add(masker => {
            masker.destroy();
          });
          this.masker.width = this.width;
          this.masker.height = this.height;
          this.world.bringToTop(this.masker);
        }
      },
      update: () => {
        this.util.safeInvoke(update);
        this.logicLoop.update();
      },
      render: () => {
        this.util.safeInvoke(render);
        this.renderLoop.update();
      }
    }, transparent);
    window.nowCourseware = this;
    this.Pattern = Pattern;
    this.controls = [];
    this.util = new Util(this);
    // if (!this.logicLoop)
    this.logicLoop = new LoopManager();
    this.renderLoop = new LoopManager();
    let device = new Device();
    let platform = device.checkPlatform();
    this.isMobile = platform !== device.deviceType.win && platform !== device.deviceType.mac;
    this.isIos = platform === device.deviceType.ios;
  }

  /**
   * 
   * 创建右下角工具条
   * @param {any} options {
   *  	soundData:{
   *    autoPlay:bool,是否自动播放声音
   * 		sound：声音id或声音id字符串数组，需要播放的声音
   * 		callback:声音播放完调用的函数
   * 		once：只在声音播放完后调用一次的函数，执行完就会销毁掉无法再调用
   *    startCallback:声音开始播放执行的事件
   * 	},
   * 	nextData: Function, 点击下一步按钮触发事件
   * 	exitData: Function, 点击退出按钮触发事件
   *	onlyShowPauseBtn: true 是否一开始只显示暂停按钮，声音播放完才显示所有按钮，默认true,优先级比autoMoveIn高
   *  autoMoveIn: true 是否自动移动到页面里，默认true
   *  @param {Boolean}stopCurrentAudio:true 在播放传入声音之前，结束正在播放的声音。false，传入的声音和当前正在播放的声音同时播放。
   *  @param {Boolean}invokePendingPromise:true 只有stopCurrentAudio为true，invokePendingPromise才有效。true 在播放传入声音之前，
   *                                          结束正在播放的声音并立即执行当前正在播放声音的回调函数。false  不执行当前正在播放声音的回调函数
   * }
   * @returns Toolbar
   * @memberof Courseware
   */
  createToolbar(options) {
    let toolBar = classFactory.getInstance(clazzInfo.toolBar, this);
    toolBar.createToolbar(options);
    return toolBar;
  }

  createHwToolbar() {
    let toolbar = classFactory.getInstance(clazzInfo.hwToolBar, this);
    toolbar.showExit();
    return toolbar;
  }

  //很多情况，idlewarning和toolbar紧密相关，toolbar的操作会影响到warning是否重新计时
  //duration和times对应idlewarning的时间间隔和播放次数
  createToolbarWithWarning(options, duration = 15, times = -1, whetherExecuteEvents = false) {
    if (this.toolbarWarning) {
      this.toolbarWarning.stop();
    }

    this.toolbarWarning = this.createWarning(duration, (resolve) => {
      if (whetherExecuteEvents) {
        options.soundData.startCallback();
      }
      this.playMultiPromise([].concat(options.soundData.sound)).then(() => {
        if (whetherExecuteEvents) {
          options.soundData.callback();
        }
        resolve();
      });
    }, undefined, times);

    let toolBar = classFactory.getInstance(clazzInfo.toolBar, this);
    let startMap = new Map();
    startMap.set(this.toolbarWarning, this.toolbarWarning.stop);
    startMap.set(this, options.soundData.startCallback);
    options.soundData.startCallback = Pattern.Decorator.invokeAll(startMap);
    let stopMap = new Map();
    stopMap.set(this.toolbarWarning, this.toolbarWarning.start);
    stopMap.set(this, options.soundData.callback);
    options.soundData.callback = Pattern.Decorator.invokeAll(stopMap);
    toolBar.createToolbar(options);

    return toolBar;
  }

  //很多情况，idlewarning和toolbar紧密相关，toolbar的操作会影响到warning是否重新计时
  //duration和times对应idlewarning的时间间隔和播放次数
  createToolbarWithWarningCallback(options, duration = 15, times = -1, callback) {
    if (this.toolbarWarning) {
      this.toolbarWarning.stop();
    }
    let warning = this.createWarning(duration, callback, undefined, times);
    let toolBar = classFactory.getInstance(clazzInfo.toolBar, this);
    let startMap = new Map();
    startMap.set(warning, warning.stop);
    startMap.set(this, options.soundData.startCallback);
    options.soundData.startCallback = Pattern.Decorator.invokeAll(startMap);
    let stopMap = new Map();
    stopMap.set(warning, warning.start);
    stopMap.set(this, options.soundData.callback);
    options.soundData.callback = Pattern.Decorator.invokeAll(stopMap);
    toolBar.createToolbar(options);
    if (!options.soundData.autoPlay) {
      this.util.safeInvoke(options.soundData.callback);
    }
    if (this.toolbarWarning) {
      this.toolbarWarning.stop();
    }
    this.toolbarWarning = warning;
    return toolBar;
  }

  /**
   * 
   * 创建声音对象
   * @param {string} urlStr :Video Url
   * @param {any} [options={}] 
   * @param {any} callback 
   * @param {any} [{
   *     stopCurrentAudio = true,在播放传入声音之前，结束正在播放的声音。false，传入的声音和当前正在播放的声音同时播放。
   *     invokePendingPromise = true 只有stopCurrentAudio为true，invokePendingPromise才有效。true 在播放传入声音之前，
   * 结束正在播放的声音并立即执行当前正在播放声音的回调函数。false  不执行当前正在播放声音的回调函数
   *                        
   *   }={}] 
   * @returns 
   * @memberof Courseware
   */
  createVideoPlay(urlStr, options = {}, callback, {
    stopCurrentAudio = false,
    invokePendingPromise = false
  } = {}) {
    if (stopCurrentAudio) {
      this[stopSoundMethod](invokePendingPromise);
    }
    let videoPlayer = classFactory.getInstance(clazzInfo.videoPlayer, this);
    videoPlayer.createVideoPlay(urlStr, options, callback);
    this.controls.push(videoPlayer);
    return videoPlayer;
  }

  createVideoPlayer(videoName, options = {}, autoPlay = true) {
    let video = this.add.video(videoName);
    video.touchLocked = false;
    let {
      x = 0,
      y = 0,
      width = this.width,
      height = this.height
    } = options;
    video.video.cssText += 'display:none;';
    video.video.setAttribute('playsinline', 'playsinline');
    video.video.setAttribute('webkit-playsinline', true);
    let videoSprite = this.add.sprite(x, y, video);
    videoSprite.width = width;
    videoSprite.height = height;
    video.onComplete.add(() => {
      video.destroy();
      video.touchLocked = true;
    });
    if (autoPlay) {
      video.play();
    }
    return video;
  }

  /**
   * 
   * 
   * @param {Number} x 
   * @param {Number} y 
   * @param {any} obj 如果不是string类型，必须为Object 如{"image":"saefj"}
   * @returns 
   * @memberof Courseware
   */
  createSprite(x, y, obj) {
    let key = _.isString(obj) ? obj : obj['image'];
    return this.add.sprite(x, y, key);
  }

  //这个播放视频，播放完会销毁掉，避免有些课件经常要手动销毁
  createRecyclingVideoPlay(urlStr, options = {}, callback = () => {}) {
    let video = this.createVideoPlay(urlStr, options, () => {
      video.destroy();
      callback();
    });
    this.controls.push(video);
    return video;
  }

  gamePause() {
    this.paused = !isPause;
    let videoPlayer = classFactory.getInstance(clazzInfo.videoPlayer, this);
    videoPlayer.pause(isPause);
    isPause = !isPause;
  }

  createIdleWarning(time, callback, loop, warningCount = -1) {
    let warning = classFactory.getInstance(clazzInfo.idleWarning, this);
    warning.initRepeater(time, callback, warningCount, loop);
    return warning;
  }

  //这东西有些课件不能单例模式，存在多个warning同时进行，时间不同的情况，需要有个非单例的创建方法
  createWarning(time, callback, loop, warningCount = -1) {
    let warning = new IdleWarning(this);
    warning.initRepeater(time, callback, warningCount, loop);
    return warning;
  }

  loadImage(key, value) {
    if (!value) {
      return;
    }
    this.load.image(key, this.util.fullUrl(value, 'image'));
  }

  loadAudio(key, value) {
    if (!value) {
      return;
    }
    this.load.audio(key, this.util.fullUrl(value, 'audio'));
  }

  loadArr(arr, key, funcName, isNeedBinary) {
    if (key) {
      for (let i = 0; i < arr.length; i++) {
        this[funcName](arr[i][key], arr[i][key], isNeedBinary);
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        this[funcName](arr[i], arr[i], isNeedBinary);
      }
    }
  }

  loadAudioArr(arr, key) {
    this.loadArr(arr, key, 'loadAudio');
  }

  loadImageArr(arr, key) {
    this.loadArr(arr, key, 'loadImage');
  }

  //ToDo:删除这个方法，杜绝魔术字符串
  loadAudioObj(obj) {
    for (let i in obj) {
      this.loadAudio(i, obj[i]);
    }
  }

  //ToDo:删除这个方法，杜绝魔术字符串
  loadImageObj(obj) {
    for (let i in obj) {
      this.loadImage(i, obj[i]);
    }
  }

  loadVideoArr(arr, key, isNeedBinary) {
    this.loadArr(arr, key, 'loadVideo', isNeedBinary);
  }

  loadVideo(key, value, isNeedBinary = true) {
    let val = value;
    if (!value) {
      val = key;
    }
    if (!isNeedBinary && window.plus) {
      this.load.image(key, this.util.fullUrl(val + '_t.jpg', 'image')); //载入最后一帧图片
    } else {
      this.loadAudio(key, val);
      if (this.isMobile) {
        if (!val.endsWith('_m')) {
          val = val + '_m';
        }
      }
      this.load.binary(key, this.util.fullUrl(val, 'video'));
    }
    // window['console'].log(this.isMobile, val, Phaser.Device.windows);
  }

  loadXmlArr(arr, key) {
    this.loadArr(arr, key, 'loadXml');
  }

  loadXml(key, value) {
    if (!value) {
      return;
    }

    this.load.atlasXML(key, this.util.fullUrl(value, 'image'), this.util.fullTxtUrl(value) + '.xml');
  }

  loadPageResources(...jsonData) {
    for (let item of jsonData) {
      this.loadPageResource(item);
    }
  }

  loadHwPublicResource() {
    this.loadPageResource(hwPublicJson);
  }

  loadPageResource(jsonData) {
    let loadJsonArr = (arr) => {
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        let key = item.endsWith('.json') ? item.substr(0, item.length - 5) : item;
        let fileName = item.endsWith('.json') ? item : item + '.json';
        this.load.json(key, this.util.fullTxtUrl(fileName));
      }
    };
    let resourceObj = ReadJsonAsset.readJsonResource(jsonData);
    if (resourceObj.images !== undefined || resourceObj.images.length > 0) {
      this.loadImageArr(resourceObj.images);
    }
    if (resourceObj.sounds !== undefined || resourceObj.sounds.length > 0) {
      this.loadAudioArr(resourceObj.sounds);
    }
    if (resourceObj.jsons !== undefined || resourceObj.jsons.length > 0) {
      loadJsonArr(resourceObj.jsons);
    }
    if (resourceObj.videos !== undefined || resourceObj.videos.length > 0) {
      this.loadVideoArr(resourceObj.videos);
    }
    if (resourceObj.xmls !== undefined || resourceObj.xmls.length > 0) {
      this.loadXmlArr(resourceObj.xmls);
    }
    if (resourceObj.imageObj !== undefined) {
      this.loadImageObj(resourceObj.imageObj);
    }
    if (resourceObj.soundObj !== undefined) {
      this.loadAudioObj(resourceObj.soundObj);
    }
  }

  /**
   * Deprecated
   * //TODO: refactor codebase to use playSoundPromise
   * @param {*} sound 
   * @param {*} callback 
   */
  playSound(sound, callback) {
    if (typeof sound === 'string') {
      this.playOneSound(sound, callback);
    }
    if (sound instanceof Array === true) {
      this.playSounds(sound, callback);
    }
  }

  playOneSound(sound, callback) {
    let music = this.add.audio(sound);
    allSounds.push(music);
    music.play();
    if (callback && typeof callback === 'function') {
      music.onStop.add((obj) => {
        callback();
        obj.onStop.removeAll();
      });
    }
  }


  playSounds(soundArr, callback) {
    let index = 0;
    let play = () => {
      if (index < soundArr.length) {
        this.playOneSound(soundArr[index], () => {
          index++;
          play();
        });
      } else {
        this.util.safeInvoke(callback);
      }
    };
    play();
  }

  //图片，json，和音频（如果有的话），名字都一样。假如不传key，某认用filename当key
  loadSil(fileName, hasSound, key) {
    this.load.image(key || fileName, this.util.fullUrl(fileName, 'image'));
    this.load.json(key || fileName, this.util.fullTxtUrl(fileName) + '.json');
    if (hasSound) {
      this.load.audio(key || fileName, this.util.fullUrl(fileName, 'audio'));
    }
  }

  loadAtlasJSONHash(key, imgPath, jsonPath = '') {
    if (!imgPath) {
      imgPath = key;
    }
    if (!jsonPath) {
      jsonPath = imgPath;
    }
    if (!jsonPath.endsWith('.json')) {
      jsonPath += '.json';
    }
    if (!imgPath.endsWith('.png')) {
      imgPath += '.png';
    }
    this.load.atlasJSONHash(key, this.util.fullUrl(imgPath, 'image'), this.util.fullTxtUrl(
      jsonPath));
  }

  playSoundPromiseByObject(soundObj, {
    stopCurrentAudio = true,
    invokePendingPromise = true
  } = {}) {
    let key = _.isString(soundObj) ? soundObj : soundObj['sound'];
    return this.playSoundPromise(key, {
      stopCurrentAudio: stopCurrentAudio,
      invokePendingPromise: invokePendingPromise
    });
  }


  //重叠检测
  checkOverlap(spriteA, spriteB) {
    let boundsA = spriteA.getBounds();
    let boundsB = spriteB.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB);
  }


  /**
   * 
   * 播放单个声音,默认情况下播放声音之前，会结束当前正在播放的声音并且立即执行当前正在播放声音的回调函数。
   * @param {string} sound 
   * @param {any} [{
   *     stopCurrentAudio = true,在播放传入声音之前，结束正在播放的声音。false，传入的声音和当前正在播放的声音同时播放。
   *     invokePendingPromise = true 只有stopCurrentAudio为true，invokePendingPromise才有效。true 在播放传入声音之前，
   * 结束正在播放的声音并立即执行当前正在播放声音的回调函数。false  不执行当前正在播放声音的回调函数
   *                        
   *   }={}] 
   * @returns Promise
   * @memberof Courseware
   */
  playSoundPromise(sound, {
    stopCurrentAudio = true,
    invokePendingPromise = true
  } = {}) {
    let music = this.add.audio(sound);
    if (stopCurrentAudio) {
      this[stopSoundMethod](invokePendingPromise);
    }
    music.play();
    let promise = new Promise((resolve) => {
      music.resolve = resolve;
      currentSounds.push(music);
      music.onStop.add(() => {
        music.onStop.removeAll();
        currentSounds = [];
        resolve();
      });
    });
    return promise;
  }

  playMultiPromiseObject(soundObjectArr, {
    stopCurrentAudio = true,
    invokePendingPromise = true
  } = {}) {
    let soundArr = soundObjectArr.map((item) => {
      let sound = _.isString(item) ? item : item['sound'];
      return sound;
    });

    return this.playMultiPromise(soundArr, {
      stopCurrentAudio: stopCurrentAudio,
      invokePendingPromise: invokePendingPromise
    });
  }

  /**
   * 播放多个声音
   * @param {String[]} sounds 
   * @param {any} [{
   *     stopCurrentAudio = true,在播放传入声音之前，结束正在播放的声音。false，传入的声音和当前正在播放的声音同时播放。
   *     invokePendingPromise = true 只有stopCurrentAudio为true，invokePendingPromise才有效。true 在播放传入声音之前，
   *                     结束正在播放的声音并立即执行当前正在播放声音的回调函数。false  不执行当前正在播放声音的回调函数
   *   }={}] 
   * return Promise
   */
  playMultiPromise(sounds, {
    stopCurrentAudio = true,
    invokePendingPromise = true
  } = {}) {
    if (stopCurrentAudio) {
      this[stopSoundMethod](invokePendingPromise);
    }
    let music = this.add.audio(sounds[0]);
    music.play();
    let promise = new Promise((resolve) => {
      music.resolve = resolve;
      currentSounds.push(music);
      music.onStop.add(() => {
        playMultilAudio(sounds, 1, resolve);
      });
    });

    let playMultilAudio = (sounds, index = 1, resolve) => {
      if (index >= sounds.length) {
        return resolve();
      }
      let music = this.add.audio(sounds[index]);
      music.play();
      music.resolve = resolve;
      currentSounds.push(music);
      music.onStop.add((obj) => {
        playMultilAudio(sounds, ++index, resolve);
        obj.onStop.removeAll();
        if (index >= sounds.length) {
          currentSounds = [];
        }
      });
    };
    return promise;
  }

  /**
   * 循环播放单个声音，主要用作播放背景声音
   * 
   * @param {string} 声音名称 
   * @param {number} [volume=1] 音量：默认为1
   * @param {bool} 个别情况存在播放背景音乐不循环播放的情况，所以加一个isLoop的设置 
   * @memberof Courseware
   */
  playSoundLoop(sound, volume = 1, isLoop = true) {
    let audio = this.add.audio(sound, volume, isLoop);
    allSounds.push(audio);
    audio.play();
    return audio;
  }

  [stopSoundMethod](invokePendingPromise = true) {
    for (let i = 0; i < currentSounds.length; i++) {
      let item = currentSounds[i];
      item.onStop.removeAll();
      item.stop();
      if (invokePendingPromise)
        item.resolve();
    }
    currentSounds = [];
  }

  soundStopAll(invokePendingPromise = true) {
    this[stopSoundMethod](invokePendingPromise);
  }

  listenProgress() {
    $('canvas').css('opacity', '0');
    $(document.body).append('<p id="progressText">%</p>');
    let $text = $('#progressText');
    $text.css({
      'position': 'fixed',
      'font-size': '50px',
      'pointer-events': 'none',
      'z-index': 10,
      'top': '50%',
      'left': '50%',
      'color': '#888888',
      'transform': 'translate(-50%,-50%) scale(' + window.innerHeight / 600 + ',' + window.innerHeight /
        600 + ')'
    });
    this.load.onFileComplete.add((progress) => {
      $text.text(`${progress}%`);
      if (progress === 100) {
        $text.remove();
        $('canvas').css('opacity', '1');
      }
    }, this);
  }

  createSpriteForObj(Obj, imageIndex = -1) {
    let imageKey = imageIndex !== -1 ? Obj.images[imageIndex] : Obj.image;
    return this.createSprite(Obj.x, Obj.y, imageKey);
  }

  destroy() {
    //关闭所有声音
    this.renderLoop && (this.renderLoop.pause = true);
    this.sound.pauseAll();
    allSounds.forEach(item => {
      item.onStop.removeAll();
    });
    this.soundStopAll(false);
    //清除自动提醒
    if (this.toolbarWarning) {
      this.toolbarWarning.stop();
    }
    //删除所有控件
    this.controls.forEach((item) => {
      try {
        if (item && item.destroy) {
          item.destroy();
        }
      } catch (e) {
        item = undefined;
      }
    });

    // this.cache.destroy();
    allSounds = [];
    currentSounds = [];
    super.destroy();
    classFactory.registeredTypes = new Map();

  }


  /**
   * 初始问题列表
   * @param {number} index 问题数量
   */
  initQuestionList(pageLength) {
    this.buriedPointData.qusitionList = [];
    for (let i = 0; i <= pageLength - 1; i++) {
      this.buriedPointData.qusitionList.push({
        errCount: 0,
        recordInfo: {}
      });
    }
  }

  /**
   * 回答问题
   * 
   * @param {number} index 当前题目索引
   * @param {bool}  result 正确还是错误
   */
  answerQuestion(index, result) {
    this.buriedPointData.qusitionList[index].errCount += (result ? 0 : 1);
  }

  /**
   * 记录录音分数
   * 
   * @param {number} index 当前题目索引
   * @param {string}  score 正确还是错误
   */

  addScore(index, score, audioSrc) {
    this.buriedPointData.qusitionList[index].recordInfo = {
      num: index,
      score: score,
      audioSrc: audioSrc
    };
  }
}
export {
  Courseware
};