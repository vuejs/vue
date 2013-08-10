var config      = require('./config'),
    Seed        = require('./seed'),
    directives  = require('./directives'),
    filters     = require('./filters'),
    textParser  = require('./text-parser')

var controllers = config.controllers,
    datum       = config.datum,
    api         = {},
    reserved    = ['datum', 'controllers']

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
        for (var key in opts) {
            if (reserved.indexOf(key) === -1) {
                config[key] = opts[key]
            }
        }
    }
    textParser.buildRegex()
    var el,
        ctrlSlt = '[' + config.prefix + '-controller]',
        dataSlt = '[' + config.prefix + '-data]',
        seeds = []
    /* jshint boss: true */
    while (el = document.querySelector(ctrlSlt) || document.querySelector(dataSlt)) {
        seeds.push(new Seed(el))
    }
    return seeds.length > 1 ? seeds : seeds[0]
}

module.exports = api