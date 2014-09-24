var baseURL = 'https://vue-demo.firebaseIO.com/'
var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

/**
 * Setup firebase sync
 */

var Users = new Firebase(baseURL + 'users')

Users.on('child_added', function (snapshot) {
  var item = snapshot.val()
  item.id = snapshot.name()
  app.users.push(item)
})

Users.on('child_removed', function (snapshot) {
  var id = snapshot.name()
  app.users.some(function (user) {
    if (user.id === id) {
      app.users.$remove(user)
      return true
    }
  })
})

/**
 * Create Vue app
 */

var app = new Vue({

  // element to mount to
  el: '#app',

  // initial data
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

  // validation filters are "write only" filters
  filters: {
    nameValidator: {
      write: function (val) {
        this.validation.name = !!val
        return val
      }
    },
    emailValidator: {
      write: function (val) {
        this.validation.email = emailRE.test(val)
        return val
      }
    }
  },

  // computed property for form validation state
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
  
  // methods
  methods: {
    addUser: function (e) {
      e.preventDefault()
      if (this.isValid) {
        Users.push(this.newUser)
        this.newUser = {
          name: '',
          email: ''
        }
      }
    },
    removeUser: function (user) {
      new Firebase(baseURL + 'users/' + user.id).remove()
    }
  }
})