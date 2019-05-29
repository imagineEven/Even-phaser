import option from '../util/iwEnv';
import {
  getScore,
  getSynthVideo
} from '../util/iwApi';

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve();
    }, time);
  });
};
class H5PlusRecorder {
  constructor() {
    this.init();
  }

  init() {
    if (window.plus) {
      this.AudioRecorder = window.plus.audio.getRecorder();
    } else {
      console.log('no window.plus');
    }
  }

  stop() {
    this.AudioRecorder && this.AudioRecorder.stop();
  }

  record() {
    return new Promise((resolve, reject) => {
      if (!this.AudioRecorder) {
        reject('设备还未准备完成，耐心等待哦！');
      }
      this.AudioRecorder.record({},
        path => {
          this.audioSrc = path;
          resolve(path);
        },
        err => {
          reject(err);
        }
      );
    });
  }

  static createAudioPlayer(src) {
    return plus.audio.createPlayer(src);
  }

  static play(audioPath) {
    return new Promise((resolve, reject) => {
      if (!audioPath) {
        reject('未存在录音文件');
      }
      this.AudioPlayer = plus.audio.createPlayer(audioPath);
      this.AudioPlayer.play(resolve, reject);
    });
  }

  //停止播放录音
  static stopPlay(cb) {
    if (this.AudioPlayer) {
      this.AudioPlayer.stop();
      typeof cb === 'function' && cb();
    }
  }

  /**
   * 
   * @param {录音文件路径} path 
   * @param {文本} text 
   * @param {当前题号数} index 
   * @param {第几次上传} batch 
   */
  upload(path, text, index, batch) {
    return new Promise((resolve, reject) => {
      this.uploadTask = plus.uploader.createUpload(
        `${option.host}:${option.port}/api/ClockIn/Audio/Eval`, {
          method: 'POST',
        },
        (t, status) => {
          if (status === 200) {
            let JsonData;
            try {
              JsonData = JSON.parse(t.responseText);
            } catch (err) {
              reject(err);
            }
            resolve(JsonData);
          } else {
            reject(t);
          }
        }
      );
      // 上传资源地址
      this.uploadTask.addFile(path, {
        key: 'files',
      });
      // 添加其他的数据源 searchDetail = StudentId+ApplicationId+题号
      let searchDetail = option.studentId + option.applicationId + index;
      let token = option.token;
      this.uploadTask.addData('Key', searchDetail);
      this.uploadTask.addData('Text', text);
      this.uploadTask.addData('EvalType', '2');
      this.uploadTask.addData('BatchNumber', JSON.stringify(batch));
      this.uploadTask.setRequestHeader('Authorization', 'Bearer ' + token);
      this.uploadTask.start();
    });
  }

  //上传音频和视频md5，用于将录音和音频合成
  uploadWithVideo(path, md5, index, batch) {
    return new Promise((resolve, reject) => {
      this.uploadTask = plus.uploader.createUpload(
        `${option.host}:${option.port}/api/Video/Synthetic`, {
          method: 'POST',
        },
        (t, status) => {
          if (status === 200) {
            let JsonData;
            try {
              JsonData = JSON.parse(t.responseText);
            } catch (err) {
              reject(err);
            }
            resolve(JsonData);
          } else if (status === 404) {
            reject('not found');
          } else {
            reject(t);
          }
        }
      );
      // 上传资源地址
      this.uploadTask.addFile(path, {
        key: 'files',
      });
      // 添加其他的数据源 searchDetail = StudentId+ApplicationId+题号
      let searchDetail = option.studentId + option.applicationId + index + batch;
      let token = option.token;
      this.uploadTask.addData('Key', searchDetail);
      this.uploadTask.addData('VideoName', md5);
      this.uploadTask.setRequestHeader('Authorization', 'Bearer ' + token);
      this.uploadTask.start();
    });
  }

  //轮询查询得分
  static getEvalData(id) {
    let fetchCount = 0;
    return new Promise((resolve, reject) => {
      let fetchData = () => {
        getScore(id).then(res => {
          if (res) {
            resolve(res);
          } else {
            fetchCount++;
            delay(100).then(fetchData);
            if (fetchCount > 30) {
              reject('获取评分失败');
              return;
            }
          }
        });
      };
      fetchData();
    });
  }

  //轮询查找视频地址
  static getVideoSrc(id) {
    let fetchCount = 0;
    return new Promise((resolve, reject) => {
      let fetchData = () => {
        getSynthVideo(id).then(res => {
          if (res) {
            resolve(res);
          } else {
            fetchCount++;
            if (fetchCount > 100) {
              plus.nativeUI.toast('获取视频路径失败！');
              reject('获取视频路径失败！');
              return;
            }
            delay(100).then(fetchData);
          }
        });
      };
      fetchData();
    });
  }
}

export default H5PlusRecorder;