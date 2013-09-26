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
 *  Compile a node
 */
api.compile = function (el, opts) {
    el = typeof el === 'string'
        ? document.querySelector(el)
        : el
    var Ctor = ViewModel,
        vmAttr = config.prefix + '-viewmodel',
        vmExp = el.getAttribute(vmAttr)
    if (vmExp) {
        Ctor = utils.getVM(vmExp)
        el.removeAttribute(vmAttr)
    }
    opts = opts || {}
    opts.el = el
    return new Ctor(opts)
}

/*
 *  Expose the main ViewModel class
 *  and add extend method
 */
api.ViewModel = ViewModel
ViewModel.extend = function (options) {
    // create child constructor
    var ExtendedVM = function (opts) {
        opts = opts || {}
        if (options.init) {
            opts.init = options.init
        }
        if (options.data) {
            opts.data = opts.data || {}
            utils.extend(opts.data, options.data)
        }
        ViewModel.call(this, opts)
    }
    // inherit from ViewModel
    var proto = ExtendedVM.prototype = Object.create(ViewModel.prototype)
    proto.constructor = ExtendedVM
    // copy props
    if (options.props) {
        utils.extend(proto, options.props, function (key) {
            return !(key in ViewModel.prototype)
        })
    }
    // register vm id so it can be found by sd-viewmodel
    if (options.id) {
        utils.registerVM(options.id, ExtendedVM)
    }
    // convert string template into a node
    // because cloneNode is faster than innerHTML
    if (options.template) {
        proto.templateNode = utils.makeTemplateNode(options)
    }
    return ExtendedVM
}

module.exports = api