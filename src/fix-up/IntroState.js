import Phaser from 'phaser';
import { ObjectPropertyFlasher } from './../../framework/plugins/ObjectPropertyFlasher.js';
import { WordPractice } from './WordPractice';
import resource from './resource.json';

import { CONSTANT } from './../../framework/core/Constant';

class IntroState extends Phaser.State {
  create() {
    this.add.sprite(0, 0, resource.bg.image);
    this.add.sprite(20, 380, resource.dragon.image);
    this.stone = this.add.sprite(93, 285, resource.stone.image);
    this.wordArr = [];
    let len = -32,
      len2 = 0;
    for (let item of this.game.data.ffix.wholeWord) {
      let word = this.game.add.text(item.x, 350, item, {
        fontSize: '46px',
        fill: '#000',
        font: CONSTANT.DEFAULT_FONT,
        fontWeight: 'bolder',
        align: 'center'
      });
      word.anchor.set(0.5);
      this.wordArr.push(word);
      len += word.width + 32;
    }
    this.redDotArr = [];
    for (let i in this.wordArr) {
      let item = this.wordArr[i];
      item.position.x = 400 - len / 2 + len2 + item.width / 2;
      if (i * 1 < this.wordArr.length - 1) {
        this.redDotArr.push(
          this.createRedDot(400 - len / 2 + item.width + len2)
        );
      }
      len2 += item.width + 32;
    }
    this.chopPoint();
  }

  createRedDot(x) {
    let dotText = this.game.add.editgraphics(x + 11, 347, 12, 12, 0xFF0000, null, 1);
    let dotTextClick = this.game.add.editgraphics(-9, -9, 30, 30, 0x000000);
    dotTextClick.alpha = 0;
    dotText.addChild(dotTextClick);
    return dotText;
  }

  chopPoint() {
    let dotText, wrongDot;
    if (this.redDotArr.length === 1) {
      dotText = this.redDotArr[0];
    } else {
      if (this.game.data.ffix.type === 'Suffix') {
        dotText = this.redDotArr.pop();
        wrongDot = this.redDotArr;
      } else {
        dotText = this.redDotArr.shift();
        wrongDot = this.redDotArr;
      }
    }
    let data = this.game.data.ffix;
    let sound = data.text !== data.wholeWord[0] ?
      resource.thereIsASuffixInTheEndOfTheWord.sound :
      resource.thereIsPreffixInFrontOfWord.sound;
    let sounds = [resource.nowItsYourTurnToChop.sound, sound];
    this.game.playMultiPromise(sounds).then(() => {
      dotText.children[dotText.children.length - 1].inputEnabled = true;
      dotText.children[dotText.children.length - 1].events.onInputDown.add(() => {
        this.chopTheWord(dotText);
      });
      this.game.playMultiPromise([resource.chopItOff.sound]).then(() => {
        this.toolbar = this.game.createToolbarWithWarning({
          soundData: {
            sound: resource.chopItOff.sound,
            autoPlay: false
          },
          showPauseBtnOnly: false
        },
        15,
        3);
        this.toolbar.moveIn();
        for (let item of this.redDotArr) {
          item.sharpColor = 0xdd3e30;
        }
      });

      this.stone.inputEnabled = true;
      this.stone.events.onInputDown.add(() => {
        if (wrongDot) {
          for(let item of wrongDot){
            item.sharpColor = '#000';
          }
        }
        if (this.toolbar)
          this.toolbar.showPauseBtnOnly();
        this.game.playSoundLoop(resource.ouch.sound, 1, false);
        this.game.playMultiPromise([resource.stoneWrong.sound]).then(() => {
          if (!dotText.flasher) {
            dotText.flasher = new ObjectPropertyFlasher(
              this.game,
              dotText,
              'sharpColor', [0xdd3e30, 0x000], { duration: 300, autoStart: true }
            );
          }
          this.game.createToolbar({
            soundData: {
              sound: resource.chopHereInstead.sound,
              autoPlay: true
            },
            showPauseBtnOnly: false,
            autoMoveIn: true
          });
        });
      });
    });
  }

  chopTheWord(dot) {
    if (dot.flasher) {
      dot.flasher.stop();
    }
    this.game.playSoundPromise(resource.aya.sound).then(() => {
      this.game.createToolbar();
      this.splitTwoWord(dot);
      for(let item of this.redDotArr){
        item.alpha = 0;
      }
      dot.alpha = 0;
      dot.destroy();
      this.game.playSoundPromise(resource.gelele.sound);
    });
  }

