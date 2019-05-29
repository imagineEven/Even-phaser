import {
  Options
} from '../core/Options';
const CONTROLLERS = {
  MOBILE: Symbol.for('createPlusVPlayer'),
  PC: Symbol.for('createPhaserVPlayer'),
};
import Phaser from 'phaser';
import {
  MPEGVedioPlayer
} from './MPEGVedioPlayer.js';
import _ from 'lodash';
class PlusVideoPlayer {
  constructor(
    game,
    x,
    y,
    videoName,
    autoPlay = true,
    loop = false,
    hasSound = true, {
      width = Options.renderOptions.width,
      height = Options.renderOptions.height,
    } = {},
    volume = 1
  ) {
    this.game = game;
    this._width = width;
    this._height = height;
    this._x = x;
    this._y = y;
    this._loop = loop;
    this._hasSound = hasSound;
    this._autoPlay = autoPlay;
    this._videoName = videoName;
    this._volume = volume;
    this.player = null;
    this.lastFrame = null;
    this.currentScale = window.innerWidth / window.innerHeight > 4 / 3 ?
      window.innerHeight / this.game.height :
      window.innerWidth / this.game.width;
    this.events = {
      onStop: new Phaser.Signal(),
      onInputDown: new Phaser.Signal(),
      onInputUp: new Phaser.Signal(),
    };
    this.offsetx =
      window.innerWidth / 2 -
      this.game.width * this.currentScale / 2 +
      this._x * this.currentScale;
    this.offsety =
      window.innerHeight / 2 -
      this.game.height * this.currentScale / 2 +
      this._y * this.currentScale;

    this.anchor = {
      root: this,
      _x: 0,
      _y: 0,
      x: {
        set(anchorX) {
          this.root.setXAnchor(anchorX);
          this._x = anchorX;
        },
        get() {
          return this._x;
        },
      },
      y: {
        set(anchorY) {
          this.root.setYAnchor(anchorY);
          this._y = anchorY;
        },
        get() {
          return this._y;
        },
      },
      set(anchorX, anchorY) {
        if (anchorY === undefined) {
          anchorY = anchorX;
        }
        this.root.setXYAnchor(anchorX, anchorY);
        this._x = anchorX;
        this._y = anchorY;
      },
    };
    this.init();
  }

  init() {
    this.contoller = window.plus ? CONTROLLERS.MOBILE : CONTROLLERS.PC;
    this[this.contoller]();
    if (this._autoPlay) {
      this.player.play();
    }
    if (this.player instanceof Phaser.Sprite) {
      this.player.events.onInputDown.add(() => {
        this.events.onInputDown.dispatch(this.player);
      });
      this.player.events.onInputUp.add(() => {
        this.events.onInputUp.dispatch(this.player);
      });
    }
  }

  setXAnchor(anchorX) {
    if (this.player instanceof Phaser.Sprite) {
      this.player.anchor.x = anchorX;
    } else {
      let offsetx =
        this._x * this.currentScale +
        window.innerWidth / 2 -
        this.game.width * this.currentScale / 2 -
        this._width * this.currentScale * anchorX;
      _.assign(this.playerStyles, {
        left: offsetx + 'px',
      });
      this.player.setStyles(this.playerStyles);
    }
  }

  setYAnchor(anchorY) {
    if (this.player instanceof Phaser.Sprite) {
      this.player.anchor.y = anchorY;
    } else {
      let offsety =
        this._y * this.currentScale +
        window.innerHeight / 2 -
        this.game.height * this.currentScale / 2 -
        this._height * this.currentScale * anchorY;
      _.assign(this.playerStyles, {
        top: offsety + 'px',
      });
      this.player.setStyles(this.playerStyles);
    }
  }

  setXYAnchor(anchorX, anchorY) {
    if (this.player instanceof Phaser.Sprite) {
      this.player.anchor.set(anchorX, anchorY);
    } else {
      let offsety =
        this._y * this.currentScale +
        window.innerHeight / 2 -
        this.game.height * this.currentScale / 2 -
        this._height * this.currentScale * anchorY;
      let offsetx =
        this._x * this.currentScale +
        window.innerWidth / 2 -
        this.game.width * this.currentScale / 2 -
        this._width * this.currentScale * anchorX;
      _.assign(this.playerStyles, {
        top: offsety + 'px',
        left: offsetx + 'px',
      });
      this.player.setStyles(this.playerStyles);
    }
  }

