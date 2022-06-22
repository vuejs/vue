export { waitForUpdate } from '../helpers/wait-for-update'
export { nextFrame } from 'web/runtime/transition-util'

// toHaveBeenWarned() matcher
function noop() {}

if (typeof console === 'undefined') {
  // @ts-ignore
  window.console = {
    warn: noop,
    error: noop
  }
}

// avoid info messages during test
console.info = noop

let asserted

function createCompareFn(spy) {
  const hasWarned = msg => {
    let count = spy.calls.count()
    let args
    while (count--) {
      args = spy.calls.argsFor(count)
      if (args.some(containsMsg)) {
        return true
      }
    }

    function containsMsg(arg) {
      return arg.toString().indexOf(msg) > -1
    }
  }

  return {
    compare: msg => {
      asserted = asserted.concat(msg)
      const warned = Array.isArray(msg) ? msg.some(hasWarned) : hasWarned(msg)
      return {
        pass: warned,
        message: warned
          ? 'Expected message "' + msg + '" not to have been warned'
          : 'Expected message "' + msg + '" to have been warned'
      }
    }
  }
}

// define custom matcher for warnings
beforeEach(() => {
  asserted = []
  // @ts-ignore
  spyOn(console, 'warn')
  // @ts-ignore
  spyOn(console, 'error')
  jasmine.addMatchers({
    toHaveBeenWarned: () => createCompareFn(console.error),
    toHaveBeenTipped: () => createCompareFn(console.warn)
  })
})

afterEach(done => {
  const warned = msg =>
    asserted.some(assertedMsg => msg.toString().indexOf(assertedMsg) > -1)
  // @ts-ignore
  let count = console.error.calls.count()
  let args
  while (count--) {
    // @ts-ignore
    args = console.error.calls.argsFor(count)
    if (!warned(args[0])) {
      // @ts-ignore
      done.fail(`Unexpected console.error message: ${args[0]}`)
      return
    }
  }
  done()
})

// injectStyles helper
function insertCSS(text) {
  const cssEl = document.createElement('style')
  cssEl.textContent = text.trim()
  document.head.appendChild(cssEl)
}

const duration = process.env.CI ? 200 : 50
const buffer = process.env.CI ? 20 : 5
let injected = false

export function injectStyles() {
  if (injected) return { duration, buffer }
  injected = true
  insertCSS(`
    .test {
      -webkit-transition: opacity ${duration}ms ease;
      transition: opacity ${duration}ms ease;
    }
    .group-move {
      -webkit-transition: -webkit-transform ${duration}ms ease;
      transition: transform ${duration}ms ease;
    }
    .v-appear, .v-enter, .v-leave-active,
    .test-appear, .test-enter, .test-leave-active,
    .hello, .bye.active,
    .changed-enter {
      opacity: 0;
    }
    .test-anim-enter-active {
      animation: test-enter ${duration}ms;
      -webkit-animation: test-enter ${duration}ms;
    }
    .test-anim-leave-active {
      animation: test-leave ${duration}ms;
      -webkit-animation: test-leave ${duration}ms;
    }
    .test-anim-long-enter-active {
      animation: test-enter ${duration * 2}ms;
      -webkit-animation: test-enter ${duration * 2}ms;
    }
    .test-anim-long-leave-active {
      animation: test-leave ${duration * 2}ms;
      -webkit-animation: test-leave ${duration * 2}ms;
    }
    @keyframes test-enter {
      from { opacity: 0 }
      to { opacity: 1 }
    }
    @-webkit-keyframes test-enter {
      from { opacity: 0 }
      to { opacity: 1 }
    }
    @keyframes test-leave {
      from { opacity: 1 }
      to { opacity: 0 }
    }
    @-webkit-keyframes test-leave {
      from { opacity: 1 }
      to { opacity: 0 }
    }
  `)
  return { duration, buffer }
}
