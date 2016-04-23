import config from '../runtime/config'
import { compile } from '../compiler/index'
import { query, warn } from '../runtime/util/index'
import Vue from './web-runtime'

const mount = Vue.prototype.$mount
const idTemplateCache = Object.create(null)
const renderFunctionCache = Object.create(null)

function idToTemplate (id) {
  const hit = idTemplateCache[id]
  return hit || (idTemplateCache[id] = query(id).innerHTML)
}

function createRenderFn (code) {
  const hit = renderFunctionCache[code]
  return hit || (renderFunctionCache[code] = new Function(code))
}

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
      const res = compile(template, {
        preserveWhitespace: config.preserveWhitespace
      })
      options.render = createRenderFn(res.render)
      const l = res.staticRenderFns.length
      if (l) {
        options.staticRenderFns = new Array(l)
        for (let i = 0; i < l; i++) {
          options.staticRenderFns[i] = createRenderFn(res.staticRenderFns[i])
        }
      }
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
    var container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compile

export default Vue
