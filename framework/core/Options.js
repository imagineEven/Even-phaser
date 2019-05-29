//optionsType 路径类型。1：VC2和Ilab 开发环境。2：ILab测试环境。3：ILab正式环境。4：课件3.0环境。5:ILab本地测试环境
//optionsType设置在webpack.config.js 中 optionsType:JSON.stringify(0) 设置
let Options;
switch (optionsType) {
  case 1:
    Options = {
      renderOptions: {
        width: 800,
        height: 600,
        backgroundColor: 0x000000
      },
      baseUrl: 'http://review.4006688991.com/',
      pathImage: 'pixi/asset/image/',
      pathVideo: 'pixi/asset/video2/',
      mp4Video: 'pixi/asset/video/',
      pathTxt: 'pixi/asset/txt/',
      pathAudio: 'pixi/asset/sound/',
      pathJson: 'pixi/asset/json/',
      pathFilters: 'pixi/asset/filters/'
    };
    break;
  case 2:
    Options = {
      renderOptions: {
        width: 800,
        height: 600,
        backgroundColor: 0x000000
      },
      baseUrl: 'http://192.168.1.150:81',
      pathImage: '/upload/Image/',
      pathVideo: '/upload/Video/',
      pathTxt: '/upload/AnimationJson/',
      pathJson: '/upload/json/',
      pathAudio: '/upload/Audio/',
      pathFilters: '/upload/filters/'
    };
    break;
  case 3:
    Options = {
      renderOptions: {
        width: 800,
        height: 600,
        backgroundColor: 0x000000
      },
      baseUrl: '',
      pathImage: '/upload/Image/',
      pathVideo: '/upload/Video/',
      pathJson: '/upload/json/',
      pathTxt: '/upload/AnimationJson/',
      pathAudio: '/upload/Audio/',
      pathFilters: '/upload/filters/'
    };
    break;
  case 4:
    Options = {
      renderOptions: {
        width: 800,
        height: 600,
        backgroundColor: 0x000000
      },
      baseUrl: '',
      pathImage: '/asset/Image/',
      pathVideo: '/asset/Video/',
      pathTxt: '/asset/txt/',
      pathAudio: '/asset/Audio/',
      pathFilters: '/asset/filters/',
      pathJson: '/asset/json/'
    };
    break;
  case 5:
    Options = {
      renderOptions: {
        width: 800,
        height: 600,
        backgroundColor: 0x000000
      },
      baseUrl: '',
      pathImage: '/upload/Image/',
      pathVideo: '/upload/Video/',
      pathTxt: '/upload/AnimationJson/',
      pathJson: '/upload/json/',
      pathAudio: '/upload/Audio/',
      pathFilters: '/upload/filters/'
    };
    break;
  case 6:
    Options = {
      renderOptions: {
        width: 800,
        height: 600,
        backgroundColor: 0x000000
      },
      baseUrl: 'http://ilab.4006688991.com',
      pathImage: '/upload/Image/',
      pathVideo: '/upload/Video/',
      mp4Video: '/upload/Video/',
      pathTxt: '/upload/AnimationJson/',
      pathJson: '/upload/json/',
      pathAudio: '/upload/Audio/',
      pathFilters: '/upload/filters/'
    };
    break;
  default:
    Options = {
      renderOptions: {
        width: 800,
        height: 600,
        backgroundColor: 0x000000
      },
      baseUrl: 'http://review.4006688991.com/',
      pathImage: 'pixi/asset/image/',
      pathVideo: 'pixi/asset/video2/',
      pathTxt: 'pixi/asset/txt/',
      pathAudio: 'pixi/asset/sound/',
      pathJson: 'pixi/asset/json/',
      pathFilters: 'pixi/asset/filters/'
    };
}

export {
  Options
};