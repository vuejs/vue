var _ = require('./index')

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {String|undefined}
 */

exports.commonTagRE = /^(div|p|span|img|a|br|ul|ol|li|h1|h2|h3|h4|h5|code|pre)$/
exports.checkComponent = function (el, options) {
  var tag = el.tagName.toLowerCase()
  if (tag === 'component') {
    // dynamic syntax
    var exp = el.getAttribute('is')
    el.removeAttribute('is')
    return exp
  } else if (
    !exports.commonTagRE.test(tag) &&
    _.resolveAsset(options, 'components', tag)
  ) {
    return tag
  /* eslint-disable no-cond-assign */
  } else if (tag = _.attr(el, 'component')) {
  /* eslint-enable no-cond-assign */
    return tag
  }
}

/**
 * Set a prop's initial value on a vm and its data object.
 * The vm may have inherit:true so we need to make sure
 * we don't accidentally overwrite parent value.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

exports.initProp = function (vm, prop, value) {
  if (exports.assertProp(prop, value)) {
    var key = prop.path
    if (key in vm) {
      _.define(vm, key, value, true)
    } else {
      vm[key] = value
    }
    vm._data[key] = value
  }
}

/**
 * Automatically cast a prop based on its specified type.
 *
 * @param {Object} prop
 * @param {String} raw
 * @return {String|Boolean|Number}
 */
exports.castProp = function (prop, raw) {
  var hasBoolean = false
  var hasNumber = false
  var types = exports.normalizePropTypes(prop.options.type)
  if (types) {
    var i, l
    for (i = 0, l = types.length; i < l; i++) {
      var type = types[i]
      if (type === Number) {
        hasNumber = true
      } else if (type === Boolean) {
        hasBoolean = true
      }
    }
  }

  if (hasBoolean && raw === '') {
    return true
  }
  var value = raw
  if (!value.trim()) {
    return value
  }
  if (!types || hasNumber) {
    value = _.toNumber(value)
  }
  if (!types || hasBoolean) {
    value = _.toBoolean(value)
  }
  return value
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {*} value
 * @return {Boolean}
 */

exports.assertProp = function (prop, value) {
  // if a prop is not provided and is not required,
  // skip the check.
  if (prop.raw === null && !prop.required) {
    return true
  }
  var options = prop.options
  var types = exports.normalizePropTypes(options.type)
  var valid = true
  var expectedTypes = []
  if (types) {
    valid = false
    var i, l, v, expectedType
    for (i = 0, l = types.length; i < l; i++) {
      var type = types[i]
      if (type === String) {
        expectedType = 'string'
        v = typeof value === expectedType
      } else if (type === Number) {
        expectedType = 'number'
        v = typeof value === 'number'
      } else if (type === Boolean) {
        expectedType = 'boolean'
        v = typeof value === 'boolean'
      } else if (type === Function) {
        expectedType = 'function'
        v = typeof value === 'function'
      } else if (type === Object) {
        expectedType = 'object'
        v = _.isPlainObject(value)
      } else if (type === Array) {
        expectedType = 'array'
        v = _.isArray(value)
      } else {
        expectedType = null
        v = value instanceof type
      }
      expectedTypes.push(expectedType)
      if (v) {
        valid = true
        break
      }
    }
  }
  if (!valid) {
    process.env.NODE_ENV !== 'production' && _.warn(
      'Invalid prop: type check failed for ' +
      prop.path + '="' + prop.raw + '".' +
      ' Expected ' + formatType(expectedTypes) +
      ', got ' + formatValue(value) + '.'
    )
    return false
  }
  var validator = options.validator
  if (validator) {
    if (!validator.call(null, value)) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Invalid prop: custom validator check failed for ' +
        prop.path + '="' + prop.raw + '"'
      )
      return false
    }
  }
  return true
}

/**
 * Normalize property type option.
 * The returned value will either be an array of types,
 * or null if the property has no type
 *
 * @param {*} types
 * @return {Array|null}
 */
exports.normalizePropTypes = function (types) {
  if (!types) {
    return null
  }
  if (!_.isArray(types)) {
    types = [types]
  }
  return types.length ? types : null
}

function formatType (val) {
  for (var i = 0, l = val.length; i < l; i++) {
    val[i] = val[i]
      ? val[i].charAt(0).toUpperCase() + val[i].slice(1)
      : 'custom type'
  }
  if (val.length === 1) {
    return val[0]
  } else {
    return 'one of ' + val.join(', ')
  }
}

function formatValue (val) {
  return Object.prototype.toString.call(val).slice(8, -1)
}
