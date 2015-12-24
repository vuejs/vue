export default {
  bind () {
    var el = this.el
    this.vm.$once('pre-hook:compiled', function () {
      el.removeAttribute('v-cloak')
    })
  }
}
