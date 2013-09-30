var config      = require('./config'),
    ViewModel   = require('./viewmodel'),
    directives  = require('./directives'),
    filters     = require('./filters'),
    textParser  = require('./text-parser'),
    utils       = require('./utils'),
    templates   = require('./templates'),
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
 *  Register a template
 */
api.template = function (name, content) {
    return content
        ? templates.set(name, content)
        : templates.get(name)
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
            if (options.data) {
                opts.data = opts.data || {}
                utils.extend(opts.data, options.data)
            }
            opts.init = opts.init || options.init
            opts.template = opts.template || options.template
            opts.tagName = opts.tagName || options.tagName
            ParentVM.call(this, opts)
        }
    // inherit from ViewModel
    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype)
    utils.defProtected(proto, 'constructor', ExtendedVM)
    // copy props
    if (options.props) {
        utils.extend(proto, options.props, function (key) {
            return !(key in ParentVM.prototype)
        })
    }
    // register vm id so it can be found by sd-viewmodel
    if (options.id) {
        utils.registerVM(options.id, ExtendedVM)
    }
    // allow extended VM to be further extended
    ExtendedVM.extend = extend
    ExtendedVM.super = ParentVM
    return ExtendedVM
}

module.exports = api