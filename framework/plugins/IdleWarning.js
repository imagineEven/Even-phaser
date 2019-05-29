import { Repeater } from './../core/Timer';

class IdleWarning {
  /**
     * Creates an instance of IdleWarning.
     * @param {Courseware} game Courseware
     * @param {Int} time 
     * @param {Function} callback 
     * @param {any} loop 
     * @param {Int} [warningCount=-1] 
     * @memberof IdleWarning
     */
  constructor(game) {
    this.game = game;
  }

  initRepeater(time, callback, warningCount = -1, loop) {
    
    this.time = time;
    this.life = this.time;
    this.callback = callback;
    this.warningCount = warningCount;
    this.warningTempCount = warningCount;
    this.repeater = new Repeater(this.game, {
      duration: 1000,
      autoStart: false,
      runAtFirst: false
    }, () => {
      this.life--;
      if (this.life === 0) {
        let promise = new Promise((resolve) => {
          if (this.warningCount) {
            this.warningCount--;
          }
          this.callback(resolve);
        });
        promise.then(() => {
          if (!this.warningCount) {
            this.warningCount = -1;
            this.stop();
          } else {
            this.reset(true);
          }
        });
      }
    }, loop);
  }

  start() {
    this.reset();
    this.repeater.start();
  }

  reset(resetCount) {
    this.life = this.time;
    if (!resetCount)
      this.warningCount = this.warningTempCount;
  }

  resetAllData(time, callback, warningCount = -1) {
    this.time = time;
    this.callback = callback;
    this.life = this.time;
    this.warningCount = warningCount;
    this.warningTempCount = warningCount;
  }

  stop() {
    this.life = Infinity;
    this.repeater.stop();
  }
}

export {
  IdleWarning
};