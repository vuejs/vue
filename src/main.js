var config      = require('./config'),
    Compiler    = require('./compiler'),
    ViewModel   = require('./viewmodel'),
    directives  = require('./directives'),
    filters     = require('./filters'),
    textParser  = require('./text-parser'),
    utils       = require('./utils')

var eventbus    = utils.eventbus,
    controllers = config.controllers,
    datum       = config.datum,
    api         = {},
    reserved    = ['datum', 'controllers'],
    booted      = false

/*
 *  expose utils
 */
api.utils = utils

/*
 *  broadcast event
 */
api.broadcast = function () {
    eventbus.emit.apply(eventbus, arguments)
}

/*
 *  Store a piece of plain data in config.datum
 *  so it can be consumed by sd-data
 */
api.data = function (id, data) {
    if (!data) return datum[id]
    datum[id] = data
}

/*
 *  Store a controller function in config.controllers
 *  so it can be consumed by sd-controller
 */
api.controller = function (id, properties) {
    if (!properties) return controllers[id]
    // create a subclass of ViewModel that has the extension methods mixed-in
    var ExtendedVM = function () {
        ViewModel.apply(this, arguments)
    }
    var p = ExtendedVM.prototype = Object.create(ViewModel.prototype)
    p.constructor = ExtendedVM
    for (var prop in properties) {
        if (prop !== 'init') {
            p[prop] = properties[prop]
        }
    }
    controllers[id] = {
        init: properties.init,
        ExtendedVM: ExtendedVM
    }
}

/*
 *  Allows user to create a custom directive
 */
api.directive = function (name, fn) {
    if (!fn) return directives[name]
    directives[name] = fn
}

/*
 *  Allows user to create a custom filter
 */
api.filter = function (name, fn) {
    if (!fn) return filters[name]
    filters[name] = fn
}

/*
 *  Set config options
 */
api.config = function (opts) {
    if (opts) {
        for (var key in opts) {
            if (reserved.indexOf(key) === -1) {
                config[key] = opts[key]
            }
        }
    }
    textParser.buildRegex()
}

/*
 *  Compile a single element
 */
api.compile = function (el) {
    return new Compiler(el).vm
}

/*
 *  Bootstrap the whole thing
 *  by creating a Compiler instance for top level nodes
 *  that has either sd-controller or sd-data
 */
api.bootstrap = function (opts) {
    if (booted) return
    api.config(opts)
    var el,
        ctrlSlt = '[' + config.prefix + '-controller]',
        dataSlt = '[' + config.prefix + '-data]'
    /* jshint boss: true */
    while (el = document.querySelector(ctrlSlt) || document.querySelector(dataSlt)) {
        new Compiler(el)
    }
    booted = true
}

module.exports = api