import Vue from 'vue'

describe('Options renderError', () => {
  it('should be used on render errors', done => {
    Vue.config.errorHandler = () => {}
    const vm = new Vue({
      data: {
        ok: true
      },
      render (h) {
        if (this.ok) {
          return h('div', 'ok')
        } else {
          throw new Error('no')
        }
      },
      renderError (h, err) {
        return h('div', err.toString())
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('ok')
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('Error: no')
      Vue.config.errorHandler = null
    }).then(done)
  })
})
