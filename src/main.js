var config      = require('./config'),
    ViewModel   = require('./viewmodel'),
    directives  = require('./directives'),
    filters     = require('./filters'),
    utils       = require('./utils')

/**
 *  Set config options
 */
ViewModel.config = function (opts, val) {
    if (typeof opts === 'string') {
        if (val === undefined) {
            return config[opts]
        } else {
            config[opts] = val
        }
    } else {
        utils.extend(config, opts)
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

/**
 *  Expose internal modules for plugins
 */
ViewModel.require = function (path) {
    return require('./' + path)
}

/**
 *  Expose an interface for plugins
 */
ViewModel.use = function (plugin) {
    if (typeof plugin === 'string') {
        try {
            plugin = require(plugin)
        } catch (e) {
            return utils.warn('Cannot find plugin: ' + plugin)
        }
    }
    if (typeof plugin === 'function') {
        plugin(ViewModel)
    } else if (plugin.install) {
        plugin.install(ViewModel)
    }
}

ViewModel.extend = extend
ViewModel.nextTick = utils.nextTick

/**
 *  Expose the main ViewModel class
 *  and add extend method
 */
function extend (options) {

    var ParentVM = this

    // inherit options
    options = inheritOptions(options, ParentVM.options, true)
    utils.processOptions(options)

    var ExtendedVM = function (opts, asParent) {
        if (!asParent) {
            opts = inheritOptions(opts, options, true)
        }
        ParentVM.call(this, opts, true)
    }

    // inherit prototype props
    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype)
    utils.defProtected(proto, 'constructor', ExtendedVM)

    // copy prototype props
    var methods = options.methods
    if (methods) {
        for (var key in methods) {
            if (
                !(key in ViewModel.prototype) &&
                typeof methods[key] === 'function'
            ) {
                proto[key] = methods[key]
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
 *  For options such as `data`, `vms`, `directives`, 'partials',
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
        if (key === 'el' || key === 'methods') continue
        var val = child[key],
            parentVal = parent[key],
            type = utils.typeOf(val)
        if (topLevel && type === 'Function' && parentVal) {
            // merge hook functions into an array
            child[key] = [val]
            if (Array.isArray(parentVal)) {
                child[key] = child[key].concat(parentVal)
            } else {
                child[key].push(parentVal)
            }
        } else if (topLevel && type === 'Object') {
            // merge toplevel object options
            inheritOptions(val, parentVal)
        } else if (val === undefined) {
            // inherit if child doesn't override
            child[key] = parentVal
        }
    }
    return child
}

module.exports = ViewModel