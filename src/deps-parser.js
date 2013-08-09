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
        binding.dependencies.push(dep)
    })
    binding.value.get()
    observer.off('get')
}

/*
 *  The second pass of dependency extraction.
 *  Only include dependencies that don't have dependencies themselves.
 */
function injectDeps (binding) {
    binding.dependencies.forEach(function (dep) {
        if (!dep.dependencies.length) {
            dep.dependents.push.apply(dep.dependents, binding.instances)
        }
    })
}

module.exports = {
    observer: observer,
    parse: function (bindings) {
        observer.isObserving = true
        bindings.forEach(catchDeps)
        bindings.forEach(injectDeps)
        observer.isObserving = false
    }
}