var utils      = require('../utils'),
    transition = require('../transition')

module.exports = {

    on        : require('./on'),
    repeat    : require('./repeat'),
    model     : require('./model'),
    'if'      : require('./if'),
    'with'    : require('./with'),

    attr: function (value) {
        this.el.setAttribute(this.arg, value)
    },

    text: function (value) {
        this.el.textContent = utils.toText(value)
    },

    html: function (value) {
        this.el.innerHTML = utils.toText(value)
    },

    show: function (value) {
        var el = this.el,
            target = value ? '' : 'none',
            change = function () {
                el.style.display = target
            }
        transition(el, value ? 1 : -1, change, this.compiler)
    },

    'class': function (value) {
        if (this.arg) {
            this.el.classList[value ? 'add' : 'remove'](this.arg)
        } else {
            if (this.lastVal) {
                this.el.classList.remove(this.lastVal)
            }
            if (value) {
                this.el.classList.add(value)
                this.lastVal = value
            }
        }
    }

}