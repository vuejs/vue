var _ = require('../util')
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
    this.filters.unshift('_objectToArray')
    // check v-ref
    this.checkRef()
    // setup ref node
    this.ref = document.createComment('v-repeat')
    _.replace(this.el, this.ref)
    // instance holders
    this.data = this.vms = this.oldData = this.oldVms = null
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
    
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   */

  diff: function () {
    
  },

  /**
   * Build a new instance and cache it.
   *
   * @param {Object} data
   */

  build: function (data) {
    // TODO: resolve constructor dynamically based on
    // passed in data. may need to modify vm.$interpolate
    // also, vm.$value should always point to the actual
    // data in the user Array/Object.
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