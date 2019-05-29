import Phaser from 'phaser';
import $ from 'jquery';
import _ from 'lodash';

class Audio extends Phaser.Group {
  constructor(game) {
    super(game);
    this.game = game;
    this.init();
  }

  init() {
    let box = document.createElement('div');
    $(box).css({
      position: 'absolute',
      top: 0,
      left: 0,
      height: '50px',
      width: '50px',
      background: 'red'
    });
    document.body.appendChild(box);
    this.audios = document.createElement('audio');
    box.appendChild(this.audios);
    this.audios.classList.add('audio');
    box.onclick = function() {
      let auido = document.querySelector('.audio');
      auido.play();
    };
  }
}

export default {
  Audio
};