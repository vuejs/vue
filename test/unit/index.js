import Vue from 'vue'

Vue.config.preserveWhitespace = false

if (typeof console === 'undefined') {
  window.console = {
    error: function () {}
  }
}

function hasWarned (msg) {
  var count = console.error.calls.count()
  var args
  while (count--) {
    args = console.error.calls.argsFor(count)
    if (args.some(containsMsg)) {
      return true
    }
  }

  function containsMsg (arg) {
    if (arg instanceof Error) throw arg
    return typeof arg === 'string' && arg.indexOf(msg) > -1
  }
}

// define custom matcher for warnings
beforeEach(function () {
  spyOn(console, 'error')
  jasmine.addMatchers({
    toHaveBeenWarned: function () {
      return {
        compare: function (msg) {
          var warned = Array.isArray(msg)
            ? msg.some(hasWarned)
            : hasWarned(msg)
          return {
            pass: warned,
            message: warned
              ? 'Expected message "' + msg + '" not to have been warned'
              : 'Expected message "' + msg + '" to have been warned'
          }
        }
      }
    }
  })
})

// helper for async assertions.
// Use like this:
//
// vm.a = 123
// waitForUpdate(() => {
//   expect(vm.$el.textContent).toBe('123')
//   vm.a = 234
// })
// .then(() => {
//   // more assertions...
//   done()
// })
// .catch(done)
window.waitForUpdate = initialCb => {
  let onError
  const queue = [initialCb]

  function shift () {
    const job = queue.shift()
    let hasError = false
    try {
      job()
    } catch (e) {
      hasError = true
      if (onError) {
        onError(e)
      }
    }
    if (!hasError) {
      if (queue.length) {
        Vue.nextTick(shift)
      }
    }
  }

  Vue.nextTick(shift)

  const chainer = {
    then: nextCb => {
      queue.push(nextCb)
      return chainer
    },
    catch: errorCb => {
      onError = errorCb
      return chainer
    }
  }

  return chainer
}

// require all test files
const testsContext = require.context('./', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
