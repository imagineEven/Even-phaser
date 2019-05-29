import $ from 'jquery';
import _ from 'lodash';
import { JSMpeg } from './jsmpeg.js';
import { Device } from './../device/Device.js';
import { Options } from './../core/Options.js';
import { CONSTANT } from './../core/Constant';
class VCVideoPlayer {
  constructor(courseware) {
    this.courseware = courseware;
  }

  createVideoPlay(urlStr, options = {}, callback) {
    if (this.canDestroy) {
      this.destroy();
      this.canDestroy = 0;
    }
    this.destroyFlag = false;
    this.soundUrl = urlStr.replace(/.mp4/, '').replace(/.ts/, '');
    urlStr = urlStr.replace(/.mp4/, '.ts');
    urlStr = `${Options.baseUrl}${Options.pathVideo}${urlStr}`;
    if (urlStr.indexOf('.ts') === -1) {
      urlStr += '.ts';
    }
    this.device = new Device();
    let height = window.innerHeight;
    this.options = _.defaults(options, {
      width: height / 3 * 4,
      height: height,
      w: height / 3 * 4,
      h: height,
      loop: false,
      disableGl: false,
      autoplay: true,
      hasSound: true,
      top: '50%',
      left: '50%'
    });
    this.canvas = this.create(this.options);
    this.player = new JSMpeg.Player(urlStr, {
      loop: this.options.loop,
      disableGl: this.options.disableGl,
      autoplay: false,
      canvas: this.canvas
    }, callback);

    this.life = 0;

    this.hasPaused = false;
    this.music = this.courseware.add.audio(this.soundUrl);
    if (this.options.autoplay) {
      this.play();
    }
  }

  create(options) {
    let canvas = document.createElement('canvas');
    canvas.width = options.w;
    canvas.height = options.h;
    $(canvas).css({
      'height': options.height + 'px',
      'width': options.width + 'px',
      'position': 'fixed',
      'transform': 'translate(-50%,-50%)',
      'top': options.top,
      'left': options.left,
      'z-index':options.zindex
    });
    document.body.appendChild(canvas);
    return canvas;
  }

  update() {
    if (this.player.isLoading && !this.hasPaused) {
      this.hasPaused = true;
      this.music.pause();
    }
    if (!this.player.isLoading && this.hasPaused) {
      this.hasPaused = false;
      this.music.resume();
    }
  }

  destroy() {
    this.destroyFlag = true;
    this.player.destroy();
    $(this.canvas).remove();
    this.courseware.logicLoop.remove(CONSTANT.VIDEO_PLAY);
  }

  playVideoSound() {
    this.music.play();
    this.courseware.logicLoop.add(() => {
 this.update(); 
}, CONSTANT.VIDEO_PLAY);
  }

  play() {
    this.canDestroy = 1;
    this.life = 0;
    this.player.play();
    this.life = new Date().getTime();
    if (this.device.checkPlatform() === this.device.deviceType.ios && this.options.hasSound) {
      this.playVideoSound();
    }
  }

  pause(isPause) {
    if (!this.player || this.player.completed || !this.canDestroy) {
      return;
    }
    if (!isPause) {
      this.player.pause();
    } else
      this.player.play();
  }
}

export {
  VCVideoPlayer
};