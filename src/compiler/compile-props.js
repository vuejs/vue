import config from '../config'
import { parseDirective } from '../parsers/directive'
import propDef from '../directives/internal/prop'
import {
  warn,
  camelize,
  hyphenate,
  getAttr,
  getBindAttr,
  isLiteral,
  initProp,
  hasOwn,
  toBoolean,
  toNumber,
  stripQuotes,
  isObject
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
 * @return {Function} propsLinkFn
 */

export function compileProps (el, propOptions) {
  var props = []
  var names = Object.keys(propOptions)
  var i = names.length
  var options, name, attr, value, path, parsed, prop
  while (i--) {
    name = names[i]
    options = propOptions[name] || empty

    if (process.env.NODE_ENV !== 'production' && name === '$data') {
      warn('Do not use $data as prop.')
      continue
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = camelize(name)
    if (!identRE.test(path)) {
      process.env.NODE_ENV !== 'production' && warn(
        'Invalid prop key: "' + name + '". Prop keys ' +
        'must be valid identifiers.'
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
            'parent path: ' + value
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
          'Prop "' + name + '" expects a two-way binding type.'
        )
      }
    } else if ((value = getAttr(el, attr)) !== null) {
      // has literal binding!
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
          'kebab-case for props in templates.'
        )
      } else if (options.required) {
        // warn missing required
        warn('Missing required prop: ' + name)
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
    var i = props.length
    var prop, path, options, value, raw
    while (i--) {
      prop = props[i]
      raw = prop.raw
      path = prop.path
      options = prop.options
      vm._props[path] = prop
      if (raw === null) {
        // initialize absent prop
        initProp(vm, prop, getDefault(vm, options))
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
        // Boolean props with no value
        value = options.type === Boolean && raw === ''
          ? true
          : raw
        initProp(vm, prop, value)
      }
    }
  }
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} options
 * @return {*}
 */

function getDefault (vm, options) {
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
