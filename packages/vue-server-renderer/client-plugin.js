'use strict';

/* @flow */
var isJS = function (file) { return /\.js(\?[^.]+)?$/.test(file); };
var isCSS = function (file) { return /\.css(\?[^.]+)?$/.test(file); };

var _a = require('chalk'), red = _a.red, yellow = _a.yellow;
var prefix = "[vue-server-renderer-webpack-plugin]";
(exports.warn = function (msg) { return console.error(red(prefix + " " + msg + "\n")); });
(exports.tip = function (msg) { return console.log(yellow(prefix + " " + msg + "\n")); });
var onEmit = function (compiler, name, hook) {
    if (compiler.hooks) {
        // Webpack >= 4.0.0
        compiler.hooks.emit.tapAsync(name, hook);
    }
    else {
        // Webpack < 4.0.0
        compiler.plugin('emit', hook);
    }
};

var hash = require('hash-sum');
var uniq = require('lodash.uniq');
var VueSSRClientPlugin = /** @class */ (function () {
    function VueSSRClientPlugin(options) {
        if (options === void 0) { options = {}; }
        //@ts-expect-error
        this.options = Object.assign({
            filename: 'vue-ssr-client-manifest.json',
        }, options);
    }
    VueSSRClientPlugin.prototype.apply = function (compiler) {
        var _this = this;
        onEmit(compiler, 'vue-client-plugin', function (compilation, cb) {
            var stats = compilation.getStats().toJson();
            var allFiles = uniq(stats.assets.map(function (a) { return a.name; }));
            var initialFiles = uniq(Object.keys(stats.entrypoints)
                .map(function (name) { return stats.entrypoints[name].assets; })
                .reduce(function (assets, all) { return all.concat(assets); }, [])
                .filter(function (file) { return isJS(file) || isCSS(file); }));
            var asyncFiles = allFiles
                .filter(function (file) { return isJS(file) || isCSS(file); })
                .filter(function (file) { return initialFiles.indexOf(file) < 0; });
            var manifest = {
                publicPath: stats.publicPath,
                all: allFiles,
                initial: initialFiles,
                async: asyncFiles,
                modules: {
                /* [identifier: string]: Array<index: number> */
                },
            };
            var assetModules = stats.modules.filter(function (m) { return m.assets.length; });
            var fileToIndex = function (file) { return manifest.all.indexOf(file); };
            stats.modules.forEach(function (m) {
                // ignore modules duplicated in multiple chunks
                if (m.chunks.length === 1) {
                    var cid_1 = m.chunks[0];
                    var chunk = stats.chunks.find(function (c) { return c.id === cid_1; });
                    if (!chunk || !chunk.files) {
                        return;
                    }
                    var id = m.identifier.replace(/\s\w+$/, ''); // remove appended hash
                    var files_1 = (manifest.modules[hash(id)] = chunk.files.map(fileToIndex));
                    // find all asset modules associated with the same chunk
                    assetModules.forEach(function (m) {
                        if (m.chunks.some(function (id) { return id === cid_1; })) {
                            files_1.push.apply(files_1, m.assets.map(fileToIndex));
                        }
                    });
                }
            });
            var json = JSON.stringify(manifest, null, 2);
            //@ts-expect-error
            compilation.assets[_this.options.filename] = {
                source: function () { return json; },
                size: function () { return json.length; },
            };
            cb();
        });
    };
    return VueSSRClientPlugin;
}());

module.exports = VueSSRClientPlugin;
