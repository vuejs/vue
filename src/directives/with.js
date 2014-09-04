var _ = require('../util')
var Watcher = require('../watcher')

module.exports = {

  priority: 900,

  bind: function () {
    var vm = this.vm
    if (this.el !== vm.$el) {
      _.warn(
        'v-with can only be used on instance root elements.'
      )
    } else if (!vm.$parent) {
      _.warn(
        'v-with must be used on an instance with a parent.'
      )
    } else {
      var key = this.arg
      this.watcher = new Watcher(
        vm.$parent,
        this.expression,
        function (val) {
          vm.$set(key, val)
        }
      )
      // initial set
      vm.$set(key, this.watcher.value)
    }
  },

  unbind: function () {
    if (this.watcher) {
      this.watcher.teardown()
    }
  }

}