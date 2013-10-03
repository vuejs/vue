var config      = require('./config'),
    ViewModel   = require('./viewmodel'),
    directives  = require('./directives'),
    filters     = require('./filters'),
    textParser  = require('./text-parser'),
    utils       = require('./utils'),
    api         = {}

/*
 *  Allows user to create a custom directive
 */
api.directive = function (name, fn) {
    if (!fn) return directives[name]
    directives[name] = fn
}

/*
 *  Allows user to create a custom filter
 */
api.filter = function (name, fn) {
    if (!fn) return filters[name]
    filters[name] = fn
}

/*
 *  Set config options
 */
api.config = function (opts) {
    if (opts) {
        utils.extend(config, opts)
        textParser.buildRegex()
    }
}

api.ViewModel = ViewModel
ViewModel.extend = extend

/*
 *  Expose the main ViewModel class
 *  and add extend method
 */
function extend (options) {
    var ParentVM = this,
        ExtendedVM = function (opts) {
            opts = opts || {}
            // extend instance data
            if (options.data) {
                opts.data = opts.data || {}
                utils.extend(opts.data, options.data)
            }
            // copy in constructor options, but instance options
            // have priority.
            for (var key in options) {
                if (key !== 'props' &&
                    key !== 'data' &&
                    key !== 'template' &&
                    key !== 'el') {
                    opts[key] = opts[key] || options[key]
                }
            }
            ParentVM.call(this, opts)
        }
    // inherit from ViewModel
    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype)
    utils.defProtected(proto, 'constructor', ExtendedVM)
    // copy prototype props
    if (options.props) {
        utils.extend(proto, options.props, function (key) {
            return !(key in ParentVM.prototype)
        })
    }
    // convert template to documentFragment
    if (options.template) {
        options.templateFragment = templateToFragment(options.template)
    }
    // allow extended VM to be further extended
    ExtendedVM.extend = extend
    ExtendedVM.super = ParentVM
    return ExtendedVM
}

/*
 *  Convert a string template to a dom fragment
 */
function templateToFragment (template) {
    if (template.charAt(0) === '#') {
        var templateNode = document.querySelector(template)
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
}

module.exports = api