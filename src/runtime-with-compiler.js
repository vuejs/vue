import config from './runtime/config'
import { compile } from './compiler/index'
import { getOuterHTML, query, warn } from './runtime/util/index'
import Vue from './runtime/index'

const mount = Vue.prototype.$mount

Vue.prototype.$mount = function (el) {
  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = query(template).innerHTML
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        warn('invalid template option:' + template, this)
      }
    } else {
      template = getOuterHTML(query(el))
    }
    options.render = compile(template, config.preserveWhiteSpace)
  }
  mount.call(this, el)
}

Vue.compile = compile

export default Vue
