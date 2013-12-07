var config    = require('./config'),
    attrs     = config.attrs,
    toString  = Object.prototype.toString,
    join      = Array.prototype.join,
    console   = window.console,
    ViewModel // late def

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
    components  : makeHash(),
    partials    : makeHash(),
    transitions : makeHash(),
    elements    : makeHash(),

    /**
     *  get an attribute and remove it.
     */
    attr: function (el, type, noRemove) {
        var attr = attrs[type],
            val = el.getAttribute(attr)
        if (!noRemove && val !== null) el.removeAttribute(attr)
        return val
    },

    /**
     *  Define an ienumerable property
     *  This avoids it being included in JSON.stringify
     *  or for...in loops.
     */
    defProtected: function (obj, key, val, enumerable, configurable) {
        if (obj.hasOwnProperty(key)) return
        Object.defineProperty(obj, key, {
            value        : val,
            enumerable   : !!enumerable,
            configurable : !!configurable
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
     *  Most simple bind
     *  enough for the usecase and fast than native bind()
     */
    bind: function (fn, ctx) {
        return function (arg) {
            return fn.call(ctx, arg)
        }
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
     *  filter an array with duplicates into uniques
     */
    unique: function (arr) {
        var hash = utils.hash(),
            i = arr.length,
            key, res = []
        while (i--) {
            key = arr[i]
            if (hash[key]) continue
            hash[key] = 1
            res.push(key)
        }
        return res
    },

    /**
     *  Convert a string template to a dom fragment
     */
    toFragment: function (template) {
        if (typeof template !== 'string') {
            return template
        }
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
     *  Convert the object to a ViewModel constructor
     *  if it is not already one
     */
    toConstructor: function (obj) {
        ViewModel = ViewModel || require('./viewmodel')
        return utils.typeOf(obj) === 'Object'
            ? ViewModel.extend(obj)
            : typeof obj === 'function'
                ? obj
                : null
    },

    isConstructor: function (obj) {
        ViewModel = ViewModel || require('./viewmodel')
        return obj.prototype instanceof ViewModel || obj === ViewModel
    },

    /**
     *  convert certain option values to the desired format.
     */
    processOptions: function (options) {
        var components = options.components,
            partials   = options.partials,
            template   = options.template,
            elements   = options.elements,
            key
        if (components) {
            for (key in components) {
                components[key] = utils.toConstructor(components[key])
            }
        }
        if (elements) {
            for (key in elements) {
                elements[key] = utils.toConstructor(elements[key])
            }
        }
        if (partials) {
            for (key in partials) {
                partials[key] = utils.toFragment(partials[key])
            }
        }
        if (template) {
            options.template = utils.toFragment(template)
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
     *  warnings, thrown in all cases
     */
    warn: function() {
        if (!config.silent && console) {
            console.trace()
            console.warn(join.call(arguments, ' '))
        }
    }
}