var baseURL = 'https://vue-demo.firebaseIO.com/',
    Users   = new Firebase(baseURL + 'users')

Users.on('child_added', function (snapshot) {
    var item = snapshot.val()
    item.id = snapshot.name()
    app.users.push(item)
})

Users.on('child_removed', function (snapshot) {
    var id = snapshot.name()
    app.users.some(function (user) {
        if (user.id === id) {
            app.users.remove(user)
            return true
        }
    })
})

var app = new Vue({
    el: '#app',
    filters: validators,
    data: {
        users: [],
        newUser: {
            name: '',
            email: ''
        },
        validation: {
            name: false,
            email: false
        }
    },
    computed: {
        isValid: function () {
            var valid = true
            for (var key in this.validation) {
                if (!this.validation[key]) {
                    valid = false
                }
            }
            return valid
        }
    },
    methods: {
        addUser: function (e) {
            e.preventDefault()
            console.log(this)
            if (this.isValid) {
                Users.push(this.newUser)
                this.newUser = {}
            }
        },
        removeUser: function (user) {
            new Firebase(baseURL + 'users/' + user.id).remove()
        }
    }
})