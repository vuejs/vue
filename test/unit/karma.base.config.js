const alias = require('../../scripts/alias')
const featureFlags = require('../../scripts/feature-flags')
const webpack = require('webpack')

const webpackConfig = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ]
  },
  resolve: {
    alias: alias,
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      'stream': require.resolve("stream-browserify")
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      __WEEX__: false,
      'process.env': {
        TRANSITION_DURATION: process.env.CI ? 100 : 50,
        TRANSITION_BUFFER: 10,
        ...featureFlags
      }
    })
  ],
  devtool: 'inline-source-map'
}

// shared config for all unit tests
module.exports = {
  frameworks: ['jasmine', 'webpack', 'karma-typescript'],
  files: [
    './index.js',
    "src/**/*.ts" // *.tsx for React Jsx
  ],
  preprocessors: {
    './index.js': ['webpack', 'sourcemap'],
    "**/*.ts": ["karma-typescript", 'webpack', 'sourcemap'] // *.tsx for React Jsx
  },
  webpack: webpackConfig,
  webpackMiddleware: {
    noInfo: true
  },
  plugins: [
    'karma-jasmine',
    'karma-mocha-reporter',
    'karma-sourcemap-loader',
    'karma-webpack',
    'karma-typescript'
  ]
}
