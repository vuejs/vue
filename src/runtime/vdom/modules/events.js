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

function updateEventListeners (oldVnode, vnode) {
  let name, cur, old, event, capture
  const elm = vnode.elm
  const oldOn = oldVnode.data.on || {}
  const on = vnode.data.on
  if (!on) return
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    if (old === undefined) {
      capture = name.charAt(0) === '!'
      event = capture ? name.slice(1) : name
      if (Array.isArray(cur)) {
        elm.addEventListener(event, arrInvoker(cur), capture)
      } else {
        cur = {fn: cur}
        on[name] = cur
        elm.addEventListener(event, fnInvoker(cur), capture)
      }
    } else if (Array.isArray(old)) {
      // Deliberately modify old array since it's captured in closure created with `arrInvoker`
      old.length = cur.length
      for (var i = 0; i < old.length; ++i) old[i] = cur[i]
      on[name] = old
    } else {
      old.fn = cur
      on[name] = old
    }
  }
}

export default {
  create: updateEventListeners,
  update: updateEventListeners
}
