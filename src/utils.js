var config    = require('./config'),
    toString  = Object.prototype.toString,
    VMs       = {}

module.exports = {

    typeOf: function (obj) {
        return toString.call(obj).slice(8, -1)
    },

    extend: function (obj, ext, qualifier) {
        for (var key in ext) {
            if (qualifier && !qualifier(key)) continue
            obj[key] = ext[key]
        }
    },

    makeTemplateNode: function (options) {
        var node = document.createElement(options.tagName || 'div')
        node.innerHTML = options.template
        return node
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