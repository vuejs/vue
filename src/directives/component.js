var _ = require('../util')
var compile = require('../compiler/compile')
var templateParser = require('../parsers/template')

module.exports = {

  isLiteral: true,

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   v-component="comp"
   *
   * - dynamic:
   *   v-component="{{currentView}}"
   */

  bind: function () {
    if (!this.el.__vue__) {
      // create a ref anchor
      this.ref = document.createComment('v-component')
      _.replace(this.el, this.ref)
      // check keep-alive options.
      // If yes, instead of destroying the active vm when
      // hiding (v-if) or switching (dynamic literal) it,
      // we simply remove it from the DOM and save it in a
      // cache object, with its constructor id as the key.
      this.keepAlive = this._checkParam('keep-alive') != null
      if (this.keepAlive) {
        this.cache = {}
      }
      // compile parent scope content
      this.parentLinkFn = compile(
        this.el, this.vm.$options,
        true, // partial
        true  // asParent
      )
      // if static, build right now.
      if (!this._isDynamicLiteral) {
        this.resolveCtor(this.expression)
        this.childVM = this.build()
        this.childVM.$before(this.ref)
      } else {
        // check dynamic component params
        this.readyEvent = this._checkParam('wait-for')
        this.transMode = this._checkParam('transition-mode')
      }
    } else {
      _.warn(
        'v-component="' + this.expression + '" cannot be ' +
        'used on an already mounted instance.'
      )
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   */

  resolveCtor: function (id) {
    this.ctorId = id
    this.Ctor = this.vm.$options.components[id]
    _.assertAsset(this.Ctor, 'component', id)
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @return {Vue} - the created instance
   */

  build: function () {
    if (this.keepAlive) {
      var cached = this.cache[this.ctorId]
      if (cached) {
        return cached
      }
    }
    var vm = this.vm
    var el = templateParser.clone(this.el)
    if (this.Ctor) {
      var parentUnlinkFn
      if (this.parentLinkFn) {
        parentUnlinkFn = this.parentLinkFn(vm, el)
      }
      var child = vm.$addChild({
        el: el
      }, this.Ctor)
      child._parentUnlinkFn = parentUnlinkFn
      if (this.keepAlive) {
        this.cache[this.ctorId] = child
      }
      return child
    }
  },

  /**
   * Teardown the active vm.
   * If keep alive, simply remove it; otherwise destroy it.
   *
   * @param {Boolean} remove
   * @param {Function} cb
   */

  unbuild: function (remove, cb) {
    var child = this.childVM
    if (!child) {
      if (cb) cb()
      return
    }
    if (this.keepAlive) {
      if (remove) {
        child.$remove(cb)
      }
    } else {
      if (child._parentUnlinkFn) {
        child._parentUnlinkFn()
      }
      child.$destroy(remove, cb)
    }
  },

  /**
   * Update callback for the dynamic literal scenario,
   * e.g. v-component="{{view}}"
   */

  update: function (value) {
    if (!value) {
      this.unbuild(true)
      this.childVM = null
    } else {
      this.resolveCtor(value)
      var child = this.build()
      var self = this
      if (this.readyEvent) {
        child.$once(this.readyEvent, function () {
          self.swapTo(child)
        })
      } else {
        this.swapTo(child)
      }
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} child - target to swap to
   */

  swapTo: function (child) {
    var self = this
    switch (self.transMode) {
      case 'in-out':
        child.$before(self.ref, function () {
          self.unbuild(true)
          self.childVM = child
        })
        break
      case 'out-in':
        self.unbuild(true, function () {
          child.$before(self.ref)
          self.childVM = child
        })
        break
      default:
        self.unbuild(true)
        child.$before(self.ref)
        self.childVM = child
    }
  },

  /**
   * Unbind.
   * Make sure keepAlive is set to false so that the
   * instance is always destroyed.
   */

  unbind: function () {
    this.keepAlive = false
    this.unbuild()
    // destroy all cached instances
    if (this.cache) {
      for (var key in this.cache) {
        var child = this.cache[key]
        if (child._parentUnlinkFn) {
          child._parentUnlinkFn()
        }
        child.$destroy()
      }
      this.cache = null
    }
  }

}