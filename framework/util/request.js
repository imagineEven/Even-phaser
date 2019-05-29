import axios from 'axios';
import option from './iwEnv';

const service = axios.create({
  baseURL: option.host + ':' + option.port + '/api', // api的base_url
  timeout: 15000,
  withCredentials: false
});

service.interceptors.request.use(config => {
  config.headers['Authorization'] = `Bearer ${option.token}`;
  return config;
}, error => {
  Promise.reject(error);
});

service.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    return Promise.reject(error);
  }
);

export default service;