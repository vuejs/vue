module.exports = {

    capitalize: function (value) {
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1)
    },

    uppercase: function (value) {
        return value.toString().toUpperCase()
    },

    delegate: function (handler, args) {
        var selector = args[0]
        return function (e) {
            if (delegateCheck(e.target, e.currentTarget, selector)) {
                handler.apply(this, arguments)
            }
        }
    }

}

function delegateCheck (current, top, selector) {
    if (current.webkitMatchesSelector(selector)) {
        return true
    } else if (current === top) {
        return false
    } else {
        return delegateCheck(current.parentNode, top, selector)
    }
}