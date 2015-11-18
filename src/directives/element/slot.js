import {
  parseTemplate,
  cloneNode
} from '../../parsers/template'

import {
  extractContent,
  replace,
  remove,
  isTemplate
} from '../../util/index'

// This is the elementDirective that handles <content>
// transclusions. It relies on the raw content of an
// instance being stored as `$options._content` during
// the transclude phase.

export default {

  priority: 1750,

  params: ['name'],

  bind () {
    var host = this.vm
    var raw = host.$options._content
    var content
    if (!raw) {
      this.fallback()
      return
    }
    var context = host._context
    var slotName = this.params.name
    if (!slotName) {
      // Default content
      var self = this
      var compileDefaultContent = function () {
        self.compile(
          extractFragment(raw.childNodes, raw, true),
          context,
          host
        )
      }
      if (!host._isCompiled) {
        // defer until the end of instance compilation,
        // because the default outlet must wait until all
        // other possible outlets with selectors have picked
        // out their contents.
        host.$once('hook:compiled', compileDefaultContent)
      } else {
        compileDefaultContent()
      }
    } else {
      var selector = '[slot="' + slotName + '"]'
      var nodes = raw.querySelectorAll(selector)
      if (nodes.length) {
        content = extractFragment(nodes, raw)
        if (content.hasChildNodes()) {
          this.compile(content, context, host)
        } else {
          this.fallback()
        }
      } else {
        this.fallback()
      }
    }
  },

  fallback () {
    this.compile(extractContent(this.el, true), this.vm)
  },

  compile (content, context, host) {
    if (content && context) {
      var scope = host
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

  unbind () {
    if (this.unlink) {
      this.unlink()
    }
  }
}

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
