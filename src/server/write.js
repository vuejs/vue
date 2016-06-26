/* @flow */

const MAX_STACK_DEPTH = 1000

export function createWriteFunction (
  write: Function,
  onError: Function
): Function {
  let stackDepth = 0
  const cachedWrite = (text, next) => {
    if (text && cachedWrite.caching) {
      cachedWrite.buffer += text
    }
    const waitForNext = write(text, next)
    if (!waitForNext) {
      if (stackDepth >= MAX_STACK_DEPTH) {
        process.nextTick(() => {
          try { next() } catch (e) {
            onError(e)
          }
        })
      } else {
        stackDepth++
        next()
        stackDepth--
      }
    }
  }
  cachedWrite.caching = false
  cachedWrite.buffer = ''
  return cachedWrite
}
