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
ViewModel.viewmodel = function (id, Ctor) {
    if (!Ctor) return utils.viewmodels[id]
    utils.viewmodels[id] = Ctor
    return this
}

/**
 *  Allows user to register/retrieve a template partial
 */
ViewModel.partial = function (id, partial) {
    if (!partial) return utils.partials[id]
    utils.partials[id] = templateToFragment(partial)
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
    // convert template to documentFragment
    if (options.template) {
        options.templateFragment = templateToFragment(options.template)
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
    child = child || {}
    convertPartials(child.partials)
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
 *  Convert an object of partials to dom fragments
 */
function convertPartials (partials) {
    if (!partials) return
    for (var key in partials) {
        if (typeof partials[key] === 'string') {
            partials[key] = templateToFragment(partials[key])
        }
    }
}

/**
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

module.exports = ViewModel