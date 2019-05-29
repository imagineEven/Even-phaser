import staticJson from './staticJson.json';
import { Repeater } from '../../framework/core/Timer';
import positionJson from './positionJson.json';
import Phaser from 'phaser';
import _ from 'lodash';
import { SilPlayer } from './../../framework/plugins/SilPlayer';

class Game {
  constructor(game, score) {
    this.game = game;
    this.score = score;
    this.bgMuic = this.game.playSoundLoop(staticJson.gamebgSound.sound);
    this.upDownKeydownCode = '';
    this.leftRightKeydownCode = '';
    this.createStage(true);

    this.isClick = 0;
    //当前分数
    this.scoreGold = 0;
    //当前方向
    this.current;
    //捡币数
    this.getCoinNum = 0;
    this.degugG = this.game.add.graphics(0, 0);

    //生成计时器
    this.game.createIntegrator({ x: 20, y: 530 });
    this.game.integrator.createFraction(this.score);
    this.createCoinScore(430, 520);
    this.goldBag = this.game.createSprite(400, 520, staticJson.imgSource.coin);
    this.coinScoreGroup.createFraction(0);
  }

  createStage(isfirst) {
    this.getCoinNum = 0;
    this.lockmove = false;
    this.nowMoveSprite = undefined;
    this.game.util.batchDestroy(this.gameMap, this.mapOutline, this.allCoin, this.person, this.allmonsters);
    let tween;
    let randMap = _.shuffle(staticJson.map)[0];
    this.randMap = randMap;
    this.mapOutline = this.game.createSprite(0, 0, randMap.images[0]);

    this.g = this.game.add.graphics(0, 0);
    this.g.beginFill(0xffff00, 0.8);
    this.g.drawCircle(0, 0, 35);
    this.circleList = this.randMap.circleList;
    this.monsters = this.randMap.monsters;
    this.mapBmd = this.game.make.bitmapData(800, 600);
    this.mapBmd.copy(randMap.images[0]);
    this.mapBmd.update();

    //随机生成一个地图
    this.gameMap = this.game.createSprite(0, 0, randMap.images[1]);

    if (isfirst) {
      this.game.createToolbar();
      this.banner = this.game.createSprite(-800, 0, staticJson.banner);
      this.banner.y = 300 - this.banner.height / 2;
      staticJson.person.images.forEach((img, index) => {
        let person = this.game.createSprite(0, 0, img);
        person.x = index * (person.width + 40) + 60;
        person.y = this.banner.height / 2 - person.height / 2;
        person.idx = index;
        person.inputEnabled = true;
        person.input.pixelPerfectClick = true;
        person.events.onInputDown.add((sprite) => {
          tween = this.game.add.tween(this.banner).to({ x: 800 }, 1000, Phaser.Easing.Linear.None, true);
          tween.onComplete.addOnce(() => {
            this.game.clearGameBar();
            this.game.createGameBar(staticJson.letsSee.sounds, true);
            this.gameStart(sprite);
            this.game.integrator.reduce(this.score).then(() => {
              this.clearing();
            });
          });
        });
        this.banner.addChild(person);
      });
      tween = this.game.add.tween(this.banner).to({ x: 0 }, 1000, Phaser.Easing.Linear.None, true);
      tween.onComplete.addOnce(() => {
        this.game.playSoundPromise(staticJson.chooseCharactor.sound).then(() => {
          this.game.createGameBar(staticJson.chooseCharactor.sound);
        });
      });
    } else {
      this.gameStart(this.nowPerson);
      this.game.world.bringToTop(this.coinScoreGroup);
      this.goldBag.bringToTop();
      this.game.integrator.bringToTop();
      this.game.integrator.reduce(this.game.incomingTime).then(() => {
        this.clearing();
      });
    }
  }

  gameStart(person) {
    this.nowPerson = person;
    this.createPerson({
      x: this.randMap.startX,
      y: this.randMap.startY,
      index: person.idx
    });

    this.allmonsters = this.game.add.group();
    this.monsters.forEach((item) => {
      //创建怪物
      this.allmonsters.add(this.createMonster(item));
    });
    this.createcoin();
  }

