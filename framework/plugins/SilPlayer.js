import _ from 'lodash';
import Phaser from 'phaser';
import { CONSTANT } from './../core/Constant';
class SilPlayer extends Phaser.Group  {
  /**播放sil文件插件
   * 注意事项：sil解压后需要把里面txt文件后缀改成json，图片和json名字都改成sil包的名字。
   * 
   * game:Courseware 传入课件对象
   * silName:string sil包的名字
   * options:{
   * 	x:x坐标
   *  y:y坐标
   *  autoPlay:默认false 是否自动播放
   *  needSound:默认false 有些sil里面是有声音的，默认是不播放声音
   *  isLoop:默认true，是否循环播放
   *  playSpeed:播放速度。数字越大播放越慢。1代表最快速度，2表示放慢一半，3表示慢1/3，以此类推
   *  onStop:function 调用stop后会响应的函数
   *  onRepeat:function 如果循环播放，则每次播放一遍后会调用的函数
   *  filters 精灵滤镜,
   *  playCount 循环次数默认为1,
   *  isBigAnimation: 如果动画卡，需要将isBigAnimation设置为true
   * }
   * */
  constructor(game, silName, options = {}, loop) {
    super(game, undefined, 'SilPlayer');
    this.instanceArr = [];
    this.silName = silName;
    this.game = game;
    this.loop = loop || game.logicLoop;
    this.silOptions = _.defaults(options, {
      x: 0,
      y: 0,
      needSound: false,
      isLoop: true,
      playSpeed: 1,
      autoPlay: false,
      isbackRun: false, //少数文件需要倒放
      isPixelPerfectClick: false,
      isBigAnimation: false,
      playCount: 1
    });
    this.playCount = this.silOptions.playCount;
    this.filters = this.silOptions.filters;
    this.isBigAnimation = this.silOptions.isBigAnimation;
    this.tickIndex = 0;
    this.frameIndex = 0;
    this.state = CONSTANT.STOP;
    this.jsonData = game.cache.getJSON(silName);
    this.baseTexture = game.cache.getBaseTexture(silName);
    if (this.isBigAnimation)
      this.drawAnimationAllFrame();
    this.drawFrameById(0);
    this.updateId = Symbol();
    if (this.silOptions.autoPlay) {
      this.start();
    }
    this.position.set(this.silOptions.x, this.silOptions.y);
  }

  clear() {
    while (this.children.length) {
      this.children[0].destroy();
    }
  }

  drawInstance(instanceIndex) {
    let item = this.jsonData.instances[instanceIndex];
    let image = this.game.add.tileSprite(0, 0, item.width, item.height,
      this.silName);
    image.tilePosition.x = -item.x;
    image.tilePosition.y = -item.y;
    image.inputEnabled = true;
    image.input.pixelPerfectClick = this.silOptions.isPixelPerfectClick;
    return image;
  }

  drawAnimationFrame() {
    this.clear();
    let instances = this.jsonData.frames[
      this.silOptions.isbackRun ? this.jsonData.frames.length - 1 - this.frameIndex : this.frameIndex].instances;
    for (let item of instances) {
      if (item.instanceIndex === undefined)
        continue;
      let objIns = this.drawInstance(item.instanceIndex);
      objIns.position.x = item.translate[0];
      objIns.position.y = item.translate[1];
      objIns.scale.set(item.scale[0], item.scale[1]);
      objIns.rotation = (item.scale[1] < 0 ? -item.rotation : item.rotation);
      this.addChild(objIns);
    }
  }

  drawAnimationAllFrame() {
    this.allFrameSprite = [];
    let instances = this.findMaxInstances();
    for (let item of instances) {
      if (item.instanceIndex === undefined)
        continue;
      let objIns = this.drawInstance(item.instanceIndex);
      objIns.position.x = item.translate[0];
      objIns.position.y = item.translate[1];
      objIns.scale.set(item.scale[0], item.scale[1]);
      objIns.rotation = (item.scale[1] < 0 ? -item.rotation : item.rotation);
      this.allFrameSprite.push(objIns);
      this.addChild(objIns);
    }
  }


  findMaxInstances() {
    let count = 0;
    let maxInstance;
    for (let i = 0; i < this.jsonData.frames.length; i++) {
      let instances = this.jsonData.frames[i].instances;
      if (instances.length > count) {
        count = instances.length;
        maxInstance = instances;
      }
    }
    return maxInstance;
  }


