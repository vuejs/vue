var _ = require('../util')
var dirParser = require('../parsers/directive')
var propDef = require('../directives/internal/prop')
var propBindingModes = require('../config')._propBindingModes

// regexes
var identRE = require('../parsers/path').identRE
var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/

/**
 * Compile props on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @return {Function} propsLinkFn
 */

module.exports = function compileProps (el, propOptions) {
  var props = []
  var i = propOptions.length
  var options, name, attr, value, path, parsed, prop
  while (i--) {
    options = propOptions[i]
    name = options.name

    if (process.env.NODE_ENV !== 'production' && name === '$data') {
      _.warn('Do not use $data as prop.')
      el.removeAttribute('$data')
      el.removeAttribute(':$data')
      el.removeAttribute('bind-$data')
      continue
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = _.camelize(name)
    if (!identRE.test(path)) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Invalid prop key: "' + name + '". Prop keys ' +
        'must be valid identifiers.'
      )
      continue
    }

    prop = {
      name: name,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY
    }

    // first check literal version
    attr = _.hyphenate(name)
    value = prop.raw = el.getAttribute(attr)
    if (value !== null) {
      el.removeAttribute(attr)
    } else {
      // then check dynamic version
      value = prop.raw = _.getBindAttr(el, attr)
      if (value !== null) {
        parsed = dirParser.parse(value)
        value = parsed.expression
        prop.filters = parsed.filters
        // check binding type
        if (_.isLiteral(value)) {
          // for bind- literals such as numbers and booleans,
          // there's no need to setup a prop binding, so we
          // can optimize them as a one-time set.
          prop.optimizedLiteral = true
        } else {
          prop.dynamic = true
          if (value.charAt(0) === '*') {
            prop.mode = propBindingModes.ONE_TIME
            value = value.slice(1).trim()
          } else if (value.charAt(0) === '@') {
            value = value.slice(1).trim()
            if (settablePathRE.test(value)) {
              prop.mode = propBindingModes.TWO_WAY
            } else {
              process.env.NODE_ENV !== 'production' && _.warn(
                'Cannot bind two-way prop with non-settable ' +
                'parent path: ' + value
              )
            }
          }
        }
        prop.parentPath = value
      } else if (options.required) {
        // warn missing required
        process.env.NODE_ENV !== 'production' && _.warn(
          'Missing required prop: ' + name
        )
      }
    }

    // warn required two-way
    if (
      process.env.NODE_ENV !== 'production' &&
      options.twoWay &&
      prop.mode !== propBindingModes.TWO_WAY
    ) {
      _.warn(
        'Prop "' + name + '" expects a two-way binding type.'
      )
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
        _.initProp(vm, prop, getDefault(options))
      } else if (prop.dynamic) {
        // dynamic prop
        if (vm._context) {
          if (prop.mode === propBindingModes.ONE_TIME) {
            // one time binding
            value = (scope || vm._context).$get(prop.parentPath)
            _.initProp(vm, prop, value)
          } else {
            // dynamic binding
            vm._bindDir({
              name: 'prop',
              def: propDef,
              prop: prop
            }, null, null, scope) // el, host, scope
          }
        } else {
          process.env.NODE_ENV !== 'production' && _.warn(
            'Cannot bind dynamic prop on a root instance' +
            ' with no parent: ' + prop.name + '="' +
            raw + '"'
          )
        }
      } else if (prop.optimizedLiteral) {
        // optimized literal, cast it and just set once
        raw = _.stripQuotes(raw)
        value = _.toBoolean(_.toNumber(raw))
        _.initProp(vm, prop, value)
      } else {
        // string literal, but we need to cater for
        // Boolean props with no value
        value = options.type === Boolean && raw === ''
          ? true
          : raw
        _.initProp(vm, prop, value)
      }
    }
  }
}

/**
 * Get the default value of a prop.
 *
 * @param {Object} options
 * @return {*}
 */

function getDefault (options) {
  // no default, return undefined
  if (!options.hasOwnProperty('default')) {
    // absent boolean value defaults to false
    return options.type === Boolean
      ? false
      : undefined
  }
  var def = options.default
  // warn against non-factory defaults for Object & Array
  if (_.isObject(def)) {
    process.env.NODE_ENV !== 'production' && _.warn(
      'Object/Array as default prop values will be shared ' +
      'across multiple instances. Use a factory function ' +
      'to return the default value instead.'
    )
  }
  // call factory function for non-Function types
  return typeof def === 'function' && options.type !== Function
    ? def()
    : def
}