  //结算界面
  clearing() {
    this.game.clearGameBar();
    this.lockmove = true;
    if (this.timer1) {
      this.timer1.stop();
    }
    this.game.playMultiPromise([staticJson.gameOver.sound, _.shuffle(staticJson.reward.sounds)[0]]).then(() => {
      this.nowMoveSprite = undefined;
      let coinScore = this.scoreGold;
      this.game.createSprite(0, 0, staticJson.imgSource.clearing);
      this.goldHeap = this.game.createSprite(400, 700, staticJson.imgSource.goldHeap);
      this.goldHeap.anchor.set(0.5);
      this.coinScoreGroup.destroy();
      this.goldBag.destroy();
      this.createCoinScore(500, 400);
      this.coinScoreGroup.createFraction(0);
      this.coinScoreGroup.add(coinScore);
      this.coinScoreGroup.x = 400 - (this.scoreGold + '').length * 18;
      this.coinScoreGroup.y += 100;
      return this.game.playSoundPromise(staticJson.howMuchGold.sound);
    }).then(() => {
      let tween = this.game.add.tween(this.goldHeap).to({ x: 400, y: 600 }, 1000, Phaser.Easing.Linear.None, true);
      tween.onComplete.addOnce(() => {
        this.game.createEndBar();
      });
    });
  }

  //创建人物
  createPerson(options) {
    this.person = this.game.add.group();

    this.person.x = options.x;
    this.person.y = options.y;
    this.createSilPerson(staticJson.personSil[options.index], this.person);
  }

  setSil(sil) {
    let silA = new SilPlayer(this.game,
      sil, {
        isLoop: true,
        playSpeed: 3
      });
    let sprite = this.game.add.sprite(0, 0);
    let bmp = this.game.make.bitmapData(silA.width, silA.height);
    sprite.loadTexture(bmp);
    sprite.sil = silA;
    silA.setAll('inputEnabled', 'false');

    sprite.start = function () {
      this.sil.start();
    };
    sprite.stopNoGoFirst = function () {
      this.sil.stopNoGoFirst();
    };
    if (this.game.isMobile) {
      sprite.inputEnabled = true;
      sprite.events.onInputDown.add(() => {
        this.moveFlag = true;
      });
    }
    sprite.addChild(silA);
    return sprite;
  }

  createMonster(data) {
    let nowmonster = this.game.add.group();
    nowmonster.x = data.x;
    nowmonster.y = data.y;
    nowmonster.startX = data.x;
    nowmonster.startY = data.y;
    nowmonster.isDao = data.isDao;
    let silList = [];
    data.monster.forEach((it) => {
      silList.push(it.json);
    });
    this.createSil(silList, nowmonster);
    this.directionX = -1;
    this.directionY = 1;
    this.directionStepX = 2;
    this.directionStepY = 2;
    let monsterActive = () => {
      try {
        this.monsterSil(nowmonster);
        this.monsterClosePerson(nowmonster);
      }
      catch (e) {
        void (e);
      }
    };

    //碰撞检测
    let timer1 = new Repeater(this.game, {
      duration: 30,
    }, () => monsterActive());
    timer1.start();
    this.timer1 = timer1;
    return nowmonster;
  }

  //人物和怪物碰撞逻辑
  monsterClosePerson(nowmonster) {
    if (this.checkOverlap(nowmonster.children[0], this.person.children[0]) && !this.lockmove) {
      this.game.playSoundPromise(staticJson.dead.sound);
      this.lockmove = true;
      let deadSil = new SilPlayer(this.game, this.person.deadSil, {
        x: this.person.x - 80,
        y: this.person.y - 80,
        isLoop: false,
        playSpeed: 3,
        autoPlay: true,
        onStop: () => {
          deadSil.destroy();
          nowmonster.x = nowmonster.startX;
          nowmonster.y = nowmonster.startY;
          this.person.x = this.randMap.startX;
          this.person.y = this.randMap.startY;
          this.lockmove = false;
        }
      });
    }
  }

