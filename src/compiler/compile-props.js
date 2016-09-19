import config from '../config'
import { parseDirective } from '../parsers/directive'
import { isSimplePath } from '../parsers/expression'
import { defineReactive, withoutConversion } from '../observer/index'
import propDef from '../directives/internal/prop'
import {
  warn,
  camelize,
  hyphenate,
  getAttr,
  getBindAttr,
  isLiteral,
  toBoolean,
  toNumber,
  stripQuotes,
  isArray,
  isPlainObject,
  isObject,
  hasOwn
} from '../util/index'

const propBindingModes = config._propBindingModes
const empty = {}

// regexes
const identRE = /^[$_a-zA-Z]+[\w$]*$/
const settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/

/**
 * Compile props on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @param {Vue} vm
 * @return {Function} propsLinkFn
 */

export function compileProps (el, propOptions, vm) {
  var props = []
  var propsData = vm.$options.propsData
  var names = Object.keys(propOptions)
  var i = names.length
  var options, name, attr, value, path, parsed, prop
  while (i--) {
    name = names[i]
    options = propOptions[name] || empty

    if (process.env.NODE_ENV !== 'production' && name === '$data') {
      warn('Do not use $data as prop.', vm)
      continue
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = camelize(name)
    if (!identRE.test(path)) {
      process.env.NODE_ENV !== 'production' && warn(
        'Invalid prop key: "' + name + '". Prop keys ' +
        'must be valid identifiers.',
        vm
      )
      continue
    }

    prop = {
      name: name,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY,
      raw: null
    }

    attr = hyphenate(name)
    // first check dynamic version
    if ((value = getBindAttr(el, attr)) === null) {
      if ((value = getBindAttr(el, attr + '.sync')) !== null) {
        prop.mode = propBindingModes.TWO_WAY
      } else if ((value = getBindAttr(el, attr + '.once')) !== null) {
        prop.mode = propBindingModes.ONE_TIME
      }
    }
    if (value !== null) {
      // has dynamic binding!
      prop.raw = value
      parsed = parseDirective(value)
      value = parsed.expression
      prop.filters = parsed.filters
      // check binding type
      if (isLiteral(value) && !parsed.filters) {
        // for expressions containing literal numbers and
        // booleans, there's no need to setup a prop binding,
        // so we can optimize them as a one-time set.
        prop.optimizedLiteral = true
      } else {
        prop.dynamic = true
        // check non-settable path for two-way bindings
        if (process.env.NODE_ENV !== 'production' &&
            prop.mode === propBindingModes.TWO_WAY &&
            !settablePathRE.test(value)) {
          prop.mode = propBindingModes.ONE_WAY
          warn(
            'Cannot bind two-way prop with non-settable ' +
            'parent path: ' + value,
            vm
          )
        }
      }
      prop.parentPath = value

      // warn required two-way
      if (
        process.env.NODE_ENV !== 'production' &&
        options.twoWay &&
        prop.mode !== propBindingModes.TWO_WAY
      ) {
        warn(
          'Prop "' + name + '" expects a two-way binding type.',
          vm
        )
      }
    } else if ((value = getAttr(el, attr)) !== null) {
      // has literal binding!
      prop.raw = value
    } else if (propsData && ((value = propsData[name] || propsData[path]) !== null)) {
      // has propsData
      prop.raw = value
    } else if (process.env.NODE_ENV !== 'production') {
      // check possible camelCase prop usage
      var lowerCaseName = path.toLowerCase()
      value = /[A-Z\-]/.test(name) && (
        el.getAttribute(lowerCaseName) ||
        el.getAttribute(':' + lowerCaseName) ||
        el.getAttribute('v-bind:' + lowerCaseName) ||
        el.getAttribute(':' + lowerCaseName + '.once') ||
        el.getAttribute('v-bind:' + lowerCaseName + '.once') ||
        el.getAttribute(':' + lowerCaseName + '.sync') ||
        el.getAttribute('v-bind:' + lowerCaseName + '.sync')
      )
      if (value) {
        warn(
          'Possible usage error for prop `' + lowerCaseName + '` - ' +
          'did you mean `' + attr + '`? HTML is case-insensitive, remember to use ' +
          'kebab-case for props in templates.',
          vm
        )
      } else if (options.required) {
        // warn missing required
        warn('Missing required prop: ' + name, vm)
      }
    }
    // push prop
    props.push(prop)
  }
  return makePropsLinkFn(props)
}

/**
 * Build a function that applies props to a vm.
 *
 * @param {Array} props
 * @return {Function} propsLinkFn
 */

function makePropsLinkFn (props) {
  return function propsLinkFn (vm, scope) {
    // store resolved props info
    vm._props = {}
    var inlineProps = vm.$options.propsData
    var i = props.length
    var prop, path, options, value, raw
    while (i--) {
      prop = props[i]
      raw = prop.raw
      path = prop.path
      options = prop.options
      vm._props[path] = prop
      if (inlineProps && hasOwn(inlineProps, path)) {
        initProp(vm, prop, inlineProps[path])
      } if (raw === null) {
        // initialize absent prop
        initProp(vm, prop, undefined)
      } else if (prop.dynamic) {
        // dynamic prop
        if (prop.mode === propBindingModes.ONE_TIME) {
          // one time binding
          value = (scope || vm._context || vm).$get(prop.parentPath)
          initProp(vm, prop, value)
        } else {
          if (vm._context) {
            // dynamic binding
            vm._bindDir({
              name: 'prop',
              def: propDef,
              prop: prop
            }, null, null, scope) // el, host, scope
          } else {
            // root instance
            initProp(vm, prop, vm.$get(prop.parentPath))
          }
        }
      } else if (prop.optimizedLiteral) {
        // optimized literal, cast it and just set once
        var stripped = stripQuotes(raw)
        value = stripped === raw
          ? toBoolean(toNumber(raw))
          : stripped
        initProp(vm, prop, value)
      } else {
        // string literal, but we need to cater for
        // Boolean props with no value, or with same
        // literal value (e.g. disabled="disabled")
        // see https://github.com/vuejs/vue-loader/issues/182
        value = (
          options.type === Boolean &&
          (raw === '' || raw === hyphenate(prop.name))
        ) ? true
          : raw
        initProp(vm, prop, value)
      }
    }
  }
}

/**
 * Process a prop with a rawValue, applying necessary coersions,
 * default values & assertions and call the given callback with
 * processed value.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} rawValue
 * @param {Function} fn
 */

function processPropValue (vm, prop, rawValue, fn) {
  const isSimple = prop.dynamic && isSimplePath(prop.parentPath)
  let value = rawValue
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop)
  }
  value = coerceProp(prop, value, vm)
  const coerced = value !== rawValue
  if (!assertProp(prop, value, vm)) {
    value = undefined
  }
  if (isSimple && !coerced) {
    withoutConversion(() => {
      fn(value)
    })
  } else {
    fn(value)
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
  processPropValue(vm, prop, value, value => {
    defineReactive(vm, prop.path, value)
  })
}

