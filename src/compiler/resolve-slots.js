import { parseTemplate } from '../parsers/template'
import {
  isTemplate,
  toArray,
  getBindAttr,
  warn
} from '../util/index'

/**
 * Scan and determine slot content distribution.
 * We do this during transclusion instead at compile time so that
 * the distribution is decoupled from the compilation order of
 * the slots.
 *
 * @param {Element|DocumentFragment} template
 * @param {Element} content
 * @param {Vue} vm
 */

export function resolveSlots (vm, content) {
  if (!content) {
    return
  }
  var contents = vm._slotContents = Object.create(null)
  var el, name
  for (var i = 0, l = content.children.length; i < l; i++) {
    el = content.children[i]
    /* eslint-disable no-cond-assign */
    if (name = el.getAttribute('slot')) {
      (contents[name] || (contents[name] = [])).push(el)
    }
    /* eslint-enable no-cond-assign */
    if (process.env.NODE_ENV !== 'production' && getBindAttr(el, 'slot')) {
      warn('The "slot" attribute must be static.', vm.$parent)
    }
  }
  for (name in contents) {
    contents[name] = extractFragment(contents[name], content)
  }
  if (content.hasChildNodes()) {
    const nodes = content.childNodes
    if (
      nodes.length === 1 &&
      nodes[0].nodeType === 3 &&
      !nodes[0].data.trim()
    ) {
      return
    }
    contents['default'] = extractFragment(content.childNodes, content)
  }
}

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @return {DocumentFragment}
 */

function extractFragment (nodes, parent) {
  var frag = document.createDocumentFragment()
  nodes = toArray(nodes)
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i]
    if (
      isTemplate(node) &&
      !node.hasAttribute('v-if') &&
      !node.hasAttribute('v-for')
    ) {
      parent.removeChild(node)
      node = parseTemplate(node, true)
    }
    frag.appendChild(node)
  }
  return frag
}
