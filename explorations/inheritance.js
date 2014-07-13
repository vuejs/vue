var Observer = require('../src/observer/observer')
var _ = require('../src/util')

function Vue (options) {

  // scope prototypal inehritance
  var scope = this._scope = options.parent
    ? Object.create(options.parent._scope)
    : {}

  // copy instantiation data into scope
  for (var key in options.data) {
    if (key in scope) {
      // key exists on the scope prototype chain
      // cannot use direct set here, because in the parent
      // scope everything is already getter/setter and we
      // need to overwrite them with Object.defineProperty.
      _.define(scope, key, options.data[key], true)
    } else {
      scope[key] = options.data[key]
    }
  }

  // create observer
  // pass in noProto:true to avoid mutating the __proto__
  var ob = this._observer = Observer.create(this._scope, true)

  // relay change events from parent scope.
  // this ensures the current Vue instance is aware of
  // stuff going on up in the scope chain.
  if (options.parent) {
    var po = options.parent._observer
    ;['set', 'mutate', 'added', 'deleted'].forEach(function (event) {
      po.on(event, function (key, a, b) {
        if (!scope.hasOwnProperty(key)) {
          ob.emit(event, key, a, b)
        }
      })
    })
  }

  // proxy everything on self
  for (var key in this._scope) {
    _.proxy(this, this._scope, key)
  }

  // also proxy newly added keys.
  var self = this
  ob.on('added', function (key) {
    if (!self.hasOwnProperty(key)) {
      _.proxy(self, scope, key)
    }
  })

}

Vue.prototype.$add = function (key, val) {
  this._scope.$add.call(this._scope, key, val)
}

Vue.prototype.$delete = function (key) {
  this._scope.$delete.call(this._scope, key)
}

window.vm = new Vue({
  data: {
    a: 'go!',
    b: 2,
    c: {
      d: 3
    },
    arr: [{a:1}, {a:2}, {a:3}],
    get hello () {
      return 'hello!' + this.a
    },
    go: function () {
      console.log(this.a)
    }
  }
})

window.child = new Vue({
  parent: vm,
  data: {
    a: 1,
    change: function () {
      this.c.d = 4
      this.b = 456 // Unlike Angular, setting primitive values in Vue WILL affect outer scope,
                   // unless you overwrite it in the instantiation data!
    }
  }
})

vm._observer.on('set', function (key, val) {
  console.log('vm set:' + key.replace(/[\b]/g, '.'), val)
})

child._observer.on('set', function (key, val) {
  console.log('child set:' + key.replace(/[\b]/g, '.'), val)
})

vm._observer.on('mutate', function (key, val) {
  console.log('vm mutate:' + key.replace(/[\b]/g, '.'), val)
})

child._observer.on('mutate', function (key, val) {
  console.log('child mutate:' + key.replace(/[\b]/g, '.'), val)
})