var config    = require('./config'),
    toString  = Object.prototype.toString,
    join      = Array.prototype.join,
    console   = window.console

/**
 *  Create a prototype-less object
 *  which is a better hash/map
 */
function makeHash () {
    return Object.create(null)
}

var utils = module.exports = {

    hash: makeHash,

    // global storage for user-registered
    // vms, partials and transitions
    viewmodels  : makeHash(),
    partials    : makeHash(),
    transitions : makeHash(),

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
     *  internal use only, so no need to check for NaN
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
            typeof value === 'boolean' ||
            (typeof value === 'number' && value == value)) // deal with NaN
            ? value
            : ''
    },

    /**
     *  simple extend
     */
    extend: function (obj, ext, protective) {
        for (var key in ext) {
            if (protective && obj[key]) continue
            obj[key] = ext[key]
        }
    },

    /**
     *  Convert an object of partial strings
     *  to domFragments
     */
    convertPartials: function (partials) {
        if (!partials) return
        for (var key in partials) {
            if (typeof partials[key] === 'string') {
                partials[key] = utils.templateToFragment(partials[key])
            }
        }
    },

    /**
     *  Convert a string template to a dom fragment
     */
    templateToFragment: function (template) {
        if (template.charAt(0) === '#') {
            var templateNode = document.getElementById(template.slice(1))
            if (!templateNode) return
            template = templateNode.innerHTML
        }
        var node = document.createElement('div'),
            frag = document.createDocumentFragment(),
            child
        node.innerHTML = template.trim()
        /* jshint boss: true */
        while (child = node.firstChild) {
            frag.appendChild(child)
        }
        return frag
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