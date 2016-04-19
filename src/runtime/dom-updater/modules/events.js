import { updateListeners } from '../../vdom/helpers'

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
