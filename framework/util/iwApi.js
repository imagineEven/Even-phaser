import service from './request';

function getScore(id) {
  return service.get(`/ClockIn/Eval/${id}`);
}

function getSynthVideo(id) {
  return service.get(`/Video/Synthetic/${id}`);
}

export {
  getScore,
  getSynthVideo
};