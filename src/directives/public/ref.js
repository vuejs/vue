if (process.env.NODE_ENV !== 'production') {
  module.exports = {
    bind: function () {
      require('../../util').warn(
        'v-ref:' + this.arg + ' must be used on a child ' +
        'component. Found on <' + this.el.tagName.toLowerCase() + '>.'
      )
    }
  }
}
