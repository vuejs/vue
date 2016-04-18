export default {
  create (_, vnode) {
    if (vnode.data.pre) {
      vnode.elm.innerHTML = vnode.data.pre
    }
  }
}
