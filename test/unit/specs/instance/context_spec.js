var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')

if (_.inBrowser) {
  describe('Instance Context', function () {

    beforeEach(function () {
      spyOn(_, 'warn')
    })

    function createGetChildContext(childContext) {
      return function () {
        var ret = {}
        for (var i = 0, l = childContext.length; i < l; ++i) {
          ret[childContext[i]] = this[childContext[i]]
        }
        return ret
      }
    }

    it('string array', function () {
      var vm = new Vue({
        template: '<v-a v-ref="a"></v-a>',
        methods: {
          f1: jasmine.createSpy(),
          f2: jasmine.createSpy()
        },
        getChildContext: createGetChildContext(['f1', 'f2']),
        components: {
          'v-a': {
            template: '<div></div>',
            context: ['f1']
          }
        }
      }).$mount()
      expect(vm.$.a.$context.f1).toEqual(vm.f1)
    })

    it('warn for incompleted child context', function () {
      var vm = new Vue({
        template: '<v-a v-ref="a"></v-a>',
        methods: {
          f1: jasmine.createSpy(),
          f2: jasmine.createSpy()
        },
        getChildContext: createGetChildContext(['f1', 'f2']),
        components: {
          'v-a': {
            template: '<div></div>',
            context: ['f1', 'f3']
          }
        }
      }).$mount()
      expect(vm.$.a.$context.f1).toBeDefined()
      expect(vm.$.a.$context.f3).toBeUndefined()
      expect(_.warn).toHaveBeenCalled()
    })

    it('merge childContext', function () {
      var spy = jasmine.createSpy()

      var vm = new Vue({
        template: '<v-a v-ref="a"></v-a>',
        mixins: [ { getChildContext: function () { return { f3: spy } } } ],
        methods: {
          f1: jasmine.createSpy(),
          f2: jasmine.createSpy()
        },
        getChildContext: createGetChildContext(['f1', 'f2']),
        components: {
          'v-a': {
            template: '<div></div>',
            context: ['f1', 'f3']
          }
        }
      }).$mount()
      expect(vm.$.a.$context.f1).toBeDefined()
      expect(vm.$.a.$context.f3).toBeDefined()
      vm.$.a.$context.f3()
      expect(spy).toHaveBeenCalled()
    })

    it('warn for non function', function () {
      var vm = new Vue({
        template: '<v-a v-ref="a"></v-a>',
        data: {
            f1: 234
        },
        getChildContext: createGetChildContext(['f1']),
        components: {
          'v-a': {
            template: '<div></div>',
            context: ['f1']
          }
        }
      }).$mount()
      expect(_.warn).toHaveBeenCalled()
      expect(vm.$.a.$context.f1).toBeUndefined()
    })

    it('no parent vm', function () {
      var vm = new Vue({
        context: ['f1', 'f2']
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('no parent childContext', function () {
      var vm = new Vue({
        template: '<v-a v-ref="a"></v-a>',
        methods: {
          f1: jasmine.createSpy()
        },
        components: {
          'v-a': {
            context: ['f1']
          }
        }
      }).$mount()
      expect(_.warn).toHaveBeenCalled()
    })


    it('not merge parent vm\'s context', function () {
      var vm = new Vue({
        template: '<v-a v-ref="a"></v-a>',
        methods: {
          f1: jasmine.createSpy(),
          f2: jasmine.createSpy()
        },
        getChildContext: createGetChildContext(['f1', 'f2']),
        components: {
          'v-a': {
            template: '<v-b v-ref="b"></v-b>',
            context: ['f1'],
            methods: {
              f1: jasmine.createSpy(),
              f3: jasmine.createSpy()
            },
            getChildContext: createGetChildContext(['f3'])
          },
          'v-b': {
            template: '<div></div>',
            context: ['f3']
          }
        }
      }).$mount()
      expect(vm.$.a.$.b.$context.f3).toEqual(vm.$.a.f3)
      expect(vm.$.a.$.b.$context.f1).toBeUndefined()
    })
  })
}
