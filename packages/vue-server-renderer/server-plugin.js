'use strict';

const isJS = (file) => /\.js(\?[^.]+)?$/.test(file);

const { red, yellow } = require('chalk');
const webpack = require('webpack');
const prefix = `[vue-server-renderer-webpack-plugin]`;
const warn = exports.warn = msg => console.error(red(`${prefix} ${msg}\n`));
const tip = exports.tip = msg => console.log(yellow(`${prefix} ${msg}\n`));
const isWebpack5 = !!(webpack.version && webpack.version[0] > 4);
const validate = compiler => {
    if (compiler.options.target !== 'node') {
        warn('webpack config `target` should be "node".');
    }
    if (compiler.options.output) {
        if (compiler.options.output.library) {
            // Webpack >= 5.0.0
            if (compiler.options.output.library.type !== 'commonjs2') {
                warn('webpack config `output.library.type` should be "commonjs2".');
            }
        }
        else if (compiler.options.output.libraryTarget !== 'commonjs2') {
            // Webpack < 5.0.0
            warn('webpack config `output.libraryTarget` should be "commonjs2".');
        }
    }
    if (!compiler.options.externals) {
        tip('It is recommended to externalize dependencies in the server build for ' +
            'better build performance.');
    }
};
const onEmit = (compiler, name, stageName, hook) => {
    if (isWebpack5) {
        // Webpack >= 5.0.0
        compiler.hooks.compilation.tap(name, compilation => {
            if (compilation.compiler !== compiler) {
                // Ignore child compilers
                return;
            }
            const stage = webpack.Compilation[stageName];
            compilation.hooks.processAssets.tapAsync({ name, stage }, (assets, cb) => {
                hook(compilation, cb);
            });
        });
    }
    else if (compiler.hooks) {
        // Webpack >= 4.0.0
        compiler.hooks.emit.tapAsync(name, hook);
    }
    else {
        // Webpack < 4.0.0
        compiler.plugin('emit', hook);
    }
};
const getAssetName = asset => {
    if (typeof asset === 'string') {
        return asset;
    }
    return asset.name;
};

class VueSSRServerPlugin {
    constructor(options = {}) {
        //@ts-expect-error
        this.options = Object.assign({
            filename: 'vue-ssr-server-bundle.json',
        }, options);
    }
    apply(compiler) {
        validate(compiler);
        const stage = 'PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER';
        onEmit(compiler, 'vue-server-plugin', stage, (compilation, cb) => {
            const stats = compilation.getStats().toJson();
            const entryName = Object.keys(stats.entrypoints)[0];
            const entryInfo = stats.entrypoints[entryName];
            if (!entryInfo) {
                // #5553
                return cb();
            }
            const entryAssets = entryInfo.assets
                .map(getAssetName)
                .filter(isJS);
            if (entryAssets.length > 1) {
                throw new Error(`Server-side bundle should have one single entry file. ` +
                    `Avoid using CommonsChunkPlugin in the server config.`);
            }
            const entry = entryAssets[0];
            if (!entry || typeof entry !== 'string') {
                throw new Error(`Entry "${entryName}" not found. Did you specify the correct entry option?`);
            }
            const bundle = {
                entry,
                files: {},
                maps: {},
            };
            Object.keys(compilation.assets).forEach(name => {
                if (isJS(name)) {
                    bundle.files[name] = compilation.assets[name].source();
                }
                else if (name.match(/\.js\.map$/)) {
                    bundle.maps[name.replace(/\.map$/, '')] = JSON.parse(compilation.assets[name].source());
                }
                // do not emit anything else for server
                delete compilation.assets[name];
            });
            const json = JSON.stringify(bundle, null, 2);
            //@ts-expect-error
            const filename = this.options.filename;
            compilation.assets[filename] = {
                source: () => json,
                size: () => json.length,
            };
            cb();
        });
    }
}

module.exports = VueSSRServerPlugin;
