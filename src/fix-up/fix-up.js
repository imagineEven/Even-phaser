import { Courseware } from './../../framework/core/Courseware';
import resource from './resource.json';
import { IntroState } from './IntroState';
import { FinalState } from './FinalState';
import { SilPlayer } from './../../framework/plugins/SilPlayer';
import { PlusVideoPlayer } from './../../framework/plugins/PlusVideoPlayer.js';
require('./../../framework/phaserplugins/editgraphics.js');

class FixUp extends Courseware {
  constructor(data) {
    let preload = () => {
      this.loadPageResources(resource, data);
      this.loadSil(resource.silMan);
      this.loadSil(resource.silStar);
      this.loadVideo(resource.video, resource.video, !window.plus);
    };
    super({}, preload, () => {
      this.createUI();
    });
    this.data = data;
    this.score = 0;
  }

  createUI() {
    this.initQuestionList(2);
    this.state.add('IntroState', new IntroState(), false);
    this.state.add('FinalState', new FinalState(), false);
    let video = new PlusVideoPlayer(this, 0, 0, resource.video);
    video.isIos = this.isIos;
    video.events.onStop.add(() => {
      this.createSprite(0, 0, resource.black);
      new SilPlayer(this, resource.silStar, {
        playSpeed: 3,
        autoPlay: true,
        isLoop: false,
        onStop: () => {
          this.state.start('IntroState');
        }
      });
    });
  }
}

export {
  FixUp
};