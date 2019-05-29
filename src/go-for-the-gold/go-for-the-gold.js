import {
  Courseware
} from '../../framework/core/Courseware';
import {
  PlusVideoPlayer
} from './../../framework/plugins/PlusVideoPlayer';
import {
  TextureFlasher
} from './../../framework/plugins/TextureFlasher';
import {
  IndicatorBnt
} from '../../framework/plugins/IndicatorBnt';
import { CONSTANT } from '../../framework/core/Constant';
import staticJson from './staticJson.json';
import positionJson from './positionJson.json';
import Game from './game';
import $ from 'jquery';
import _ from 'lodash';
import {
  Device
} from './../../framework/device/Device';

class GoForTheGold extends Courseware {
  constructor(data) {
    let preload = () => {
      this.loadPageResources(this.data, staticJson);
      _.flattenDeep(staticJson.personSil).forEach(child => {
        this.loadSil(child);
      });
      staticJson.monster1.forEach(child => {
        this.loadSil(child);
      });
    };

    let create = () => {
      //当前页数
      this.page = 0;
      //视频播放完后的黑屏
      let bmd = this.add.bitmapData(800, 600);
      bmd.ctx.beginPath();
      bmd.ctx.rect(0, 0, 800, 600);
      bmd.ctx.fillStyle = '#000000';
      bmd.ctx.fill();
      this.blackFrame = this.add.sprite(0, 0, bmd);
      //创建视频层级
      this.videoGroup = this.add.group();
      //创建背景层
      this.gameStage = this.add.group();
      //创建按钮层级
      this.btnStage = this.add.group();

      //穿件背景图片
      this.back = this.createSprite(0, 0, staticJson.imgSource.mian_img);
      //初始分数
      this.initScreen = 30;
      this.createIntegrator({
        x: 20,
        y: 532
      });
      this.integrator.createFraction(this.initScreen);
      //提交按钮
      this.submit = this.createSprite(400, 543, staticJson.imgSource.unsurebnt);
      this.submit.scale.set(0.4);
      this.submit.anchor.set(0.5);
      this.submit.flasher = new TextureFlasher(this, this.submit, [staticJson.imgSource.surebnt1.image, staticJson.imgSource.surebnt2.image], {
        duration: 300
      });
      this.submit.events.onInputDown.add(() => {
        this.util.setObjectArrayClicked(this.btnGroup, false);
        this.submit.flasher.stop();
        this.submit.loadTexture(staticJson.imgSource.unsurebnt.image);
        this.submitEvent();
      });

      //创建正误按钮
      this.IndicatorBnt = new IndicatorBnt(this, this.data.page.length, {
        height: 583
      });

      let video = new PlusVideoPlayer(this, 0, 0, staticJson.beginVideo.video, true, false, false);
      let bgSound = this.playSoundLoop(staticJson.beginVideo.sound, 1, false);
      video.events.onStop.add(() => {
        bgSound.destroy();
        video.destroy();
        this.loopGame();
      });
    };
    let update = () => {
      if (this.lastGame) {
        this.lastGame.update();
      }
    };
    super({}, preload, create, update, null, '', true);
    this.data = data;
    let device = new Device();
    this.isMobile = (device.checkPlatform().toString() !== device.deviceType.win.toString());
    this.staticRes = {};
    this.createGameBar = (sound, readForward) => {
      this.createTipBar(sound, readForward);
    };
    this.clearGameBar = () => {
      this.clearTipBar();
    };
    this.createEndBar = () => {
      this.createEnds();
    };
  }

  loopGame() {
    this.blackFrame.visible = false;
    this.currentData = this.data.page[this.page];
    this.answerNum = 0; //回答次数
    this.createToolbar();
    this.createBtnArr();
    this.currentChooseId;
    this.currentChooseIndex;
    //创建图片
    this.centerPicture = this.createSprite(400, 200, this.currentData);
    this.centerPicture.scale.set(0.8);
    this.centerPicture.anchor.set(0.5);
    this.videoGroup.add(this.centerPicture);

    let promise;

    if (!this.page) {
      promise = this.playMultiPromiseObject(staticJson.beginTip.sounds);
    } else {
      promise = this.playSoundPromise(staticJson.beginTip.sounds[1]);
    }

    promise.then(() => {
      return this.oneByoneHeightLight();
    }).then(() => {
      this.btnGroup.children.forEach(child => {
        child.loadTexture(staticJson.imgSource.bnt_bg.image);
      });
      this.centerPicture.destroy();
      this.createVideo(this.currentData.video[0], () => {
        this.playBtn.alpha = 1;
        this.playBtn.inputEnabled = true;
        this.createTipBar(staticJson.clickFromVideo.sound, true);
        this.util.setObjectArrayClicked(this.btnGroup, true);
      });
    });

    //创建按钮
    this.playBtn = this.createSprite(400, 220, staticJson.imgSource.play_bnt);
    this.playBtn.anchor.set(0.5);
    this.playBtn.alpha = 0;
    this.playBtn.events.onInputDown.add(() => {
      this.createToolbar();
      this.playAgain(this.currentData.video[0]);
    });
  }

