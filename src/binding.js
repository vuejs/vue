/*
 *  Binding class.
 *
 *  each property on the viewmodel has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 *  and multiple computed property dependents
 */
function Binding (compiler, key, isExp) {
    this.value = undefined
    this.isExp = !!isExp
    this.root = !this.isExp && key.indexOf('.') === -1
    this.compiler = compiler
    this.key = key
    this.instances = []
    this.subs = []
    this.deps = []
}

var BindingProto = Binding.prototype

/*
 *  Process the value, then trigger updates on all dependents
 */
BindingProto.update = function (value) {
    this.value = value
    var i = this.instances.length
    while (i--) {
        this.instances[i].update(value)
    }
    this.pub()
}

/*
 *  -- computed property only --    
 *  Force all instances to re-evaluate themselves
 */
BindingProto.refresh = function () {
    var i = this.instances.length
    while (i--) {
        this.instances[i].refresh()
    }
}

/*
 *  Unbind the binding, remove itself from all of its dependencies
 */
BindingProto.unbind = function () {
    var i = this.instances.length
    while (i--) {
        this.instances[i].unbind()
    }
    i = this.deps.length
    var subs
    while (i--) {
        subs = this.deps[i].subs
        subs.splice(subs.indexOf(this), 1)
    }
    // TODO if this is a root level binding
    this.compiler = this.pubs = this.subs = this.instances = this.deps = null
}

/*
 *  Notify computed properties that depend on this binding
 *  to update themselves
 */
BindingProto.pub = function () {
    var i = this.subs.length
    while (i--) {
        this.subs[i].refresh()
    }
}

module.exports = Binding