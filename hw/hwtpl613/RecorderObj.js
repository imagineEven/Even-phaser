import $ from 'jquery';
import ExitUtil from '../../framework/plugins/exitUtil';

class RecorderObj {
  constructor() {
    this.init();
  }

  init() {
    if (window.plus) {
      this.AudioRecorder = window.plus.audio.getRecorder();
    } else {
      // alert('no window.plus');
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
      this.AudioRecorder.record({
      },
      path => {
        this.audioSrc = path;
        resolve(path);
      },
      err => {
        console.log(err);
        // alert(err);
      }
      );
    });
  }

  play(audioPath) {
    return new Promise((resolve, reject) => {
      if (!this.audioSrc) {
        reject('未存在录音文件');
      }
      this.AudioPlayer = plus.audio.createPlayer(audioPath);
      this.AudioPlayer.play(resolve, reject);
    });
  }

  //停止播放录音
  stopPlay(cb) {
    if (this.AudioPlayer) {
      this.AudioPlayer.stop();
      typeof cb === 'function' && cb();
    }
  }

  upload(data, path, index, batch) {
    return new Promise((resolve, reject) => {
      this.uploadTask = plus.uploader.createUpload('http://192.168.1.150:8012/api/ClockIn/Eval', {
        method: 'POST'
      }, (t, status) => {
        if (status === 200) {
          let JsonData;
          try{
            JsonData = JSON.parse(t.responseText);
          }catch(err){
            reject(err);
          }
          resolve(JsonData);
        } else {
          reject(t);
        }
      });
      // 上传资源地址
      this.uploadTask.addFile(path, {
        key: 'files'
      });

      // 添加其他的数据源 searchDetail = StudentId+ApplicationId+题号
      let searchDetail = '';
      // let random = Math.random();
      if (sessionStorage.getItem('applicationInfo')) {
        let applicationInfo = JSON.parse(sessionStorage.getItem('applicationInfo'));
        searchDetail = applicationInfo.studentId + '-' + applicationInfo.applicationId + '-' + (index + 1);
      } else {
        searchDetail = '00000000-0000-0000-0000-000000000000-10899-1';
        // ExitUtil.exitGame();
      }
      let token = ''; 
      if (sessionStorage.getItem('token')) {
        token = sessionStorage.getItem('token');
      } else if (localStorage.getItem('token')) {
        token = localStorage.getItem('token');
      } else {
        token = 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjhiY2M0Yzg0NGRlYjlkNGEzMDU5NzQ4OWEzOGQ2YWI4IiwidHlwIjoiSldUIn0.eyJuYmYiOjE1NTEyNDc1NTAsImV4cCI6MTU1MTI1MTE1MCwiaXNzIjoiaHR0cDovL29hdXRoLjQwMDY2ODg5OTEuY29tIiwiYXVkIjpbImh0dHA6Ly9vYXV0aC40MDA2Njg4OTkxLmNvbS9yZXNvdXJjZXMiLCJDcm1BcGkiXSwiY2xpZW50X2lkIjoiY2xpZW50U3R1ZGVudCIsInN1YiI6IjA4NGFlMjY0LTQ3MjAtNDE0OS1iODRjLTA0YmIwMWIzNmMxNiIsImF1dGhfdGltZSI6MTU1MTI0NzU1MCwiaWRwIjoibG9jYWwiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJKYXNvbiIsImZ1bGxOYW1lIjoiSmFzb24t5aeT5ZCNIiwiaWxTdHVkZW50SWQiOiIxOTcwMzUwNjA2Nzc4NTQ2NSIsImluc3RpdHV0aW9uSWQiOiIxNzNiNjllNy1jZDA2LTRjODctYTcwMS00MDFmZmI5ZGVkM2EiLCJ1c2VyTmFtZSI6Ikphc29uIiwiaXNTdHVkZW50IjoiMSIsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJDcm1BcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsiY3VzdG9tIl19.ayn0VwGxLaAIk34kTelFuz6SF2LNS8FgIPlYJctLtvU8i8ATpn2Pa8jtJFe7oMJ6ccABBt_OAvcYX6bfIYLSzQAxGrHllPLqOuuwvwjZb7VJ23d5kIrYJThMxOOiZXaQ0v4B4I4C7zy6a4rFNR8-TPNaGEyujCAu-_FiE88El-LLN4v21xArg7NXjjmFw_ieI2rfw8DIpp8Z5wy5CZYoAuy5mz-V4SPwf6loosBSzOV0B6t9t7quoFGde5PnJQ7B9mIRNwVtmbj-ast4bmLPLA9ZpRarcnwuttRPVYKK59vXfSD3kGo0XqPx8z0x1ywYms_QbbUyZPcIJllNrrHBlQ';
        // ExitUtil.exitGame();
      }
      this.uploadTask.addData('Key', searchDetail);
      this.uploadTask.addData('Text', $(data.word).text());
      this.uploadTask.addData('EvalType', '2');
      this.uploadTask.addData('BatchNumber', JSON.stringify(batch));

      this.uploadTask.setRequestHeader('Authorization', 'Bearer '+ token);
      this.uploadTask.start();
    });
  }
}

export default RecorderObj;
