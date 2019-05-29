/*eslint-disable*/
var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var BrowserSyncPlugin = require('browser-sync-webpack-plugin')
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')
  // Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/')
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
var pixi = path.join(phaserModule, 'build/custom/pixi.js')
var p2 = path.join(phaserModule, 'build/custom/p2.js')
var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
  optionsType: JSON.stringify(5)
})

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      path.resolve(__dirname, 'entry.js')
    ],
    vendor: ['pixi', 'p2', 'phaser', 'webfontloader', 'jquery',
      './framework/video/jsmpeg.js'
    ]
  },
  devtool: 'cheap-source-map',
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'dist'),
    publicPath: '../dist/',
    filename: 'bundle-entry.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  watch: false,
  watchOptions: {
    stdin: false
  },
  plugins: [
    definePlugin,
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor' /* chunkName= */ ,
      filename: 'vendor.bundle-entry.js' /* filename= */
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        },
        mangle: {
          safari10: true
        }
      }
    })
  ],
  module: {
    rules: [{
        test: /\.js$/,
        use: ['babel-loader'],
        include: path.join(__dirname, 'src')
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
}