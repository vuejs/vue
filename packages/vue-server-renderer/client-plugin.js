'use strict';

/*  */

var isJS = function (file) { return /\.js(\?[^.]+)?$/.test(file); };

var ref = require('chalk');
var red = ref.red;
var yellow = ref.yellow;

var prefix = "[vue-server-renderer-webpack-plugin]";
var warn = exports.warn = function (msg) { return console.error(red((prefix + " " + msg + "\n"))); };
var tip = exports.tip = function (msg) { return console.log(yellow((prefix + " " + msg + "\n"))); };

var hash = require('hash-sum');
var uniq = require('lodash.uniq');
var VueSSRClientPlugin = function VueSSRClientPlugin (options) {
  if ( options === void 0 ) options = {};

  this.options = Object.assign({
    filename: 'vue-ssr-client-manifest.json'
  }, options);
};

VueSSRClientPlugin.prototype.apply = function apply (compiler) {
    var this$1 = this;

  compiler.plugin('emit', function (compilation, cb) {
    var stats = compilation.getStats().toJson();

    var allFiles = uniq(stats.assets
      .map(function (a) { return a.name; }));

    

    // const debug = (file, obj) => {
    // require('fs').writeFileSync(__dirname + '/' + file, JSON.stringify(obj, null, 2))
    // }
    // debug('stats.json', stats)
    // debug('client-manifest.json', manifest)

    var json = JSON.stringify(manifest, null, 2);
    compilation.assets[this$1.options.filename] = {
      source: function () { return json; },
      size: function () { return json.length; }
    };
    cb();
  });
};

module.exports = VueSSRClientPlugin;
