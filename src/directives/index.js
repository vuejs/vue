module.exports = {

    on    : require('./on'),
    each  : require('./each'),

    attr: function (value) {
        this.el.setAttribute(this.arg, value)
    },

    text: function (value) {
        this.el.textContent =
            (typeof value === 'string' || typeof value === 'number')
            ? value : ''
    },

    html: function (value) {
        this.el.innerHTML =
            (typeof value === 'string' || typeof value === 'number')
            ? value : ''
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

    'if': {
        bind: function () {
            this.parent = this.el.parentNode
            this.ref = document.createComment('sd-if-' + this.key)
            var next = this.el.nextSibling
            if (next) {
                this.parent.insertBefore(this.ref, next)
            } else {
                this.parent.appendChild(this.ref)
            }
        },
        update: function (value) {
            if (!value) {
                if (this.el.parentNode) {
                    this.parent.removeChild(this.el)
                }
            } else {
                if (!this.el.parentNode) {
                    this.parent.insertBefore(this.el, this.ref)
                }
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