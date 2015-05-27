var _ = require('./index')
var config = require('../config')
var commonTagRE = /^(div|p|span|img|a|br|ul|ol|li|h1|h2|h3|h4|h5|table|tbody|tr|td|pre)$/

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {String|undefined}
 */

exports.checkComponent = function (el, options) {
  var tag = el.tagName.toLowerCase()
  if (tag === 'component') {
    // dynamic syntax
    var exp = el.getAttribute('is')
    el.removeAttribute('is')
    return exp
  } else if (
    !commonTagRE.test(tag) &&
    _.resolveAsset(options, 'components', tag)
  ) {
    return tag
  }
}

/**
 * Create an "anchor" for performing dom insertion/removals.
 * This is used in a number of scenarios:
 * - block instance
 * - v-html
 * - v-if
 * - component
 * - repeat
 *
 * @param {String} content
 * @param {Boolean} persist - IE trashes empty textNodes on
 *                            cloneNode(true), so in certain
 *                            cases the anchor needs to be
 *                            non-empty to be persisted in
 *                            templates.
 * @return {Comment|Text}
 */

exports.createAnchor = function (content, persist) {
  return config.debug
    ? document.createComment(content)
    : document.createTextNode(persist ? ' ' : '')
}

/**
 * Resolve read & write filters for a vm instance. The
 * filters descriptor Array comes from the directive parser.
 *
 * This is extracted into its own utility so it can
 * be used in multiple scenarios.
 *
 * @param {Vue} vm
 * @param {Array<Object>} filters
 * @param {Object} [target]
 * @return {Object}
 */

exports.resolveFilters = function (vm, filters, target) {
  if (!filters) {
    return
  }
  var res = target || {}
  // var registry = vm.$options.filters
  filters.forEach(function (f) {
    var def = _.resolveAsset(vm.$options, 'filters', f.name)
    _.assertAsset(def, 'filter', f.name)
    if (!def) return
    var args = f.args
    var reader, writer
    if (typeof def === 'function') {
      reader = def
    } else {
      reader = def.read
      writer = def.write
    }
    if (reader) {
      if (!res.read) res.read = []
      res.read.push(function (value) {
        return args
          ? reader.apply(vm, [value].concat(resolveArgs(vm, args)))
          : reader.call(vm, value)
      })
    }
    if (writer) {
      if (!res.write) res.write = []
      res.write.push(function (value, oldVal) {
        return args
          ? writer.apply(vm, [value, oldVal].concat(resolveArgs(vm, args)))
          : writer.call(vm, value, oldVal)
      })
    }
  })
  return res
}

/**
 * Resolve arguments into static values
 *
 * @param {Vue} vm
 * @param {Array} args
 * @return {Array}
 */

function resolveArgs (vm, args) {
  return args.map(function (arg) {
    return arg.dynamic
      ? vm.$get(arg.value)
      : arg.value
  })
}

/**
 * Apply filters to a value
 *
 * @param {*} value
 * @param {Array} filters
 * @param {Vue} vm
 * @param {*} oldVal
 * @return {*}
 */

exports.applyFilters = function (value, filters, vm, oldVal) {
  if (!filters) {
    return value
  }
  for (var i = 0, l = filters.length; i < l; i++) {
    value = filters[i].call(vm, value, oldVal)
  }
  return value
}