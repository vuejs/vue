import Vue from 'vue'

describe('Options functional', () => {
  it('should work', done => {
    const vm = new Vue({
      data: { test: 'foo' },
      template: '<div><wrap :msg="test">bar</wrap></div>',
      components: {
        wrap: {
          functional: true,
          props: ['msg'],
          render (h, props, children) {
            return h('div', null, [props.msg, ' '].concat(children))
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<div>foo bar</div>')
    vm.test = 'qux'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<div>qux bar</div>')
    }).then(done)
  })
})