/**
 * Update a prop's value on a vm.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

export function updateProp (vm, prop, value) {
  processPropValue(vm, prop, value, value => {
    vm[prop.path] = value
  })
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @return {*}
 */

function getPropDefaultValue (vm, prop) {
  // no default, return undefined
  const options = prop.options
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
      'Invalid default value for prop "' + prop.name + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
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
 * @param {Vue} vm
 */

function assertProp (prop, value, vm) {
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
        'Invalid prop: type check failed for prop "' + prop.name + '".' +
        ' Expected ' + expectedTypes.map(formatType).join(', ') +
        ', got ' + formatValue(value) + '.',
        vm
      )
    }
    return false
  }
  var validator = options.validator
  if (validator) {
    if (!validator(value)) {
      process.env.NODE_ENV !== 'production' && warn(
        'Invalid prop: custom validator check failed for prop "' + prop.name + '".',
        vm
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

function coerceProp (prop, value, vm) {
  var coerce = prop.options.coerce
  if (!coerce) {
    return value
  }
  if (typeof coerce === 'function') {
    return coerce(value)
  } else {
    process.env.NODE_ENV !== 'production' && warn(
      'Invalid coerce for prop "' + prop.name + '": expected function, got ' + typeof coerce + '.',
      vm
    )
    return value
  }
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
