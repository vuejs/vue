import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { query } from 'web/util/index'
import Vue from './web-runtime'
import { compileToFunctions } from './web-compiler'

const idToTemplate = cached(id => query(id).innerHTML)
const mount = Vue.prototype.$mount

Vue.prototype.$mount = function (el) {
  el = el && query(el)
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
      template = getOuterHTML(el)
    }
    if (template) {
      const { render, staticRenderFns } = compileToFunctions(template, {
        preserveWhitespace: config.preserveWhitespace,
        delimiters: options.delimiters
      })
      options.render = render
      options.staticRenderFns = staticRenderFns
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

function getOuterHTML (el) {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
