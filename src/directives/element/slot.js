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
      this.compile(extractContent(this.el, true), this.vm)
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
        if (!host) {
          // TODO warn to use plugin only within components
        }
        // copy all remaining attributes from slot to all direct children
        let attrs = this.el.attributes
        for(let i = attrs.length - 1; i >= 0; i--) {
          let name = attrs[i].name,
            value = attrs[i].value,
            children = content.children
          for(let j = 0, len = children.length;  j < len; j++) {
            // TODO warn if child can't have attributes?
            if (!(children[j].hasAttribute(name) ||
                (name[0]===':' && children[j].hasAttribute('v-bind'+name)) ||
                (name[0]==='@' && children[j].hasAttribute('v-on:'+name.slice(1)))
              )) {
              children[j].setAttribute(name,value)
            }
          }
        }
        // use v-for scope when available
        scope = this._frag ? this._frag.scope : scope || {}

        // add all data from context to scope
        for(let data in context._data) {
          if (scope[data] == null) {
            defineReactive(scope,data,context._data[data])
          }
        }
        // add all data from host to scope with prefixed names
        for(let data in host._data) {
          defineReactive(scope,'_'+data,host._data[data])
        }
        // child relations test: how to get the slot content to be comp11 child?
        this.unlink = context.$compile(content, host, scope, this._frag)
        if (this.params.plugin !== true) {
          // should check on the newly created vm if it is valid
        }

      } else {
        this.unlink = context.$compile(content, host, scope, this._frag)
      }
    }
    if (content) {
      replace(this.el, content)
    } else {
      remove(this.el)
    }
  },

  unbind () {
    if (this.unlink) {
      this.unlink()
    }
  }
}
