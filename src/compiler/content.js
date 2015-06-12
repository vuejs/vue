var _ = require('../util')

// This is the elementDirective that handles <content>
// transclusions. It relies on the raw content of an
// instance being stored as `$options._content` during
// the transclude phase.

module.exports = {

  bind: function () {
    var vm = this.vm
    var contentOwner = vm
    // we need find the content owner, which is the closest
    // non-inline-repeater instance.
    while (contentOwner.$options._repeat) {
      contentOwner = contentOwner.$parent
    }
    var raw = contentOwner.$options._content
    var content
    if (!raw) {
      // fallback content
      // extract as a fragment
      content = _.extractContent(this.el, true)
      this.compile(content, vm)
      return
    }
    var parent = contentOwner.$parent
    var selector = this.el.getAttribute('select')
    if (!selector) {
      // default content
      // Importent: clone the rawContent before extracting
      // content because the <content> may be inside a v-if
      // and need to be compiled more than once.
      content = _.extractContent(raw.cloneNode(true), true)
      this.compile(content, parent, vm)
    } else {
      // select content
      selector = vm.$interpolate(selector)
      content = raw.querySelector(selector)
      // only allow top-level select
      if (content && content.parentNode === raw) {
        // same deal, clone the node for v-if
        content = content.cloneNode(true)
        this.compile(content, parent, vm)
      }
    }
  },

  compile: function (content, owner, host) {
    if (content && owner) {
      this.unlink = owner.$compile(content, host)
    }
    if (content) {
      _.replace(this.el, content)
    } else {
      _.remove(this.el)
    }
  },

  unbind: function () {
    if (this.unlink) {
      this.unlink()
    } 
  }

}
