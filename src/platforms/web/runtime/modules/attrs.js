import { makeMap } from 'shared/util'

const isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck')
const isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
)

const xlinkNS = 'http://www.w3.org/1999/xlink'
const isXlink = name => name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'

function updateAttrs (oldVnode, vnode) {
  if (!oldVnode.data.attrs && !vnode.data.attrs) {
    return
  }
  let key, cur, old
  const elm = vnode.elm
  const oldAttrs = oldVnode.data.attrs || {}
  const attrs = vnode.data.attrs || {}

  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      setAttr(elm, key, cur)
    }
  }
  for (key in oldAttrs) {
    if (attrs[key] == null) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, key)
      } else {
        elm.removeAttribute(key)
      }
    }
  }
}

function setAttr (el, key, value) {
  if (isBooleanAttr(key)) {
    if (value == null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, key)
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, value == null ? 'false' : 'true')
  } else if (isXlink(key)) {
    el.setAttributeNS(xlinkNS, key, value)
  } else {
    el.setAttribute(key, value)
  }
}

export default {
  create: function (_, vnode) {
    const attrs = vnode.data.staticAttrs
    if (attrs) {
      for (let key in attrs) {
        if (!vnode.elm) debugger
        setAttr(vnode.elm, key, attrs[key])
      }
    }
    updateAttrs(_, vnode)
  },
  update: updateAttrs
}
