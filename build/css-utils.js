const
  purify = require('purify-css'),
  glob = require('glob'),
  path = require('path'),
  fs = require('fs')

function getSize (size) {
  return (size / 1024).toFixed(2) + 'kb'
}

module.exports.purify = function(cb) {
  var css = glob.sync(path.join(__dirname, '../dist/**/*.css'))
  var js = glob.sync(path.join(__dirname, '../dist/**/*.js'))

  Promise.all(css.map(function (file) {
    return new Promise(function (resolve) {
      console.log('\n Purifying ' + path.relative(path.join(__dirname, '../dist'), file).bold + '...')
      purify(js, [file], {minify: true}, function (purified) {
        var oldSize = fs.statSync(file).size
        fs.writeFileSync(file, purified)
        var newSize = fs.statSync(file).size

        console.log(
          ' * Reduced size by ' + ((1 - newSize / oldSize) * 100).toFixed(2) + '%, from ' +
          getSize(oldSize) + ' to ' + getSize(newSize) + '.'
        )
        resolve()
      })
    })
  }))
  .then(cb)
}
