import { warn } from './debug'
import { resolveAsset } from './options'
import { getAttr, getBindAttr } from './dom'
import { isArray, isPlainObject, isObject, hasOwn } from './lang'
import { defineReactive } from '../observer/index'

export const commonTagRE = /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/i
export const reservedTagRE = /^(slot|partial|component)$/i

let isUnknownElement
if (process.env.NODE_ENV !== 'production') {
  isUnknownElement = function (el, tag) {
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      )
    } else {
      return (
        /HTMLUnknownElement/.test(el.toString()) &&
        // Chrome returns unknown for several HTML5 elements.
        // https://code.google.com/p/chromium/issues/detail?id=540526
        !/^(data|time|rtc|rb)$/.test(tag)
      )
    }
  }
}

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

export function checkComponentAttr (el, options) {
  var tag = el.tagName.toLowerCase()
  var hasAttrs = el.hasAttributes()
  if (!commonTagRE.test(tag) && !reservedTagRE.test(tag)) {
    if (resolveAsset(options, 'components', tag)) {
      return { id: tag }
    } else {
      var is = hasAttrs && getIsBinding(el)
      if (is) {
        return is
      } else if (process.env.NODE_ENV !== 'production') {
        var expectedTag =
          options._componentNameMap &&
          options._componentNameMap[tag]
        if (expectedTag) {
          warn(
            'Unknown custom element: <' + tag + '> - ' +
            'did you mean <' + expectedTag + '>? ' +
            'HTML is case-insensitive, remember to use kebab-case in templates.'
          )
        } else if (isUnknownElement(el, tag)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.'
          )
        }
      }
    }
  } else if (hasAttrs) {
    return getIsBinding(el)
  }
}

/**
 * Get "is" binding from an element.
 *
 * @param {Element} el
 * @return {Object|undefined}
 */

function getIsBinding (el) {
  // dynamic syntax
  var exp = getAttr(el, 'is')
  if (exp != null) {
    return { id: exp }
  } else {
    exp = getBindAttr(el, 'is')
    if (exp != null) {
      return { id: exp, dynamic: true }
    }
  }
}

/**
 * Set a prop's initial value on a vm and its data object.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

export function initProp (vm, prop, value) {
  const key = prop.path
  value = coerceProp(prop, value)
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop.options)
  }
  if (assertProp(prop, value)) {
    defineReactive(vm, key, value, true /* doNotObserve */)
  }
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} options
 * @return {*}
 */

function getPropDefaultValue (vm, options) {
  // no default, return undefined
  if (!hasOwn(options, 'default')) {
    // absent boolean value defaults to false
    return options.type === Boolean
      ? false
      : undefined
  }
  var def = options.default
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Object/Array as default prop values will be shared ' +
      'across multiple instances. Use a factory function ' +
      'to return the default value instead.'
    )
  }
  // call factory function for non-Function types
  return typeof def === 'function' && options.type !== Function
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {*} value
 */

export function assertProp (prop, value) {
  if (
    !prop.options.required && ( // non-required
      prop.raw === null ||      // abscent
      value == null             // null or undefined
    )
  ) {
    return true
  }
  var options = prop.options
  var type = options.type
  var valid = true
  var expectedType
  if (type) {
    if (type === String) {
      expectedType = 'string'
      valid = typeof value === expectedType
    } else if (type === Number) {
      expectedType = 'number'
      valid = typeof value === 'number'
    } else if (type === Boolean) {
      expectedType = 'boolean'
      valid = typeof value === 'boolean'
    } else if (type === Function) {
      expectedType = 'function'
      valid = typeof value === 'function'
    } else if (type === Object) {
      expectedType = 'object'
      valid = isPlainObject(value)
    } else if (type === Array) {
      expectedType = 'array'
      valid = isArray(value)
    } else {
      valid = value instanceof type
    }
  }
  if (!valid) {
    process.env.NODE_ENV !== 'production' && warn(
      'Invalid prop: type check failed for ' +
      prop.path + '="' + prop.raw + '".' +
      ' Expected ' + formatType(expectedType) +
      ', got ' + formatValue(value) + '.'
    )
    return false
  }
  var validator = options.validator
  if (validator) {
    if (!validator(value)) {
      process.env.NODE_ENV !== 'production' && warn(
        'Invalid prop: custom validator check failed for ' +
        prop.path + '="' + prop.raw + '"'
      )
      return false
    }
  }
  return true
}

/**
 * Force parsing value with coerce option.
 *
 * @param {*} value
 * @param {Object} options
 * @return {*}
 */

export function coerceProp (prop, value) {
  var coerce = prop.options.coerce
  if (!coerce) {
    return value
  }
  // coerce is a function
  return coerce(value)
}

function formatType (val) {
  return val
    ? val.charAt(0).toUpperCase() + val.slice(1)
    : 'custom type'
}

function formatValue (val) {
  return Object.prototype.toString.call(val).slice(8, -1)
}
