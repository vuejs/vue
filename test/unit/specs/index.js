// set some global Vue options
var Vue = require('src')
Vue.options.replace = false
Vue.config.silent = true

/**
 * Because Vue's internal modules reference the warn function
 * from different modules (some from util and some from debug),
 * we need to normalize the warn check into a few global
 * utility functions.
 */

var _ = require('src/util')
var __ = require('src/util/debug')
var scope = typeof window === 'undefined'
  ? global
  : window

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
    if (arg instanceof Error) throw arg
    return typeof arg === 'string' && arg.indexOf(msg) > -1
  }
}

scope.process = {
  env: {
    NODE_ENV: 'development'
  }
}

// require all test files
var testsContext = require.context('.', true, /_spec$/)
testsContext.keys().forEach(testsContext)
