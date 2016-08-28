var Vue = require('src')
var _ = require('src/util')

describe('Instance state initialization', function () {
  it('should warn data functions that do not return an object', function () {
    new Vue({
      data: function () {}
    })
    expect('should return an object').toHaveBeenWarned()
  })

  it('should initialize data once per strat', function () {
    var spyOncePerStrat = jasmine.createSpy('called once per strat')
    var Comp = Vue.extend({
      data: function () {
        spyOncePerStrat()
        return {
          result: 'false'
        }
      }
    })
    new Comp({
      data: function () {
        spyOncePerStrat()
        return {
          result: 'true'
        }
      }
    })
    expect(spyOncePerStrat.calls.count()).toBe(2)
  })

  describe('data proxy', function () {
    var data = {
      a: 0,
      b: 0
    }
    var vm = new Vue({
      data: data
    })

    it('initial', function () {
      expect(vm.a).toBe(data.a)
      expect(vm.b).toBe(data.b)
    })

    it('vm => data', function () {
      vm.a = 1
      expect(data.a).toBe(1)
      expect(vm.a).toBe(data.a)
    })

    it('data => vm', function () {
      data.b = 2
      expect(vm.b).toBe(2)
      expect(vm.b).toBe(data.b)
    })
  })

  describe('$data', function () {
    it('should initialize props', function () {
      var vm = new Vue({
        el: document.createElement('div'),
        props: ['c']
      })
      expect(_.hasOwn(vm, 'c')).toBe(true)
    })

    it('external prop should overwrite default value', function () {
      var el = document.createElement('div')
      el.setAttribute('v-bind:c', '2')
      el.textContent = '{{c}}'
      var vm = new Vue({
        el: el,
        props: ['c'],
        data: {
          c: 1
        }
      })
      expect(vm.c).toBe(2)
      expect(el.textContent).toBe('2')
    })

    it('props should be available in data() and create()', function () {
      var el = document.createElement('div')
      el.setAttribute(':c', '2')
      var vm = new Vue({
        el: el,
        props: ['c'],
        data: function () {
          expect(this.c).toBe(2)
          return {
            d: this.c + 1
          }
        },
        created: function () {
          expect(this.c).toBe(2)
        }
      })
      expect(vm.d).toBe(3)
    })

    it('replace $data', function () {
      var vm = new Vue({
        data: {
          a: 1
        }
      })
      vm.$data = { b: 2 }
      // proxy new key
      expect(vm.b).toBe(2)
      // unproxy old key that's no longer present
      expect(_.hasOwn(vm, 'a')).toBe(false)
    })
  })

  describe('computed', function () {
    var spyE = jasmine.createSpy('computed e')
    var spyF = jasmine.createSpy('cached computed f')
    var spyCachedWatcher = jasmine.createSpy('cached computed watcher')

    var Test = Vue.extend({
      computed: {
        // uncached
        c: {
          cache: false,
          get: function () {
            return this.a + this.b
          }
        },
        // with setter
        d: {
          get: function () {
            return this.a + this.b
          },
          set: function (newVal) {
            var vals = newVal.split(' ')
            this.a = vals[0]
            this.b = vals[1]
          }
        },
        // chained computed
        e: function () {
          return this.c + 'e'
        },
        // cached
        f: {
          get: function () {
            spyF()
            return this.ff
          }
        },
        // chained cached
        g: function () {
          return this.f + 1
        },
        // another cached, for watcher test
        h: {
          get: function () {
            return this.hh
          }
        }
      }
    })

    var vm = new Test({
      data: {
        a: 'a',
        b: 'b',
        ff: 0,
        hh: 0
      },
      watch: {
        e: spyE,
        h: spyCachedWatcher
      }
    })

    it('get', function () {
      expect(vm.c).toBe('ab')
      expect(vm.d).toBe('ab')
      expect(vm.e).toBe('abe')
    })

    it('set', function (done) {
      vm.c = 123 // should do nothing
      vm.d = 'c d'
      expect(vm.a).toBe('c')
      expect(vm.b).toBe('d')
      expect(vm.c).toBe('cd')
      expect(vm.d).toBe('cd')
      expect(vm.e).toBe('cde')
      Vue.nextTick(function () {
        expect(spyE).toHaveBeenCalledWith('cde', 'abe')
        done()
      })
    })

    it('cached computed', function () {
      expect(spyF).not.toHaveBeenCalled()
      var f = vm.f
      var g = vm.g
      expect(spyF.calls.count()).toBe(1)
      expect(f).toBe(0)
      expect(g).toBe(1)
      // get again
      f = vm.f
      g = vm.g
      // should not be evaluated again
      expect(spyF.calls.count()).toBe(1)
      expect(f).toBe(0)
      expect(g).toBe(1)
      // update dep
      vm.ff = 1
      f = vm.f
      g = vm.g
      expect(spyF.calls.count()).toBe(2)
      expect(f).toBe(1)
      expect(g).toBe(2)
    })

    it('watching cached computed', function (done) {
      expect(spyCachedWatcher).not.toHaveBeenCalled()
      vm.hh = 2
      Vue.nextTick(function () {
        expect(spyCachedWatcher).toHaveBeenCalledWith(2, 0)
        done()
      })
    })

    it('same definition object bound to different instance', function () {
      var vm = new Test({
        data: {
          a: 'A',
          b: 'B'
        }
      })
      expect(vm.c).toBe('AB')
      expect(vm.d).toBe('AB')
      vm.d = 'C D'
      expect(vm.a).toBe('C')
      expect(vm.b).toBe('D')
      expect(vm.c).toBe('CD')
      expect(vm.d).toBe('CD')
      expect(vm.e).toBe('CDe')
    })
  })

  describe('methods', function () {
    it('should work and have correct context', function () {
      var vm = new Vue({
        data: {
          a: 1
        },
        methods: {
          test: function () {
            expect(this instanceof Vue).toBe(true)
            return this.a
          }
        }
      })
      expect(vm.test()).toBe(1)
    })
  })

  describe('meta', function () {
    var vm = new Vue({
      _meta: {
        $index: 0,
        $value: 'test'
      }
    })

    it('should define metas only on vm', function () {
      expect(vm.$index).toBe(0)
      expect(vm.$value).toBe('test')
      expect('$index' in vm.$data).toBe(false)
      expect('$value' in vm.$data).toBe(false)
    })
  })
})
