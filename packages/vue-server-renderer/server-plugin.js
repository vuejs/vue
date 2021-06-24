'use strict';

/*  */

var isJS = function (file) { return /\.js(\?[^.]+)?$/.test(file); };

var ref = require('chalk');
var red = ref.red;
var yellow = ref.yellow;
var webpack = require('webpack');

var prefix = "[vue-server-renderer-webpack-plugin]";
var warn = exports.warn = function (msg) { return console.error(red((prefix + " " + msg + "\n"))); };
var tip = exports.tip = function (msg) { return console.log(yellow((prefix + " " + msg + "\n"))); };

var isWebpack5 = !!(webpack.version && webpack.version[0] > 4);

var validate = function (compiler) {
  if (compiler.options.target !== 'node') {
    warn('webpack config `target` should be "node".');
  }

  if (compiler.options.output) {
    if (compiler.options.output.library) {
      // Webpack >= 5.0.0
      if (compiler.options.output.library.type !== 'commonjs2') {
        warn('webpack config `output.library.type` should be "commonjs2".');
      }
    } else if (compiler.options.output.libraryTarget !== 'commonjs2') {
      // Webpack < 5.0.0
      warn('webpack config `output.libraryTarget` should be "commonjs2".');
    }
  }

  if (!compiler.options.externals) {
    tip(
      'It is recommended to externalize dependencies in the server build for ' +
      'better build performance.'
    );
  }
};

var onEmit = function (compiler, name, stageName, hook) {
  if (isWebpack5) {
    // Webpack >= 5.0.0
    compiler.hooks.compilation.tap(name, function (compilation) {
      if (compilation.compiler !== compiler) {
        // Ignore child compilers
        return
      }
      var stage = webpack.Compilation[stageName];
      compilation.hooks.processAssets.tapAsync({ name: name, stage: stage }, function (assets, cb) {
        hook(compilation, cb);
      });
    });
  } else if (compiler.hooks) {
    // Webpack >= 4.0.0
    compiler.hooks.emit.tapAsync(name, hook);
  } else {
    // Webpack < 4.0.0
    compiler.plugin('emit', hook);
  }
};

var getAssetName = function (asset) {
  if (typeof asset === 'string') {
    return asset
  }
  return asset.name
};

var VueSSRServerPlugin = function VueSSRServerPlugin (options) {
  if ( options === void 0 ) options = {};

  this.options = Object.assign({
    filename: 'vue-ssr-server-bundle.json'
  }, options);
};

VueSSRServerPlugin.prototype.apply = function apply (compiler) {
    var this$1 = this;

  validate(compiler);

  var stage = 'PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER';
  onEmit(compiler, 'vue-server-plugin', stage, function (compilation, cb) {
    var stats = compilation.getStats().toJson();
    var entryName = Object.keys(stats.entrypoints)[0];
    var entryInfo = stats.entrypoints[entryName];

    if (!entryInfo) {
      // #5553
      return cb()
    }

    var entryAssets = entryInfo.assets
      .map(getAssetName)
      .filter(isJS);

    if (entryAssets.length > 1) {
      throw new Error(
        "Server-side bundle should have one single entry file. " +
        "Avoid using CommonsChunkPlugin in the server config."
      )
    }

    var entry = entryAssets[0];
    if (!entry || typeof entry !== 'string') {
      throw new Error(
        ("Entry \"" + entryName + "\" not found. Did you specify the correct entry option?")
      )
    }

    var bundle = {
      entry: entry,
      files: {},
      maps: {}
    };

    Object.keys(compilation.assets).forEach(function (name) {
      if (isJS(name)) {
        bundle.files[name] = compilation.assets[name].source();
      } else if (name.match(/\.js\.map$/)) {
        bundle.maps[name.replace(/\.map$/, '')] = JSON.parse(compilation.assets[name].source());
      }
      // do not emit anything else for server
      delete compilation.assets[name];
    });

    var json = JSON.stringify(bundle, null, 2);
    var filename = this$1.options.filename;

    compilation.assets[filename] = {
      source: function () { return json; },
      size: function () { return json.length; }
    };

    cb();
  });
};

module.exports = VueSSRServerPlugin;
