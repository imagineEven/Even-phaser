import service from './request';

function getScore(params) {
  return service.get('/ClockIn/Eval/Result/00000000-0000-0000-0000-000000000000-10899-1', {
    params
  });
}

export {
  getScore
};