var _ = require('../util')
var textParser = require('../parse/text')
var expParser = require('../parse/expression')
var templateParser = require('../parse/template')
var uid = 0

module.exports = {

  /**
   * Setup.
   */

  bind: function () {
    // uid as a cache identifier
    this.id = '__v_repeat_' + (++uid)
    // put in the default filter to guard Object values
    // this filter needs to always be the first one. We
    // can do this in bind because the watcher is not
    // created yet.
    if (!this.filters) {
      this.filters = []
    }
    this.filters.unshift({ name: '_objToArray' })
    // check other directives that need to be handled
    // at v-repeat level
    this.checkIf()
    this.checkRef()
    this.checkComponent()
    // setup ref node
    this.ref = document.createComment('v-repeat')
    _.replace(this.el, this.ref)
    // check if this is a block repeat
    if (this.el.tagName === 'TEMPLATE') {
      this.el = templateParser.parse(this.el)
    }
    // instance holders
    this.data = this.vms = this.oldData = this.oldVms = null
  },

  /**
   * Warn against v-if usage.
   */

  checkIf: function () {
    if (_.attr(this.el, 'if') !== null) {
      _.warn(
        'Don\'t use v-if with v-repeat. ' +
        'Use v-show or the "filterBy" filter instead.'
      )
    }
  },

  /**
   * Check if v-ref is also present. If yes, evaluate it and
   * locate the first non-anonymous parent as the owner vm.
   */

  checkRef: function () {
    var childId = _.attr(this.el, 'ref')
    this.childId = childId
      ? this.vm.$interpolate(childId)
      : null
    if (this.childId) {
      var owner = this.vm.$parent
      while (owner._isAnonymous) {
        owner = owner.$parent
      }
      this.owner = owner
    }
  },

  /**
   * Check the component constructor to use for repeated
   * instances. If static we resolve it now, otherwise it
   * needs to be resolved at build time with actual data.
   */

  checkComponent: function () {
    var id = _.attr(this.el, 'component')
    if (!id) {
      this.Ctor = _.Vue // default constructor
    } else {
      var tokens = textParser.parse(id)
      if (!tokens.length) { // static component
        this.Ctor = this.vm.$options.components[id]
        if (!this.Ctor) {
          _.warn('Failed to resolve component: ' + id)
          this.Ctor = _.Vue
        }
      } else if (tokens.length === 1) {
        // to be resolved later
        this.CtorExp = tokens[0].value
      } else {
        _.warn(
          'Invalid attribute binding: "' +
           'component="' + id + '"' +
          '\nDon\'t mix binding tags with plain text ' +
          'in attribute bindings.'
        )
      }
    }
  },

  /**
   * Update.
   * This is called whenever the Array mutates.
   *
   * @param {Array} data
   */

  update: function (data) {
    if (data && !_.isArray(data)) {
      _.warn(
        'Invalid value for v-repeat:' + data +
        '\nExpects Object or Array.'
      )
      return
    }
    // converted = true means the Array was converted
    // from an Object
    this.converted = data._converted
    this.oldVms = this.vms
    this.oldData = this.data
    this.data = data || []
    this.vms = this.oldData
      ? this.diff()
      : this.init()
    // update v-ref
    if (this.childId) {
      this.owner.$[this.childId] = this.vms
    }
  },

  /**
   * Only called on initial update, build up the first
   * batch of instances.
   */

  init: function () {
    var data = this.data
    var i = 0
    var l = data.length
    var vms = new Array(l)
    var vm
    for (; i < l; i++) {
      vm = this.build(data[i], i)
      vms[i] = vm
      vm.$before(this.ref)
    }
    return vms
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   */

  diff: function () {
    // TODO
    console.log('diffing...')
  },

  /**
   * Build a new instance and cache it.
   *
   * @param {Object} data
   * @param {Number} index
   */

  build: function (data, index) {
    var original = data
    var raw = this.converted
      ? data.value
      : data
    var isObject = raw && typeof raw === 'object'
    var hasAlias = !isObject || this.arg
    // wrap the raw data with alias
    data = hasAlias ? {} : raw
    // resolve constructor
    var Ctor = this.Ctor || this.resolveCtor(data)
    var vm = new Ctor({
      el: this.el.cloneNode(true),
      data: data,
      parent: this.vm
    })
    // define alias
    if (hasAlias) {
      var alias = this.arg || '$value'
      vm.$add(alias, raw)
    }
    // define key
    if (this.converted) {
      vm.$add('$key', original.key)
    }
    // define index
    vm.$add('$index', index)
    // cache instance
    if (isObject) {
      this.cacheInstance(raw, vm)
    }
    return vm
  },

  /**
   * Resolve a contructor to use for an instance.
   * The tricky part here is that there could be dynamic
   * components depending on instance data.
   *
   * @param {Object} data
   * @return {Function}
   */

  resolveCtor: function (data) {
    var getter = expParser.parse(this.CtorExp).get
    var context = Object.create(this.vm.$scope)
    _.extend(context, data)
    var id = getter(context)
    var Ctor = this.vm.$options.components[id]
    if (!Ctor) {
      _.warn('Failed to resolve component: ' + id)
    }
    return Ctor
  },

  /**
   * Unbind, teardown everything
   */

  unbind: function () {
    if (this.childId) {
      delete this.owner.$[this.childId]
    }
    if (this.vms) {
      var i = this.vms.length
      var vm
      while (i--) {
        vm = this.vms[i]
        this.deleteInstance(vm.$value)
        vm.$destroy()
      }
    }
  },

  /**
   * Save a vm's reference on a data object as a hidden
   * property. This mimics a Map that allows us to determine
   * a data object's owner instance during the diff phase.
   *
   * @param {Object} data
   * @param {Vue} vm
   */

  cacheInstance: function (data, vm) {
    if (data[this.id] !== undefined) {
      data[this.id] = vm
    } else {
      _.define(data, this.id, vm)
    }
  },

  /**
   * Try to get a cached instance from a piece of data.
   *
   * @param {Object} data
   * @return {Vue|undefined}
   */

  getInstance: function (data) {
    return data[this.id]
  },

  /**
   * Delete the saved reference on a data object.
   * This assumes the data already has a vm cached on it.
   *
   * @param {Object} data
   */

  deleteInstance: function (data) {
    data[this.id] = null
  }

}