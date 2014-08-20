var _ = require('../util')
var uid = 0

module.exports = {

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
    var childId = _.attr(this.el, 'ref')
    this.childId = this.vm.$interpolate(childId)
    // setup ref node
    this.ref = document.createComment('v-repeat')
    _.replace(this.el, this.ref)
    // instance holders
    this.data = this.vms = this.oldData = this.oldVms = null
  },

  update: function (data) {
    if (!_.isArray(data)) {
      _.warn('v-repeat expects an Array or Object value.')
      return
    }
    this.oldVms = this.vms
    this.oldData = this.data
    // TODO
  },

  unbind: function () {
    
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