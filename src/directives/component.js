var _ = require('../util')
var Watcher = require('../watcher')

/**
 * Possible permutations:
 *
 * - literal:
 *   v-component="comp"
 *
 * - dynamic:
 *   v-component="{{currentView}}"
 *
 * - conditional:
 *   v-component="comp" v-if="abc"
 *
 * - dynamic + conditional:
 *   v-component="{{currentView}}" v-if="abc"
 *
 */

module.exports = {

  isLiteral: true,

  bind: function () {
    if (!this.el.__vue__) {
      // create a ref anchor
      this.ref = document.createComment('v-component')
      _.before(this.ref, this.el)
      _.remove(this.el)
      // check v-if conditionals
      this.checkIf()
      // if static, build right now.
      if (!this._isDynamicLiteral) {
        this.resolveCtor(this.expression)
        this.build()
      }
    } else {
      _.warn(
        'v-component ' + this.expression + ' cannot be ' +
        'used on an already mounted instance.'
      )
    }
  },

  checkIf: function () {
    var condition = _.attr(this.el, 'if')
    if (condition !== null) {
      this.ifWatcher = new Watcher(
        this.vm,
        condition,
        this.ifCallback,
        this
      )
      this.active = this.ifWatcher.value
    } else {
      this.active = true
    }
  },

  ifCallback: function (value) {
    if (value) {
      this.active = true
      this.build()
    } else {
      this.active = false
      this.unbuild(true)
    }
  },

  resolveCtor: function (id) {
    var registry = this.vm.$options.components
    this.Ctor = registry[id]
    if (!this.Ctor) {
      _.warn('Failed to resolve component: ' + id)
    }
  },

  build: function () {
    if (this.active && this.Ctor && !this.childVM) {
      this.childVM = new this.Ctor({
        el: this.el.cloneNode(true),
        parent: this.vm
      })
      this.childVM.$before(this.ref)
    }
  },

  unbuild: function (remove) {
    if (this.childVM) {
      this.childVM.$destroy(remove)
      this.childVM = null
    }
  },

  update: function (value) {
    this.unbuild(true)
    if (value) {
      this.resolveCtor(value)
      this.build()
    }
  },

  unbind: function () {
    this.unbuild()
    if (this.ifWatcher) {
      this.ifWatcher.teardown()
    }
  }

}