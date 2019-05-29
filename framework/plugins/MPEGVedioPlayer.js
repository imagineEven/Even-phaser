import { JSMpeg } from '../video/jsmpeg.js';
import { CONSTANT } from '../core/CONSTANT';
import { Device } from './../device/Device.js';
import Phaser from 'phaser';

class MPEGVedioPlayer extends Phaser.Sprite {

  constructor(game, x, y, vedioName, autoPlay = true, loop = false, hasSound = true) {
    super(game, x, y);
    game.world.addChild(this);
    if (game.controls) {
      game.controls.push(this);
    }
    this.game = game;
    this.inputEnabled = true; //默认开启点击防止穿透
    let bitData = game.cache.getBinary(vedioName);
    this.frameCount = 0;
    this.life = 0;
    this.hasPaused = false;
    this.hasSound = hasSound;
    this.isPlay = false;
    this.device = new Device();
    this.events.onStop = new Phaser.Signal();
    this.count = 0;
    if (this.game.isMobile) {
      this.scale.set(CONSTANT.VIDEO_SCALE, CONSTANT.VIDEO_SCALE);
    }
    this.player = new JSMpeg.PhaserPlayer(bitData, {
      loop: loop,
      autoplay: false,
      audio: false,
      renderCallBack: (phaserBitMapRender, YCbCrToRGBA, option) => {
        if (this.isDestroy) {
          return;
        }
        if (!this.bmp) {
          this.bmp = game.make.bitmapData(option.width, option.height);
        }
        YCbCrToRGBA.call(phaserBitMapRender, option.y, option.cb, option.cr, option.imageData.data);
        this.bmp.fill(0, 0, 0, 1);
        this.bmp.context.putImageData(option.imageData, 0, 0);
        this.loadTexture(this.bmp);
      }
    }, () => {
      if (this.isDestroy) {
        return;
      }
      this.events.onStop.dispatch(this);
    });
    this.music = game.add.audio(vedioName);
    this.music.loop = loop;
    if (autoPlay) {
      this.game.util.waitByPromise(100)
        .then(() => {
          this.play();
        });
    }
  }

  play() {
    if (this.isDestroy) {
      return;
    }
    this.canDestroy = 1;
    this.life = 0;
    if (this.music) {
      this.music.play();
    }
    this.player.play();
    this.game.logicLoop.add(() => {
      this.update();
    }, CONSTANT.VIDEO_PLAY);
    this.life = new Date().getTime();

    if (this.device.checkPlatform() === this.device.deviceType.ios && this.hasSound) {
      this.playVideoSound();
    }
  }

  playVideoSound() {
    this.music.play();
    this.game.logicLoop.add(() => {
      this.update();
    }, CONSTANT.VIDEO_PLAY);
  }

  pause() {
    if (this.music) {
      this.music.pause();
    }
    this.player.pause();
  }

  resume() {
    if (this.music) {
      this.music.resume();
    }
    this.player.play();
  }

  stop() {
    if (this.isDestroy) {
      return;
    }
    if (this.music) {
      this.music.stop();
    }
    this.player.stop();
    this.events.onStop.dispatch(this);
  }

  destroy() {
    if (this.isDestroy) {
      return;
    }
    this.isDestroy = true;
    this.game.logicLoop.remove(CONSTANT.VIDEO_PLAY);
    super.destroy();
    if (this.music) {
      this.music.destroy();
    }
    this.player.destroy();

  }

  destroys() {
    if (this.isDestroy) {
      return;
    }
    this.isDestroy = true;
    this.game.logicLoop.remove(CONSTANT.VIDEO_PLAY);
    super.destroy();
    if (this.music) {
      this.music.destroy();
    }
    this.player.destroy();
  }

  update() {
    if (this.isDestroy) {
      return;
    }
    if (this.player.isLoading && !this.hasPaused) {
      this.hasPaused = true;
      if (this.music) {
        this.music.pause();
      }
    }
    if (!this.player.isLoading && this.hasPaused) {
      this.hasPaused = false;
      if (this.music) {
        this.music.resume();
      }
    }
  }

  set isIos(isIosPlatform) {
    if (isIosPlatform) {
      this.events.onInputDown.add(this.iosVideoInputEvents, this);
    }
  }

  iosVideoInputEvents() {
    this.events.onInputDown.remove(this.iosVideoInputEvents, this);
    this.game.util.waitByPromise(50)
      .then(() => {
        this.play();
      });
  }

}

export { MPEGVedioPlayer };