process.env.NODE_ENV = 'production'

require('dotenv').config()

require('colors')

var
  shell = require('shelljs'),
  path = require('path'),
  css = require('./css-utils'),
  config = require('../config'),
  webpack = require('webpack'),
  webpackConfig = require('../webpack.config'),
  serviceWorkerWebpackConfig = require('./webpack.serviceworker.conf'),
  targetPath = path.join(__dirname, '../dist')

console.log(' WARNING!'.bold)
console.log(' Do NOT use VueRouter\'s "history" mode if')
console.log(' building for Cordova or Electron.\n')

require('./script.clean.js')
console.log((' Building Quasar App with "' + config.theme + '" theme...\n').bold)

shell.mkdir('-p', targetPath)
shell.cp('-R', 'src/statics', targetPath)

function finalize () {
  console.log((
    '\n Build complete with "' + config.theme.bold + '" theme in ' +
    '"/dist"'.bold + ' folder.\n').cyan)

  console.log(' Built files are meant to be served over an HTTP server.'.bold)
  console.log(' Opening index.html over file:// won\'t work.'.bold)
}

webpack(webpackConfig, function (err, stats) {
  if (err) throw err

  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')

  if (stats.hasErrors()) {
    process.exit(1)
  }

  if (config.build.purifyCSS) {
    css.purify(buildServiceWorker)
  }
  else {
    buildServiceWorker()
  }
})

function buildServiceWorker(callback) {
  console.log((' Building Service Worker\n').bold)
  webpack(serviceWorkerWebpackConfig, function (err, stats) {
    if (err) throw err

    if (stats.hasErrors()) {
      process.exit(1)
    }

    finalize()
  })
}
