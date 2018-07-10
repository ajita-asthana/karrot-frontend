const backend = (process.env.BACKEND || 'https://dev.karrot.world').replace(/\/$/, '') // no trailing slash
const theme = process.argv[2] || 'mat'

const backendProxy = {
  target: backend,

  // If we are proxying to an https:// backend we need to change the origin to the target
  // domain so that we make the request with the correct hostname
  // However, when we are running inside docker the backend is not accessible from the client
  // so we need to use the origin origin (localhost).
  changeOrigin: /^https:/.test(backend),
  ws: true,
  onProxyReq: (proxyReq) => {
    if (/^https:/.test(backend)) {
      // For secure backends we must set the referer to make django happy
      // https://github.com/django/django/blob/master/django/middleware/csrf.py#L226
      // If the backend tries to use this referer for anything useful it will break
      // as it is a blatant lie, but I don't think it does...
      proxyReq.setHeader('referer', backend)
    }
  },
}

module.exports = {
  // Progress Bar Webpack plugin format
  // https://github.com/clessg/progress-bar-webpack-plugin#options
  progressFormat: ' [:bar] ' + ':percent'.bold + ' (:msg)',

  // Default theme to build with ('ios' or 'mat')
  theme,
  cordovaAssets: './cordova/platforms/' + (theme === 'mat' ? 'android' : 'ios') + '/platform_www',

  // Backend to make API requests to
  backend,

  build: {
    // Remove unused CSS
    // Disable it if it has side-effects for your specific app
    purifyCSS: false, // TODO enable?
  },
  dev: {
    // auto open browser or not
    openBrowser: true,
    port: 8080,

    // If for example you are using Quasar Play
    // to generate a QR code then on each dev (re)compilation
    // you need to avoid clearing out the console, so set this
    // to "false", otherwise you can set it to "true" to always
    // have only the messages regarding your last (re)compilation.
    clearConsoleOnRebuild: false,

    // Proxy your API if using any.
    // Also see /build/script.dev.js and search for "proxy api requests"
    // https://github.com/chimurai/http-proxy-middleware
    proxyTable: {
      '/api': backendProxy,
      '/media': backendProxy,
    },
  },
}
