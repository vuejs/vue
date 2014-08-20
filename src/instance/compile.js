var _ = require('../util')
var config = require('../config')
var Direcitve = require('../directive')
var textParser = require('../parse/text')
var dirParser = require('../parse/directive')
var templateParser = require('../parse/template')

/**
 * The main entrance to the compilation process.
 * Calling this function requires the instance's `$el` to
 * be already set up, and it should be called only once
 * during an instance's entire lifecycle.
 */

exports._compile = function () {
  if (this._isBlock) {
    _.toArray(this._blockFragment.childNodes)
      .forEach(this._compileNode, this)
  } else {
    this._compileNode(this.$el)
  }
  this._isCompiled = true
}

/**
 * Generic compile function. Determines the actual compile
 * function to use based on the nodeType.
 *
 * @param {Node} node
 */

exports._compileNode = function (node) {
  var type = node.nodeType
  if (type === 1 && node.tagName !== 'SCRIPT') {
    this._compileElement(node)
  } else if (type === 3 && config.interpolate) {
    this._compileTextNode(node)
  }
}

/**
 * Compile an Element.
 *
 * @param {Element} node
 */

exports._compileElement = function (node) {
  var tag = node.tagName
  // textarea is pretty annoying
  // because its value creates childNodes which
  // we don't want to compile.
  if (tag === 'TEXTAREA' && node.value) {
      node.value = this.$interpolate(node.value)
  }
  var hasAttributes = node.hasAttributes()
  // check priority directives
  if (hasAttributes) {
    if (this._checkPriorityDirs(node)) {
      return
    }
  }
  // check tag components
  if (
    tag.indexOf('-') > 0 &&
    this.$options.components[tag]
  ) {
    this._bindDirective('component', tag, node)
    return
  }
  // compile normal directives
  if (hasAttributes) {
    this._compileAttrs(node)
  }
  // recursively compile childNodes
  if (node.hasChildNodes()) {
    _.toArray(node.childNodes)
      .forEach(this._compileNode, this)
  }
}

/**
 * Compile attribtues on an Element.
 * Collect directives, sort them by priority,
 * then bind them. Also check normal directives for
 * param attributes and interpolation bindings.
 *
 * @param {Element} node
 */

exports._compileAttrs = function (node) {
  var attrs = _.toArray(node.attributes)
  var i = attrs.length
  var registry = this.$options.directives
  var dirs = []
  var attr, attrName, dir, dirName
  while (i--) {
    attr = attrs[i]
    attrName = attr.name
    if (attrName.indexOf(config.prefix) === 0) {
      dirName = attrName.slice(config.prefix.length)
      if (registry[dirName]) {
        if (dirName !== 'cloak') {
          node.removeAttribute(attrName)
        }
        dirs.push({
          name: dirName,
          value: attr.value
        })
      } else {
        _.warn('Failed to resolve directive: ' + dirName)
      }
    } else if (config.interpolate) {
      this._bindAttr(node, attr)
    }
  }
  // sort the directives by priority, low to high
  dirs.sort(function (a, b) {
    a = registry[a.name].priority || 0
    b = registry[b.name].priority || 0
    return a > b ? 1 : -1
  })
  i = dirs.length
  while (i--) {
    dir = dirs[i]
    this._bindDirective(dir.name, dir.value, node)
  }
}

/**
 * Compile a TextNode.
 * Possible interpolations include:
 *
 * - normal text binding,    e.g. {{text}}
 * - unescaped html binding, e.g. {{{html}}}
 * - one-time text binding,  e.g. {{*text}}
 * - one-time html binding,  e.g. {{{*html}}}
 *
 * @param {TextNode} node
 */

exports._compileTextNode = function (node) {
  var tokens = textParser.parse(node.nodeValue)
  if (!tokens) {
    return
  }
  var el, token, value
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i]
    if (token.tag) {
      if (token.oneTime) {
        value = this.$get(token.value)
        el = token.html
          ? templateParser.parse(value, true)
          : document.createTextNode(value)
        _.before(el, node)
      } else {
        value = token.value
        if (token.html) {
          el = document.createComment('vue-html')
          _.before(el, node)
          this._bindDirective('html', value, el)
        } else {
          el = document.createTextNode('')
          _.before(el, node)
          this._bindDirective('text', value, el)
        }
      }
    } else {
      el = document.createTextNode(token.value)
      _.before(el, node)
    }
  }
  _.remove(node)
}

/**
 * Check for priority directives that would potentially
 * skip other directives. Each priority directive, once
 * detected, will cause the compilation to skip the rest
 * and let that directive handle the rest. This allows,
 * for example, "v-repeat" to handle how it should handle
 * the situation when "v-component" is also present, and
 * "v-component" won't have to worry about that.
 *
 * @param {Element} node
 * @return {Boolean}
 */

var priorityDirs = [
  'repeat',
  'component',
  'if'
]

exports._checkPriorityDirs = function (node) {
  if (_.attr(node, 'pre') !== null) {
    return true
  }
  var value, dir
  /* jshint boss: true */
  for (var i = 0, l = priorityDirs.length; i < l; i++) {
    dir = priorityDirs[i]
    if (value = _.attr(node, dir)) {
      this._bindDirective(dir, value, node)
      return true
    }
  }
}

/**
 * Bind a directive.
 *
 * @param {String} name
 * @param {String} value
 * @param {Element} node
 */

exports._bindDirective = function (name, value, node) {
  var descriptors = dirParser.parse(value)
  var dirs = this._directives
  for (var i = 0, l = descriptors.length; i < l; i++) {
    dirs.push(
      new Direcitve(name, node, this, descriptors[i])
    )
  }
}

/**
 * Check a normal attribute for bindings.
 * A normal attribute could potentially be:
 *
 * - a param attribute (only on root nodes)
 * - an interpolated attribute, e.g. attr="{{data}}"
 */

exports._bindAttr = function (node, attr) {
  var name = attr.name
  var value = attr.value
  // check if this is a param attribute.
  var params = this.$options.paramAttributes
  var isParam =
    node === this.$el && // only check on root node
    params &&
    params.indexOf(name) > -1
  if (isParam) {
    node.removeAttribute(name)
  }
  // parse attribute value
  var tokens = textParser.parse(value)
  if (!tokens) {
    if (isParam) {
      this.$set(name, value)
    }
    return
  }
  // only 1 binding tag allowed
  if (tokens.length > 1) {
    _.warn(
      'Invalid attribute binding: "' +
      name + '="' + value + '"' +
      '\nDon\'t mix binding tags with plain text ' +
      'in attribute bindings.'
    )
    return
  }
  // param attributes are bound as v-with
  var dirName = isParam
    ? 'with'
    : 'attr'
  // wrap namespaced attribute so it won't mess up
  // the directive parser
  var arg = name.indexOf(':') > 0
    ? "'" + name + "'"
    : name
  // bind
  this._bindDirective(
    dirName,
    arg + ':' + tokens[0].value,
    node
  )
}