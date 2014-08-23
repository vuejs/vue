var _ = require('../util')
var Watcher = require('../watcher')

module.exports = {

  isLiteral: true,

  /**
   * Setup. Need to check a few possible permutations:
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
   */

  bind: function () {
    if (!this.el.__vue__) {
      // create a ref anchor
      this.ref = document.createComment('v-component')
      _.replace(this.el, this.ref)
      // check v-if conditionals
      this.checkIf()
      // check keep-alive options
      this.checkKeepAlive()
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

  /**
   * Check if v-component is being used together with v-if.
   * If yes, we created a watcher for the v-if value and
   * react to its value change in `this.ifCallback`.
   */

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

  /**
   * Callback when v-if value changes.
   * Marks the active flag.
   *
   * @param {*} value
   */

  ifCallback: function (value) {
    if (value) {
      this.active = true
      this.build()
    } else {
      this.active = false
      this.unbuild(true)
    }
  },

  /**
   * Check if the "keep-alive" flag is present.
   * If yes, instead of destroying the active vm when
   * hiding (v-if) or switching (dynamic literal) it,
   * we simply remove it from the DOM and save it in a
   * cache object, with its constructor id as the key.
   */

  checkKeepAlive: function () {
    // check keep-alive flag
    this.keepAlive = this.el.hasAttribute('keep-alive')
    if (this.keepAlive) {
      this.cache = {}
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm. If the component id is empty string, the
   * default 'Vue' constructor will be used.
   */

  resolveCtor: function (id) {
    if (id === '') {
      this.id = '__vue__'
      this.Ctor = _.Vue
    } else {
      this.id = id
      this.Ctor = this.vm._asset('components', id)
    }
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   */

  build: function () {
    if (!this.active) {
      return
    }
    if (this.keepAlive) {
      var vm = this.cache[this.id]
      if (vm) {
        this.childVM = vm
        vm.$before(this.ref)
        return
      }
    }
    if (this.Ctor && !this.childVM) {
      this.childVM = new this.Ctor({
        el: this.el.cloneNode(true),
        parent: this.vm
      })
      if (this.keepAlive) {
        this.cache[this.id] = this.childVM
      }
      this.childVM.$before(this.ref)
    }
  },

  /**
   * Teardown the active vm.
   * If keep alive, simply remove it; otherwise destroy it.
   *
   * @param {Boolean} remove
   */

  unbuild: function (remove) {
    if (!this.childVM) {
      return
    }
    if (this.keepAlive) {
      if (remove) {
        this.childVM.$remove()
      }
    } else {
      this.childVM.$destroy(remove)
    }
    this.childVM = null
  },

  /**
   * Update callback for the dynamic literal scenario,
   * e.g. v-component="{{view}}"
   */

  update: function (value) {
    this.unbuild(true)
    if (value) {
      this.resolveCtor(value)
      this.build()
    }
  },

  /**
   * Unbind.
   * Make sure keepAlive is set to false so that the
   * instance is always destroyed. Teardown v-if watcher
   * if present.
   */

  unbind: function () {
    this.keepAlive = false
    this.unbuild()
    if (this.ifWatcher) {
      this.ifWatcher.teardown()
    }
  }

}