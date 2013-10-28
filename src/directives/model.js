var utils = require('../utils'),
    isIE  = !!document.attachEvent

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
                : 'input'

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

        // fix shit for IE9
        // since it doesn't fire input on backspace / del / cut
        if (isIE) {
            el.addEventListener('cut', self.set)
            el.addEventListener('keydown', function (e) {
                if (e.keyCode === 46 || e.keyCode === 8) {
                    self.set()
                }
            })
        }
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