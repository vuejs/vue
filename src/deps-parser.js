var Emitter  = require('emitter'),
    config   = require('./config'),
    observer = new Emitter()

var dummyEl = document.createElement('div'),
    ARGS_RE = /^function\s*?\((.+?)\)/,
    SCOPE_RE_STR = '\\.scope\\.[\\.A-Za-z0-9_][\\.A-Za-z0-9_$]*',
    noop = function () {}

/*
 *  Auto-extract the dependencies of a computed property
 *  by recording the getters triggered when evaluating it.
 *
 *  However, the first pass will contain duplicate dependencies
 *  for computed properties. It is therefore necessary to do a
 *  second pass in injectDeps()
 */
function catchDeps (binding) {
    observer.on('get', function (dep) {
        binding.deps.push(dep)
    })
    parseContextDependency(binding)
    binding.value.get({
        scope: createDummyScope(binding),
        el: dummyEl
    })
    observer.off('get')
}

/*
 *  The second pass of dependency extraction.
 *  Only include dependencies that don't have dependencies themselves.
 */
function filterDeps (binding) {
    var i = binding.deps.length, dep
    config.log('\n─ ' + binding.key)
    while (i--) {
        dep = binding.deps[i]
        if (!dep.deps.length) {
            config.log('  └─' + dep.key)
            dep.subs.push(binding)
        } else {
            binding.deps.splice(i, 1)
        }
    }
}

/*
 *  We need to invoke each binding's getter for dependency parsing,
 *  but we don't know what sub-scope properties the user might try
 *  to access in that getter. To avoid thowing an error or forcing
 *  the user to guard against an undefined argument, we staticly
 *  analyze the function to extract any possible nested properties
 *  the user expects the target scope to possess. They are all assigned
 *  a noop function so they can be invoked with no real harm.
 */
function createDummyScope (binding) {
    var scope = {},
        deps = binding.contextDeps
    if (!deps) return scope
    var i = binding.contextDeps.length,
        j, level, key, path
    while (i--) {
        level = scope
        path = deps[i].split('.')
        j = 0
        while (j < path.length) {
            key = path[j]
            if (!level[key]) level[key] = noop
            level = level[key]
            j++
        }
    }
    return scope
}

/*
 *  Extract context dependency paths
 */
function parseContextDependency (binding) {
    var fn   = binding.value.get,
        str  = fn.toString(),
        args = str.match(ARGS_RE)
    if (!args) return null
    var argRE = new RegExp(args[1] + SCOPE_RE_STR, 'g'),
        matches = str.match(argRE),
        base = args[1].length + 7
    if (!matches) return null
    var i = matches.length,
        deps = [], dep
    while (i--) {
        dep = matches[i].slice(base)
        if (deps.indexOf(dep) === -1) {
            deps.push(dep)
        }
    }
    binding.contextDeps = deps
    binding.seed._contextBindings.push(binding)
}

module.exports = {

    /*
     *  the observer that catches events triggered by getters
     */
    observer: observer,

    /*
     *  parse a list of computed property bindings
     */
    parse: function (bindings) {
        config.log('\nparsing dependencies...')
        observer.isObserving = true
        bindings.forEach(catchDeps)
        bindings.forEach(filterDeps)
        observer.isObserving = false
        config.log('\ndone.')
    }
}