  //怪物Sil
  monsterSil(nowmonster) {
    if (nowmonster.y > this.person.y) {
      nowmonster.children.forEach(sil => {
        sil.alpha = 0;
        sil.start();
      });
      nowmonster.children[2].alpha = 1;
      nowmonster.y -= 1;
    }
    else if (nowmonster.y < this.person.y) {
      nowmonster.children.forEach(sil => {
        sil.alpha = 0;
        sil.start();
      });
      nowmonster.children[1].alpha = 1;
      nowmonster.y += 1;
    }
    if (nowmonster.x > this.person.x) {
      nowmonster.children.forEach(sil => {
        sil.alpha = 0;
        sil.start();
      });
      nowmonster.children[0].alpha = 1;
      if (nowmonster.isDao) {
        nowmonster.children[0].x = 0;
        nowmonster.children[0].scale.x = 1;
      }
      else {
        nowmonster.children[0].x = Math.abs(nowmonster.children[0].width);
        nowmonster.children[0].scale.x = -1;
      }
      nowmonster.x -= 1;
    }
    else if (nowmonster.x < this.person.x) {
      nowmonster.children.forEach(sil => {
        sil.alpha = 0;
        sil.start();
      });
      nowmonster.children[0].alpha = 1;
      if (nowmonster.isDao) {
        nowmonster.children[0].x = Math.abs(nowmonster.children[0].width);
        nowmonster.children[0].scale.x = -1;
      }
      else {
        nowmonster.children[0].x = 0;
        nowmonster.children[0].scale.x = 1;
      }
      nowmonster.x += 1;
    }
  }

  //金币得分
  createCoinScore(x1, y1) {
    this.coinScoreGroup = this.game.add.group();
    this.coinScoreGroup.x = x1;
    this.coinScoreGroup.y = y1;
    this.coinScoreGroup.createFraction = (time) => {
      if (time < 10) {
        time = '0' + time;
      }
      let numArray = time.toString().split('');
      numArray.forEach((num, index) => {
        let picNum = parseInt(num);
        let screen = this.game.createSprite(index * 40, 8, staticJson.gold_array.images[picNum]);
        this.coinScoreGroup.addChild(screen);
      });
    };

    this.coinScoreGroup.add = (score) => {
      let promise = Promise.resolve();
      for (let i = 0; i <= score; i++) {
        promise = promise.then(() => changeScreen(i));
      }

      let changeScreen = (item) => {
        this.coinScoreGroup.removeChildren();
        let currentScreen = item;
        this.coinScoreGroup.createFraction(currentScreen);
        return this.game.util.waitByPromise(10);
      };
      return promise;
    };

    this.coinScoreGroup.clean = () => {
      this.coinScoreGroup.removeAll();
    };
  }

  keyboardDownCallBack(event) {
    let group = this.person;
    switch (event.code) {
      case 'ArrowRight':
        this.nowMoveSprite = group.children[0];
        this.leftRightKeydownCode = event.code;
        break;
      case 'ArrowLeft':
        this.nowMoveSprite = group.children[0];
        this.leftRightKeydownCode = event.code;
        break;
      case 'ArrowUp':
        this.nowMoveSprite = group.children[1];
        this.upDownKeydownCode = event.code;
        break;
      case 'ArrowDown':
        this.nowMoveSprite = group.children[2];
        this.upDownKeydownCode = event.code;
    }
  }

