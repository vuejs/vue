var _ = require('../../../src/util')
var __ = require('../../../src/util/debug')

var scope = typeof window === 'undefined'
  ? global
  : window

/**
 * Because Vue's internal modules reference the warn function
 * from different modules (some from util and some from debug),
 * we need to normalize the warn check into a few global
 * utility functions.
 */

scope.spyWarns = function () {
  spyOn(_, 'warn')
  spyOn(__, 'warn')
}

scope.getWarnCount = function () {
  return _.warn.calls.count() + __.warn.calls.count()
}

scope.hasWarned = function (msg, silent) {
  var count = _.warn.calls.count()
  var args
  while (count--) {
    args = _.warn.calls.argsFor(count)
    if (args.some(containsMsg)) {
      return true
    }
  }

  count = __.warn.calls.count()
  while (count--) {
    args = __.warn.calls.argsFor(count)
    if (args.some(containsMsg)) {
      return true
    }
  }

  if (!silent) {
    console.warn('[test] "' + msg + '" was never warned.')
  }

  function containsMsg (arg) {
    return arg.indexOf(msg) > -1
  }
}

scope.process = {
  env: {
    NODE_ENV: 'development'
  }
}
