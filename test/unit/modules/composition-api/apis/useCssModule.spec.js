const Vue = require('vue/dist/vue.common.js')
const { useCssModule } = require('../../src')

const style = { whateverStyle: 'whateverStyle' }

function injectStyles() {
  Object.defineProperty(this, '$style', {
    configurable: true,
    get: function () {
      return style
    },
  })
}

describe('api/useCssModule', () => {
  it('should get the same object', (done) => {
    const vm = new Vue({
      beforeCreate() {
        injectStyles.call(this)
      },
      template: '<div>{{style}}</div>',
      setup() {
        const style = useCssModule()
        return { style }
      },
    })
    vm.$mount()
    expect(vm.style).toBe(style)
    done()
  })
})