  //cleanAll
  cleanAll() {
    this.util.batchDestroy(this.btnGroup, this.playBtn, this.mianvideo);
  }

  //submitEvent
  submitEvent() {
    let number = 0;
    let score;
    this.clearTipBar();
    this.submit.isChoose = false;
    this.submit.inputEnabled = false;
    if (!this.currentChooseId) {
      if (!this.answerNum) {
        this.IndicatorBnt.set(this.page, 'green');
        number = 5;
      } else if (this.answerNum === 1) {
        this.IndicatorBnt.set(this.page, 'yellow');
      } else {
        this.IndicatorBnt.set(this.page, 'red');
      }
      this.playMultiPromise([_.shuffle(staticJson.right.sounds)[0], this.currentSound]).then(() => {
        this.playBtn.alpha = 0;
        this.playBtn.inputEnabled = false;
        // this.mianvideo.destroy();
        this.createVideo(this.currentData.video[1], () => {
          this.playSoundPromise(this.currentData.tip.sound).then(() => {
            score = !this.page ? this.initScreen : this.incomingTime;
            this.playSoundPromise(staticJson.scorePlus.sound);
            return this.integrator.add(score, number);
          }).then(() => {
            this.nextQuestion();
          });
        });
      });
    } else {
      this.answerNum++;
      this.btnGroup.children.forEach(btn => {
        btn.children[1].alpha = 1;
        btn.children[1].inputEnabled = true;
      });
      let curBnt = this.btnGroup.children[this.currentChooseIndex];
      curBnt.isChoose = true;
      curBnt.loadTexture(curBnt.false);
      curBnt.children[0].fill = '#A0A0A0';
      this.submit.loadTexture(staticJson.imgSource.unsurebnt.image);

      if (this.answerNum === 1) {
        this.IndicatorBnt.set(this.page, 'red');
        this.playSoundPromise(staticJson.wrongCheck.sound).then(() => {
          return this.playMultiPromiseObject([staticJson.whichFixVideo.sound, staticJson.seeAgain.sound]);
        }).then(() => {
          this.createTipBar(staticJson.seeAgain.sound, false);
          this.util.setObjectArrayClicked(this.btnGroup, true);
        });
      } else {
        this.playSoundPromise(staticJson.wrongCheck.sound).then(() => {
          this.btnGroup.children.forEach(btn => {
            btn.children[1].loadTexture(staticJson.imgSource.bnt_video0.image);
          });
          return this.playSoundPromise(staticJson.seeWordMeans.sound);
        }).then(() => {
          this.btnGroup.children.forEach(btn => {
            btn.children[1].loadTexture(staticJson.imgSource.bnt_video1.image);
          });
          this.util.setObjectArrayClicked(this.btnGroup, true);
          let flash = (flag) => {
            let image = flag ? 'red' : 'green';
            this.btnGroup.children.forEach(child => {
              let bnt = child.children[1];
              bnt.loadTexture(bnt[image].image);
            });
          };
          this.createTipBar(staticJson.seeWordMeans.sound, false, () => {
            flash(false);
          }, () => {
            flash(true);
          });
        });
      }
    }
  }

  //nextQuestion
  nextQuestion() {
    this.page++;
    if (this.page === this.data.page.length) {
      this.util.batchDestroy(this.playBtn, this.mianvideo);
      this.integrator.flasher.start();
      this.playSoundPromise(staticJson.youEarnExtraTime.sound).then(() => {
        this.integrator.flasher.stop();
        this.util.batchDestroy(this.btnGroup);
        this.selectQuestionOver();
        this.lastGame = new Game(this, this.incomingTime);
      });
    } else {
      this.cleanAll();
      this.loopGame();
    }
  }