  set width(w) {
    if (this.player instanceof Phaser.Sprite) {
      this.player.width = w;
    } else {
      _.assign(this.playerStyles, {
        width: w * this.currentScale + 'px',
      });
      this.player.setStyles(this.playerStyles);
    }
    this._width = w;
  }

  get width() {
    return this._width;
  }

  set height(h) {
    if (this.player instanceof Phaser.Sprite) {
      this.player.height = h;
    } else {
      _.assign(this.playerStyles, {
        height: h * this.currentScale + 'px',
      });
      this.player.setStyles(this.playerStyles);
    }
    this._height = h;
  }

  get height() {
    return this._height;
  }

  set x(x) {
    if (this.player instanceof Phaser.Sprite) {
      this.player.x = x;
    } else {
      this.player.setStyles({
        left: x * this.currentScale +
          window.innerWidth / 2 -
          this.game.width * this.currentScale / 2 +
          'px',
      });
    }
    this._x = x;
  }

  get x() {
    return this._x;
  }

  set y(y) {
    if (this.player instanceof Phaser.Sprite) {
      this.player.y = y;
    } else {
      this.player.setStyles({
        top: y * this.currentScale +
          window.innerHeight / 2 -
          this.game.height * this.currentScale / 2 +
          'px',
      });
    }
    this._y = y;
  }

  get y() {
    return this._y;
  }

  set visible(b) {
    if (!this.player) return;
    if (this.player instanceof Phaser.Sprite) {
      this.player.visible = b;
    } else {
      b ? this.player.show() : this.player.hide();
    }
    this._visible = b;
  }

  get visible() {
    return this._visible;
  }

  playSound(key) {
    if (this.contoller === CONTROLLERS.PC) {
      this.game.playSoundPromise(key, {
        stopCurrentAudio: false
      });
    }
  }

  [Symbol.for('createPlusVPlayer')]() {
    let videoSrc;
    if (!~this._videoName.indexOf('http')) {
      videoSrc = `${Options.baseUrl}${Options.mp4Video}${this._videoName}.mp4`;
    } else {
      videoSrc = this._videoName;
    }
    let canvansWidth = this.game.width * this.currentScale;
    let canvansHeight = this.game.height * this.currentScale;
    let offsetx =
      window.innerWidth / 2 - canvansWidth / 2 + this._x * this.currentScale;
    let offsety =
      window.innerHeight / 2 - canvansHeight / 2 + this._y * this.currentScale;
    this.playerStyles = {
      src: videoSrc,
      top: `${offsety}px`,
      left: `${offsetx}px`,
      width: this._width * this.currentScale + 'px',
      height: this._height * this.currentScale + 'px',
      position: 'absolute',
      controls: false,
      'show-progress': false,
      'show-fullscreee-btn': false,
      'show-play-btn': false,
      'show-center-play-btn': false,
      'enable-progress-gesture': false
    };
    this.player = plus.video.createVideoPlayer(
      'videoplayer',
      this.playerStyles
    );
    plus.webview.currentWebview().append(this.player);
    this.player.addEventListener('ended', event => {
      //创建最后一帧图片
      this.lastFrame = this.game.add.sprite(this._x, this._y, this._videoName);
      this.lastFrame.width = this._width;
      this.lastFrame.height = this._height;
      this.lastFrame.anchor.set(this.anchor.x, this.anchor.y);
      this.destroy(false);
      this.events.onStop.dispatch(this.player, event);
    });
    window.plusVPlayers.push(this.player);
  }

  [Symbol.for('createPhaserVPlayer')]() {
    this.player = new MPEGVedioPlayer(
      this.game,
      this._x,
      this._y,
      this._videoName,
      false,
      this._loop,
      this._hasSound
    );
    this.player.width = this._width;
    this.player.height = this._height;
    this.player.events.onStop.add(() => {
      this.events.onStop.dispatch(this.player);
    });
  }

  play() {
    this.player.play();
  }

  stop() {
    this.player.stop();
  }

  destroy(deleteLast = true) {
    deleteLast && this.lastFrame && this.lastFrame.destroy();
    if (!this.player) return;
    if (this.player instanceof Phaser.Sprite) {
      this.player.destroy();
    } else {
      this.player.close();
    }
    this.player = null;
  }
}

export {
  PlusVideoPlayer
};