  //创建动画
  createSilPerson(data, group) {
    if (this.game.isMobile) {
      this.game.input.addMoveCallback(() => {
        if (this.moveFlag) {
          let pointer = this.game.input.activePointer;
          let x = pointer.x;
          let y = pointer.y;
          if (x > this.person.x) {
            this.keyboardDownCallBack({ code: 'ArrowRight' });
          }
          else if (x < this.person.x) {
            this.keyboardDownCallBack({ code: 'ArrowLeft' });
          }
          if (y > this.person.y) {
            this.keyboardDownCallBack({ code: 'ArrowDown' });
          }
          else if (y < this.person.y) {
            this.keyboardDownCallBack({ code: 'ArrowUp' });
          }
        }
      });
      this.game.input.onUp.add(() => {
        this.moveFlag = false;
        group.children.forEach(sil => {
          this.leftRightKeydownCode = '';
          this.upDownKeydownCode = '';
          sil.stopNoGoFirst();
        });
      });
    }
    this.createSil(data, group);
    group.chongdong = data[3];
    group.deadSil = data[4];
    //初始化
    group.children.forEach(person => {
      person.alpha = 0;
    });
    group.children[0].alpha = 1;
    this.nowMoveSprite = group.children[0];
    this.game.input.keyboard.onDownCallback = ((event) => {
      this.keyboardDownCallBack(event);
    });


    this.game.input.keyboard.onUpCallback = ((event) => {
      if (event.code === this.upDownKeydownCode) {
        this.upDownKeydownCode = '';
      }
      if (event.code === this.leftRightKeydownCode) {
        this.leftRightKeydownCode = '';
      }
      // 单独创建四个方向键
      let upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
      let downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
      let leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      let rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      if (!upKey.isDown && !downKey.isDown) {
        this.upDownKeydownCode = '';
      }
      if (!leftKey.isDown && !rightKey.isDown) {
        this.leftRightKeydownCode = '';
      }
      if (this.upDownKeydownCode === '' && this.leftRightKeydownCode === '') {
        group.children.forEach(sil => {
          sil.stopNoGoFirst();
        });
      }

    });
  }

  //创建怪物动画
  createSil(data, group) {
    data.forEach(sil => {
      let step = this.setSil(sil);
      group.add(step);
    });
  }

  //判断是否在地图中
  isContentMap(point) {
    let pointArray = [];
    this.completeMap.forEach(map => {
      pointArray.push(map.contains(point.x + point.width - 20, point.y + point.height - 20));
    });
    return pointArray.indexOf(true);
  }

  createMap(array) {
    let mapArray = [];
    array.forEach(position => {
      let oneMap = this.spliteArray(position);
      mapArray.push(oneMap);
    });
    return mapArray;
  }

  spliteArray(array) {
    let positionCollect = [];
    let oddArray = [];
    let evenArray = [];
    array.forEach((num, index) => {
      index % 2 === 0 ? evenArray.push(num) : oddArray.push(num);
    });
    let Len = array.length / 2;
    for (let i = 0; i < Len; i++) {
      let point = new Phaser.Point(evenArray[i], oddArray[i]);
      positionCollect.push(point);
    }
    return positionCollect;
  }

  //金币
  createcoin() {
    this.allCoin = this.game.add.group();
    this.allCoins = [];
    let width = 32;
    let height = 56;
    for (let i = 0; i <= 9; i++) {
      let panduan = true;
      while (panduan) {
        let x = Math.floor(Math.random() * 800);
        let y = Math.floor(Math.random() * 600);
        let isOk = true;
        for (let row = x; row <= x + width; row++) {
          for (let col = y; col <= y + height; col++) {
            let nowpix = this.mapBmd.getPixelRGB(row, col).rgba;
            if (nowpix !== 'rgba(255,255,255,1)') {
              isOk = false;
              break;
            }
          }
          if (!isOk) {
            break;
          }
        }
        let a = new Phaser.Rectangle(x, y, width, height);
        let b = this.person.getBounds();
        b.x = this.person.x;
        b.y = this.person.y;
        let xj = Phaser.Rectangle.intersects(a, b);

        if (isOk && !xj) {
          let coin = this.game.createSprite(x, y, staticJson.imgSource.coin);
          this.allCoins.push(coin);
          this.allCoin.add(coin);
          break;
        }
      }
    }
  }

  //创建虫洞
  createHole() {
    this.allHole = this.game.add.group();
    positionJson.holePosition.forEach(position => {
      let hole = this.game.createSprite(position[0], position[1], staticJson.imgSource.wormHole);
      hole.scale.set(0.5);
      hole.anchor.set(0.5);
      hole.alpha = 0;
      this.allHole.add(hole);
    });
  }

