const booleanAttrs = [
  "allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
  "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable",
  "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple",
  "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
  "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
  "truespeed", "typemustmatch", "visible"
]

const booleanAttrsDict = {}
for (let i = 0, len = booleanAttrs.length; i < len; i++) {
  booleanAttrsDict[booleanAttrs[i]] = true
}

function updateAttr (oldVnode, vnode) {
  let key, cur, old
  const elm = vnode.elm
  const oldAttrs = oldVnode.data.attrs || {}
  const attrs = vnode.data.attrs || {}

  // update modified attributes, add new attributes
  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      // TODO: add support to namespaced attributes (setAttributeNS)
      if(!cur && booleanAttrsDict[key])
        elm.removeAttribute(key)
      else
        elm.setAttribute(key, cur)
    }
  }
  //remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key)
    }
  }
}

export default {
  create: updateAttrs,
  update: updateAttrs
}
