import Vue from 'vue'

describe('Global API: observable', () => {
  it('should work', done => {
    const state = Vue.observable({
      count: 0
    })

    const app = new Vue({
      render(h) {
        return h('div', [
          h('span', state.count),
          h('button', {
            on: {
              click: () => {
                state.count++
              }
            }
          }, '+')
        ])
      }
    }).$mount()

    expect(app.$el.querySelector('span').textContent).toBe('0')
    app.$el.querySelector('button').click()
    waitForUpdate(() => {
      expect(app.$el.querySelector('span').textContent).toBe('1')
    }).then(done)
  })
})
