// test cases for edge cases & bug fixes
var Vue = require('../../../src/vue')

describe('Misc', function () {

  it('should handle directive.bind() altering its childNode structure', function () {
    var vm = new Vue({
      el: document.createElement('div'),
      template: '<div v-test>{{test}}</div>',
      data: {
        test: 'hi'
      },
      directives: {
        test: {
          bind: function () {
            this.el.insertBefore(document.createTextNode('yo '),
              this.el.firstChild)
          }
        }
      }
    })
    expect(vm.$el.textContent).toBe('yo hi')
  })

})