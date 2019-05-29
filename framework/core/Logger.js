class Logger {
  constructor(courseId) {
    this.course = courseId;
    this.courseLog = {
      infos: [],
      add: function(info) {
        this.courseLog.infos.push(info);
      }
    };
  }
}
/**创建题目答对和答错状态
 * name：string 题目名称
 * rightOrWrong：bool 是否答对
 * score：number 分数
 * wrongTimes： number 答错次数
 * */
class Info {
  constructor(name, rightOrWrong, score, wrongTimes) {
    this.infoName = name;
    this.rightOrWrong = rightOrWrong;
    this.score = score;
    this.wrongTimes = wrongTimes;
  }
}
export {
  Logger,
  Info
};