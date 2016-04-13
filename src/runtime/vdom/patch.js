import VNode from './vnode'
import * as dom from './dom'
import { isPrimitive } from '../util/index'

const emptyNode = VNode('', {}, [], undefined, undefined)
const hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post']
const svgNS = 'http://www.w3.org/2000/svg'

function isUndef (s) {
  return s === undefined
}

function isDef (s) {
  return s !== undefined
}

function sameVnode (vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel
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

export default function createPatchFunction (modules, api) {
  let i, j
  const cbs = {}

  if (isUndef(api)) api = dom

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]])
    }
  }

  function emptyNodeAt (elm) {
    return VNode(api.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    return function () {
      if (--listeners === 0) {
        const parent = api.parentNode(childElm)
        api.removeChild(parent, childElm)
      }
    }
  }

  function createElm (vnode, insertedVnodeQueue) {
    let i, thunk, elm
    const data = vnode.data
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode)
      if (isDef(i = data.vnode)) {
        thunk = vnode
        vnode = i
      }
    }
    const children = vnode.children
    const tag = vnode.sel
    if (isDef(tag)) {
      elm = vnode.elm = isDef(data) && data.svg
        ? api.createElementNS(svgNS, tag)
        : api.createElement(tag)
      if (Array.isArray(children)) {
        for (i = 0; i < children.length; ++i) {
          api.appendChild(elm, createElm(children[i], insertedVnodeQueue))
        }
      } else if (isPrimitive(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text))
      }
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)
      i = vnode.data.hook // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode)
        if (i.insert) insertedVnodeQueue.push(vnode)
      }
    } else {
      elm = vnode.elm = api.createTextNode(vnode.text)
    }
    if (isDef(thunk)) thunk.elm = vnode.elm
    return vnode.elm
  }

  function addVnodes (parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      api.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before)
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
      if (isDef(i = data.vnode)) invokeDestroyHook(i)
    }
  }

  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      let i, listeners, rm
      const ch = vnodes[startIdx]
      if (isDef(ch)) {
        if (isDef(ch.sel)) {
          invokeDestroyHook(ch)
          listeners = cbs.remove.length + 1
          rm = createRmCb(ch.elm, listeners)
          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm)
          if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
            i(ch, rm)
          } else {
            rm()
          }
        } else { // Text node
          api.removeChild(parentElm, ch.elm)
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
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = oldKeyToIdx[newStartVnode.key]
        if (isUndef(idxInOld)) { // New element
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        } else {
          elmToMove = oldCh[idxInOld]
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
          oldCh[idxInOld] = undefined
          api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
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
    if (isDef(i = oldVnode.data) && isDef(i = i.vnode)) oldVnode = i
    if (isDef(i = vnode.data) && isDef(i = i.vnode)) {
      patchVnode(oldVnode, i, insertedVnodeQueue)
      vnode.elm = i.elm
      return
    }
    let elm = vnode.elm = oldVnode.elm
    const oldCh = oldVnode.children
    const ch = vnode.children
    if (oldVnode === vnode) return
    if (!sameVnode(oldVnode, vnode)) {
      var parentElm = api.parentNode(oldVnode.elm)
      elm = createElm(vnode, insertedVnodeQueue)
      api.insertBefore(parentElm, elm, oldVnode.elm)
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
        if (isDef(oldVnode.text)) api.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      api.setTextContent(elm, vnode.text)
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode)
    }
  }

  return function patch (oldVnode, vnode) {
    var i, elm, parent
    var insertedVnodeQueue = []
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()

    if (isUndef(oldVnode.sel)) {
      oldVnode = emptyNodeAt(oldVnode)
    }

    if (sameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode, insertedVnodeQueue)
    } else {
      elm = oldVnode.elm
      parent = api.parentNode(elm)

      createElm(vnode, insertedVnodeQueue)

      if (parent !== null) {
        api.insertBefore(parent, vnode.elm, api.nextSibling(elm))
        removeVnodes(parent, [oldVnode], 0, 0)
      }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i])
    }
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()
    return vnode.elm
  }
}