  splitTwoWord(dot) {
    this.game.util.batchDestroy(this.wordArr, this.stone);
    let words = this.game.data.ffix.wholeWord;
    let data;
    if (words.length > 2) {
      if (this.game.data.ffix.type === 'Suffix') {
        let val = words.pop();
        words[0] = words.reduce((prev, next) => {
          return prev + next;
        });
        words[1] = val;
      } else {
        let val = words.shift();
        words[1] = words.reduce((prev, next) => {
          return prev + next;
        });
        words[0] = val;
      }
    }
    if (words[0].length > words[1].length) {
      data = resource.stones[2];
    } else if (words[0].length < words[1].length) {
      data = resource.stones[0];
    } else {
      data = resource.stones[1];
    }
    let stonePieces = [];
    for (let i = 0; i < 2; i++) {
      let originX = i === 0 ? this.stone.position.x : dot.position.x + 16;
      if (i === 0) {
        originX = dot.position.x / 2 + this.stone.position.x / 2 - 8;
      } else {
        originX =
          this.stone.width / 2 +
          this.stone.position.x / 2 +
          dot.position.x / 2 +
          8;
      }
      data[i].stone.x = originX;
      let stone = this.game.add.image(originX, 340, data[i].stone.image);
      stonePieces.push(stone);
      stone.anchor.set(0.5);
      let x = i === 0 ? stone.width / 2 - 70 : 50 - stone.width / 2;
      let word = this.game.add.text(x, 10, words[i], {
        fontSize: '42px',
        fill: '#000',
        font: CONSTANT.DEFAULT_FONT,
        fontWeight: 'bolder'
      });
      word.anchor.set(1 - i, 0.5);
      stone.addChild(word);
      this.fixWord = word;
      this.game.add.tween(stone.position).to({
        x: stone.position.x + (i === 0 ? -40 : 40)
      },
      300,
      'Linear',
      true
      );
    }

    this.game.util.waitByPromise(500).then(() => {
      this.closeDoor();
    });
  }

  closeDoor() {
    this.leftDoor = this.game.createSprite(0, 0, resource.doorLeft);
    this.leftDoor.anchor.x = 1;
    this.rightDoor = this.game.createSprite(0, 0, resource.doorRight);
    this.rightDoor.position.x = 800;
    this.game.playSoundLoop(resource.closeDoor.sound, 1, false);
    this.moveDoor(400, 500, () => {
      this.game
        .playSoundPromise(
          resource['okIKnowThat' + this.game.data.ffix.type].sound
        )
        .then(() => {
          this.ffixWord.flasher = new ObjectPropertyFlasher(
            this.game,
            this.ffixWord,
            'fill', ['#000', '#FF8400'], { duration: 300, autoStart: false }
          );
          this.ffixWord.flasher.start();
          this.ffixWord.inputEnabled = false;
          this.ffixWord.events.onInputDown.add(() => {
            this.ffixWord.inputEnabled = false;
            this.ffixWord.flasher.stop();
            this.showWordPractice();
          });
          this.toolbar = this.game.createToolbarWithWarning({
            soundData: {
              sound: resource.clickHereToLearnMoreAboutIt.sound,
              autoPlay: true,
              callback: () => {
                this.ffixWord.inputEnabled = true;
              }
            }
          },
          15,
          3
          );
        });
    });

    this.game.util.waitByPromise(700).then(() => {
      this.ffixWord = this.game.add.text(400, 125, this.game.data.ffix.text, {
        fontSize: '60px',
        fill: '#000',
        font: CONSTANT.DEFAULT_FONT,
        fontWeight: 'bolder',
        align: 'center'
      });
      this.ffixWord.anchor.set(0.5);
    });
  }

  showWordPractice() {
    let practice = new WordPractice(this.game, this.game.data.practice, () => {
      this.game.playSoundLoop(resource.closeDoor.sound, 1, false);
      this.moveDoor(400, 500, () => {
        this.state.start('FinalState');
        this.game.toolbarWarning.stop();
      });
    });
    this.game.world.addChild(practice);
    this.game.world.addChild(this.leftDoor);
    this.game.world.addChild(this.rightDoor);
    this.game.world.addChild(this.fixWord);
    this.game.world.bringToTop(this.leftDoor);
    this.moveDoor(200, 300);
    this.game.toolbarWarning.stop();
    this.game.playSoundLoop(resource.openDoor.sound, 1, false);
  }

  moveDoor(x, time, callback) {
    this.game.add.tween(this.leftDoor.position).to({
      x: x
    },
    time,
    'Linear',
    true
    );
    this.game.add
      .tween(this.rightDoor.position)
      .to({
        x: 800 - x
      },
      time,
      'Linear',
      true
      )
      .onComplete.add(() => {
        this.game.util.safeInvoke(callback);
      });
  }

  update() {
    this.game.logicLoop.update();
  }
}

export { IntroState };