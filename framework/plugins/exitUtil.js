export default class ExitUtil {

  /**
   *游戏结束
   *
   * @static
   * @param {*} game
   * @memberof ExitUtil
   */
  static gameOver(game) {
    if (game.buriedPointData) {
      game.buriedPointData.gameEndTime = new Date();
      game.isletsGo = true;
      let oneError = 0;
      let errCount = 0;
      game.buriedPointData.qusitionList.forEach((item) => {
        if (item.errCount !== 0) {
          errCount++;
        }
        if (item.errCount === 1) {
          oneError++;
        }
      });
      let correctPoints = game.buriedPointData.qusitionList.length - errCount;
      let recordInfos = game.buriedPointData.qusitionList.map((item) => {
        return item.recordInfo;
      });
      let sendStr = 'getnextcourse ' + JSON.stringify({
        CurrentTimeSpans: game.buriedPointData.gameEndTime - game.buriedPointData.gameStartTime,
        CorrectPoints: correctPoints,
        AudioRecords: recordInfos,
        SubCorrectPoints: oneError,
        SumPoints: game.buriedPointData.qusitionList.length
      });
      let nowSocket = window.nowSocket || window.parent.nowSocket || window.parent.parent.nowSocket;
      if (nowSocket) {
        nowSocket.send(sendStr);
      } else {
        location.href = location.href;
      }
      window['console'].log(sendStr);
    }
  }

  /**
   *退出游戏（游戏中途退出）
   *
   * @static
   * @memberof ExitUtil
   */
  static exitGame() {
    if (window.plusVPlayers.length) {
      window.plusVPlayers.forEach(player => {
        player.close();
      });
    }
    if (window.exitCourse) {
      window.exitCourse.exit();
    } else {
      location.reload();
    }
  }
}