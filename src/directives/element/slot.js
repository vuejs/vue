import { SLOT } from '../priorities'

import {
  parseTemplate,
  cloneNode
} from '../../parsers/template'

import {
  extend,
  extractContent,
  replace,
  remove,
  isTemplate
} from '../../util/index'

// This is the elementDirective that handles <content>
// transclusions. It relies on the raw content of an
// instance being stored as `$options._content` during
// the transclude phase.

// We are exporting two versions, one for named and one
// for unnamed, because the unnamed slots must be compiled
// AFTER all named slots have selected their content. So
// we need to give them different priorities in the compilation
// process. (See #1965)

export const slot = {

  priority: SLOT,

  bind () {
    var host = this.vm
    var raw = host.$options._content
    if (!raw) {
      this.fallback()
      return
    }
    var context = host._context
    var slotName = this.params && this.params.name
    if (!slotName) {
      // Default slot
      this.tryCompile(extractFragment(raw.childNodes, raw, true), context, host)
    } else {
      // Named slot
      var selector = '[slot="' + slotName + '"]'
      var nodes = raw.querySelectorAll(selector)
      if (nodes.length) {
        this.tryCompile(extractFragment(nodes, raw), context, host)
      } else {
        this.fallback()
      }
    }
  },

  tryCompile (content, context, host) {
    if (content.hasChildNodes()) {
      this.compile(content, context, host)
    } else {
      this.fallback()
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
        content.appendChild(elseBlock)
      }
      const scope = host
        ? host._scope
        : this._scope
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

export const namedSlot = extend(extend({}, slot), {
  priority: slot.priority + 1,
  params: ['name']
})

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @param {Element} parent
 * @param {Boolean} main
 * @return {DocumentFragment}
 */

function extractFragment (nodes, parent, main) {
  var frag = document.createDocumentFragment()
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i]
    // if this is the main outlet, we want to skip all
    // previously selected nodes;
    // otherwise, we want to mark the node as selected.
    // clone the node so the original raw content remains
    // intact. this ensures proper re-compilation in cases
    // where the outlet is inside a conditional block
    if (main && !node.__v_selected) {
      append(node)
    } else if (!main && node.parentNode === parent) {
      node.__v_selected = true
      append(node)
    }
  }
  return frag

  function append (node) {
    if (isTemplate(node) &&
        !node.hasAttribute('v-if') &&
        !node.hasAttribute('v-for')) {
      node = parseTemplate(node)
    }
    node = cloneNode(node)
    frag.appendChild(node)
  }
}
