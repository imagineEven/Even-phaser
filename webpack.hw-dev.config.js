let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let BrowserSyncPlugin = require('browser-sync-webpack-plugin');
//let UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// Phaser webpack config
let phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
let phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
let pixi = path.join(phaserModule, 'build/custom/pixi.js');
let p2 = path.join(phaserModule, 'build/custom/p2.js');

let definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
  optionsType: JSON.stringify(1)
});
let fs = require('fs');//引用文件系统模块

function readFileList(path, filesList) {
  let files = fs.readdirSync(path);
  files.forEach(function (itm) {
    let stat = fs.statSync(path + itm);
    if (stat.isDirectory()) {
      //递归读取文件
      readFileList(path + itm + '/', filesList);
    } else {

      let obj = {};//定义一个对象存放文件的路径和名字
      obj.path = path;//路径
      obj.filename = itm;//名字
      filesList.push(obj);
    }

  });

}
let getFiles = {
  //获取文件夹下的所有文件
  getFileList: function (path) {
    let filesList = [];
    readFileList(path, filesList);
    return filesList;
  },
  //获取文件夹下的所有图片
  getImageFiles: function (path) {
    let imageList = [];

    this.getFileList(path).forEach((item) => {
      let ms = image(fs.readFileSync(item.path + item.filename));

      ms.mimeType && (imageList.push(item.filename));
    });
    return imageList;

  }
};
function SaveJsonFiles(IndexFilePath) {
  if(!fs.existsSync('./dist/' + IndexFilePath + '/')) {
    fs.mkdirSync('./dist/' + IndexFilePath + '/');
  }
  let files = getFiles.getFileList('./hw/json/');
  files.forEach((item) => {
    if (item.filename.replace('.json', '').toLowerCase()
      .indexOf((IndexFilePath).toLowerCase().replace('.json', '')) !== -1) {
      let txt = fs.readFileSync(item.path + item.filename);
      fs.writeFileSync('./dist/' + IndexFilePath + '/' + item.filename, txt);
    }
  });
}

module.exports = (env) => {
  let IndexFilePath = (env !== undefined && env.IndexFilePath !== undefined) ? env.IndexFilePath : 'word-survivor';
  SaveJsonFiles(IndexFilePath);
  //获取文件夹下的所有文件
  let files = getFiles.getFileList('./hw/html/');
  let DivHtml = '';
  let IsHaveIndexFilePath = false;
  files.forEach((item) => {

    if (item.filename.toLowerCase() === (IndexFilePath + '.html').toLowerCase()) {
      IsHaveIndexFilePath = true;
    }
    DivHtml += '<div><a href="/' + item.filename + '">' + item.filename + '</a></div>';
  });
  if (!IsHaveIndexFilePath) {
    DivHtml = '<div><a href="/' + IndexFilePath + '.html">' + IndexFilePath + '.html' + '</a></div>' + DivHtml;
  }
  fs.writeFileSync('./index.html', '<!DOCTYPE html><html><head><style>div{line-height:30px;text-decoration: none;font-size: 20px;padding: 10px;}div a{color:blue;text-decoration: none;}</style><title>游戏目录</title></head><body>'
    + DivHtml + '</body></html>');
  return {
    entry: {
      app: [
        'pixi', 'p2', 'phaser', 'webfontloader', 'lodash',
        './framework/video/jsmpeg.js',
        'jquery',
        'babel-polyfill',
        path.resolve(__dirname, 'hw/' + IndexFilePath + '/' + IndexFilePath + '.js'),

      ]
      // ,
      // vendor: ['pixi', 'p2', 'phaser', 'webfontloader', 'jquery', 'lodash',
      //   './framework/video/jsmpeg.js'
      // ]
    },
    // devtool: 'cheap-source-map',
    devtool: 'source-map',
    output: {
      pathinfo: true,
      path: path.resolve(__dirname, 'dist/' + IndexFilePath),
      publicPath: './dist/' + IndexFilePath + '/',
      filename: IndexFilePath + '.bundle.js',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    watch: true,
    plugins: [
      definePlugin,
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'vendor' /* chunkName= */,
      //   filename: 'vendor.bundle.js' /* filename= */
      // }),
      new HtmlWebpackPlugin({
        filename: '../../hw/html/' + IndexFilePath + '.html',
        template: './hw/index.html',
        chunks: ['vendor', 'app'],
        chunksSortMode: 'manual',
        IndexFilePath: IndexFilePath,
        minify: {
          removeAttributeQuotes: false,
          collapseWhitespace: true,
          html5: true,
          minifyCSS: false,
          minifyJS: false,
          minifyURLs: false,
          removeComments: true,
          removeEmptyAttributes: false
        },
        hash: false
      }),
      new BrowserSyncPlugin({
        host: process.env.IP || 'localhost',
        port: process.env.PORT || 3000,
        snippetOptions: {
          //忽略Templates文件夹中的所有HTML文件 
          ignorePaths: './node_modules'
        },
        server: {
          baseDir: ['./', './build', './hw/html']
        },

      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
      //, new UglifyJsPlugin()
    ],
    module: {
      rules: [{
        test: /\.js$/,
        use: ['babel-loader'],
        include: path.join(__dirname, 'hw')
      },
      {
        test: /pixi\.js/,
        use: ['expose-loader?PIXI']
      },
      {
        test: /phaser-split\.js$/,
        use: ['expose-loader?Phaser']
      },
      {
        test: /p2\.js/,
        use: ['expose-loader?p2']
      },
      {
        test:/\.css$/,
        use:['style-loader', 'css-loader']
      },
      {
        test:/\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader:'url-loader',
        options:{
          limit: 10000
        }
      }
      ]
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
    resolve: {
      alias: {
        'phaser': phaser,
        'pixi': pixi,
        'p2': p2
      }
    }
  };
};