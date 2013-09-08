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

/*
 *  Angular style bootstrap
 */
api.bootstrap = function (el) {
    el = (typeof el === 'string'
        ? document.querySelector(el)
        : el) || document.body
    var Ctor = ViewModel,
        vmAttr = config.prefix + '-viewmodel',
        vmExp = el.getAttribute(vmAttr)
    if (vmExp) {
        Ctor = utils.getVM(vmExp)
        el.removeAttribute(vmAttr)
    }
    return new Ctor({ el: el })
}

/*
 *  Expose the main ViewModel class
 *  and add extend method
 */
api.ViewModel = ViewModel

ViewModel.extend = function (options) {
    var ExtendedVM = function (opts) {
        opts = opts || {}
        if (options.init) {
            opts.init = options.init
        }
        ViewModel.call(this, opts)
    }
    var proto = ExtendedVM.prototype = Object.create(ViewModel.prototype)
    proto.constructor = ExtendedVM
    if (options.props) utils.extend(proto, options.props)
    if (options.id) {
        utils.registerVM(options.id, ExtendedVM)
    }
    return ExtendedVM
}

// collect templates on load
utils.collectTemplates()

module.exports = api