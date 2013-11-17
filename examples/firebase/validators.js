var validators = (function () {
    var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return {
        nameValidator: function (val) {
            this.validation.name = !!val
            return val
        },
        emailValidator: function (val) {
            this.validation.email = emailRE.test(val)
            return val
        }
    }
})()