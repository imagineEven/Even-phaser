class Recorder {
  constructor() {
    this.mediaRecorder;
    this.audio = document.createElement('audio');
  }

  record() {
    this.mediaRecorder.start();
  }

  stop() {
    this.mediaRecorder.stop();
  }

  play(callback) {
    this.audio.play();
    if (callback) {
      this.audio.onended = () => {
        callback();
      };
    } else {
      this.audio.onended = () => {};
    }
  }

  init() {
    return navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);

        let audioChunks = [];
        this.mediaRecorder.addEventListener('dataavailable', event => {
          audioChunks.push(event.data);
        });

        this.mediaRecorder.addEventListener('stop', () => {
          let audioBlob = new Blob(audioChunks);
          let audioUrl = URL.createObjectURL(audioBlob);
          this.audio = document.createElement('audio');
          this.audio.src = audioUrl;
        });
      });
  }
}

export {
  Recorder
};