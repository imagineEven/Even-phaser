import $ from 'jquery';
import ExitUtil from '../../framework/plugins/exitUtil';

const image = {
  exit: '39fb6465ddeec6224ee52e959999d9ec',
  continue: '529e1fd916bed09fb5aff6242d2c04cb',
  left: '53c584377bdb9c7bfe4c0bd61106994d',
  right: 'f21fae72bb5f0ae1a8ad60162b49e59c'
};

class ContinueBar {
  constructor(game, callback) {
    this.game = game;
    this.callback = callback;
    this.showContinue();
  }

  show(isShow) {
    const display = isShow ? 'block' : 'none';
    $(this.panel).css({
      display: display
    });
  }

  showContinue() {
    this.container = $('#CoursewareDiv');
    this.panel = $('<div class="continue_exit"></div>');
    this.bound = $('<div class="container_bound"></div>');

    $(this.panel).css({
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: this.game.width / 2,
      height: this.game.height,
      background: 'rgba(12, 46, 63, 0.8)',
      borderRightWidth: this.game.width * 0.01,
      borderRightColor: '#0C2E3F',
      borderRightStyle: 'solid',
      zIndex: 9999,
      pointerEvents: 'auto'
    });
    $(this.bound).css({
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: this.game.width - this.game.width * 0.01,
      height: this.game.height - this.game.width * 0.01,
      borderWidth: this.game.width * 0.005,
      borderColor: '#CA2025',
      borderStyle: 'solid',
      zIndex: 10000,
      pointerEvents: 'auto',
      display: 'none'
    });

    this.continue = $('<div class="contine_bnt"></div>');
    const cont = this.game.util.fullUrl(image.continue, 'image');
    $(this.continue).css({
      marginLeft: this.game.width / 9,
      marginTop: this.game.height * 0.363,
      width: this.game.width * 0.2575,
      height: this.game.height * 0.08,
      background: 'url(' + cont + ') center no-repeat',
      backgroundSize: '100% 100%'
    });

    this.exit = $('<div class="exit_bnt"></div>');
    const et = this.game.util.fullUrl(image.exit, 'image');
    $(this.exit).css({
      marginLeft: this.game.width / 9,
      marginTop: this.game.height * 0.113,
      width: this.game.width * 0.14,
      height: this.game.height * 0.08,
      background: 'url(' + et + ') center no-repeat',
      backgroundSize: '100% 100%'
    });
    this.continue.on('click', () => {
      this.show(false);
      this.callback();
      this.destroy();
    });
    this.exit.on('click', () => {
      this.destroy();
      ExitUtil.exitGame();
    });

    this.left = $('<div class="arrow_left_bnt"></div>');
    const le = this.game.util.fullUrl(image.left, 'image');
    $(this.left).css({
      marginLeft: this.game.width * 0.48375,
      marginTop: this.game.height * 0.3333,
      width: this.game.width * 0.0225,
      height: this.game.height * 0.0333,
      background: 'url(' + le + ') center no-repeat',
      backgroundSize: '100% 100%'
    });
    this.left.on('click', () => {
      $(this.panel).css({
        display: 'none'
      });
      $(this.bound).css({
        display: 'block'
      });
    });

    this.right = $('<div class="arrow_right_bnt"></div>');
    const rt = this.game.util.fullUrl(image.right, 'image');
    $(this.right).css({
      marginLeft: 0,
      marginTop: this.game.height * 0.953,
      width: this.game.width * 0.0225,
      height: this.game.height * 0.0333,
      background: 'url(' + rt + ') center no-repeat',
      backgroundSize: '100% 100%'
    });
    this.right.on('click', () => {
      $(this.panel).css({
        display: 'block'
      });
      $(this.bound).css({
        display: 'none'
      });
    });
    this.panel.append(this.continue);
    this.panel.append(this.exit);
    this.panel.append(this.left);
    this.bound.append(this.right);
    this.container.append(this.panel);
    this.container.append(this.bound);
  }

  destroy() {
    $(this.panel).remove();
    $(this.bound).remove();
    $(this.continue).remove();
    $(this.exit).remove();
  }
}

export {
  ContinueBar
};