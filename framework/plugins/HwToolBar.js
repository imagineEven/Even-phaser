import ExitUtil from './exitUtil';

export default class HwToolBar {
  constructor(game) {
    this.game = game;
    this.events = {};
  }
 
  showExit() {
    if (this.exitBtn) {
      this.game.world.bringToTop(this.exitBtn);
      return;
    }
    this.exitBtn = this.game.add.sprite(this.game.width * 0.87109, this.game.height * 0.921875, '912e797308b1dca965e335602775690e');
    this.exitBtn.inputEnabled = true;
    this.exitBtn.width = this.game.width * 0.1289065;
    this.exitBtn.height = this.game.height * 0.078125;
    this.exitBtn.events.onInputDown.add(() => {
      this.showExitBg();
    });
  }

  showExitBg() {
    this.dispatch('showExit', this);
    if (this.bg) {
      this.bg.visible = true;
      this.exitBg.visible = true;
      this.game.world.bringToTop(this.bg);
      this.game.world.bringToTop(this.exitBg);
      return;
    }
    //创建遮罩
    this.bg = this.game.add.graphics();
    this.bg.beginFill(0x000000, 0.65);
    this.bg.drawRect(0, 0, this.game.width, this.game.height);
    this.exitBg = this.game.add.sprite(this.game.width / 2, this.game.height / 2, '82314ddd5caff7c4565b950bddbcb069');
    this.exitBg.width = this.game.width * 0.5611;
    this.exitBg.height = this.game.height * 0.48729;
    this.exitBg.anchor.set(0.5);

    let text = this.game.add.text(0, this.game.height * -0.262, '是否确定退出？', { font: 'bold 50px  Century Gothic' });
    text.anchor.set(0.5, 0);
    text.x = this.exitBg.width / 2 - text.width / 2-20;
    this.exitBg.addChild(text);
    // let okBtn = this.game.add.sprite(this.game.width * 0.16528, this.game.height * 0.36686, '664359f671355b048466e0f527ef97ae');
    let okBtn = this.game.add.sprite(this.game.width * -0.26845, this.game.height * 0.30686, 'dab63892b89b4ce0ff88f06edf4507e4');
    okBtn.anchor.set(0.5);
    okBtn.inputEnabled = true;
    this.exitBg.addChild(okBtn);
    okBtn.events.onInputDown.add(() => {
      ExitUtil.exitGame();
    }, this.game);
    let cancelBtn = this.game.add.sprite(this.game.width * 0.30249, this.game.height * 0.30686, '0f1370880a9511dc3142c6dbb1be3866');
    cancelBtn.anchor.set(0.5);
    this.exitBg.addChild(cancelBtn);
    cancelBtn.inputEnabled = true;
    cancelBtn.events.onInputDown.add(() => {
      this.bg.visible = false;
      this.exitBg.visible = false;
      this.dispatch('hideExit', this);
    }, this.game);
  }

  addEvents(events){
    for (let eventName in events){
      if(events.hasOwnProperty(eventName)){
        this.events[eventName] = events[eventName];
      }
    }
  }

  dispatch(eventName){
    if(typeof this.events[eventName]==='function'){
      this.events[eventName]();
    }
  }
  
}