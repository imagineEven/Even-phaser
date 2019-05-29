import $ from 'jquery';
import ExitUtil from '../../framework/plugins/exitUtil';

const image = {
  background: '82314ddd5caff7c4565b950bddbcb069',
  exit: 'dab63892b89b4ce0ff88f06edf4507e4',
  continue: '0f1370880a9511dc3142c6dbb1be3866'
};

class ExitDialog {
  constructor(game, style) {
    this.game = game;
    this.style = style;
    this.showExit();
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
      if (this.mask) {
        this.show(true);
      } else {
        this.showExitBg();
      }
    });
  }

  show(isShow) {
    const display = isShow ? 'block' : 'none';
    $(this.mask).css({
      display: display
    });
    $(this.panel).css({
      display: display
    });
  }

  showExitBg() {
    this.container = $('#CoursewareDiv');
    this.mask = $('<div class="hw_exit_mask"></div>');
    $(this.mask).css({
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: this.game.width,
      height: this.game.height,
      background: 'rgba(0, 0, 0, 0.65)',
      zIndex: this.style.zIndex
    });
    this.panel = $('<div class="hw_exit_dialog"></div>');
    const panel = this.game.util.fullUrl(image.background, 'image');
    $(this.panel).css({
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -this.game.width * 0.5611 * 0.5,
      marginTop: -this.game.height * 0.48729 * 0.5,
      width: this.game.width * 0.5611,
      height: this.game.height * 0.48729,
      background: 'url(' + panel + ') center no-repeat',
      backgroundSize: '100% 100%',
      zIndex: this.style.zIndex + 1,
      pointerEvents: 'auto'
    });

    this.tip = $('<div class="hw_exit_tip">是否确定退出？</div>');
    const fontSize = this.game.height * 0.0333;
    $(this.tip).css({
      marginTop: this.game.height * 0.125,
      font: 'bold ' + fontSize + 'px Century Gothic',
      textAlign: 'center'
    });

    this.btns = $('<div class="hw_exit_bnts"></div>');
    $(this.btns).css({
      marginTop: this.game.height * 0.155,
      display: 'flex',
      justifyContent: 'center'
    });
    this.exit = $('<div class="hw_exit_exit"></div>');
    const exit = this.game.util.fullUrl(image.exit, 'image');
    $(this.exit).css({
      width: this.game.width * 0.1625,
      height: this.game.height * 0.0667,
      background: 'url(' + exit + ') center no-repeat',
      backgroundSize: '100% 100%'
    });
    this.continue = $('<div class="hw_exit_continue"></div>');
    const continue1 = this.game.util.fullUrl(image.continue, 'image');
    $(this.continue).css({
      marginLeft: this.game.width * 0.08,
      width: this.game.width * 0.1625,
      height: this.game.height * 0.0667,
      background: 'url(' + continue1 + ') center no-repeat',
      backgroundSize: '100% 100%'
    });
    this.exit.on('click', () => {
      ExitUtil.exitGame();
    });
    this.continue.on('click', () => {
      this.show(false);
    });

    this.btns.append(this.exit);
    this.btns.append(this.continue);

    this.container.append(this.mask);
    this.panel.append(this.tip);
    this.panel.append(this.btns);
    this.container.append(this.panel);
  }
}

export {
  ExitDialog
};