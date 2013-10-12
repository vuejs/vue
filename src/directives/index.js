module.exports = {

    on     : require('./on'),
    repeat : require('./repeat'),

    attr: function (value) {
        this.el.setAttribute(this.arg, value)
    },

    text: function (value) {
        this.el.textContent = isValidTextValue(value)
            ? value
            : ''
    },

    html: function (value) {
        this.el.innerHTML = isValidTextValue(value)
            ? value
            : ''
    },

    style: {
        bind: function () {
            this.arg = convertCSSProperty(this.arg)
        },
        update: function (value) {
            this.el.style[this.arg] = value
        }
    },

    show: function (value) {
        this.el.style.display = value ? '' : 'none'
    },

    visible: function (value) {
        this.el.style.visibility = value ? '' : 'hidden'
    },
    
    focus: function (value) {
        var el = this.el
        if (value) {
            setTimeout(function () {
                el.focus()
            }, 0)
        }
    },

    class: function (value) {
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

    value: {
        bind: function () {
            var el = this.el, self = this
            this.change = function () {
                self.vm.$set(self.key, el.value)
            }
            el.addEventListener('keyup', this.change)
        },
        update: function (value) {
            this.el.value = value ? value : ''
        },
        unbind: function () {
            this.el.removeEventListener('keyup', this.change)
        }
    },

    checked: {
        bind: function () {
            var el = this.el, self = this
            this.change = function () {
                self.vm.$set(self.key, el.checked)
            }
            el.addEventListener('change', this.change)
        },
        update: function (value) {
            this.el.checked = !!value
        },
        unbind: function () {
            this.el.removeEventListener('change', this.change)
        }
    },

    model: {
        bind: function () {
            var self = this,
                el   = self.el,
                type = el.type,
                lazy = self.compiler.options.lazy
            self.event =
                (lazy ||
                type === 'checkbox' ||
                type === 'select' ||
                type === 'radio')
                    ? 'change'
                    : 'keyup'
            self.attr = type === 'checkbox'
                ? 'checked'
                : 'value'
            self.set = function () {
                self.vm.$set(self.key, el[self.attr])
            }
            el.addEventListener(self.event, self.set)
        },
        update: function (value) {
            this.el[this.attr] = this.attr === 'checked'
                ? !!value
                : isValidTextValue(value)
                    ? value
                    : ''
        },
        unbind: function () {
            this.el.removeEventListener(this.event, this.set)
        }
    },

    'if': {
        bind: function () {
            this.parent = this.el.parentNode
            this.ref = document.createComment('sd-if-' + this.key)
        },
        update: function (value) {
            var attached = !!this.el.parentNode
            if (!this.parent) { // the node was detached when bound
                if (!attached) {
                    return
                } else {
                    this.parent = this.el.parentNode
                }
            }
            // should always have this.parent if we reach here
            if (!value) {
                if (attached) {
                    // insert the reference node
                    var next = this.el.nextSibling
                    if (next) {
                        this.parent.insertBefore(this.ref, next)
                    } else {
                        this.parent.appendChild(this.ref)
                    }
                    this.parent.removeChild(this.el)
                }
            } else if (!attached) {
                this.parent.insertBefore(this.el, this.ref)
                this.parent.removeChild(this.ref)
            }
        }
    }
}

/*
 *  convert hyphen style CSS property to Camel style
 */
var CONVERT_RE = /-(.)/g
function convertCSSProperty (prop) {
    if (prop.charAt(0) === '-') prop = prop.slice(1)
    return prop.replace(CONVERT_RE, function (m, char) {
        return char.toUpperCase()
    })
}

function isValidTextValue (value) {
    return typeof value === 'string' || typeof value === 'number'
}