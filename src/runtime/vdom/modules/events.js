import { isArray } from '../../util/index'

function arrInvoker (arr) {
  return function (ev) {
    for (let i = 0; i < arr.length; i++) {
      arr[i](ev)
    }
  }
}

function fnInvoker (o) {
  return function (ev) { o.fn(ev) }
}

export function updateListeners (on, oldOn, add) {
  let name, cur, old, event, capture
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    if (old === undefined) {
      capture = name.charAt(0) === '!'
      event = capture ? name.slice(1) : name
      if (isArray(cur)) {
        add(event, arrInvoker(cur), capture)
      } else {
        cur = { fn: cur }
        on[name] = cur
        add(event, fnInvoker(cur), capture)
      }
    } else if (isArray(old)) {
      old.length = cur.length
      for (let i = 0; i < old.length; i++) old[i] = cur[i]
      on[name] = old
    } else {
      old.fn = cur
      on[name] = old
    }
  }
}

function updateDOMListeners (oldVnode, vnode) {
  const on = vnode.data.on
  const oldOn = oldVnode.data.on || {}
  updateListeners(on, oldOn, (event, handler, capture) => {
    vnode.elm.addEventListener(event, handler, capture)
  })
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}
