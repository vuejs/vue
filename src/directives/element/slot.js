import { SLOT } from '../priorities'
import {
  extractContent,
  replace,
  remove,
  defineReactive
} from '../../util/index'

export default {

  priority: SLOT,
  params: ['name','plugin'],

  bind () {
    // this was resolved during component transclusion
    var name = this.params.name || 'default'
    var content = this.vm._slotContents && this.vm._slotContents[name]
    if (!content || !content.hasChildNodes()) {
      this.fallback()
    } else {
      this.compile(content.cloneNode(true), this.vm._context, this.vm)
    }
  },

  compile (content, context, host) {
    if (content && context) {
      if (
        this.el.hasChildNodes() &&
        content.childNodes.length === 1 &&
        content.childNodes[0].nodeType === 1 &&
        content.childNodes[0].hasAttribute('v-if')
      ) {
        // if the inserted slot has v-if
        // inject fallback content as the v-else
        const elseBlock = document.createElement('template')
        elseBlock.setAttribute('v-else', '')
        elseBlock.innerHTML = this.el.innerHTML
        // the else block should be compiled in child scope
        elseBlock._context = this.vm
        content.appendChild(elseBlock)
      }
      let scope = host
        ? host._scope
        : this._scope

      if (this.params.plugin) {
        // copy all remaining attributes from slot to all direct children
        let attrs = this.el.attributes
        for(let i = attrs.length - 1; i >= 0; i--) {
          let name = attrs[i].name,
            value = attrs[i].value,
            children = content.children
          // prefix value
          // TODO properly handle v-bind
          if (name[0]===':') {
            value = '__'+value
          }
          for(let j = 0, len = children.length;  j < len; j++) {
            // TODO warn if child can't have attributes?
            children[j].setAttribute(name,value)
          }
        }
        if (!scope) {
          scope = {}
        }
        // add all data from context to scope
        for(let data in context._data) {
          defineReactive(scope,data,context._data[data])
        }
        // add all data from host to scope with prefixed names
        for(let data in host._data) {
          defineReactive(scope,'__'+data,host._data[data])
        }
      }

      this.unlink = context.$compile(
        content, host, scope, this._frag
      )
    }
    if (content) {
      replace(this.el, content)
    } else {
      remove(this.el)
    }
  },

  fallback () {
    this.compile(extractContent(this.el, true), this.vm)
  },

  unbind () {
    if (this.unlink) {
      this.unlink()
    }
  }
}