  //在此播放事件
  playAgain(url) {
    this.playBtn.alpha = 0;
    this.playBtn.inputEnabled = false;
    this.mianvideo && this.mianvideo.destroy();
    this.createVideo(url, () => {
      this.playBtn.alpha = 1;
      this.playBtn.inputEnabled = true;
      this.createTipBar(staticJson.clickFromVideo.sound, false);
    });
  }

  //创建视频
  createVideo(url, callback = () => { }) {
    this.mainvideo = new PlusVideoPlayer(this, 104, 20, url, true, false, true, {
      width: 592,
      height: 378
    });
    this.playBtn.bringToTop();
    this.submit.inputEnabled = false;
    this.mainvideo.events.onStop.add(() => {
      this.submit.inputEnabled = !!this.submit.isChoose;
      callback();
    });
  }

  createBtnArr() {
    //数组按钮
    this.btnGroup = this.add.group();
    //生成三个按钮组
    let btnArray = [];
    this.currentData.text.forEach((word, index) => {
      let btn = this.createSprite(0, 0, staticJson.imgSource.bnt_bg);
      let txt = this.add.text(0, 0, word, {
        fontSize: 26,
        fill: '#000',
        font: CONSTANT.DEFAULT_FONT,
        fontWeight: 'bold'
      });
      let playVideo = this.createSprite(90, 0, staticJson.imgSource.bnt_video1);
      playVideo.anchor.set(0.5);
      playVideo.green = staticJson.imgSource.bnt_video0;
      playVideo.red = staticJson.imgSource.bnt_video1;
      btn.isChoose = false;
      playVideo.alpha = 0;
      playVideo.video = this.currentData.text_video[index];
      txt.anchor.set(0.5);
      btn.anchor.set(0.5);
      btn.Id = index;
      btn.normal = staticJson.imgSource.bnt_bg.image;
      btn.flasher = staticJson.imgSource.bnt_flash.image;
      btn.false = staticJson.imgSource.false_bnt_bg.image;
      btn.sound = this.currentData.sounds[index];
      btn.addChild(txt);
      btn.addChild(playVideo);
      btn.inputEnabled = false;
      playVideo.events.onInputDown.add((event) => {
        event.loadTexture(staticJson.imgSource.bnt_video0.image);
      });
      playVideo.events.onInputUp.add((event) => {
        event.loadTexture(staticJson.imgSource.bnt_video1.image);
        this.btnPlayVideoEvent(event.video);
      });
      btn.events.onInputDown.add((event) => {
        this.btnEvent(event);
        this.currentChooseId = event.Id;
        this.currentChooseIndex = event.Index;
        this.currentSound = event.sound;
        if (!event.isChoose) {
          this.submit.loadTexture(staticJson.imgSource.surebnt1.image);
          this.submit.flasher.start();
          this.submit.inputEnabled = true;
          this.submit.isChoose = true;
        }
      });
      btnArray.push(btn);
    });
    _.shuffle(btnArray).forEach((btn, index) => {
      btn.Index = index;
      btn.x = positionJson.btnPosition[index].x;
      btn.y = positionJson.btnPosition[index].y;
      this.btnGroup.add(btn);
    });
  }

  //选项按钮点击事件
  btnEvent(event) {
    this.btnGroup.children.forEach(child => {
      if (!child.isChoose) {
        child.loadTexture(child.normal);
      }
    });
    if (!event.isChoose) {
      this.playSoundPromiseByObject(event.sound);
      event.loadTexture(event.flasher);
    }
  }

  //按钮播放视频事件
  btnPlayVideoEvent(video) {
    this.clearTipBar();
    this.playBtn.alpha = 0;
    this.playBtn.inputEnabled = false;
    this.setBtnsClicked(false);
    if (this.mainvideo) {
      this.mainvideo.destroy();
    }
    this.blackFrame.visible = false;

    let player = new PlusVideoPlayer(this, 104, 20, video, true, false, true, {
      width: 592,
      height: 378
    });
    player.events.onStop.add(() => {
      player.destroy();
      this.blackFrame.visible = true;
      this.playBtn.alpha = 1;
      this.playBtn.inputEnabled = true;
      this.setBtnsClicked(true);
      this.createTipBar(this.toolSound, false);
    });
  }

  setBtnsClicked(canClicked) {
    this.util.setObjectArrayClicked(this.btnGroup.children, canClicked);
    this.btnGroup.children.forEach((child) => {
      child.children[1].inputEnabled = canClicked;
    });
  }

