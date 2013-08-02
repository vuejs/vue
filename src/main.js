var config     = require('./config'),
    Seed       = require('./seed'),
    directives = require('./directives'),
    filters    = require('./filters')

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

Seed.directive = function (name, fn) {
    directives[name] = fn
}

Seed.filter = function (name, fn) {
    filters[name] = fn
}

module.exports = Seed