var utils = require('../utils'),
    isIE9 = navigator.userAgent.indexOf('MSIE 9.0') > 0

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
            self.vm.$set(self.key, el[attr])
        }
        el.addEventListener(self.event, self.set)

        // fix shit for IE9
        // since it doesn't fire input on backspace / del / cut
        if (isIE9) {
            self.onCut = function () {
                // cut event fires before the value actually changes
                setTimeout(function () {
                    self.set()
                }, 0)
            }
            self.onDel = function (e) {
                if (e.keyCode === 46 || e.keyCode === 8) {
                    self.set()
                }
            }
            el.addEventListener('cut', self.onCut)
            el.addEventListener('keyup', self.onDel)
        }
    },

    update: function (value) {
        /* jshint eqeqeq: false */
        var self = this,
            el   = self.el
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
        if (isIE9) {
            this.el.removeEventListener('cut', this.onCut)
            this.el.removeEventListener('keyup', this.onDel)
        }
    }
}