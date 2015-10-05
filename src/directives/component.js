var _ = require('../util')
var config = require('../config')
var templateParser = require('../parsers/template')

module.exports = {

  isLiteral: true,
  priority: 1500,

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
      // check keep-alive options.
      // If yes, instead of destroying the active vm when
      // hiding (v-if) or switching (dynamic literal) it,
      // we simply remove it from the DOM and save it in a
      // cache object, with its constructor id as the key.
      this.keepAlive = this.param('keep-alive') != null
      // wait for event before insertion
      this.waitForEvent = this.param('wait-for')

      if (process.env.NODE_ENV !== 'production') {
        if (this.waitForEvent) {
          _.deprecation.WAIT_FOR()
        }
      }

      // check ref
      // TODO: only check ref in 1.0.0
      var ref = this.param(config.prefix + 'ref')
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && ref) {
        _.deprecation.V_REF()
      }
      this.ref = ref || _.findRef(this.el)
      var refs = (this._scope || this.vm).$
      if (this.ref && !refs.hasOwnProperty(this.ref)) {
        _.defineReactive(refs, this.ref, null)
      }

      if (this.keepAlive) {
        this.cache = {}
      }
      // check inline-template
      if (this.param('inline-template') !== null) {
        // extract inline template as a DocumentFragment
        this.inlineTemplate = _.extractContent(this.el, true)
      }
      // component resolution related state
      this.pendingComponentCb =
      this.Component = null
      // transition related state
      this.pendingRemovals = 0
      this.pendingRemovalCb = null
      // if static, build right now.
      if (!this._isDynamicLiteral) {
        this.resolveComponent(this.expression, _.bind(this.initStatic, this))
      } else {
        // check dynamic component params
        // create a ref anchor
        this.anchor = _.createAnchor('v-component')
        _.replace(this.el, this.anchor)
        this.transMode = this.param('transition-mode')
      }
    } else {
      process.env.NODE_ENV !== 'production' && _.warn(
        'cannot mount component "' + this.expression + '" ' +
        'on already mounted element: ' + this.el
      )
    }
  },

  /**
   * Initialize a static component.
   */

  initStatic: function () {
    // wait-for
    var anchor = this.el
    var options
    var waitFor = this.waitForEvent
    var activateHook = this.Component.options.activate
    if (waitFor) {
      options = {
        created: function () {
          this.$once(waitFor, insert)
        }
      }
    }
    var child = this.childVM = this.build(options)
    if (!this.waitForEvent) {
      if (activateHook) {
        activateHook.call(child, insert)
      } else {
        child.$before(anchor)
        _.remove(anchor)
      }
    }
    function insert () {
      // TODO: no need to fallback to this in 1.0.0
      // once wait-for is removed
      (child || this).$before(anchor)
      _.remove(anchor)
    }
  },

  /**
   * Public update, called by the watcher in the dynamic
   * literal scenario, e.g. v-component="{{view}}"
   */

  update: function (value) {
    this.setComponent(value)
  },

  /**
   * Switch dynamic components. May resolve the component
   * asynchronously, and perform transition based on
   * specified transition mode. Accepts a few additional
   * arguments specifically for vue-router.
   *
   * The callback is called when the full transition is
   * finished.
   *
   * @param {String} value
   * @param {Function} [cb]
   */

  setComponent: function (value, cb) {
    this.invalidatePending()
    if (!value) {
      // just remove current
      this.unbuild(true)
      this.remove(this.childVM, cb)
      this.childVM = null
    } else {
      this.resolveComponent(value, _.bind(function () {
        this.unbuild(true)
        var options
        var self = this
        var waitFor = this.waitForEvent
        var activateHook = this.Component.options.activate
        if (waitFor) {
          options = {
            created: function () {
              this.$once(waitFor, insert)
            }
          }
        }
        var cached = this.getCached()
        var newComponent = this.build(options)
        if ((!waitFor && !activateHook) || cached) {
          this.transition(newComponent, cb)
        } else {
          this.waitingFor = newComponent
          if (activateHook) {
            activateHook.call(newComponent, insert)
          }
        }

        function insert () {
          self.waitingFor = null
          // TODO: no need to fallback to this in 1.0.0
          // once wait-for is removed
          self.transition((newComponent || this), cb)
        }
      }, this))
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   */

  resolveComponent: function (id, cb) {
    var self = this
    this.pendingComponentCb = _.cancellable(function (Component) {
      self.Component = Component
      cb()
    })
    this.vm._resolveComponent(id, this.pendingComponentCb)
  },

  /**
   * When the component changes or unbinds before an async
   * constructor is resolved, we need to invalidate its
   * pending callback.
   */

  invalidatePending: function () {
    if (this.pendingComponentCb) {
      this.pendingComponentCb.cancel()
      this.pendingComponentCb = null
    }
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @param {Object} [extraOptions]
   * @return {Vue} - the created instance
   */

  build: function (extraOptions) {
    var cached = this.getCached()
    if (cached) {
      return cached
    }
    if (this.Component) {
      // default options
      var options = {
        el: templateParser.clone(this.el),
        template: this.inlineTemplate,
        // if no inline-template, then the compiled
        // linker can be cached for better performance.
        _linkerCachable: !this.inlineTemplate,
        _ref: this.ref,
        _asComponent: true,
        _isRouterView: this._isRouterView,
        // if this is a transcluded component, context
        // will be the common parent vm of this instance
        // and its host.
        _context: this.vm,
        // if this is inside an inline v-repeat, the scope
        // will be the intermediate scope created for this
        // repeat fragment. this is used for linking props
        // and container directives.
        _scope: this._scope,
        // pass in the owner fragment of this component.
        // this is necessary so that the fragment can keep
        // track of its contained components in order to
        // call attach/detach hooks for them.
        _frag: this._frag
      }
      // extra options
      if (extraOptions) {
        _.extend(options, extraOptions)
      }
      var parent = this._host || this.vm
      var child = parent._addChild(options, this.Component)
      if (this.keepAlive) {
        this.cache[this.Component.cid] = child
      }
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' &&
          this.el.hasAttribute('transition') &&
          child._isFragment) {
        _.warn(
          'Transitions will not work on a fragment instance. ' +
          'Template: ' + child.$options.template
        )
      }
      return child
    }
  },

  /**
   * Try to get a cached instance of the current component.
   *
   * @return {Vue|undefined}
   */

  getCached: function () {
    return this.keepAlive && this.cache[this.Component.cid]
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   *
   * @param {Boolean} defer
   */

  unbuild: function (defer) {
    if (this.waitingFor) {
      this.waitingFor.$destroy()
      this.waitingFor = null
    }
    var child = this.childVM
    if (!child || this.keepAlive) {
      return
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, defer)
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function (child, cb) {
    var keepAlive = this.keepAlive
    if (child) {
      // we may have a component switch when a previous
      // component is still being transitioned out.
      // we want to trigger only one lastest insertion cb
      // when the existing transition finishes. (#1119)
      this.pendingRemovals++
      this.pendingRemovalCb = cb
      var self = this
      child.$remove(function () {
        self.pendingRemovals--
        if (!keepAlive) child._cleanup()
        if (!self.pendingRemovals && self.pendingRemovalCb) {
          self.pendingRemovalCb()
          self.pendingRemovalCb = null
        }
      })
    } else if (cb) {
      cb()
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   * @param {Function} [cb]
   */

  transition: function (target, cb) {
    var self = this
    var current = this.childVM
    this.childVM = target
    switch (self.transMode) {
      case 'in-out':
        target.$before(self.anchor, function () {
          self.remove(current, cb)
        })
        break
      case 'out-in':
        self.remove(current, function () {
          target.$before(self.anchor, cb)
        })
        break
      default:
        self.remove(current)
        target.$before(self.anchor, cb)
    }
  },

  /**
   * Unbind.
   */

  unbind: function () {
    this.invalidatePending()
    // Do not defer cleanup when unbinding
    this.unbuild()
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy()
      }
      this.cache = null
    }
  }
}
