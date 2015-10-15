var _ = require('../util')
var dirParser = require('../parsers/directive-new')
var textParser = require('../parsers/text')
var propDef = require('../directives/prop')
var propBindingModes = require('../config')._propBindingModes

// regexes
var identRE = require('../parsers/path').identRE
var dataAttrRE = /^data-/
var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/
var literalValueRE = /^\s?(true|false|[\d\.]+|'[^']*'|"[^"]*")\s?$/

/**
 * Compile props on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @return {Function} propsLinkFn
 */

// TODO: 1.0.0 we can just loop through el.attributes and
// check for prop- prefixes.

module.exports = function compileProps (el, propOptions) {
  var props = []
  var i = propOptions.length
  var options, name, attr, value, path, prop, literal, single, parsed
  while (i--) {
    options = propOptions[i]
    name = options.name

    if (process.env.NODE_ENV !== 'production') {
      if (name === '$data') {
        _.deprecation.DATA_AS_PROP()
      }
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = _.camelize(name.replace(dataAttrRE, ''))
    if (!identRE.test(path)) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Invalid prop key: "' + name + '". Prop keys ' +
        'must be valid identifiers.'
      )
      continue
    }
    attr = _.hyphenate(name)
    value = el.getAttribute(attr)

    if (value === null) {
      value = el.getAttribute('data-' + attr)
      if (value !== null) {
        attr = 'data-' + attr
        if (process.env.NODE_ENV !== 'production') {
          _.deprecation.DATA_PROPS(attr, value)
        }
      }
    }

    // create a prop descriptor
    prop = {
      name: name,
      raw: value,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY
    }
    if (value !== null) {
      // important so that this doesn't get compiled
      // again as a normal attribute binding
      el.removeAttribute(attr)
      var tokens = textParser.parse(value)
      if (tokens) {

        if (process.env.NODE_ENV !== 'production') {
          _.deprecation.PROPS(attr, value)
        }

        prop.dynamic = true
        prop.parentPath = textParser.tokensToExp(tokens)
        // check prop binding type.
        single = tokens.length === 1
        literal = literalValueRE.test(prop.parentPath)
        // one time: {{* prop}}
        if (literal || (single && tokens[0].oneTime)) {
          prop.mode = propBindingModes.ONE_TIME
        } else if (
          !literal &&
          (single && tokens[0].twoWay)
        ) {
          if (settablePathRE.test(prop.parentPath)) {
            prop.mode = propBindingModes.TWO_WAY
          } else {
            process.env.NODE_ENV !== 'production' && _.warn(
              'Cannot bind two-way prop with non-settable ' +
              'parent path: ' + prop.parentPath
            )
          }
        }
      }
    } else {
      // new syntax, check binding type
      if ((value = _.getBindAttr(el, attr)) === null) {
        if ((value = _.getBindAttr(el, attr + '.sync')) !== null) {
          prop.mode = propBindingModes.TWO_WAY
        } else if ((value = _.getBindAttr(el, attr + '.once')) !== null) {
          prop.mode = propBindingModes.ONE_TIME
        }
      }
      prop.raw = value
      if (value !== null) {
        // mark it so we know this is a bind
        prop.bindSyntax = true
        parsed = dirParser.parse(value)
        value = parsed.expression
        prop.filters = parsed.filters
        // check literal
        if (literalValueRE.test(value)) {
          prop.raw = _.stripQuotes(value) || value
        } else {
          prop.dynamic = true
          // check non-settable path for two-way bindings
          if (process.env.NODE_ENV !== 'production' &&
              prop.mode === propBindingModes.TWO_WAY &&
              !settablePathRE.test(value)) {
            prop.mode = propBindingModes.ONE_WAY
            _.warn(
              'Cannot bind two-way prop with non-settable ' +
              'parent path: ' + value
            )
          }
        }
      }
      prop.parentPath = value
    }

    // warn required two-way
    if (
      process.env.NODE_ENV !== 'production' &&
      value !== null &&
      options.twoWay &&
      prop.mode !== propBindingModes.TWO_WAY
    ) {
      _.warn(
        'Prop "' + name + '" expects a two-way binding type.'
      )
    }

    // warn missing required
    if (value === null && options.required) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Missing required prop: ' + name
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
    var prop, path, options, value
    while (i--) {
      prop = props[i]
      path = prop.path
      vm._props[path] = prop
      options = prop.options
      if (prop.raw === null) {
        // initialize absent prop
        _.initProp(vm, prop, getDefault(vm, options))
      } else if (prop.dynamic) {
        // dynamic prop
        if (vm._context) {
          if (prop.mode === propBindingModes.ONE_TIME) {
            // one time binding
            value = (scope || vm._context).$get(prop.parentPath)
            _.initProp(vm, prop, value)
          } else {
            // dynamic binding
            vm._bindDir('prop', null, prop, propDef, null, scope)
          }
        } else {
          process.env.NODE_ENV !== 'production' && _.warn(
            'Cannot bind dynamic prop on a root instance' +
            ' with no parent: ' + prop.name + '="' +
            prop.raw + '"'
          )
        }
      } else {
        // literal, cast it and just set once
        var raw = prop.raw
        if (options.type === Boolean && raw === '') {
          value = true
        } else if (raw.trim()) {
          value = _.toBoolean(_.toNumber(raw))
          if (process.env.NODE_ENV !== 'production' &&
              !prop.bindSyntax &&
              value !== raw) {
            _.deprecation.PROP_CASTING(prop.name, prop.raw)
          }
        } else {
          value = raw
        }
        _.initProp(vm, prop, value)
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
    ? def.call(vm)
    : def
}
