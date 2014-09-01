/**
 * Shared build function
 */

var fs = require('fs')
var resolve = require('component-resolver')
var build = require('component-builder')

module.exports = function (grunt, cb) {
  var banner = grunt.config.get('banner')
  // build with component-builder
  resolve(process.cwd(), {}, function (err, tree) {
    build.scripts(tree)
      .use('scripts', build.plugins.js())
      .end(function (err, js) {
        // wrap with umd
        js = umd(js)
        // replace require paths with numbers for file size
        js = shortenPaths(js)
        // add banner
        js = banner + js
        // done
        cb(js)
      })
  })
}

/**
 * component's umd wrapper throws error in strict mode
 * so we have to roll our own
 */

function umd (js) {
  return '\n;(function(){\n\n'
    + '"use strict"\n\n'
    + build.scripts.require
    + js
    + 'if (typeof exports == "object") {\n'
    + '  module.exports = require("vue");\n'
    + '} else if (typeof define == "function" && define.amd) {\n'
    +'  define([], function(){ return require("vue"); });\n'
    + '} else {\n'
    + '  window.Vue = require("vue");\n'
    + '}\n'
    + '})()\n';
}

/**
 * Shorten require() paths for smaller file size
 */

function shortenPaths (js) {
  var seen = {}
  var count = 0
  return js.replace(/'vue\/src\/(.+?)'|"vue\/src\/(.+?)"/g, function (path) {
    path = path.slice(1, -1)
    if (!seen[path]) {
      seen[path] = ++count
    }
    return seen[path]
  })
}