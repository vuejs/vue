var config        = require('./config'),
    toString      = Object.prototype.toString,
    templates     = {},
    VMs           = {}

/*
 *  get accurate type of an object
 */
function typeOf (obj) {
    return toString.call(obj).slice(8, -1)
}

module.exports = {

    typeOf: typeOf,

    getTemplate: function (id) {
        var el = templates[id]
        if (!el && el !== null) {
            var selector = '[' + config.prefix + '-template="' + id + '"]'
            el = templates[id] = document.querySelector(selector)
            if (el) el.parentNode.removeChild(el)
        }
        return el
    },

    registerVM: function (id, VM) {
        VMs[id] = VM
    },

    getVM: function (id) {
        return VMs[id]
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