var Emitter  = require('emitter')

/*
 *  Binding class.
 *
 *  each property on the scope has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 *  and multiple computed property dependents
 */
function Binding (value) {
    this.value = value
    this.instances = []
    this.dependents = []
}

/*
 *  Pre-process a passed in value based on its type
 */
Binding.prototype.set = function (value) {
    var type = typeOf(value),
        self = this
    // preprocess the value depending on its type
    if (type === 'Object') {
        if (value.get) { // computed property
            self.isComputed = true
        } else { // normal object
            // TODO watchObject
        }
    } else if (type === 'Array') {
        watchArray(value)
        value.on('mutate', function () {
            self.emitChange()
        })
    }
    this.value = value
}

/*
 *  Process the value, then trigger updates on all dependents
 */
Binding.prototype.update = function (value) {
    this.set(value)
    this.instances.forEach(function (instance) {
        instance.update(value)
    })
    this.emitChange()
}

/*
 *  Notify computed properties that depend on this binding
 *  to update themselves
 */
Binding.prototype.emitChange = function () {
    this.dependents.forEach(function (dept) {
        dept.refresh()
    })
}

/*
 *  get accurate type of an object
 */
var toString = Object.prototype.toString
function typeOf (obj) {
    return toString.call(obj).slice(8, -1)
}

/*
 *  augment an Array so that it emit events when mutated
 */
var aproto = Array.prototype,
    arrayMutators = ['push','pop','shift','unshift','splice','sort','reverse'],
    arrayAugmentations = {
        remove: function (index) {
            if (typeof index !== 'number') index = index.$index
            this.splice(index, 1)
        },
        replace: function (index, data) {
            if (typeof index !== 'number') index = index.$index
            this.splice(index, 1, data)
        }
    }

function watchArray (collection) {
    Emitter(collection)
    arrayMutators.forEach(function (method) {
        collection[method] = function () {
            var result = aproto[method].apply(this, arguments)
            collection.emit('mutate', {
                method: method,
                args: aproto.slice.call(arguments),
                result: result
            })
        }
    })
    for (var method in arrayAugmentations) {
        collection[method] = arrayAugmentations[method]
    }
}

module.exports = Binding