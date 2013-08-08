var Emitter = require('emitter')

/*
 *  Binding class
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
 *  Notify computed properties that depends on this binding
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
var OtoString = Object.prototype.toString
function typeOf (obj) {
    return OtoString.call(obj).slice(8, -1)
}

/*
 *  augment an Array so that it emit events when mutated
 */
var arrayMutators = ['push','pop','shift','unshift','splice','sort','reverse']
var arrayAugmentations = {
    remove: function (scope) {
        this.splice(scope.$index, 1)
    },
    replace: function (index, data) {
        if (typeof index !== 'number') {
            index = index.$index
        }
        this.splice(index, 1, data)
    }
}

function watchArray (collection) {
    Emitter(collection)
    arrayMutators.forEach(function (method) {
        collection[method] = function () {
            var result = Array.prototype[method].apply(this, arguments)
            collection.emit('mutate', {
                method: method,
                args: Array.prototype.slice.call(arguments),
                result: result
            })
        }
    })
    for (var method in arrayAugmentations) {
        collection[method] = arrayAugmentations[method]
    }
}

module.exports = Binding