import createElement from './create-element'

function init (thunk) {
  var i, cur = thunk.data
  cur.vnode = cur.fn.apply(undefined, cur.args)
}

function prepatch (oldThunk, thunk) {
  var i, old = oldThunk.data, cur = thunk.data
  var oldArgs = old.args, args = cur.args
  cur.vnode = old.vnode
  if (old.fn !== cur.fn || oldArgs.length !== args.length) {
    cur.vnode = cur.fn.apply(undefined, args)
    return
  }
  for (i = 0; i < args.length; ++i) {
    if (oldArgs[i] !== args[i]) {
      cur.vnode = cur.fn.apply(undefined, args)
      return
    }
  }
}

export default function thunk (name, fn, args) {
  return createElement('thunk' + name, {
    hook: { init, prepatch },
    fn, args
  })
}
