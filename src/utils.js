var config    = require('./config'),
    toString  = Object.prototype.toString,
    templates = {},
    VMs       = {}

module.exports = {

    typeOf: function (obj) {
        return toString.call(obj).slice(8, -1)
    },

    extend: function (obj, ext) {
        for (var key in ext) {
            obj[key] = ext[key]
        }
    },

    collectTemplates: function () {
        var selector = 'script[type="text/' + config.prefix + '-template"]',
            templates = document.querySelectorAll(selector),
            i = templates.length
        while (i--) {
            this.storeTemplate(templates[i])
        }
    },

    storeTemplate: function (template) {
        var id = template.getAttribute(config.prefix + '-template-id')
        if (id) {
            templates[id] = template.innerHTML.trim()
        }
        template.parentNode.removeChild(template)
    },

    getTemplate: function (id) {
        return templates[id]
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