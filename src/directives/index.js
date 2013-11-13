var utils      = require('../utils'),
    transition = require('../transition')

module.exports = {

    on     : require('./on'),
    repeat : require('./repeat'),
    model  : require('./model'),
    'if'   : require('./if'),

    attr: function (value) {
        this.el.setAttribute(this.arg, value)
    },

    text: function (value) {
        this.el.textContent = utils.toText(value)
    },

    html: function (value) {
        this.el.innerHTML = utils.toText(value)
    },

    visible: function (value) {
        this.el.style.visibility = value ? '' : 'hidden'
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
    },

    style: {
        bind: function () {
            this.arg = convertCSSProperty(this.arg)
        },
        update: function (value) {
            this.el.style[this.arg] = value
        }
    }
}

/**
 *  convert hyphen style CSS property to Camel style
 */
var CONVERT_RE = /-(.)/g
function convertCSSProperty (prop) {
    if (prop.charAt(0) === '-') prop = prop.slice(1)
    return prop.replace(CONVERT_RE, function (m, char) {
        return char.toUpperCase()
    })
}