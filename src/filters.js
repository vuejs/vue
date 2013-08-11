var keyCodes = {
    enter: 13,
    tab: 9,
    'delete': 46,
    up: 38,
    left: 37,
    right: 39,
    down: 40,
    esc: 27
}

module.exports = {

    trim: function (value) {
        return value ? value.toString().trim() : ''
    },

    capitalize: function (value) {
        if (!value) return ''
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1)
    },

    uppercase: function (value) {
        return value ? value.toString().toUpperCase() : ''
    },

    lowercase: function (value) {
        return value ? value.toString().toLowerCase() : ''
    },

    currency: function (value, args) {
        if (!value) return ''
        var sign = (args && args[0]) || '$',
            i = value % 3,
            f = '.' + value.toFixed(2).slice(-2),
            s = Math.floor(value).toString()
        return sign + s.slice(0, i) + s.slice(i).replace(/(\d{3})(?=\d)/g, '$1,') + f
    },

    key: function (handler, args) {
        if (!handler) return
        var code = keyCodes[args[0]]
        if (!code) {
            code = parseInt(args[0], 10)
        }
        return function (e) {
            if (e.keyCode === code) {
                handler.call(this, e)
            }
        }
    }

}