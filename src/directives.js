var config     = require('./config'),
    watchArray = require('./watchArray')

module.exports = {

    text: function (value) {
        this.el.textContent = value || ''
    },

    show: function (value) {
        this.el.style.display = value ? '' : 'none'
    },

    class: function (value) {
        this.el.classList[value ? 'add' : 'remove'](this.arg)
    },

    on: {
        update: function (handler) {
            var event = this.arg
            if (!this.handlers) {
                this.handlers = {}
            }
            var handlers = this.handlers
            if (handlers[event]) {
                this.el.removeEventListener(event, handlers[event])
            }
            if (handler) {
                handler = handler.bind(this.el)
                this.el.addEventListener(event, handler)
                handlers[event] = handler
            }
        },
        unbind: function () {
            var event = this.arg
            if (this.handlers) {
                this.el.removeEventListener(event, this.handlers[event])
            }
        }
    },

    each: {
        update: function (collection) {
            watchArray(collection, this.mutate.bind(this))
            // for each in array
            //   - create a Seed element using the el's outerHTML and raw data object
            //   - replace the raw object with new Seed's scope object
        },
        mutate: function (mutation) {
            console.log(mutation)
            console.log(this)
        }
    }

}

var push = [].push,
    slice = [].slice

function augmentArray (collection, directive) {
    collection.push = function (element) {
        push.call(this, arguments)
        directive.mutate({
            event: 'push',
            elements: slice.call(arguments),
            collection: collection
        })
    }
}