var config    = require('./config'),
    toString  = Object.prototype.toString,
    join      = Array.prototype.join,
    console   = window.console

module.exports = {

    // global storage for user-registered
    // vms, partials and transitions
    vms         : {},
    partials    : {},
    transitions : {},

    /**
     *  Define an ienumerable property
     *  This avoids it being included in JSON.stringify
     *  or for...in loops.
     */
    defProtected: function (obj, key, val, enumerable) {
        if (obj.hasOwnProperty(key)) return
        Object.defineProperty(obj, key, {
            enumerable: !!enumerable,
            configurable: false,
            value: val
        })
    },

    /**
     *  Accurate type check
     */
    typeOf: function (obj) {
        return toString.call(obj).slice(8, -1)
    },

    /**
     *  Make sure only strings and numbers are output to html
     *  output empty string is value is not string or number
     */
    toText: function (value) {
        /* jshint eqeqeq: false */
        return (typeof value === 'string' ||
            (typeof value === 'number' && value == value)) // deal with NaN
            ? value
            : ''
    },

    /**
     *  simple extend
     */
    extend: function (obj, ext, protective) {
        if (!ext) return
        for (var key in ext) {
            if (protective && obj[key]) continue
            obj[key] = ext[key]
        }
    },

    /**
     *  log for debugging
     */
    log: function () {
        if (config.debug && console) {
            console.log(join.call(arguments, ' '))
        }
    },
    
    /**
     *  warn for debugging
     */
    warn: function() {
        if (config.debug && console) {
            console.warn(join.call(arguments, ' '))
        }
    }
}