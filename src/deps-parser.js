var Emitter  = require('emitter'),
    observer = new Emitter()

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
    binding.value.get()
    observer.off('get')
}

/*
 *  The second pass of dependency extraction.
 *  Only include dependencies that don't have dependencies themselves.
 */
function filterDeps (binding) {
    var i = binding.deps.length, dep
    while (i--) {
        dep = binding.deps[i]
        if (!dep.deps.length) {
            dep.subs.push.apply(dep.subs, binding.instances)
        } else {
            binding.deps.splice(i, 1)
        }
    }
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
        observer.isObserving = true
        bindings.forEach(catchDeps)
        bindings.forEach(filterDeps)
        observer.isObserving = false
    }
}