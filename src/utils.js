var config    = require('./config'),
    toString  = Object.prototype.toString

module.exports = {

    vms: {},
    partials: {},

    /*
     *  Define an ienumerable property
     *  This avoids it being included in JSON.stringify
     *  or for...in loops.
     */
    defProtected: function (obj, key, val) {
        if (obj.hasOwnProperty(key)) return
        Object.defineProperty(obj, key, {
            enumerable: false,
            configurable: false,
            value: val
        })
    },

    typeOf: function (obj) {
        return toString.call(obj).slice(8, -1)
    },

    extend: function (obj, ext, qualifier) {
        for (var key in ext) {
            if (qualifier && !qualifier(key)) continue
            obj[key] = ext[key]
        }
    },

    log: function () {
        if (config.debug) console.log.apply(console, arguments)
        return this
    },
    
    warn: function() {
        if (config.debug) console.warn.apply(console, arguments)
        return this
    }
}