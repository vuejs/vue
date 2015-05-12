var scope = typeof window === 'undefined'
  ? global
  : window

scope.hasWarned = function (_, msg) {
  return _.warn.calls.argsFor(0)[0].indexOf(msg) > -1
}