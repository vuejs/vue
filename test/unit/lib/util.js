var scope = typeof window === 'undefined'
  ? global
  : window

scope.hasWarned = function (_, msg) {
  var args = _.warn.calls.argsFor(0)
  return !!(args[0] && args[0].indexOf(msg) > -1)
}