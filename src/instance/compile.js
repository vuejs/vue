var config = require('../config')

/**
 * The main entrance to the compilation process.
 * Calling this function requires the instance's `$el` to
 * be already set up, and it should be called only once
 * during an instance's entire lifecycle.
 */

exports._compile = function () {
  if (this._isBlock) {
    this.$el.forEach(this._compileNode, this)
  } else {
    this._compileNode(this.$el)
  }
}

/**
 * Generic compile function. Determines the actual compile
 * function to use based on the nodeType.
 *
 * @param {Node} node
 */

exports._compileNode = function (node) {
  switch (node.nodeType) {
    case 1: // element
      if (node.tagName !== 'SCRIPT') {
        this._compileElement(node)
      }
      break
    case 3: // text
      if (config.interpolate) {
        this._compileTextNode(node)
      }
      break
    case 8: // comment
      this._compileComment(node)
      break
  }
}

/**
 * Compile an HTMLElement
 *
 * @param {HTMLElement} node
 */

exports._compileElement = function (node) {
  var tag = node.tagName
  // textarea is pretty annoying
  // because its value creates childNodes which
  // we don't want to compile.
  if (tag === 'TEXTAREA' && node.value) {
      node.value = this.$interpolate(node.value)
  }
  if (
    // skip non-component with no attributes
    (!node.hasAttributes() && tag.indexOf('-') < 0) ||
    // skip v-pre
    _.attr(node, 'pre') !== null
  ) {
    return
  }
  // TODO
}

/**
 * Compile a TextNode
 *
 * @param {TextNode} node
 */

exports._compileTextNode = function (node) {
  
}

/**
 * Compile a comment node (check for block flow-controls)
 *
 * @param {CommentNode} node
 */

exports._compileComment = function (node) {
  
}