var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')

describe('Instance Dependencies', function () {

  var spy, spy2
  beforeEach(function () {
    spy = jasmine.createSpy()
    spy2 = jasmine.createSpy()
    spyOn(_, 'warn')
  })

  describe('option dependencies', function () {

    it('string array', function () {
      var vm = new Vue({
        services: {
          'dep1': 123,
          'dep2': 234
        },
        dependencies: ['dep1', 'dep2']
      })
      expect(vm.$services).toBeDefined()
      expect(vm.$services.dep1).toEqual(123)
      expect(vm.$services.dep2).toEqual(234)
    })

    it('object', function () {
      var vm = new Vue({
        services: {
          'dep1': 123,
          'dep2': 234,
          'dep3': 456
        },
        dependencies: {
          dep1: null,
          dep2: function (dep2) {
            return 2 * dep2
          },
          dep3: spy
        }
      })
      expect(vm.$services).toBeDefined()
      expect(vm.$services.dep1).toEqual(123)
      expect(vm.$services.dep2).toEqual(468)
      expect(spy).toHaveBeenCalledWith(456, 'dep3')
    })

    it('transform', function () {
      var vm = new Vue({
        services: {
          'dep1': 123,
          'dep2': 234
        },
        dependencies: {
          dep1: function (dep1) {
            return 3 * dep1;
          },
          dep2: function (dep2) {
            return 2 * dep2
          }
        }
      })
      expect(vm.$services).toBeDefined()
      expect(vm.$services.dep1).toEqual(369)
      expect(vm.$services.dep2).toEqual(468)
    })

    it('incompleted services', function () {
      var vm = new Vue({
        services: {
          'dep1': 123
        },
        dependencies: ['dep1', 'dep2']
      })
      expect(_.warn).toHaveBeenCalled()
      expect(vm.$services).toBeDefined()
      expect(vm.$services.dep1).toEqual(123)
      expect(vm.$services.dep2).toBeUndefined()
    })

    it('inherit services', function () {
      var Child = Vue.extend({
          services: {
            'dep1': 123
          }
      })

      Child = Child.extend({
        dependencies: ['dep1', 'dep2']
      })

      var vm = new Child({
        services: {
          'dep2': 234
        }
      })

      expect(vm.$services).toBeDefined()
      expect(vm.$services.dep1).toEqual(123)
      expect(vm.$services.dep2).toEqual(234)
    })

    it('throw useless services', function () {
      var vm = new Vue({
        services: {
          'dep1': 123,
          'dep2': 234,
          'dep3': 456
        },
        dependencies: ['dep1', 'dep2']
      })
      expect(vm.$services).toBeDefined()
      expect(vm.$services.dep1).toEqual(123)
      expect(vm.$services.dep2).toEqual(234)
      expect(vm.$services.dep3).toBeUndefined()
    })

    if (_.inBrowser) {
      it('isolate dependencies', function () {
        var vm = new Vue({
          template: '<v-a v-ref="a"></v-a>',
          services: {
            'dep1': 123,
            'dep3': 567
          },
          components: {
            'v-a': {
              template: '<v-b v-ref="b"></v-b><div>{{$services.dep2}}</div><div>{{$services.dep1}}</div>',
              services: {
                dep2: 234
              },
              dependencies: ['dep1', 'dep2']
            },
            'v-b': {
              template: '<div>{{$services.dep2}}</div><div>{{$services.dep3}}</div>',
              dependencies: ['dep2', 'dep3']
            }
          }
        }).$mount()
        expect(vm.$.a).toBeDefined()
        expect(vm.$.a.$services).toBeDefined()
        expect(vm.$.a.$services.dep1).toEqual(123)
        expect(vm.$.a.$services.dep2).toEqual(234)
        expect(vm.$.a.$.b).toBeDefined()
        expect(vm.$.a.$.b.$services.dep2).toEqual(234)
        expect(vm.$.a.$.b.$services.dep3).toEqual(567)
        expect(vm.$.a.$.b.$services.dep1).toBeUndefined()
      })
    }
  })

})