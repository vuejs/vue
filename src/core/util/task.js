/* @flow */

export function makeTask (func: Function): Function {
  let resolved = false
  const callbacks = []

  func(resolveFunc)
  function resolveFunc () {
    if (!resolved) {
      resolved = true
      setTimeout(() => {
        callbacks.forEach(callback => callback && callback())
      })
    }
  }
  function recvTask (callback) {
    if (resolved) {
      setTimeout(() => {
        callback && callback()
      })
    } else {
      callbacks.push(callback)
    }
  }
  return recvTask
}

export function waitForAllTask (taskList: Array<Function>, callback: Function) {
  let count = 0
  const taskLength = taskList && taskList.length || 0
  if (taskLength) {
    taskList.forEach(task => {
      task(waitFunc)
    })
  } else {
    callback && callback()
  }
  function waitFunc () {
    count++
    if (count >= taskLength) {
      callback && callback()
    }
  }
}
