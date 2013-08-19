var Compiler = require('./compiler')

/*
 *  ViewModel exposed to the user that holds data,
 *  computed properties, event handlers
 *  and a few reserved methods
 */
function ViewModel (options) {

    // determine el
    this.$el = options.template
        ? options.template.cloneNode(true)
        : typeof options.el === 'string'
            ? document.querySelector(options.el)
            : options.el

    // possible info inherited as an each item
    this.$index  = options.index
    this.$parent = options.parentCompiler && options.parentCompiler.vm

    // compile. options are passed directly to compiler
    new Compiler(this, options)
}

var VMProto = ViewModel.prototype

VMProto.$wait = function () {
    this.__wait__ = true
}

VMProto.$ready = function () {
    this.$compiler.observer.emit('ready')
}

/*
 *  watch a key on the viewmodel for changes
 *  fire callback with new value
 */
VMProto.$watch = function () {
    // TODO just listen on this.$compiler.observer
}

/*
 *  remove watcher
 */
VMProto.$unwatch = function () {
    // TODO
}

/*
 *  unbind everything, remove everything
 */
VMProto.$destroy = function () {
    this.$compiler.destroy()
    this.$compiler = null
}

module.exports = ViewModel