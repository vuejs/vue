/**
 * Virtual DOM implementation based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * with custom modifications.
 */

import VNode from './vnode'
import { isPrimitive, warn } from '../util/index'

const emptyNode = VNode('', {}, [])
const hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post']

function isUndef (s) {
  return s === undefined
}

function isDef (s) {
  return s !== undefined
}

function sameVnode (vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.tag === vnode2.tag
}

function getElm (vnode) {
  return vnode.elm || vnode.data.child._vnode.elm
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  let i, key
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}

export default function createPatchFunction (backend) {
  let i, j
  const cbs = {}

  const { modules, nodeOps } = backend

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]])
    }
  }

  function emptyNodeAt (elm) {
    return VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    return function remove () {
      if (--listeners === 0) {
        const parent = nodeOps.parentNode(childElm)
        nodeOps.removeChild(parent, childElm)
      }
    }
  }

  function createElm (vnode, insertedVnodeQueue) {
    let i, elm
    const data = vnode.data
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode)
      if (isDef(i = data.child)) {
        insertedVnodeQueue.push(vnode)
        return i._vnode.elm
      }
    }
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
      elm = vnode.elm = isDef(data) && data.svg
        ? nodeOps.createSVGElement(tag)
        : nodeOps.createElement(tag)
      if (Array.isArray(children)) {
        for (i = 0; i < children.length; ++i) {
          nodeOps.appendChild(elm, createElm(children[i], insertedVnodeQueue))
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(elm, nodeOps.createTextNode(vnode.text))
      }
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)
      i = vnode.data.hook // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode)
        if (i.insert) insertedVnodeQueue.push(vnode)
      }
    } else {
      elm = vnode.elm = nodeOps.createTextNode(vnode.text)
    }
    return vnode.elm
  }

  function addVnodes (parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      nodeOps.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before)
    }
  }

  function invokeDestroyHook (vnode) {
    let i, j
    const data = vnode.data
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode)
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j])
        }
      }
      if (isDef(i = data.child)) invokeDestroyHook(i._vnode)
    }
  }

  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      let i, listeners, rm
      let ch = vnodes[startIdx]
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          if (isDef(i = ch.data) && isDef(i = i.child)) {
            i.$destroy()
            ch = i._vnode
          }
          invokeDestroyHook(ch)
          listeners = cbs.remove.length + 1
          rm = createRmCb(getElm(ch), listeners)
          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm)
          if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
            i(ch, rm)
          } else {
            rm()
          }
        } else { // Text node
          nodeOps.removeChild(parentElm, ch.elm)
        }
      }
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, elmToMove, before

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        nodeOps.insertBefore(parentElm, getElm(oldStartVnode), nodeOps.nextSibling(getElm(oldEndVnode)))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        nodeOps.insertBefore(parentElm, getElm(oldEndVnode), getElm(oldStartVnode))
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = oldKeyToIdx[newStartVnode.key]
        if (isUndef(idxInOld)) { // New element
          nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), getElm(oldStartVnode))
          newStartVnode = newCh[++newStartIdx]
        } else {
          elmToMove = oldCh[idxInOld]
          if (process.env.NODE_ENV !== 'production' && !elmToMove) {
            warn(
              'Duplicate track-by key: ' + idxInOld + '. ' +
              'Make sure each v-for item has a unique track-by key.'
            )
          }
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
          oldCh[idxInOld] = undefined
          nodeOps.insertBefore(parentElm, getElm(elmToMove), getElm(oldStartVnode))
          newStartVnode = newCh[++newStartIdx]
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx + 1]) ? null : getElm(newCh[newEndIdx + 1])
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }

  function patchVnode (oldVnode, vnode, insertedVnodeQueue) {
    let i, hook
    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode)
    }
    // skip child component, which handles its own updates
    // and nodes with v-pre
    if (isDef(i = vnode.data) && (i.child || i.pre)) {
      return
    }
    let elm = vnode.elm = oldVnode.elm
    const oldCh = oldVnode.children
    const ch = vnode.children
    if (oldVnode === vnode) return
    if (!sameVnode(oldVnode, vnode)) {
      var parentElm = nodeOps.parentNode(oldVnode.elm)
      elm = createElm(vnode, insertedVnodeQueue)
      nodeOps.insertBefore(parentElm, elm, oldVnode.elm)
      removeVnodes(parentElm, [oldVnode], 0, 0)
      return
    }
    if (isDef(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      i = vnode.data.hook
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue)
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode)
    }
  }

  return function update (oldVnode, vnode) {
    var i, elm, parent
    var insertedVnodeQueue = []
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()

    if (!oldVnode) {
      createElm(vnode, insertedVnodeQueue)
    } else {
      if (isUndef(oldVnode.tag)) {
        oldVnode = emptyNodeAt(oldVnode)
      }

      if (sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue)
      } else {
        elm = oldVnode.elm
        parent = nodeOps.parentNode(elm)

        createElm(vnode, insertedVnodeQueue)

        if (parent !== null) {
          nodeOps.insertBefore(parent, getElm(vnode), nodeOps.nextSibling(elm))
          removeVnodes(parent, [oldVnode], 0, 0)
        }
      }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i])
    }
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()
    return vnode.elm
  }
}
