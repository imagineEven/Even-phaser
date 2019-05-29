const EVENT={
  SOUND_PLAY: Symbol.for('soundStart'),
  SOUND_PAUSE: Symbol.for('soundPause'),
  SOUND_STOP: Symbol.for('soundStop'),
  SOUND_COMPLETE: Symbol.for('soundComplete'),
  UPDATE_SCORE:Symbol.for('updateScore'),
  MOVING:Symbol.for('moving'),
  MOVE_COMPLETE:Symbol.for('moveComplete'),
  BTN_CLICK:Symbol.for('btnClick'),
  ANIMATION_COMPLETE:Symbol.for('animationComplete'),
  ANIMATION_PLAY:Symbol.for('animationPlay'),
  BTN_ENABLE:Symbol.for('btnEnable'),
  BTN_DISABLE:Symbol.for('btnDisable'),
  CLICK_NEXT:Symbol.for('clickNext'),
  VIDEO_COMPLETE:Symbol.for('videoComplete'),
  ANSWER_RIGHT:Symbol.for('answerRight'),
  ANSWER_WRONG:Symbol.for('answerWrong'),
  AUTO_CLICK:Symbol.for('autoClick'),
  GAME_OVER:Symbol.for('gameOver')
};
export default EVENT;