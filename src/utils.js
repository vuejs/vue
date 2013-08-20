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