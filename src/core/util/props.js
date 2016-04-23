import { hasOwn, isArray, isObject, isPlainObject } from '../../shared/util'
import { observe, observerState } from '../observer/index'
import { warn } from './debug'

export function validateProp (vm, key, propsData) {
  if (!propsData) return
  const prop = vm.$options.props[key]
  const absent = hasOwn(propsData, key)
  let value = propsData[key]
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key)
    // since the default value is a fresh copy,
    // make sure to observe it.
    observerState.shouldConvert = true
    observe(value)
    observerState.shouldConvert = false
  }
  if (process.env.NODE_ENV !== 'production') {
    assertProp(prop, key, value, vm, absent)
  }
  return value
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @return {*}
 */

function getPropDefaultValue (vm, prop, name) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    // absent boolean value defaults to false
    return prop.type === Boolean
      ? false
      : undefined
  }
  var def = prop.default
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Invalid default value for prop "' + name + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    )
  }
  // call factory function for non-Function types
  return typeof def === 'function' && prop.type !== Function
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {String} name
 * @param {*} value
 * @param {Vue} vm
 * @param {Boolean} absent
 */

function assertProp (prop, name, value, vm, absent) {
  if (prop.required && absent) {
    process.env.NODE_ENV !== 'production' && warn(
      'Missing required prop: "' + name + '"',
      vm
    )
    return false
  }
  if (value == null) {
    return true
  }
  var type = prop.type
  var valid = !type
  var expectedTypes = []
  if (type) {
    if (!isArray(type)) {
      type = [type]
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i])
      expectedTypes.push(assertedType.expectedType)
      valid = assertedType.valid
    }
  }
  if (!valid) {
    if (process.env.NODE_ENV !== 'production') {
      warn(
        'Invalid prop: type check failed for prop "' + name + '".' +
        ' Expected ' + expectedTypes.map(formatType).join(', ') +
        ', got ' + formatValue(value) + '.',
        vm
      )
    }
    return false
  }
  var validator = prop.validator
  if (validator) {
    if (!validator(value)) {
      process.env.NODE_ENV !== 'production' && warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      )
      return false
    }
  }
  return true
}

/**
 * Assert the type of a value
 *
 * @param {*} value
 * @param {Function} type
 * @return {Object}
 */

function assertType (value, type) {
  var valid
  var expectedType
  if (type === String) {
    expectedType = 'string'
    valid = typeof value === expectedType
  } else if (type === Number) {
    expectedType = 'number'
    valid = typeof value === expectedType
  } else if (type === Boolean) {
    expectedType = 'boolean'
    valid = typeof value === expectedType
  } else if (type === Function) {
    expectedType = 'function'
    valid = typeof value === expectedType
  } else if (type === Object) {
    expectedType = 'object'
    valid = isPlainObject(value)
  } else if (type === Array) {
    expectedType = 'array'
    valid = isArray(value)
  } else {
    valid = value instanceof type
  }
  return {
    valid,
    expectedType
  }
}

/**
 * Format type for output
 *
 * @param {String} type
 * @return {String}
 */

function formatType (type) {
  return type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : 'custom type'
}

/**
 * Format value
 *
 * @param {*} value
 * @return {String}
 */

function formatValue (val) {
  return Object.prototype.toString.call(val).slice(8, -1)
}
