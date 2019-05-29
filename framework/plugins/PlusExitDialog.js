import ExitUtil from '../../framework/plugins/exitUtil';

const image = {
  exit: '39fb6465ddeec6224ee52e959999d9ec',
  continue: '529e1fd916bed09fb5aff6242d2c04cb',
  left: '53c584377bdb9c7bfe4c0bd61106994d',
  right: 'f21fae72bb5f0ae1a8ad60162b49e59c'
};
class PlusExitDialog {
  constructor(game, callback) {
    this.game = game;
    this.continueFN = callback;
    this.initUI();
  }

  initUI() {
    let currentScale = this.game.currentScale;
    let gameWidth = this.game.width;
    let gameHeight = this.game.height;
    let offsetx = window.innerWidth / 2 - this.game.width * currentScale / 2;
    this.masker = new plus.nativeObj.View('exitDialog', {
      left: offsetx + 'px',
      width: gameWidth * currentScale + 'px',
      height: '100%'
    }, [{
      id: 'sideBar',
      tag: 'rect',
      position: {
        left: '0px',
        top: '0px',
        width: gameWidth * currentScale / 2 + 'px',
        height: '100%'
      },
      color: 'rgba(12,46,63,0.8)'
    }, {
      id: 'sideBarLine',
      tag: 'rect',
      position: {
        right: gameWidth * currentScale / 2 + 'px',
        top: '0px',
        width: '8px',
        height: '100%'
      },
      color: '#0c2E3F'
    }]);

    this.border = new plus.nativeObj.View('exitBorder', {
      left: offsetx + 'px',
      width: gameWidth * currentScale,
      height: '100%'
    });
    this.border.drawRect({
      color: 'rgba(255,255,255,0)',
      borderWidth: '8px',
      borderColor: '#CA2025',
      radius: '2px'
    });

    let leftArrowUrl = this.game.util.fullUrl(image.left, 'image'),
      rightArrowUrl = this.game.util.fullUrl(image.right, 'image'),
      continueUrl = this.game.util.fullUrl(image.continue, 'image'),
      exitUrl = this.game.util.fullUrl(image.exit, 'image');
    let leftArrowWidth = 22 * currentScale,
      leftArrowHeight = 26 * currentScale;

    let rightArrowWidth = 18 * currentScale,
      rightArrowHeight = 20 * currentScale;

    let exitBtnWidth = 112 * currentScale,
      exitBtnHeight = 48 * currentScale;

    let continueBtnWidth = 206 * currentScale,
      continueBtnHeight = 48 * currentScale;
    let leftArrow = `<img src="${leftArrowUrl}" width="${leftArrowWidth}px" height="${leftArrowHeight}px"></img>`,
      rightArrow = `<img src="${rightArrowUrl}" width="${rightArrowWidth}px" height="${rightArrowHeight}px"></img>`,
      continueBtn = `<img src="${continueUrl}" width="${continueBtnWidth}" height="${continueBtnHeight}"></img>`,
      exitBtn = `<img src="${exitUrl}" width="${exitBtnWidth}" height="${exitBtnHeight}"></img>`;

    this.masker.drawRichText(leftArrow, {
      width: leftArrowWidth + 'px',
      height: leftArrowHeight + 'px',
      bottom: '0px',
      right: gameWidth * currentScale / 2 + 'px',
    }, {
      onClick: () => {
        this.masker.hide();
        this.border.show();
      }
    });

    this.masker.drawRichText(continueBtn, {
      width: continueBtnWidth + 'px',
      height: continueBtnHeight + 'px',
      top: (gameHeight * currentScale / 2 - 106 * currentScale) + 'px',
      left: gameWidth * currentScale / 9,
    }, {
      onClick: () => {
        this.destory();
        typeof this.continueFN === 'function' && this.continueFN();
      }
    });

    this.masker.drawRichText(exitBtn, {
      width: exitBtnWidth + 'px',
      height: exitBtnHeight + 'px',
      top: (gameHeight * currentScale / 2 + 50 * currentScale) + 'px',
      left: gameWidth * currentScale / 9,
    }, {
      onClick: () => { //退出
        this.destory();
        ExitUtil.exitGame();
      }
    });

    this.border.drawRichText(rightArrow, {
      width: rightArrowWidth + 'px',
      height: rightArrowHeight + 'px',
      left: '0px',
      bottom: '0px'
    }, {
      onClick: () => {
        this.masker.show();
        this.border.hide();
      }
    });
    this.masker.show();
  }

  destory() {
    this.border.close();
    this.masker.close();
    this.border = this.masker = null;
  }
}

export {
  PlusExitDialog
};