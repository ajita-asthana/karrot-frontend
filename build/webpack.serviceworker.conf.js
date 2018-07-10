const path = require('path')
const webpack = require('webpack')
const config = require('../config')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  mode: 'production',
  entry: resolve('src/service-worker.js'),
  devtool: false,
  output: {
    path: resolve('dist'),
    filename: 'service-worker.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'FCM_SENDER_ID': JSON.stringify(config.fcmSenderId)
    }),
    /*
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      minimize: true,
      compress: {
        warnings: false,
      },
    }),
    */
  ],
}
