var Vue = require('../../../../src/vue')

describe('Instance Scope', function () {

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

  describe('computed', function () {
    
    var Test = Vue.extend({
      computed: {
        c: function () {
          expect(this).toBe(vm)
          return this.a + this.b
        },
        d: {
          get: function () {
            expect(this).toBe(vm)
            return this.a + this.b
          },
          set: function (newVal) {
            expect(this).toBe(vm)
            var vals = newVal.split(' ')
            this.a = vals[0]
            this.b = vals[1]
          }
        }
      }
    })

    var vm = new Test({
      data: {
        a: 'a',
        b: 'b'
      }
    })

    it('get', function () {
      expect(vm.c).toBe('ab')
      expect(vm.d).toBe('ab')
    })

    it('set', function () {
      vm.c = 123 // should do nothing
      vm.d = 'c d'
      expect(vm.a).toBe('c')
      expect(vm.b).toBe('d')
      expect(vm.c).toBe('cd')
      expect(vm.d).toBe('cd')
    })

    it('inherit', function () {
      var child = vm.$addChild({
        inherit: true
      })
      expect(child.c).toBe('cd')

      child.d = 'e f'
      expect(vm.a).toBe('e')
      expect(vm.b).toBe('f')
      expect(vm.c).toBe('ef')
      expect(vm.d).toBe('ef')
      expect(child.a).toBe('e')
      expect(child.b).toBe('f')
      expect(child.c).toBe('ef')
      expect(child.d).toBe('ef')
    })

    it('same definition object bound to different instance', function () {
      vm = new Test({
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

      var child = vm.$addChild({
        inherit: true
      })
      expect(child.test()).toBe(1)
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