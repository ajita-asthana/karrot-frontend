const webpack = require('webpack'),
  path = require('path'),
  autoprefixer = require('autoprefixer'),
  VueLoaderPlugin = require('vue-loader/lib/plugin'),
  ProgressBarPlugin = require('progress-bar-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin'),
  config = require('./config'),
  projectRoot = path.resolve(__dirname, './'),
  production = process.env.NODE_ENV === 'production'

function resolve (dir) {
  return path.join(__dirname, '.', dir)
}

let plugins = [
  new webpack.DefinePlugin({
    // override process.env
    'process.env': {
      NODE_ENV: JSON.stringify(production ? 'production' : 'development'),
    },
    PRODUCTION: production,
    GIT_SHA1: JSON.stringify(process.env.GIT_SHA1 || process.env.CIRCLE_SHA1),
    RAVEN_CONFIG: JSON.stringify(process.env.RAVEN_CONFIG || production ? 'https://6fd3cc6b432b457e8f18e12aa163a900@sentry.io/236883' : null),
    CORDOVA: process.env.CORDOVA === 'true',
    BACKEND: JSON.stringify(config.backend),
    KARROT_THEME: JSON.stringify(process.env.KARROT_THEME || 'default'),
    FCM_SENDER_ID: JSON.stringify(process.env.FCM_SENDER_ID),
    __THEME: JSON.stringify(config.theme),
  }),
  new VueLoaderPlugin(),
  new ProgressBarPlugin({
    format: config.progressFormat,
  }),
]

if (!production) {
  plugins = [
    ...plugins,
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      inject: true,
    }),
    new FriendlyErrorsPlugin({
      clearConsole: config.dev.clearConsoleOnRebuild,
    }),
  ]
}
else {
  plugins = [
    ...plugins,
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundlesize.html',
      defaultSizes: 'gzip',
      openAnalyzer: false,
      generateStatsFile: false,
      statsFilename: 'stats.json',
      // Options for `stats.toJson()` method.
      // For example you can exclude sources of your modules from stats file with `source: false` option.
      // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
      statsOptions: null,
      // Log level. Can be 'info', 'warn', 'error' or 'silent'.
      logLevel: 'info',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, './dist/index.html'),
      template: 'src/index.html',
      inject: true,
      cache: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      chunksSortMode: 'none',
    }),
  ]
}

module.exports = {
  devtool: production ? 'source-map' : 'cheap-module-eval-source-map',
  mode: production ? 'production' : 'development',
  optimization: {
    concatenateModules: true,
    noEmitOnErrors: true,
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        /*
        minimize: true,
        compress: {
          warnings: false,

          // Attempt to get the sourcemaps working better https://github.com/webpack/webpack/issues/4084#issuecomment-274495886
          sequences: false,
          conditionals: false,
        },
        */
        uglifyOptions: {
          safari10: true,
        },
      }),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        assetNameRegExp: /\.(css|styl|stylus)$/,
        cssProcessorOptions: {
          safe: true,
        },
      }),
    ],
    /*
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test (chunk) {
            return chunk.resource &&
              /[\\/]node_modules[\\/]/.test(chunk.resource) &&
              chunk.resource.indexOf('node_modules/intl') < 0 &&
              chunk.resource.indexOf('quasar-framework/i18n') < 0 &&
              chunk.resource.indexOf('firebase') < 0 &&
              chunk.resource.indexOf('vue-croppa') < 0 &&
              chunk.resource.indexOf('jstimezonedetect') < 0
          },
          priority: 20,
        },
        default: {
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
        styles: {
          name: 'app',
          test: /\.(css|styl|stylus)$/,
          enforce: true,
          priority: 30,
        },
      },
    },
    */
    runtimeChunk: {
      name: 'manifest',
    },
  },
  devServer: {
    historyApiFallback: true,
    logLevel: 'warn',
  },
  entry: {
    app: production ? './src/main.js' : ['./build/hot-reload.js', './src/main.js'],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: production ? '' : '/',
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[id].[chunkhash].js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [
      resolve('src'),
      resolve('node_modules'),
    ],
    alias: {
      quasar: path.resolve(__dirname, './node_modules/quasar-framework/dist/quasar.mat.esm.js'),
      '@': path.resolve(__dirname, './src'),
      '>': path.resolve(__dirname, './test'),
      variables: path.resolve(__dirname, './src/themes/quasar.variables.styl'),
      slidetoggle: path.resolve(__dirname, './src/themes/karrot.slidetoggle.styl'),
      editbox: path.resolve(__dirname, './src/themes/karrot.editbox.styl'),
    },
  },
  module: {
    rules: [
      { // eslint
        enforce: 'pre',
        test: /\.(vue|js)$/,
        loader: 'eslint-loader',
        include: projectRoot,
        exclude: /node_modules/,
        options: {
          formatter: require('eslint-friendly-formatter'),
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          productionMode: false, // TODO
          compilerOptions: {
            preserveWhitespace: false,
          },
        },
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: projectRoot,
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        ),
      },
      {
        test: /\.css$/,
        use: [
          production ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer(), require('cssnano')],
            },
          },
        ],
      },
      {
        test: /\.styl(us)?$/,
        use: [
          production ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer()],
            },
          },
          {
            loader: 'stylus-loader',
            options: {
              preferPathResolver: 'webpack',
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]',
        },
      },
    ],
  },
  plugins,
  performance: {
    hints: false,
    maxAssetSize: 500000,
  },
  node: {
    setImmediate: false,
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
}
