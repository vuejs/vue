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
