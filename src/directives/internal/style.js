import {
  extend,
  isArray,
  hyphenate,
  camelize,
  warn
} from '../../util/index'

const prefixes = ['-webkit-', '-moz-', '-ms-']
const camelPrefixes = ['Webkit', 'Moz', 'ms']
const importantRE = /!important;?$/
const propCache = Object.create(null)

let testEl = null

export default {

  deep: true,

  update (value) {
    if (typeof value === 'string') {
      this.el.style.cssText = value
    } else if (isArray(value)) {
      this.handleObject(value.reduce(extend, {}))
    } else {
      this.handleObject(value || {})
    }
  },

  handleObject (value) {
    // cache object styles so that only changed props
    // are actually updated.
    var cache = this.cache || (this.cache = {})
    var name, val
    for (name in cache) {
      if (!(name in value)) {
        this.handleSingle(name, null)
        delete cache[name]
      }
    }
    for (name in value) {
      val = value[name]
      if (val !== cache[name]) {
        cache[name] = val
        this.handleSingle(name, val)
      }
    }
  },

  handleSingle (prop, value) {
    prop = normalize(prop)
    if (!prop) return // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += ''
    if (value) {
      var isImportant = importantRE.test(value)
        ? 'important'
        : ''
      if (isImportant) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          warn(
            'It\'s probably a bad idea to use !important with inline rules. ' +
            'This feature will be deprecated in a future version of Vue.'
          )
        }
        value = value.replace(importantRE, '').trim()
        this.el.style.setProperty(prop.kebab, value, isImportant)
      } else {
        this.el.style[prop.camel] = value
      }
    } else {
      this.el.style[prop.camel] = ''
    }
  }

}

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize (prop) {
  if (propCache[prop]) {
    return propCache[prop]
  }
  var res = prefix(prop)
  propCache[prop] = propCache[res] = res
  return res
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix (prop) {
  prop = hyphenate(prop)
  var camel = camelize(prop)
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1)
  if (!testEl) {
    testEl = document.createElement('div')
  }
  var i = prefixes.length
  var prefixed
  if (camel !== 'filter' && (camel in testEl.style)) {
    return {
      kebab: prop,
      camel: camel
    }
  }
  while (i--) {
    prefixed = camelPrefixes[i] + upper
    if (prefixed in testEl.style) {
      return {
        kebab: prefixes[i] + prop,
        camel: prefixed
      }
    }
  }
}
