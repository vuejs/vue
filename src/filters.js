module.exports = {

    capitalize: function (value) {
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1)
    },

    uppercase: function (value) {
        return value.toUpperCase()
    },

    delegate: function (handler, args) {
        var selector = args[0]
        return function (e) {
            if (e.target.webkitMatchesSelector(selector)) {
                handler.apply(this, arguments)
            }
        }
    }

}