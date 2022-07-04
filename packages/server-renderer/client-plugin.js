'use strict';

Object.freeze({});
/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap(str, expectsLowerCase) {
    const map = Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val];
}
/**
 * Check if a tag is a built-in tag.
 */
makeMap('slot,component', true);
/**
 * Check if an attribute is a reserved attribute.
 */
makeMap('key,ref,slot,slot-scope,is');

makeMap('accept,accept-charset,accesskey,action,align,alt,async,autocomplete,' +
    'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,' +
    'checked,cite,class,code,codebase,color,cols,colspan,content,' +
    'contenteditable,contextmenu,controls,coords,data,datetime,default,' +
    'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,for,' +
    'form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,' +
    'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,' +
    'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,' +
    'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,' +
    'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,' +
    'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,' +
    'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,' +
    'target,title,usemap,value,width,wrap');
const isJS = (file) => /\.js(\?[^.]+)?$/.test(file);
const isCSS = (file) => /\.css(\?[^.]+)?$/.test(file);

const { red, yellow } = require('chalk');
const webpack = require('webpack');
const prefix = `[vue-server-renderer-webpack-plugin]`;
(exports.warn = msg => console.error(red(`${prefix} ${msg}\n`)));
(exports.tip = msg => console.log(yellow(`${prefix} ${msg}\n`)));
const isWebpack5 = !!(webpack.version && webpack.version[0] > 4);
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
const stripModuleIdHash = id => {
    if (isWebpack5) {
        // Webpack >= 5.0.0
        return id.replace(/\|\w+$/, '');
    }
    // Webpack < 5.0.0
    return id.replace(/\s\w+$/, '');
};
const getAssetName = asset => {
    if (typeof asset === 'string') {
        return asset;
    }
    return asset.name;
};

const hash = require('hash-sum');
const uniq = require('lodash.uniq');
class VueSSRClientPlugin {
    constructor(options = {}) {
        //@ts-expect-error no type on options
        this.options = Object.assign({
            filename: 'vue-ssr-client-manifest.json'
        }, options);
    }
    apply(compiler) {
        const stage = 'PROCESS_ASSETS_STAGE_ADDITIONAL';
        onEmit(compiler, 'vue-client-plugin', stage, (compilation, cb) => {
            const stats = compilation.getStats().toJson();
            const allFiles = uniq(stats.assets.map(a => a.name));
            const initialFiles = uniq(Object.keys(stats.entrypoints)
                .map(name => stats.entrypoints[name].assets)
                .reduce((assets, all) => all.concat(assets), [])
                .map(getAssetName)
                .filter(file => isJS(file) || isCSS(file)));
            const asyncFiles = allFiles
                .filter(file => isJS(file) || isCSS(file))
                .filter(file => initialFiles.indexOf(file) < 0);
            const manifest = {
                publicPath: stats.publicPath,
                all: allFiles,
                initial: initialFiles,
                async: asyncFiles,
                modules: {
                /* [identifier: string]: Array<index: number> */
                }
            };
            const assetModules = stats.modules.filter(m => m.assets.length);
            const fileToIndex = asset => manifest.all.indexOf(getAssetName(asset));
            stats.modules.forEach(m => {
                // ignore modules duplicated in multiple chunks
                if (m.chunks.length === 1) {
                    const cid = m.chunks[0];
                    const chunk = stats.chunks.find(c => c.id === cid);
                    if (!chunk || !chunk.files) {
                        return;
                    }
                    const id = stripModuleIdHash(m.identifier);
                    const files = (manifest.modules[hash(id)] =
                        chunk.files.map(fileToIndex));
                    // find all asset modules associated with the same chunk
                    assetModules.forEach(m => {
                        if (m.chunks.some(id => id === cid)) {
                            files.push.apply(files, m.assets.map(fileToIndex));
                        }
                    });
                }
            });
            const json = JSON.stringify(manifest, null, 2);
            //@ts-expect-error no type on options
            compilation.assets[this.options.filename] = {
                source: () => json,
                size: () => json.length
            };
            cb();
        });
    }
}

module.exports = VueSSRClientPlugin;
