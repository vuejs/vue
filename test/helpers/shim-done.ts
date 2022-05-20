// wrap tests to support test('foo', done => {...}) interface
const _test = test

const wait = (): [() => void, Promise<void>] => {
  let done
  const p = new Promise<void>((resolve, reject) => {
    done = resolve
    done.fail = reject
  })
  return [done, p]
}

const shimmed =
  ((global as any).it =
  (global as any).test =
    (desc: string, fn?: any, timeout?: number) => {
      if (fn && fn.length > 0) {
        _test(
          desc,
          () => {
            const [done, p] = wait()
            fn(done)
            return p
          },
          timeout
        )
      } else {
        _test(desc, fn, timeout)
      }
    })

;['skip', 'only', 'todo', 'concurrent'].forEach(key => {
  shimmed[key] = _test[key]
})

export {}
