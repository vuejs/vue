exports._init = function (options) {

  var data = options.data
  var parent = options.parent
  var scope = this._scope = parent
    ? Object.create(parent._scope)
    : {}

  // copy instantiation data into scope
  for (var key in data) {
    if (key in scope) {
      // key exists on the scope prototype chain
      // cannot use direct set here, because in the parent
      // scope everything is already getter/setter and we
      // need to overwrite them with Object.defineProperty.
      _.define(scope, key, data[key], true)
    } else {
      scope[key] = data[key]
    }
  }

  // create observer
  // pass in noProto:true to avoid mutating the __proto__
  var ob = this._observer = Observer.create(scope, { noProto: true })
  var dob = Observer.create(data)
  var locked = false

  // sync scope and original data.
  ob
    .on('set', guard(function (key, val) {
      data[key] = val
    }))
    .on('added', guard(function (key, val) {
      data.$add(key, val)
    }))
    .on('deleted', guard(function (key) {
      data.$delete(key)
    }))

  // also need to sync data object changes to scope...
  // this would cause cycle updates, so we need to lock
  // stuff when one side updates the other
  dob
    .on('set', guard(function (key, val) {
      scope[key] = val
    }))
    .on('added', guard(function (key, val) {
      scope.$add(key, val)
    }))
    .on('deleted', guard(function (key) {
      scope.$delete(key)
    }))

  function guard (fn) {
    return function (key, val) {
      if (locked || key.indexOf(Observer.pathDelimiter) > -1) {
        return
      }
      locked = true
      fn(key, val)
      locked = false
    }
  }

  // relay change events from parent scope.
  // this ensures the current Vue instance is aware of
  // stuff going on up in the scope chain.
  if (parent) {
    var po = parent._observer
    ;['set', 'mutate', 'added', 'deleted'].forEach(function (event) {
      po.on(event, function (key, a, b) {
        if (!scope.hasOwnProperty(key)) {
          ob.emit(event, key, a, b)
        }
      })
    })
  }

  // proxy everything on self
  for (var key in scope) {
    _.proxy(this, scope, key)
  }

  // also proxy newly added keys.
  var self = this
  ob.on('added', function (key) {
    _.proxy(self, scope, key)
  })
  
}