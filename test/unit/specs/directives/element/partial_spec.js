var Vue = require('src')
var _ = require('src/util')
var compiler = require('src/compiler')

describe('Partial', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('static', function (done) {
    var vm = new Vue({
      el: el,
      template: '<partial name="p"></partial>',
      data: {
        msg: 'foo'
      },
      partials: {
        p: '{{msg}}'
      }
    })
    expect(el.textContent).toBe('foo')
    vm.msg = 'bar'
    _.nextTick(function () {
      expect(el.textContent).toBe('bar')
      done()
    })
  })

  it('dynamic', function (done) {
    var vm = new Vue({
      el: el,
      template: '<partial :name="\'test-\' + id"></partial>',
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

  it('dynamic inside v-for', function () {
    new Vue({
      el: el,
      template: '<div v-for="id in list"><partial v-bind:name="\'test-\' + id"></partial></div>',
      data: {
        list: ['foo', 'bar']
      },
      partials: {
        'test-foo': 'foo {{id}}',
        'test-bar': 'bar {{id}}'
      }
    })
    expect(el.textContent).toBe('foo foobar bar')
  })

  it('caching', function () {
    var calls = 0
    var compile = compiler.compile
    compiler.compile = function () {
      calls++
      return compile.apply(this, arguments)
    }
    // Note: caching only works on components, not native Vue
    var Comp = Vue.extend({
      template:
        '<partial name="cache-test"></partial> ' +
        '<partial name="cache-test"></partial>',
      partials: {
        'cache-test': 'foo {{msg}}'
      }
    })
    new Comp({
      el: el,
      data: {
        msg: 'bar'
      }
    })
    expect(el.textContent).toBe('foo bar foo bar')
    // one call for instance, and one for partial
    expect(calls).toBe(2)
    // cleanup
    compiler.compile = compile
  })

  it('teardown', function () {
    var vm = new Vue({
      el: el,
      template: '<partial :name="\'test-\' + id"></partial>',
      data: {
        id: 'a'
      },
      partials: {
        'test-a': 'a {{id}}'
      }
    })
    expect(vm._directives.length).toBe(2)
    expect(vm._watchers.length).toBe(2)
    var partialDir
    vm._directives.some(function (d) {
      if (d.name === 'partial') {
        partialDir = d
        return true
      }
    })
    partialDir._teardown()
    // the text-directive should've been removed.
    expect(vm._directives.length).toBe(1)
    expect(vm._directives[0].name).toBe('partial')
    expect(vm._watchers.length).toBe(0)
  })
})
