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

export function scanSlots (template, content, vm) {
  if (!content) {
    return
  }
  var contents = vm._slotContents = {}
  var slots = template.querySelectorAll('slot')
  if (slots.length) {
    var hasDefault, slot, name
    for (var i = 0, l = slots.length; i < l; i++) {
      slot = slots[i]
      /* eslint-disable no-cond-assign */
      if (name = slot.getAttribute('name')) {
        select(slot, name)
      } else if (
        process.env.NODE_ENV !== 'production' &&
        (name = getBindAttr(slot, 'name'))
      ) {
        warn('<slot :name="' + name + '">: slot names cannot be dynamic.')
      } else {
        // default slot
        hasDefault = true
      }
      /* eslint-enable no-cond-assign */
    }
    if (hasDefault) {
      contents['default'] = extractFragment(content.childNodes, content)
    }
  }

  function select (slot, name) {
    // named slot
    var selector = '[slot="' + name + '"]'
    var nodes = content.querySelectorAll(selector)
    if (nodes.length) {
      contents[name] = extractFragment(nodes, content)
    }
  }
}

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @param {Element} parent
 * @return {DocumentFragment}
 */

function extractFragment (nodes, parent) {
  var frag = document.createDocumentFragment()
  nodes = toArray(nodes)
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i]
    if (node.parentNode === parent) {
      if (
        isTemplate(node) &&
        !node.hasAttribute('v-if') &&
        !node.hasAttribute('v-for')
      ) {
        parent.removeChild(node)
        node = parseTemplate(node)
      }
      frag.appendChild(node)
    }
  }
  return frag
}
