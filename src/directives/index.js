module.exports = {

    on     : require('./on'),
    repeat : require('./repeat'),

    attr: function (value) {
        this.el.setAttribute(this.arg, value)
    },

    text: function (value) {
        this.el.textContent = toText(value)
    },

    html: function (value) {
        this.el.innerHTML = toText(value)
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

    model: {
        bind: function () {
            var self = this,
                el   = self.el,
                type = el.type,
                lazy = self.compiler.options.lazy
            self.event =
                (lazy ||
                el.tagName === 'SELECT' ||
                type === 'checkbox' ||
                type === 'radio')
                    ? 'change'
                    : 'keyup'
            self.attr = type === 'checkbox'
                ? 'checked'
                : 'value'
            self.set = function () {
                self.lock = true
                self.vm.$set(self.key, el[self.attr])
                self.lock = false
            }
            el.addEventListener(self.event, self.set)
        },
        update: function (value) {
            var self = this,
                el   = self.el
            if (self.lock) return
            if (el.type === 'radio') {
                /* jshint eqeqeq: false */
                el.checked = value == el.value
            } else if (el.tagName === 'SELECT') {
                // you cannot set <select>'s value in stupid IE9
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
            } else {
                this.el[this.attr] = this.attr === 'checked'
                    ? !!value
                    : toText(value)
            }
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

/*
 *  Make sure only strings and numbers are output to html
 */
function toText (value) {
    return (typeof value === 'string' || typeof value === 'number')
        ? value
        : ''
}