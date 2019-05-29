class BasicChoice {
  /**
   * choices:Array  选项数组
   * rightChecker：Function 一个函数，判断题目正确的规则
   * options：{
   * 	onRight：Function或者Function数组，回答正确会调用这个函数。
   *             单选题只需要一个Function。如果是多选题则是函数数组
   *             比如多选题有2个正确选项，那么第一次正确，则调用
   *             数组第一个函数，第二次正确则调用第二个函数
   *    onWrong：Function或者Function数组，和onRight类似
   *    onComplete：Function。题目全部回答正确会调用这个。单选题答对会在onRight
   *             之后直接触发onComplete。多选题则所有正确选项都选好会调用。
   *             也可以手动调用onComplete
   * }
   * */
  constructor(choices, rightChecker, options = {}) {
    this.choices = choices;
    this.rightChecker = rightChecker;
    this.rightArr = [];
    this.setRightArr(choices, rightChecker);
    this.wrongTimes = 0;
    this.rightTimes = 0;
    this.rightFunctionArr = [];
    this.wrongFunctionArr = [];
    this.setRightAndWrong(options, 'onRight');
    this.setRightAndWrong(options, 'onWrong');
    if (options.onComplete && typeof options.onComplete === 'function') {
      this.onComplete = options.onComplete;
    } else {
      this.onComplete = () => {};
    }
  }

  setRightAndWrong(options, str) {
    let arrName = str === 'onRight' ? 'rightFunctionArr' :
      'wrongFunctionArr';
    if (options[str]) {
      if (typeof options[str] === 'function') {
        this[arrName].push(options[str]);
      } else {
        this[arrName] = options[str];
      }
    }
  }

  // new的时候自动调用，一般情况不需要手动调用。这个就是通过
  // rightChecker将所有正确选项放到一个数组里
  setRightArr(choices, rightChecker) {
    for (let choice of choices) {
      if (rightChecker(choice)) {
        this.rightArr.push(choice);
      }
    }
  }

  // 判断点击的这个选项是否是正确的
  checkRight(choice) {
    if (this.rightChecker(choice)) {
      if (this.rightFunctionArr[this.rightTimes]) {
        this.rightFunctionArr[this.rightTimes](choice);
      } else {
        this.rightFunctionArr[0](choice);
      }
      this.rightTimes++;
      this.wrongTimes = 0;
      if (this.rightTimes >= this.rightArr.length) {
        this.onComplete();
      }
      return true;
    } else {
      if (this.wrongFunctionArr[this.wrongTimes]) {
        this.wrongFunctionArr[this.wrongTimes](choice);
      } else {
        this.wrongFunctionArr[0](choice);
      }
      this.wrongTimes++;
      return false;
    }
  }

  addDefaultClick(btn) {
    btn.events.onInputDown.add(() => {
      this.checkRight(btn);
    });
  }

  destroy() {
    this.choices = undefined;
    this.rightChecker = undefined;
    this.rightArr = undefined;
    this.choices = undefined;
    this.wrongTimes = undefined;
    this.rightTimes = undefined;
    this.rightFunctionArr = undefined;
    this.wrongFunctionArr = undefined;
  }
}

class MultipleChoice extends BasicChoice {
  /**
   * 该选择题是通过点击进行判断
   * choices:Array  选项数组
   * rightChecker：Function 一个函数，判断题目正确的规则
   * options：{
   * 	onRight：Function或者Function数组，回答正确会调用这个函数。
   *             单选题只需要一个Function。如果是多选题则是函数数组
   *             比如多选题有2个正确选项，那么第一次正确，则调用
   *             数组第一个函数，第二次正确则调用第二个函数
   *    onWrong：Function或者Function数组，和onRight类似
   *    onComplete：Function。题目全部回答正确会调用这个。单选题答对会在onRight
   *             之后直接触发onComplete。多选题则所有正确选项都选好会调用。
   *             也可以手动调用onComplete
   * }
   * */
  constructor(choices, rightChecker, options = {}) {
    super(choices, rightChecker, options);
    for (let item of choices) {
      this.addDefaultClick(item);
    }
  }

  addDefaultClick(btn) {
    btn.events.onInputDown.add(() => {
      this.checkRight(btn);
    });
  }
}

class DragableChoice extends BasicChoice {
  /**
   * 该选择题是通过拖拽移动到某区域进行判断是否正确
   * choices:Array  选项数组
   * rightChecker：Function 一个函数，判断题目正确的规则
   * options：{
   * 	onRight：Function或者Function数组，回答正确会调用这个函数。
   *             单选题只需要一个Function。如果是多选题则是函数数组
   *             比如多选题有2个正确选项，那么第一次正确，则调用
   *             数组第一个函数，第二次正确则调用第二个函数
   *    onWrong：Function或者Function数组，和onRight类似
   *    onComplete：Function。题目全部回答正确会调用这个。单选题答对会在onRight
   *             之后直接触发onComplete。多选题则所有正确选项都选好会调用。
   *             也可以手动调用onComplete
   * }
   * */
  constructor(game, choices, rightChecker, options = {}, targetArr) {
    super(choices, rightChecker, options);
    this.targetArr = targetArr;
    for (let item of choices) {
      this.addDefaultDrag(game, item, options);
    }
  }

  addDefaultDrag(game, btn, options) {
    btn.oldPosition = {
      x: btn.position.x,
      y: btn.position.y
    };
    btn.preTexture = btn.texture;
    btn.pixelPerfectClick = true;
    btn.events.onDragStart.add((btn) => {
      //将按钮置于顶层
      btn.parent.addChild(btn);
      if (options.dragTexture) {
        btn.loadTexture(options.dragTexture);
      }
    });

    btn.events.onDragStop.add((btn) => {
      let isInTarget = false;
      for (let item of this.targetArr) {
        isInTarget = game.util.inPictureArea(btn.position, item);
        if (isInTarget) {
          this.currentTarget = item;
          break;
        }
      }
      if (isInTarget) {
        this.checkRight(btn);
      } else {
        this.setAutoBack(game, btn, options);
      }
    });
  }

  setAutoBack(game, btn, options) {
    btn.texture = btn.preTexture;
    //当autoComeBack为true或者不设置的时候，默认为true。
    if (options.autoComeBack || options.autoComeBack === undefined) {
      game.add.tween(btn.position).to(btn.oldPosition, options.duration ||
        1000, 'Linear', true);
    }
  }
}

export {
  BasicChoice,
  MultipleChoice,
  DragableChoice
};