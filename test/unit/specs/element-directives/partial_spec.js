var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')
var compiler = require('../../../../src/compiler')

describe('Partial', function () {

  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('static', function (done) {
    var vm = new Vue({
      el: el,
      template: '<partial name="yo"></partial>',
      data: {
        msg: 'hello'
      },
      partials: {
        yo: '{{msg}}'
      }
    })
    expect(el.textContent).toBe('hello')
    vm.msg = 'what'
    _.nextTick(function () {
      expect(el.textContent).toBe('what')
      done()
    })
  })

  it('dynamic', function (done) {
    var vm = new Vue({
      el: el,
      template: '<partial name="test-{{id}}"></partial>',
      data: {
        id: 'a'
      },
      partials: {
        'test-a': 'a {{id}}',
        'test-b': 'b {{id}}'
      }
    })
    expect(el.textContent).toBe('a a')
    vm.id = 'b'
    _.nextTick(function () {
      expect(el.textContent).toBe('b b')
      done()
    })
  })

  it('caching', function () {
    var calls = 0
    var compile = compiler.compile
    compiler.compile = function () {
      calls++
      return compile.apply(this, arguments)
    }
    new Vue({
      el: el,
      template:
        '<partial name="cache-test"></partial> ' +
        '<partial name="cache-test"></partial>',
      data: {
        msg: 'hi'
      },
      partials: {
        'cache-test': 'cache-test {{msg}}'
      }
    })
    expect(el.textContent).toBe('cache-test hi cache-test hi')
    // one call for instance, and one for partial
    expect(calls).toBe(2)
    // cleanup
    compiler.compile = compile
  })

  it('teardown', function () {
    var vm = new Vue({
      el: el,
      template: '<partial name="test-{{id}}"></partial>',
      data: {
        id: 'a'
      },
      partials: {
        'test-a': 'a {{id}}'
      }
    })
    expect(vm._directives.length).toBe(2)
    expect(vm._directives[1].name).toBe('partial')
    expect(vm._watchers.length).toBe(2)
    vm._directives[1]._teardown()
    // the text-directive should've been removed.
    expect(vm._directives.length).toBe(1)
    expect(vm._directives[0].name).toBe('partial')
    expect(vm._watchers.length).toBe(0)
  })

})
