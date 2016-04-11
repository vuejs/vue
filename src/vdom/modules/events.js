function arrInvoker(arr) {
  return function() {
    // Special case when length is two, for performance
    arr.length === 2 ? arr[0](arr[1]) : arr[0].apply(undefined, arr.slice(1))
  }
}

function fnInvoker(o) {
  return function(ev) { o.fn(ev) }
}

function updateEventListeners(oldVnode, vnode) {
  var name, cur, old, elm = vnode.elm,
      oldOn = oldVnode.data.on || {}, on = vnode.data.on
  if (!on) return
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    if (old === undefined) {
      if (Array.isArray(cur)) {
        elm.addEventListener(name, arrInvoker(cur))
      } else {
        cur = {fn: cur}
        on[name] = cur
        elm.addEventListener(name, fnInvoker(cur))
      }
    } else if (Array.isArray(old)) {
      // Deliberately modify old array since it's captured in closure created with `arrInvoker`
      old.length = cur.length
      for (var i = 0; i < old.length; ++i) old[i] = cur[i]
      on[name]  = old
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
