var scope = typeof window === 'undefined'
  ? global
  : window

scope.hasWarned = function (_, msg) {
  var count = _.warn.calls.count()
  while (count--) {
    var args = _.warn.calls.argsFor(count)
    if (args.some(containsMsg)) {
      return true
    }
  }

  console.warn('[test] "' + msg + '" was never warned.')

  function containsMsg (arg) {
    return arg.indexOf(msg) > -1
  }
}

scope.process = {
  env: {
    NODE_ENV: 'development'
  }
}
