import { makeMap } from '../../../shared/util'

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
const isXlink = name => name.slice(0, 6) === 'xlink:'

function updateAttrs (oldVnode, vnode) {
  let key, cur, old
  const elm = vnode.elm
  const oldAttrs = oldVnode.data.attrs || {}
  const attrs = vnode.data.attrs || {}

  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      if (isBooleanAttr(key)) {
        if (cur == null) {
          elm.removeAttribute(key)
        } else {
          elm.setAttribute(key, key)
        }
      } else if (isEnumeratedAttr(key)) {
        elm.setAttribute(key, cur == null ? 'false' : 'true')
      } else if (isXlink(key)) {
        elm.setAttributeNS(xlinkNS, key, cur)
      } else {
        elm.setAttribute(key, cur)
      }
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

export default {
  create: updateAttrs,
  update: updateAttrs
}
