/**
 * Test property proxy, scope inheritance,
 * data event propagation and data sync
 */

var Vue = require('../../../../src/vue')
var Observer = require('../../../../src/observer')
Observer.pathDelimiter = '.'

describe('Scope', function () {
  
  // TODO

  describe('computed', function () {
    
    var vm = new Vue({
      data: {
        a: 'a',
        b: 'b'
      },
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
      var child = vm.$addChild()
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

      var child = vm.$addChild()
      expect(child.test()).toBe(1)
    })

  })

})