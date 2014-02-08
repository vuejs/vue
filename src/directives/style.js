var camelRE = /-([a-z])/g,
    prefixes = ['webkit', 'moz', 'ms']

function camelReplacer (m) {
    return m[1].toUpperCase()
}

module.exports = {

    bind: function () {
        var prop = this.arg,
            first = prop.charAt(0)
        if (first === '$') {
            // properties that start with $ will be auto-prefixed
            prop = prop.slice(1)
            this.prefixed = true
        } else if (first === '-') {
            // normal starting hyphens should not be converted
            prop = prop.slice(1)
        }
        this.prop = prop.replace(camelRE, camelReplacer)
    },

    update: function (value) {
        var prop = this.prop
        this.el.style[prop] = value
        if (this.prefixed) {
            prop = prop.charAt(0).toUpperCase() + prop.slice(1)
            var i = prefixes.length
            while (i--) {
                this.el.style[prefixes[i] + prop] = value
            }
        }
    }

}