  //金币人物碰撞
  impactcoinWithPerson() {
    this.allCoin.children.forEach(coin => {
      if (this.checkOverlap(coin, this.person.children[0])) {
        this.getCoinNum++;
        this.scoreGold = parseInt(this.scoreGold) + 10;

        this.coinScoreGroup.clean();
        this.coinScoreGroup.createFraction(this.scoreGold);
        coin.destroy();
        this.game.playSoundPromise(staticJson.eat.sound, { stopCurrentAudio: false });
        if (this.getCoinNum === 10) {
          this.lockmove = true;
          if (this.timer1) {
            this.timer1.destroy();
            this.timer1 = undefined;
          }
          this.person.alpha = 0;
          let chongDongSil = new SilPlayer(this.game, this.person.chongdong, {
            x: this.person.x,
            y: this.person.y,
            isLoop: false,
            playSpeed: 3,
            autoPlay: true,
            onStop: () => {
              chongDongSil.destroy();
              setTimeout(() => {
                this.createStage();
              }, 100);

            }
          });

        }
      }
    });
  }

  getPersonBounds() {
    let rect = this.person.getBounds();
    rect.width = 50;
    rect.height = 64;
    return rect;
  }

  //虫洞穿越
  personHole() {
    this.circleList.forEach((item) => {
      let circle = new Phaser.Circle(item.x, item.y, 35);
      let isIntersect = Phaser.Circle.intersectsRectangle(circle, this.getPersonBounds());
      if (isIntersect && !item.lock) {
        this.person.alpha = 0;
        this.lockmove = true;
        let chongDongSil = new SilPlayer(this.game, this.person.chongdong, {
          x: item.x - 30,
          y: item.y - 33,
          isLoop: false,
          playSpeed: 3,
          autoPlay: true,
          onStop: () => {
            chongDongSil.destroy();
            this.person.alpha = 1;
            this.circleList.forEach((item2) => {
              if (item2.id === item.nextid) {
                this.person.x = Math.floor(item2.x - this.getPersonBounds().width / 2 + 10);
                this.person.y = Math.floor(item2.y - this.getPersonBounds().height + 17);
                item2.lock = true;
              }
            });
            this.lockmove = false;
          }
        });
      }
      if (!isIntersect && item.lock) {
        item.lock = false;
      }
    });
  }

