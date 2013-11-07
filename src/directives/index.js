var utils = require('../utils'),
    transition = require('../transition')

module.exports = {

    on     : require('./on'),
    repeat : require('./repeat'),
    model  : require('./model'),

    attr: function (value) {
        this.el.setAttribute(this.arg, value)
    },

    text: function (value) {
        this.el.textContent = utils.toText(value)
    },

    html: function (value) {
        this.el.innerHTML = utils.toText(value)
    },

    style: {
        bind: function () {
            this.arg = convertCSSProperty(this.arg)
        },
        update: function (value) {
            this.el.style[this.arg] = value
        }
    },

    show: function (value, init) {
        var el = this.el,
            change = function () {
                el.style.display = value ? '' : 'none'
            }
        transition(el, value ? 1 : -1, change, init)
    },

    visible: function (value) {
        this.el.style.visibility = value ? '' : 'hidden'
    },

    'class': function (value) {
        if (this.arg) {
            this.el.classList[value ? 'add' : 'remove'](this.arg)
        } else {
            if (this.lastVal) {
                this.el.classList.remove(this.lastVal)
            }
            this.el.classList.add(value)
            this.lastVal = value
        }
    },

    'if': {
        bind: function () {
            this.parent = this.el.parentNode
            this.ref = document.createComment('sd-if-' + this.key)
            this.el.sd_ref = this.ref
        },
        update: function (value, init) {

            var el = this.el,
                attached = !!el.parentNode

            if (!this.parent) { // the node was detached when bound
                if (!attached) {
                    return
                } else {
                    this.parent = el.parentNode
                }
            }

            // should always have this.parent if we reach here
            var parent = this.parent,
                ref    = this.ref

            if (!value) {
                if (attached) {
                    // insert the reference node
                    var next = el.nextSibling
                    if (next) {
                        parent.insertBefore(ref, next)
                    } else {
                        parent.appendChild(ref)
                    }
                    transition(el, -1, remove, init)
                }
            } else if (!attached) {
                transition(el, 1, insert, init)
            }

            function remove () {
                parent.removeChild(el)  
            }

            function insert () {
                parent.insertBefore(el, ref)
                parent.removeChild(ref) 
            }
        },
        unbind: function () {
            this.el.sd_ref = null
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