  //创建积分器
  createIntegrator(options = {}) {
    this.integrator = this.createSprite(options.x, options.y, staticJson.imgSource.score_meun);
    this.integrator.flasher = new TextureFlasher(this, this.integrator, [staticJson.imgSource.score_meun.image, staticJson.imgSource.score_meun_light.image], {
      duration: 300
    });
    this.integrator.createFraction = (time) => {
      this.incomingTime = time;
      if (time < 10) {
        time = '0' + time;
      }
      let numArray = time.toString().split('');
      numArray.forEach((num, index) => {
        let picNum = parseInt(num);
        let screen = this.createSprite(50 + index * 30, 8, staticJson.score_array.images[picNum]);
        screen.scale.set(0.6);
        this.integrator.addChild(screen);
      });
    };
    this.integrator.add = (time, add) => {
      let promise = Promise.resolve();
      for (let i = 1; i <= add; i++) {
        promise = promise.then(() => changeScreen(i));
      }

      let changeScreen = (item) => {
        this.integrator.removeChildren();
        let currentScreen = time + item;
        this.integrator.createFraction(currentScreen);
        return this.util.waitByPromise(300);
      };
      return promise;
    };

    this.integrator.reduce = (time) => {
      let promise = Promise.resolve();
      for (let i = time; i >= 0; i--) {
        promise = promise.then(() => changeScreen(i));
      }

      let changeScreen = (item) => {
        this.integrator.removeChildren();
        let currentScreen = item;
        this.integrator.createFraction(currentScreen);
        return this.util.waitByPromise(1000);
      };
      return promise;
    };
  }

  //selectQuestionOver
  selectQuestionOver() {
    this.util.batchDestroy(this.back, this.IndicatorBnt.bntGroup, this.submit, this.integrator);
  }

  //依次高亮
  oneByoneHeightLight() {
    let promise = Promise.resolve();
    this.btnGroup.children.forEach((item, index) => {
      promise = promise.then(() => backGroudFlasher(item, index));
    });
    let backGroudFlasher = (btn) => {
      this.btnGroup.children.forEach(child => {
        child.loadTexture(staticJson.imgSource.bnt_bg.image);
      });
      btn.loadTexture(staticJson.imgSource.bnt_flash.image);
      return this.playSoundPromiseByObject(btn.sound);
    };
    return promise;
  }

  createTipBar(sound, readForward, startCallback = () => { }, endCallback = () => { }) {
    sound = Array.isArray(sound) ? sound : [sound];
    this.toolSound = sound;
    this.createToolbar({
      soundData: {
        autoPlay: false,
        sound: sound,
        startCallback: () => {
          this.idleWarning.stop();
          startCallback();
        },
        callback: () => {
          this.idleWarning.start();
          endCallback();
        }
      },
      onlyShowPauseBtn: false,
      autoMoveIn: false
    });

    this.idleWarning = this.createIdleWarning(15, (resolve) => {
      this.idleWarning.stop();
      startCallback();
      this.playMultiPromise(sound).then(() => {
        this.idleWarning.start();
        endCallback();
      });
      resolve();
    }, undefined, 2);

    if (readForward) {
      this.idleWarning.stop();
      startCallback();
      this.playMultiPromise(sound).then(() => {
        this.idleWarning.start();
        endCallback();
      });
    } else {
      this.idleWarning.start();
      endCallback();
    }
  }

  clearTipBar() {
    if (this.idleWarning) {
      this.idleWarning.stop();
    }
    this.toolSound = undefined;
    this.createToolbar();
  }

  createEnds() {
    this.exit = this.createToolbar({
      soundData: {
        sound: staticJson.clickLetsGo.sound,
        autoPlay: false,
        startCallback: () => {
          this.idleWarning.stop();
        },
        callback: () => {
          this.idleWarning.start();
        }
      },
      exitData: () => {
        //TODO:待退出方法完善
      },
      onlyShowPauseBtn: false,
      autoMoveIn: true
    });
    this.exit.showPauseBtnOnlyInstant();
    this.exitFlasher = new TextureFlasher(this, this.exit.exitBtn, [
      'toolbarIconExit',
      'toolbarIconExitFlasher'
    ], {
        duration: 300,
        autoStart: false
      });
    this.exitFlasher.start();
    this.playSoundPromise(staticJson.clickLetsGo.sound).then(() => {
      this.idleWarning = this.createIdleWarning(15, (resolve) => {
        this.playSoundPromise(staticJson.clickLetsGo.sound);
        resolve();
      }, undefined, 2);
      this.idleWarning.start();
    });
  }
}

export {
  GoForTheGold
};