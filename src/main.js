var config     = require('./config'),
    Seed       = require('./seed'),
    directives = require('./directives'),
    filters    = require('./filters')

var seeds = {}

function buildSelector () {
    config.selector = Object.keys(module.exports).forEach(function (directive) {
    
    })
}

module.exports = {
    seeds: seeds,
    seed: function (id, opts) {
        seeds[id] = opts
    },
    directive: function (name, fn) {
        Directives[name] = fn
    },
    filter: function (name, fn) {
        Filters[name] = fn
    },
    config: function (opts) {
        for (var prop in opts) {
            if (prop !== 'selector') {
                config[prop] = opts[prop]
            }
        }
    },
    plant: function () {
        for (var id in seeds) {
            seeds[id] = new Seed(id, seeds[id])
        }
    }
}