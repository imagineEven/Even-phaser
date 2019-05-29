/**
 * 请求iw资源配置
 */
let option;
//获取应用信息
const applicationInfo = JSON.parse(sessionStorage.getItem('applicationInfo'))||{};
const token = localStorage.getItem('token')||sessionStorage.getItem('token');
const options = {
  __DEV__:{
    host: 'http://192.168.1.150',
    port: 8012,
    studentId: '00000000-0000-0000-0000-000000000000',
    applicationId: '10800',
    token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjhiY2M0Yzg0NGRlYjlkNGEzMDU5NzQ4OWEzOGQ2YWI4IiwidHlwIjoiSldUIn0.eyJuYmYiOjE1NDY1MDA3OTQsImV4cCI6MTU0NjUwNDM5NCwiaXNzIjoiaHR0cDovL29hdXRoLjQwMDY2ODg5OTEuY29tIiwiYXVkIjpbImh0dHA6Ly9vYXV0aC40MDA2Njg4OTkxLmNvbS9yZXNvdXJjZXMiLCJDcm1BcGkiXSwiY2xpZW50X2lkIjoiY2xpZW50U3R1ZGVudCIsInN1YiI6IjAyMGY2ODQzLTVhZDItNGIxZC1hMjI5LTE0MGQwZDFhMWQ0MSIsImF1dGhfdGltZSI6MTU0NjUwMDc5NCwiaWRwIjoibG9jYWwiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIwODExIiwiZnVsbE5hbWUiOiJpYW7mtYvor5UiLCJpbnN0aXR1dGlvbklkIjoiOTFlNDBkMzgtMDliYS00MDRhLThhOTItYjgzNWNmYjBjMzM1IiwidXNlck5hbWUiOiIwODExIiwiaXNTdHVkZW50IjoiMSIsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJDcm1BcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsiY3VzdG9tIl19.rNxq-5FepBR_fEZQlAYplxzxuL0-ahByZp7oMlz8-wEeVZxgWT6S2Kwnr76p-Yg7C8k0qBw-sq82zi46WGpX7vyyWS58Pl94-AXFtOK74IFd9IFJMf8l7I2xPcDIl7JOF8EwBOitbbJQ6-yLgOriEwG2bSbuHY5UmTZmcJLTmmgf_vY4y2w91UWDpzXoi65M5xYNeaMYmk_5egArKq6JHxn7ZLHTA_s3vsM8Y5oW8BaEzPbV3lRBE6BlvHDfCJmhBdOUfGskYV8OW-oBT8fEwfdBzVGtwQkA2MrWxOZxS65ciw7ec79Pqp_wvxsl85-tAH2LLvll2Vu6mmPXJVT-Rg'

  },
  __PRO__:{
    host: 'http://learn.4006688991.com',
    port:80,
    studentId: applicationInfo.studentId,
    applicationId: applicationInfo.applicationId,
    token:token
  }
};
if(__DEV__){
  option = options['__DEV__'];
}else{
  option = options['__PRO__'];
}

export default option;


