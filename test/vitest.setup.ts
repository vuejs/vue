import { SpyInstance } from 'vitest'

expect.extend({
  toHaveBeenWarned(received: string) {
    asserted.add(received)
    const passed = warn.mock.calls.some((args) => args[0].includes(received))
    if (passed) {
      return {
        pass: true,
        message: () => `expected "${received}" not to have been warned.`
      }
    } else {
      const msgs = warn.mock.calls.map((args) => args[0]).join('\n - ')
      return {
        pass: false,
        message: () =>
          `expected "${received}" to have been warned` +
          (msgs.length
            ? `.\n\nActual messages:\n\n - ${msgs}`
            : ` but no warning was recorded.`)
      }
    }
  },

  toHaveBeenWarnedLast(received: string) {
    asserted.add(received)
    const passed =
      warn.mock.calls[warn.mock.calls.length - 1][0].includes(received)
    if (passed) {
      return {
        pass: true,
        message: () => `expected "${received}" not to have been warned last.`
      }
    } else {
      const msgs = warn.mock.calls.map((args) => args[0]).join('\n - ')
      return {
        pass: false,
        message: () =>
          `expected "${received}" to have been warned last.\n\nActual messages:\n\n - ${msgs}`
      }
    }
  },

  toHaveBeenWarnedTimes(received: string, n: number) {
    asserted.add(received)
    let found = 0
    warn.mock.calls.forEach((args) => {
      if (args[0].includes(received)) {
        found++
      }
    })

    if (found === n) {
      return {
        pass: true,
        message: () => `expected "${received}" to have been warned ${n} times.`
      }
    } else {
      return {
        pass: false,
        message: () =>
          `expected "${received}" to have been warned ${n} times but got ${found}.`
      }
    }
  }
})

let warn: SpyInstance
const asserted: Set<string> = new Set()

beforeEach(() => {
  asserted.clear()
  warn = vi.spyOn(console, 'error')
  warn.mockImplementation(() => {})
})

afterEach(() => {
  const assertedArray = Array.from(asserted)
  const nonAssertedWarnings = warn.mock.calls
    .map((args) => args[0])
    .filter((received) => {
      return !assertedArray.some((assertedMsg) => {
        return received.includes(assertedMsg)
      })
    })
  warn.mockRestore()
  if (nonAssertedWarnings.length) {
    throw new Error(
      `test case threw unexpected warnings:\n - ${nonAssertedWarnings.join(
        '\n - '
      )}`
    )
  }
})

import Vue from 'vue'

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
// })
// .then(done)

interface Job extends Function {
  wait?: boolean
  fail?: (e: any) => void
}

global.waitForUpdate = (initialCb: Job) => {
  let end
  let reject
  const queue: Job[] = initialCb ? [initialCb] : []

  function shift() {
    const job = queue.shift()
    if (queue.length) {
      let hasError = false
      try {
        job!.wait ? job!(shift) : job!()
      } catch (e) {
        hasError = true
        if (reject) {
          reject()
        } else {
          const done = queue[queue.length - 1]
          if (done && done.fail) {
            done.fail(e)
          }
        }
      }
      if (!hasError && !job!.wait) {
        if (queue.length) {
          Vue.nextTick(shift)
        }
      }
    } else if (job && (job.fail || job === end)) {
      job() // done
    }
  }

  Vue.nextTick(() => {
    if (!queue.length || (!end && !queue[queue.length - 1]!.fail)) {
      throw new Error('waitForUpdate chain is missing .then(done)')
    }
    shift()
  })

  const chainer = {
    then: (nextCb) => {
      queue.push(nextCb)
      return chainer
    },
    thenWaitFor: (wait) => {
      if (typeof wait === 'number') {
        wait = timeout(wait)
      }
      wait.wait = true
      queue.push(wait)
      return chainer
    },
    end: (endFn) => {
      queue.push(endFn)
      end = endFn
    },
    promise() {
      return new Promise((resolve, rej) => {
        end = resolve
        reject = rej
      })
    }
  }

  return chainer
}

function timeout(n) {
  return (next) => setTimeout(next, n)
}
