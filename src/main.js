var config      = require('./config'),
    Seed        = require('./seed'),
    directives  = require('./directives'),
    filters     = require('./filters'),
    controllers = require('./controllers')

Seed.config = config

Seed.extend = function (opts) {
    var Spore = function () {
        Seed.apply(this, arguments)
        for (var prop in this.extensions) {
            var ext = this.extensions[prop]
            this.scope[prop] = (typeof ext === 'function')
                ? ext.bind(this)
                : ext
        }
    }
    Spore.prototype = Object.create(Seed.prototype)
    Spore.prototype.extensions = {}
    for (var prop in opts) {
        Spore.prototype.extensions[prop] = opts[prop]
    }
    return Spore
}

Seed.controller = function (id, extensions) {
    if (controllers[id]) {
        console.warn('controller "' + id + '" was already registered and has been overwritten.')
    }
    var c = controllers[id] = Seed.extend(extensions)
    return c
}

Seed.bootstrap = function (seeds) {
    if (!Array.isArray(seeds)) seeds = [seeds]
    var instances = []
    seeds.forEach(function (seed) {
        var el = seed.el
        if (typeof el === 'string') {
            el = document.querySelector(el)
        }
        if (!el) console.warn('invalid element or selector: ' + seed.el)
        var ctrlid = el.getAttribute(config.prefix + '-controller'),
            Controller = ctrlid ? controllers[ctrlid] : Seed
        if (!Controller) console.warn('controller ' + ctrlid + ' is not defined.')
        if (ctrlid) el.removeAttribute(config.prefix + '-controller')
        instances.push(new Controller(el, seed.data, seed.options))
    })
    return instances.length > 1
        ? instances
        : instances[0]
}

Seed.directive = function (name, fn) {
    directives[name] = fn
}

Seed.filter = function (name, fn) {
    filters[name] = fn
}

// alias for an alternative API
Seed.evolve = Seed.controller
Seed.plant  = Seed.bootstrap

module.exports = Seed