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

  it('attached/detached hooks for transcluded components', function () {
    var spy1 = jasmine.createSpy('attached')
    var spy2 = jasmine.createSpy('detached')
    var el = document.createElement('div')
    el.innerHTML = '<div v-component="outter" v-ref="outter"><div v-component="inner"></div></div>'
    document.body.appendChild(el)

    var vm = new Vue({
      el: el,
      components: {
        outter: {
          template: '<content></content>'
        },
        inner: {
          template: 'hi',
          attached: spy1,
          detached: spy2
        }
      }
    })
    expect(spy1).toHaveBeenCalled()
    vm.$.outter.$remove()
    expect(spy2).toHaveBeenCalled()
  })

})