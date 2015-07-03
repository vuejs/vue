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
    el.innerHTML = '<outer v-ref="outter"><inner></inner></outer>'
    document.body.appendChild(el)

    var vm = new Vue({
      el: el,
      components: {
        outer: {
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

  it('v-repeat on component root node with replace:true', function () {
    var el = document.createElement('div')
    var vm = new Vue({
      el: el,
      template: '<test></test>',
      components: {
        test: {
          data: function () {
            return { list: [1, 2, 3] }
          },
          template: '<div v-repeat="list">{{$value}}</div>',
          replace: true
        }
      }
    })
    expect(vm.$el.innerHTML).toBe('<div>1</div><div>2</div><div>3</div>')
  })

  // #922
  it('template repeat inside svg', function () {
    var el = document.createElement('div')
    new Vue({
      el: el,
      template: '<svg><template v-repeat="list"><text>{{$value}}</text></template></svg>',
      data: {
        list: [1, 2, 3]
      }
    })
    // IE inlines svg namespace
    var xmlns = /\s?xmlns=".*svg"/
    expect(el.innerHTML.replace(xmlns, '')).toBe('<svg><text>1</text><text>2</text><text>3</text></svg>')
  })

  // #1005
  it('call attach/ready/detach hook for child components', function () {
    Vue.options.replace = true
    var el = document.createElement('div')
    var logs = []
    function log (n) {
      return function () {
        logs.push(n)
      }
    }
    document.body.appendChild(el)
    var vm = new Vue({
      el: el,
      attached: log(0),
      ready: log(1),
      detached: log(2),
      template: '<div><test></test><test></test></div>',
      components: {
        test: {
          template: '<span>hi</span>',
          attached: log(3),
          ready: log(4),
          detached: log(5)
        }
      }
    })
    expect(vm.$el.innerHTML).toBe('<span>hi</span><span>hi</span>')
    expect(logs.join()).toBe('0,3,4,3,4,1')
    logs = []
    vm.$destroy(true)
    expect(logs.join()).toBe('2,5,5')
    Vue.options.replace = false
  })

})
