import Phaser from 'phaser';
import { CONSTANT } from '../../framework/core/Constant';
import H5PlusRecorder from '../../framework/plugins/H5PlusRecorder';

/***
 * recordOption：录音按钮
 * progressOption：进度条，默认向中点收缩（0.5）
 */
class VCRecorder {
  constructor(game, recordOption = { x: 314, y: 525, anchor: 0.5, times: 4000 }, progressOption = { anchorX: 0.5 }, startCallback = undefined, stopCallback = undefined) {
    this.game = game;
    this.recordOption = recordOption;
    this.progressOption = progressOption;

    this.startCallback = startCallback;
    this.stopCallback = stopCallback;

    this.recorder = new H5PlusRecorder();
    this.batchIndex = 0;
    this.audioPath = '';
    this.createRecord();
  }

  createRecord() {
    this.createSoundWave();
    this.createProgressBar();
    let option = this.recordOption;
    this.startBnt = this.game.createSprite(0, 0, 'recordDefault');
    this.startBnt.imgKeys = ['recordLight', 'recordNormal', 'recordPress', 'recordDefault'];
    this.startBnt.x = option.x + this.startBnt.width / 2;
    this.startBnt.y = option.y + this.startBnt.height / 2;
    this.startBnt.anchor.setTo(0.5);
    this.startBnt.flash = (isRecord, endCallback) => {
      this.game.add.tween(this.startBnt.scale).to({ x: [0.7, 1, 0.8, 1], y: [0.7, 1, 0.8, 1] }, 1000, Phaser.Easing.Linear.None, true).onComplete.add(() => {
        if (isRecord) {
          this.waveGroup.start();
        } else {
          this.waveGroup.play(endCallback);
        }
      });
    };
    this.startBnt.inputEnabled = false;
    this.startBnt.events.onInputDown.add(() => {
      this.startBnt.inputEnabled = false;
      this.game.soundStopAll();

      this.progressBar.start(() => {
        this.recorder.stop();
      });
      this.startBnt.flash(true);
      this.startCallback();

      this.recorder.record().then(path => {
        this.audioPath = path;
        //录音完成
        let text = this.recordText; //new VCRecorder()后，需要赋值当前的录制的单词或句子
        this.recorder.upload(path, unescape(text), this.pageIndex, this.batchIndex).then(res => {
          this.batchIndex++;
          H5PlusRecorder.getEvalData(res.evalId).then(data => {
            this.score = data.score;
            //播放录音
            this.play();
            H5PlusRecorder.play(this.audioPath).then(() => {
              this.stopCallback();
            });
          });
        }).catch(() => {
          console.log('上传录音失败');
        });
      });
    });
  }

  //底部进度条
  createProgressBar() {
    let bmd = this.game.add.bitmapData(this.game.world.width, 7);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, this.game.world.width, 7);
    bmd.ctx.fillStyle = '#4468C7';
    bmd.ctx.fill();

