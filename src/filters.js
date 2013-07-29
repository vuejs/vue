module.exports = {
    capitalize: function (value) {
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1)
    },
    uppercase: function (value) {
        return value.toUpperCase()
    }
}