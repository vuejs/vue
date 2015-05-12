var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')

if (_.inBrowser) {
  describe('Instance Context', function () {

    var spy, spy2
    beforeEach(function () {
      spy = jasmine.createSpy()
      spy2 = jasmine.createSpy()
      spyOn(_, 'warn')
    })

    describe('option childContext', function () {

      it('string array', function () {
        var vm = new Vue({
          childContext: ['f1', 'f2'],
          methods: {
            f1: spy,
            f2: spy2
          }
        })
        var childContext = vm._getChildContext()
        expect(childContext).toBeDefined()
        expect(childContext.f1).toEqual(vm.f1)
        expect(childContext.f2).toEqual(vm.f2)
      })

      it('object', function () {
        var vm = new Vue({
          childContext: {
            f1: spy,
            f2: spy2,
            f3: 'f1'
          },
          methods: {
            f1: jasmine.createSpy(),
            f2: jasmine.createSpy()
          }
        })
        var childContext = vm._getChildContext()
        expect(childContext).toBeDefined()
        expect(spy).toHaveBeenCalledWith('f1')
        expect(spy2).toHaveBeenCalledWith('f2')
        expect(childContext.f3).toEqual(vm.f1)
      })

      it('no childContext', function () {
        var vm = new Vue()
        expect(vm._getChildContext()).toEqual(null)
      })

      it('cache', function () {
        var vm = new Vue({
          childContext: ['f1', 'f2'],
          methods: {
            f1: spy,
            f2: spy2
          }
        })
        var childContext = vm._getChildContext()
        expect(childContext).toBeDefined()
        expect(childContext).toEqual(vm._getChildContext())
      })

      it('redirect null to key name', function () {
        var vm = new Vue({
          childContext: {
            f1: null,
            f3: 'f1'
          },
          methods: {
            f1: spy
          }
        })
        var childContext = vm._getChildContext()
        expect(childContext).toBeDefined()
        expect(childContext.f3).toEqual(vm.f1)
        expect(childContext.f1).toEqual(vm.f1)
      })

      it('not merge parent vm\'s childContext', function () {
        var vm = new Vue({
          template: '<v-a v-ref="a"></v-a>',
          childContext: ['f1', 'f2'],
          methods: {
            f1: jasmine.createSpy(),
            f2: jasmine.createSpy()
          },
          components: {
            'v-a': {
              template: '<div></div>',
              childContext: ['f3', 'f4'],
              methods: {
                f1: jasmine.createSpy(),
                f3: jasmine.createSpy(),
                f4: jasmine.createSpy()
              }
            }
          }
        }).$mount()
        expect(vm.$.a).toBeDefined()
        var childContext = vm.$.a._getChildContext()
        expect(childContext).toBeDefined()
        expect(childContext.f3).toEqual(vm.$.a.f3)
        expect(childContext.f4).toEqual(vm.$.a.f4)
        expect(childContext.f1).toBeUndefined()
      })
    })

    describe('option context', function() {

      it('string array', function () {
        var vm = new Vue({
          template: '<v-a v-ref="a"></v-a>',
          childContext: ['f1', 'f2'],
          methods: {
            f1: jasmine.createSpy(),
            f2: jasmine.createSpy()
          },
          components: {
            'v-a': {
              template: '<div></div>',
              context: ['f1']
            }
          }
        }).$mount()
        expect(vm.$.a.$context.f1).toEqual(vm.f1)
      })

      it('object', function () {
        var vm = new Vue({
          template: '<v-a v-ref="a"></v-a>',
          childContext: ['f1', 'f2', 'f3'],
          methods: {
            f1: jasmine.createSpy(),
            f2: jasmine.createSpy(),
            f3: jasmine.createSpy()
          },
          components: {
            'v-a': {
              template: '<div></div>',
              context: {
                f1: spy,
                f2: function () {
                  return this.f4
                },
                f3: null
              },
              methods: {
                f4: jasmine.createSpy()
              }
            }
          }
        }).$mount()
        expect(vm.$.a.$context.f2).toEqual(vm.$.a.f4)
        expect(spy).toHaveBeenCalledWith(vm.f1, 'f1')
        expect(vm.$.a.$context.f3).toEqual(vm.f3)
      })

      it('incompleted childContext', function () {
        var vm = new Vue({
          template: '<v-a v-ref="a"></v-a>',
          childContext: ['f1', 'f2'],
          methods: {
            f1: jasmine.createSpy(),
            f2: jasmine.createSpy()
          },
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

      it('no parent vm', function () {
        var vm = new Vue({
          context: ['f1', 'f2']
        })
        expect(_.warn).toHaveBeenCalled()
      })

      it('no parent childContext', function () {
        var vm = new Vue({
          template: '<v-a v-ref="a"></v-a>',
          childContext: ['f1', 'f3'],
          methods: {
            f1: jasmine.createSpy(),
            f3: jasmine.createSpy()
          },
          components: {
            'v-a': {
              template: '<v-b v-ref="b"></v-b>',
              context: ['f1'],
              methods: {
                f1: jasmine.createSpy(),
                f3: jasmine.createSpy()
              }
            },
            'v-b': {
              template: '<div></div>',
              context: ['f3']
            }
          }
        }).$mount()
        expect(_.warn).toHaveBeenCalled()
      })


      it('not merge parent vm\'s context', function () {
        var vm = new Vue({
          template: '<v-a v-ref="a"></v-a>',
          childContext: ['f1', 'f2'],
          methods: {
            f1: jasmine.createSpy(),
            f2: jasmine.createSpy()
          },
          components: {
            'v-a': {
              template: '<v-b v-ref="b"></v-b>',
              context: ['f1'],
              childContext: ['f3'],
              methods: {
                f1: jasmine.createSpy(),
                f3: jasmine.createSpy()
              }
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
  })
}
