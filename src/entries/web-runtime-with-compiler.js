import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { query } from 'web/util/index'
import Vue from './web-runtime'
import { compile } from './web-compiler'

const idToTemplate = cached(id => query(id).innerHTML)

const cache1 = Object.create(null)
const cache2 = Object.create(null)

function createRenderFns (template) {
  const preserveWhitespace = config.preserveWhitespace
  const cache = preserveWhitespace ? cache1 : cache2
  if (cache[template]) {
    return cache[template]
  }
  const res = {}
  const compiled = compile(template, { preserveWhitespace })
  res.render = new Function(compiled.render)
  const l = compiled.staticRenderFns.length
  if (l) {
    res.staticRenderFns = new Array(l)
    for (let i = 0; i < l; i++) {
      res.staticRenderFns[i] = new Function(compiled.staticRenderFns[i])
    }
  }
  return (cache[template] = res)
}

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
      const { render, staticRenderFns } = createRenderFns(template)
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
    var container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = createRenderFns

export default Vue
