var config      = require('./config'),
    Seed        = require('./seed'),
    directives  = require('./directives'),
    filters     = require('./filters')

var controllers = config.controllers,
    datum       = config.datum,
    api         = {}

/*
 *  Store a piece of plain data in config.datum
 *  so it can be consumed by sd-data
 */
api.data = function (id, data) {
    if (!data) return datum[id]
    if (datum[id]) {
        console.warn('data object "' + id + '"" already exists and has been overwritten.')
    }
    datum[id] = data
}

/*
 *  Store a controller function in config.controllers
 *  so it can be consumed by sd-controller
 */
api.controller = function (id, extensions) {
    if (!extensions) return controllers[id]
    if (controllers[id]) {
        console.warn('controller "' + id + '" already exists and has been overwritten.')
    }
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
 *  Bootstrap the whole thing
 *  by creating a Seed instance for top level nodes
 *  that has either sd-controller or sd-data
 */
api.bootstrap = function (opts) {
    if (opts) {
        config.prefix = opts.prefix || config.prefix
    }
    var el,
        ctrlSlt = '[' + config.prefix + '-controller]',
        dataSlt = '[' + config.prefix + '-data]'
    /* jshint boss: true */
    while (el = document.querySelector(ctrlSlt) || document.querySelector(dataSlt)) {
        new Seed(el)
    }
}

module.exports = api