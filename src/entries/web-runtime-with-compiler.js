import config from '../runtime/config'
import { compile } from '../compiler/index'
import { query, warn } from '../runtime/util/index'
import Vue from './web-runtime'

const mount = Vue.prototype.$mount
const idTemplateCache = Object.create(null)

function idToTemplate (id) {
  const hit = idTemplateCache[id]
  return hit || (idTemplateCache[id] = query(id).innerHTML)
}

Vue.prototype.$mount = function (el) {
  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        warn('invalid template option:' + template, this)
      }
    } else if (el) {
      template = getOuterHTML(query(el))
    }
    if (template) {
      options.render = new Function(compile(template, {
        preserveWhitespace: config.preserveWhitespace
      }))
    }
  }
  mount.call(this, el)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 *
 * @param {Element} el
 * @return {String}
 */

export function getOuterHTML (el) {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    var container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compile

export default Vue
