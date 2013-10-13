var utils = require('../utils')

module.exports = {

    bind: function () {

        var self = this,
            el   = self.el,
            type = el.type

        self.lock = false

        // determine what event to listen to
        self.event =
            (self.compiler.options.lazy ||
            el.tagName === 'SELECT' ||
            type === 'checkbox' ||
            type === 'radio')
                ? 'change'
                : 'keyup'

        // determin the attribute to change when updating
        var attr = type === 'checkbox'
            ? 'checked'
            : 'value'

        // attach listener
        self.set = function () {
            self.lock = true
            self.vm.$set(self.key, el[attr])
            self.lock = false
        }
        el.addEventListener(self.event, self.set)
    },

    update: function (value) {
        /* jshint eqeqeq: false */
        var self = this,
            el   = self.el
        if (self.lock) return
        if (el.tagName === 'SELECT') { // select dropdown
            // setting <select>'s value in IE9 doesn't work
            var o = el.options,
                i = o.length,
                index = -1
            while (i--) {
                if (o[i].value == value) {
                    index = i
                    break
                }
            }
            o.selectedIndex = index
        } else if (el.type === 'radio') { // radio button
            el.checked = value == el.value
        } else if (el.type === 'checkbox') { // checkbox
            el.checked = !!value
        } else {
            el.value = utils.toText(value)
        }
    },

    unbind: function () {
        this.el.removeEventListener(this.event, this.set)
    }
}