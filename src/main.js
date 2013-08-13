var config      = require('./config'),
    Seed        = require('./seed'),
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
api.controller = function (id, extensions) {
    if (!extensions) return controllers[id]
    controllers[id] = extensions
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
    return new Seed(el).scope
}

/*
 *  Bootstrap the whole thing
 *  by creating a Seed instance for top level nodes
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
        new Seed(el)
    }
    booted = true
}

module.exports = api