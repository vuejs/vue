/**
 * Async callback style it for compatibility with old tests.
 */
export function _it(
  desc: string,
  runner: (done: (err?: Error) => void) => void | Promise<any>
) {
  it(desc, async () => {
    if (runner.length === 0) {
      return runner(() => {})
    }
    await new Promise<void>((resolve, reject) => {
      const res = runner(err => {
        if (err) reject(err)
        else resolve()
      })
      if (res instanceof Promise) {
        resolve(res)
      }
    })
  })
}
