export default {
  bind () {
    var el = this.el
    this.vm.$once('hook:compiled', function () {
      el.removeAttribute('v-cloak')
    })
  }
}
