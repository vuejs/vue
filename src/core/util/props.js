/* @flow */

import { hasOwn, isObject, isPlainObject, capitalize, hyphenate } from 'shared/util'
import { observe, observerState } from '../observer/index'
import { warn } from './debug'

type PropOptions = {
  type: Function | Array<Function> | null,
  default: any,
  required: ?boolean,
  validator: ?Function
}

export function validateProp (
  key: string,
  propOptions: Object,
  propsData: ?Object,
  vm?: Component
): any {
  /* istanbul ignore if */
  if (!propsData) return
  const prop = propOptions[key]
  const absent = !hasOwn(propsData, key)
  let value = propsData[key]
  // handle boolean props
  if (prop.type === Boolean) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false
    } else if (value === '' || value === hyphenate(key)) {
      value = true
    }
  }
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
 */
function getPropDefaultValue (vm: ?Component, prop: PropOptions, name: string): any {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  const def = prop.default
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
 */
function assertProp (
  prop: PropOptions,
  name: string,
  value: any,
  vm: ?Component,
  absent: boolean
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    )
    return
  }
  if (value == null && !prop.required) {
    return
  }
  let type = prop.type
  let valid = !type
  const expectedTypes = []
  if (type) {
    if (!Array.isArray(type)) {
      type = [type]
    }
    for (let i = 0; i < type.length && !valid; i++) {
      const assertedType = assertType(value, type[i])
      expectedTypes.push(assertedType.expectedType)
      valid = assertedType.valid
    }
  }
  if (!valid) {
    warn(
      'Invalid prop: type check failed for prop "' + name + '".' +
      ' Expected ' + expectedTypes.map(capitalize).join(', ') +
      ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
      vm
    )
    return
  }
  const validator = prop.validator
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      )
    }
  }
}

/**
 * Assert the type of a value
 */
function assertType (value: any, type: Function): {
  valid: boolean,
  expectedType: string
} {
  let valid
  let expectedType
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
    expectedType = 'Object'
    valid = isPlainObject(value)
  } else if (type === Array) {
    expectedType = 'Array'
    valid = Array.isArray(value)
  } else {
    expectedType = type.name || type.toString()
    valid = value instanceof type
  }
  return {
    valid,
    expectedType
  }
}