  checkOverlap(spriteA, spriteB) {

    let boundsA = spriteA.getBounds();
    let boundsB = spriteB.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB);
  }

  update() {

    let run = (speed) => {
      if (!this.nowMoveSprite || this.lockmove) {
        return;
      }
      let x = 0;
      let y = 0;
      let upDownStartXy = undefined;
      let upDownCenterXy = undefined;
      let upDownEndXy = undefined;
      let upDownisYueJie = false;

      let leftRightStartXy = undefined;
      let leftRightCenterXy = undefined;
      let leftRightEndXy = undefined;
      let leftRightisYueJie = false;
      let nowMoveSpriteWidth = Math.abs(this.nowMoveSprite.width);
      if (this.upDownKeydownCode === 'ArrowUp') {
        y = -speed;
        let offsetY = this.nowMoveSprite.height - 20;
        upDownStartXy = { x: this.person.x + 10, y: this.person.y + y + offsetY };
        upDownCenterXy = { x: this.person.x + nowMoveSpriteWidth / 2, y: this.person.y + y + offsetY };
        upDownEndXy = { x: this.person.x + nowMoveSpriteWidth - 10, y: this.person.y + y + offsetY };
      } else if (this.upDownKeydownCode === 'ArrowDown') {
        y = speed;
        let offsetY = this.nowMoveSprite.height - 10;
        upDownStartXy = { x: this.person.x + 10, y: this.person.y + y + offsetY + 5 };
        upDownCenterXy = { x: this.person.x + nowMoveSpriteWidth / 2, y: this.person.y + y + offsetY + 5 };
        upDownEndXy = { x: this.person.x + nowMoveSpriteWidth - 10, y: this.person.y + y + offsetY + 5 };
      }

      if (this.leftRightKeydownCode === 'ArrowLeft') {
        x = -speed;
        leftRightStartXy = { x: this.person.x + x + 5, y: this.person.y + this.nowMoveSprite.height - 15 };
        leftRightCenterXy = { x: this.person.x + x + 5, y: this.person.y + this.nowMoveSprite.height - 10 };
        leftRightEndXy = { x: this.person.x + x + 5, y: this.person.y + this.nowMoveSprite.height - 5 };
        leftRightisYueJie = (this.person.x + x < 0);
      } else if (this.leftRightKeydownCode === 'ArrowRight') {
        x = speed;
        leftRightStartXy = { x: this.person.x + x - 5 + nowMoveSpriteWidth, y: this.person.y + this.nowMoveSprite.height - 15 };
        leftRightCenterXy = { x: this.person.x + x - 5 + nowMoveSpriteWidth, y: this.person.y + this.nowMoveSprite.height - 10 };
        leftRightEndXy = { x: this.person.x + x - 5 + nowMoveSpriteWidth, y: this.person.y + this.nowMoveSprite.height - 5 };
        leftRightisYueJie = (this.person.x + x + nowMoveSpriteWidth > 800);
      }

      if (y > 0) {
        this.person.children.forEach(person => {
          person.alpha = 0;
        });
        this.person.children[2].alpha = 1;
        this.person.children[2].start();
      }
      else if (y < 0) {
        this.person.children.forEach(person => {
          person.alpha = 0;
        });
        this.person.children[1].alpha = 1;
        this.person.children[1].start();
      }

      if (x > 0) {
        this.person.children.forEach(person => {
          person.alpha = 0;
        });
        this.person.children[0].alpha = 1;
        this.person.children[0].x = 0;
        this.person.children[0].scale.x = 1;
        this.person.children[0].start();
      }
      else if (x < 0) {
        this.person.children.forEach(person => {
          person.alpha = 0;
        });
        this.person.children[0].alpha = 1;
        this.person.children[0].start();
        this.person.children[0].x = Math.abs(this.person.children[0].width);
        this.person.children[0].scale.x = -1;
      }

      this.degugG.clear();
      if (upDownStartXy) {
        let upDownStartRgba = this.mapBmd.getPixelRGB(upDownStartXy.x, upDownStartXy.y).rgba;
        let upDownCenterRgba = this.mapBmd.getPixelRGB(upDownCenterXy.x, upDownCenterXy.y).rgba;
        let upDownEndRgba = this.mapBmd.getPixelRGB(upDownEndXy.x, upDownEndXy.y).rgba;
        // this.degugG.lineStyle(2, 0xFF00FF, 1);
        // this.degugG.moveTo(upDownStartXy.x, upDownStartXy.y);
        // this.degugG.lineTo(upDownCenterXy.x, upDownCenterXy.y);
        // this.degugG.lineStyle(2, 0x000000, 1);
        // this.degugG.moveTo(upDownCenterXy.x, upDownCenterXy.y);
        // this.degugG.lineTo(upDownEndXy.x, upDownEndXy.y);
        if (upDownStartRgba === 'rgba(0,0,0,1)' || upDownEndRgba === 'rgba(0,0,0,1)' || upDownCenterRgba === 'rgba(0,0,0,1)' || upDownisYueJie) //撞墙了
        {
          y = 0;
        }
      }
      if (leftRightStartXy) {
        let leftRightStartRgba = this.mapBmd.getPixelRGB(leftRightStartXy.x, leftRightStartXy.y).rgba;
        let leftRightCenterRgba = this.mapBmd.getPixelRGB(leftRightCenterXy.x, leftRightCenterXy.y).rgba;
        let leftRightEndRgba = this.mapBmd.getPixelRGB(leftRightEndXy.x, leftRightEndXy.y).rgba;
        // this.degugG.lineStyle(2, 0x0000FF, 1);
        // this.degugG.moveTo(leftRightStartXy.x, leftRightStartXy.y);
        // this.degugG.lineTo(leftRightCenterXy.x, leftRightCenterXy.y);
        // this.degugG.lineStyle(2, 0xFF0000, 1);
        // this.degugG.moveTo(leftRightCenterXy.x, leftRightCenterXy.y);
        // this.degugG.lineTo(leftRightEndXy.x, leftRightEndXy.y);
        if (leftRightStartRgba === 'rgba(0,0,0,1)' || leftRightCenterRgba === 'rgba(0,0,0,1)' || leftRightEndRgba === 'rgba(0,0,0,1)' || leftRightisYueJie) //撞墙了
        {
          x = 0;
        }
      }




      this.person.x += x;
      this.person.y += y;

      this.personHole();
      this.impactcoinWithPerson();
    };
    run(2);
  }
}

export default Game;