  playAnimation() {
    let index = this.silOptions.isbackRun ? this.jsonData.frames.length - 1 - this.frameIndex : this.frameIndex;
    let instances = this.jsonData.frames[index].instances;
    instances.forEach((item, i) => {
      let sprite = this.allFrameSprite[i];
      let position = this.jsonData.instances[item.instanceIndex];
      if (item.instanceIndex !== undefined) {
        if (sprite) {
          sprite.bringToTop();
          sprite.alpha = 1;
          sprite.tilePosition.x = -position.x;
          sprite.tilePosition.y = -position.y;
          sprite.width = position.width;
          sprite.height = position.height;
          sprite.position.x = item.translate[0];
          sprite.position.y = item.translate[1];
          sprite.scale.set(item.scale[0], item.scale[1]);
          sprite.rotation = (item.scale[1] < 0 ? -item.rotation : item.rotation);
          //sprite.bringToTop();
        }
      } else {
        sprite.alpha = 0;
      }
    });
    if (instances.length < this.allFrameSprite.length) {
      for (let i = instances.length; i < this.allFrameSprite.length; i++) {
        this.allFrameSprite[i].alpha = 0;
      }
    }

  }

  drawFrameById(id) {
    this.frameIndex = id;
    if (!this.isBigAnimation)
      this.drawAnimationFrame();
    else
      this.playAnimation();
  }

  start() {
    if (this.state !== CONSTANT.STOP) {
      return;
    }
    this.state = CONSTANT.START;
    this.loop.add(() => {
      this.update();
    }, this.updateId);
  }

  stop() {
    this.frameIndex = 0;
    this.playCount = this.silOptions.playCount;
    this.state = CONSTANT.STOP;
    this.loop.remove(this.updateId);
    this.game.util.safeInvoke(this.silOptions.onStop);
  }

  stopNoGoFirst() {
    this.playCount = this.silOptions.playCount;
    this.state = CONSTANT.STOP;
    this.loop.remove(this.updateId);
    this.game.util.safeInvoke(this.silOptions.onStop);
  }

  pause() {
    if (this.state === CONSTANT.START) {
      this.state = CONSTANT.PAUSE;
    }
  }

  resume() {
    if (this.state === CONSTANT.PAUSE) {
      this.state = CONSTANT.START;
    }
  }

  restart() {
    if (this.state === CONSTANT.STOP) {
      this.state = CONSTANT.START;
      this.frameIndex = 0;
    }
  }

  update() {
    if (this.state !== Symbol.for('start')) {
      return;
    }
    this.tickIndex++;
    if (this.tickIndex % this.silOptions.playSpeed === 0) {
      if (this.isBigAnimation)
        this.playAnimation();
      else
        this.drawAnimationFrame();
      if (this.frameIndex === 0 && this.silOptions.needSound) {
        this.game.playSoundPromise(this.silName);
      }
      if (++this.frameIndex < this.jsonData.frames.length) {
        return;
      }
      if (this.playCount > 1 && !this.silOptions.isLoop) {
        this.frameIndex = 0;
        this.playCount--;
        this.game.util.safeInvoke(this.silOptions.onRepeat);
        return;
      }
      if (this.silOptions.isLoop) {
        this.frameIndex = 0;
        this.game.util.safeInvoke(this.silOptions.onRepeat);
      } else {
        this.stop();
      }
    }
  }

  updateBySetInterval() {
    setInterval(() => {
      this.tickIndex++;
      if (this.tickIndex % this.silOptions.playSpeed === 0) {
        if (this.isBigAnimation)
          this.playAnimation();
        else
          this.drawAnimationFrame();
        if (this.frameIndex === 0 && this.silOptions.needSound) {
          this.game.playSoundPromise(this.silName);
        }
        if (++this.frameIndex < this.jsonData.frames.length) {
          return;
        } else {
          if (this.silOptions.isLoop) {
            this.frameIndex = 0;
            this.game.util.safeInvoke(this.silOptions.onRepeat);
          }
        }
      }
    }, 17);
  }

  destroy() {
    if (this.state !== CONSTANT.STOP) {
      this.stop();
    }
    super.destroy();
  }
}

export {
  SilPlayer
};