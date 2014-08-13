var _ = require('../util')
var templateParser = require('../parse/template')

/**
 * Setup the instance's element before compilation.
 * 1. Setup $el
 * 2. Process the template option
 * 3. Resolve <content> insertion points
 *
 * @param {Node|String} el
 */

exports._initElement = function (el) {
  if (typeof el === 'string') {
    var selector = el
    el = document.querySelector(el)
    if (!el) {
      _.warn('Cannot find element: ' + selector)
    }
  }
  // If the passed in `el` is a DocumentFragment, the
  // instance is considered a "block instance" which manages
  // not a single element, but multiple elements. A block
  // instance's `$el` is an Array of the elements it manages.
  if (el instanceof DocumentFragment) {
    this._blockNodes = _.toArray(el.childNodes)
    this.$el = document.createComment('vue-block')
  } else {
    this.$el = el
  }
  this.$el.__vue__ = this
  this._initTemplate()
  this._initContent()
}

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 */

exports._initTemplate = function () {
  var el = this.$el
  var options = this.$options
  var template = options.template
  if (template) {
    var frag = templateParser.parse(template)
    if (!frag) {
      _.warn('Invalid template option: ' + template)
    } else {
      // collect raw content. this wipes out $el.
      this._collectRawContent()
      frag = frag.cloneNode(true)
      if (options.replace) {
        // replace
        if (frag.childNodes.length > 1) {
          // the template contains multiple nodes
          // in this case the original `el` is simply
          // a placeholder.
          this._blockNodes = _.toArray(frag.childNodes)
          this.$el = document.createComment('vue-block')
        } else {
          // 1 to 1 replace, we need to copy all the
          // attributes from the original el to the replacer
          this.$el = frag.firstChild
          _.copyAttributes(el, this.$el)
        }
        if (el.parentNode) {
          _.before(this.$el, el)
          _.remove(el)
        }
      } else {
        // simply insert.
        el.appendChild(frag)
      }
    }
  }
}

/**
 * Collect raw content inside $el before they are
 * replaced by template content.
 */

exports._collectRawContent = function () {
  var el = this.$el
  var child
  if (el.hasChildNodes()) {
    this._rawContent = document.createElement('div')
    /* jshint boss: true */
    while (child = el.firstChild) {
      this._rawContent.appendChild(child)
    }
  }
}

/**
 * Resolve <content> insertion points mimicking the behavior
 * of the Shadow DOM spec:
 *
 *  http://w3c.github.io/webcomponents/spec/shadow/#insertion-points
 */

exports._initContent = function () {
  var outlets = getOutlets(this.$el)
  var raw = this._rawContent
  var i = outlets.length
  var outlet, select, j, main
  if (i) {
    // first pass, collect corresponding content
    // for each outlet.
    while (i--) {
      outlet = outlets[i]
      if (raw) {
        select = outlet.getAttribute('select')
        if (select) { // select content
          outlet.content = _.toArray(
            raw.querySelectorAll(select)
          )
        } else { // default content
          main = outlet
        }
      } else { // fallback content
        outlet.content = _.toArray(outlet.childNodes)
      }
    }
    // second pass, actually insert the contents
    for (i = 0, j = outlets.length; i < j; i++) {
      outlet = outlets[i]
      if (outlet === main) continue
      insertContentAt(outlet, outlet.content)
    }
    // finally insert the main content
    if (raw && main) {
      insertContentAt(main, _.toArray(raw.childNodes))
    }
  }
  this._rawContent = null
}

/**
 * Get <content> outlets from the element/list
 *
 * @param {Element|Array} el
 * @return {Array}
 */

var concat = [].concat
function getOutlets (el) {
  return _.isArray(el)
    ? concat.apply([], el.map(getOutlets))
    : _.toArray(el.getElementsByTagName('content'))
}

/**
 * Insert an array of nodes at outlet,
 * then remove the outlet.
 *
 * @param {Element} outlet
 * @param {Array} contents
 */

function insertContentAt (outlet, contents) {
  // not using util DOM methods here because
  // parentNode can be cached
  var parent = outlet.parentNode
  for (var i = 0, j = contents.length; i < j; i++) {
    parent.insertBefore(contents[i], outlet)
  }
  parent.removeChild(outlet)
}