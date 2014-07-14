/**
 * Prototype properties on every Vue instance.
 */

module.exports = function (p) {

  /**
   * The $root recursively points to the root instance.
   *
   * @readonly
   */

  Object.defineProperty(p, '$root', {
    get: function () {
      return this.$parent
        ? this.$parent.$root
        : this
    }
  })

  /**
   * $data has a setter which does a bunch of teardown/setup work
   */

  Object.defineProperty(p, '$data', {
    get: function () {
      return this._data
    },
    set: function (newData) {
      this._initData(newData)
    }
  })

}