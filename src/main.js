var config      = require('./config'),
    ViewModel   = require('./viewmodel'),
    directives  = require('./directives'),
    filters     = require('./filters'),
    utils       = require('./utils')

/**
 *  Set config options
 */
ViewModel.config = function (opts) {
    if (opts) {
        utils.extend(config, opts)
        if (opts.prefix) updatePrefix()
    }
    return this
}

/**
 *  Allows user to register/retrieve a directive definition
 */
ViewModel.directive = function (id, fn) {
    if (!fn) return directives[id]
    directives[id] = fn
    return this
}

/**
 *  Allows user to register/retrieve a filter function
 */
ViewModel.filter = function (id, fn) {
    if (!fn) return filters[id]
    filters[id] = fn
    return this
}

/**
 *  Allows user to register/retrieve a ViewModel constructor
 */
ViewModel.component = function (id, Ctor) {
    if (!Ctor) return utils.components[id]
    utils.components[id] = utils.toConstructor(Ctor)
    return this
}

/**
 *  Allows user to register/retrieve a Custom element constructor
 */
ViewModel.element = function (id, Ctor) {
    if (!Ctor) return utils.elements[id]
    utils.elements[id] = utils.toConstructor(Ctor)
    return this
}

/**
 *  Allows user to register/retrieve a template partial
 */
ViewModel.partial = function (id, partial) {
    if (!partial) return utils.partials[id]
    utils.partials[id] = utils.toFragment(partial)
    return this
}

/**
 *  Allows user to register/retrieve a transition definition object
 */
ViewModel.transition = function (id, transition) {
    if (!transition) return utils.transitions[id]
    utils.transitions[id] = transition
    return this
}

ViewModel.extend = extend

/**
 *  Expose the main ViewModel class
 *  and add extend method
 */
function extend (options) {

    var ParentVM = this

    // inherit options
    options = inheritOptions(options, ParentVM.options, true)
    utils.processOptions(options)

    var ExtendedVM = function (opts) {
        opts = inheritOptions(opts, options, true)
        ParentVM.call(this, opts)
    }

    // inherit prototype props
    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype)
    utils.defProtected(proto, 'constructor', ExtendedVM)

    // copy prototype props
    var protoMixins = options.proto
    if (protoMixins) {
        for (var key in protoMixins) {
            if (!(key in ViewModel.prototype)) {
                proto[key] = protoMixins[key]
            }
        }
    }

    // allow extended VM to be further extended
    ExtendedVM.extend = extend
    ExtendedVM.super = ParentVM
    ExtendedVM.options = options
    return ExtendedVM
}

/**
 *  Inherit options
 *
 *  For options such as `scope`, `vms`, `directives`, 'partials',
 *  they should be further extended. However extending should only
 *  be done at top level.
 *  
 *  `proto` is an exception because it's handled directly on the
 *  prototype.
 *
 *  `el` is an exception because it's not allowed as an
 *  extension option, but only as an instance option.
 */
function inheritOptions (child, parent, topLevel) {
    child = child || utils.hash()
    if (!parent) return child
    for (var key in parent) {
        if (key === 'el' || key === 'proto') continue
        if (!child[key]) { // child has priority
            child[key] = parent[key]
        } else if (topLevel && utils.typeOf(child[key]) === 'Object') {
            inheritOptions(child[key], parent[key], false)
        }
    }
    return child
}

/**
 *  Update prefix for some special directives
 *  that are used in compilation.
 */
var specialAttributes = [
    'id',
    'pre',
    'text',
    'repeat',
    'partial',
    'component',
    'transition'
]

function updatePrefix () {
    specialAttributes.forEach(setPrefix)
}

function setPrefix (attr) {
    config.attrs[attr] = config.prefix + '-' + attr
}

updatePrefix()
module.exports = ViewModel