    this.progressBar = this.game.add.sprite(0, 0, bmd);
    this.progressBar.x = this.progressBar.width * this.progressOption.anchorX;
    this.progressBar.y = this.game.world.height - this.progressBar.height / 2;
    this.progressBar.anchor.setTo(this.progressOption.anchorX, 0.5);//0.426
    this.progressBar.visible = false;
    this.progressBar.start = callback => {
      this.progressBar.visible = true;
      this.game.add.tween(this.progressBar).to({ width: 0 }, this.recordOption.times, Phaser.Easing.Linear.None, true).onComplete.add(() => {
        this.progressBar.width = this.game.world.width;
        this.progressBar.visible = false;
        callback(); //结束录音
      });
    };
  }

  //录音波纹
  createSoundWave() {
    this.waveGroup = this.game.add.group();
    let option = this.recordOption; //314 525
    let big = this.game.createSprite(0, 0, 'outerWave');
    big.x = option.x - 54 + big.width / 2;//260
    big.y = option.y - 2 + big.height / 2;//523
    big.anchor.setTo(0.5);

    big.scale.setTo(0.5);
    big.visible = false;
    this.waveGroup.add(big);

    let small = this.game.createSprite(0, 0, 'innerWave');
    small.x = option.x - 30 + small.width / 2;//284
    small.y = option.y + 7 + small.height / 2;//532
    small.anchor.setTo(0.5);

    small.scale.setTo(0.5);
    small.visible = false;
    this.waveGroup.add(small);

    //开始录音
    this.waveGroup.start = () => {
      big.visible = true;
      this.game.add.tween(big.scale).to({ x: 1, y: 1 }, 300, Phaser.Easing.Linear.None, true).onComplete.add(() => {
        this.game.add.tween(big.scale).to({ x: 0.9, y: 0.9 }, 100, Phaser.Easing.Linear.None, true).onComplete.add(() => {
          this.game.add.tween(big.scale).to({ x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
          small.visible = true;
          this.game.add.tween(small.scale).to({ x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true).onComplete.add(() => {
            this.game.add.tween(big.scale).to({ x: 0.3, y: 0.3 }, 1000, Phaser.Easing.Linear.None, true);
            this.game.add.tween(small.scale).to({ x: 0.3, y: 0.3 }, 1000, Phaser.Easing.Linear.None, true).onComplete.add(() => {
              big.visible = false;
              small.visible = false;
            });
          });
        });
      });
    };

    //播放录音
    this.waveGroup.play = (endCallback) => {
      this.startBnt.inputEnabled = false;
      big.visible = true;
      big.scale.setTo(0.1);
      big.aplha = 0;
      this.game.add.tween(big).to({ alpha: 0.3 }, 500, Phaser.Easing.Linear.None, true);
      this.game.add.tween(big.scale).to({ x: 0.3, y: 0.3 }, 500, Phaser.Easing.Linear.None, true).onComplete.add(() => {
        this.game.add.tween(big).to({ alpha: 0.9 }, 800, Phaser.Easing.Linear.None, true);
        this.game.add.tween(big.scale).to({ x: 1, y: 1 }, 800, Phaser.Easing.Linear.None, true).onComplete.add(() => {
          big.visible = false;
        });
        small.visible = true;
        small.scale.setTo(0.3);
        small.aplha = 0;
        this.game.add.tween(small).to({ alpha: 0.9 }, 1300, Phaser.Easing.Linear.None, true);
        this.game.add.tween(small.scale).to({ x: 1, y: 1 }, 1300, Phaser.Easing.Linear.None, true).onComplete.add(() => {
          small.visible = false;
          this.createScore(endCallback);
        });
      });
    };
  }

  createScore(endCallback) {
    let option = this.recordOption;
    let scoreArr = (parseInt(this.score)).toString().split('');
    this.scoreGroup = this.game.add.group();

    let x = 0;
    scoreArr.forEach(item => {
      let text = this.game.add.text(x, 0, item, {
        font: CONSTANT.DEFAULT_FONT,
        fontWeight: 'bold',
        fontSize: '24pt',
        fill: '#4C65A9'
      });
      x += text.width + 10;
      this.scoreGroup.add(text);
    });
    this.scoreGroup.x = option.x + this.startBnt.width + 10;
    this.scoreGroup.y = option.y + (this.startBnt.height - this.scoreGroup.height) / 2;
    this.game.world.bringToTop(this.scoreGroup);

    let children = this.scoreGroup.children;
    let pro = Promise.resolve();
    children.forEach((item, sIndex) => {
      pro = pro.then(() => {
        this.game.add.tween(item).to({ y: [-15, -10, 0, -5, 0] }, 1500, Phaser.Easing.Linear.None, true);
        return this.game.util.waitByPromise(200);
      }).then(() => {
        if (sIndex === children.length - 1) {
          this.game.util.waitByPromise(500).then(() => {
            this.scoreGroup.destroy();
            this.startBnt.inputEnabled = true;
            this.startBnt.loadTexture('recordNormal');
            endCallback && endCallback();
          });
        }
      });
    });
  }

  play(endCallback = undefined) {
    this.startBnt.loadTexture('recordPlay');
    this.startBnt.flash(false, endCallback);
  }

  stopPlay() {

  }
}

export {
  VCRecorder
};