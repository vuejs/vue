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
    el = document.querySelector(el)
  }
  // If the passed in `el` is a DocumentFragment, the instance is
  // considered a "block instance" which manages not a single element,
  // but multiple elements. A block instance's `$el` is an Array of
  // the elements it manages.
  if (el instanceof DocumentFragment) {
    this._isBlock = true
    this.$el = _.toArray(el.childNodes)
  } else {
    this.$el = el
  }
  this._initTemplate()
  this._initContent()
}

/**
 * Process the template option.
 * If the replace option is true this will also modify the $el.
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
      // collect raw content. this wipes out the container el.
      this._collectRawContent()
      frag = frag.cloneNode(true)
      if (options.replace) {
        // replace
        if (frag.childNodes.length > 1) {
          // the template contains multiple nodes
          // in this case the original `el` is simply
          // a placeholder.
          this._isBlock = true
          this.$el = _.toArray(frag.childNodes)
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
  if (el.hasChildNodes()) {
    this.rawContent = document.createElement('div')
    /* jshint boss: true */
    while (child = el.firstChild) {
      this.rawContent.appendChild(child)
    }
  }
}

/**
 * Resolve <content> insertion points per W3C Web Components
 * working draft:
 *
 *  http://www.w3.org/TR/2013/WD-components-intro-20130606/#insertion-points
 */

exports._initContent = function () {
  // TODO
}