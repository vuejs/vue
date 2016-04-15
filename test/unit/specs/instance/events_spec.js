var Vue = require('src')
var _ = require('src/util')

describe('Instance Events', function () {
  var spy, spy2
  beforeEach(function () {
    spy = jasmine.createSpy()
    spy2 = jasmine.createSpy()
  })

  describe('option events', function () {
    it('normal events', function () {
      var vm = new Vue({
        events: {
          test: spy,
          test2: [spy, spy]
        }
      })
      vm.$emit('test', 123)
      expect(spy).toHaveBeenCalledWith(123)
      vm.$emit('test2')
      expect(spy.calls.count()).toBe(3)
    })

    it('hook events', function () {
      new Vue({
        events: {
          'hook:created': spy
        }
      })
      expect(spy).toHaveBeenCalled()
    })

    it('method name strings', function () {
      var vm = new Vue({
        events: {
          test: 'doSomething',
          test2: 'doSomethingElse'
        },
        methods: {
          doSomething: spy
        }
      })
      vm.$emit('test', 123)
      expect(spy).toHaveBeenCalledWith(123)
      vm.$emit('test2')
      expect('Unknown method').toHaveBeenWarned()
    })
  })

  describe('option watchers', function () {
    it('normal', function (done) {
      var spyA = jasmine.createSpy()
      var spyB = jasmine.createSpy()
      var count = 0
      var a = {
        b: { c: 1 }
      }
      var vm = new Vue({
        watch: {
          'a.b.c': spyA,
          'b + c': spyB,
          a: {
            deep: true,
            immediate: true,
            handler: 'test'
          }
        },
        data: {
          a: a,
          b: 1,
          c: 2
        },
        methods: {
          test: function (val) {
            count++
            expect(val).toBe(a)
          }
        }
      })
      vm.a.b.c = 2
      vm.b = 3
      vm.c = 4
      expect(count).toBe(1)
      _.nextTick(function () {
        expect(spyA).toHaveBeenCalledWith(2, 1)
        expect(spyB).toHaveBeenCalledWith(7, 3)
        expect(count).toBe(2)
        done()
      })
    })

    it('method name strings', function (done) {
      var spy = jasmine.createSpy()
      var vm = new Vue({
        watch: {
          'a': 'test'
        },
        data: {
          a: 1
        },
        methods: {
          test: spy
        }
      })
      vm.a = 2
      _.nextTick(function () {
        expect(spy).toHaveBeenCalledWith(2, 1)
        done()
      })
    })
  })

  describe('hooks', function () {
    it('created', function () {
      var ctx
      var vm = new Vue({
        created: function () {
          // can't assert this === vm here
          // because the constructor hasn't returned yet
          ctx = this
          // should have observed data
          expect(this._data.__ob__).toBeTruthy()
          spy()
        }
      })
      expect(ctx).toBe(vm)
      expect(spy).toHaveBeenCalled()
    })

    it('beforeDestroy', function () {
      var vm = new Vue({
        beforeDestroy: function () {
          expect(this).toBe(vm)
          expect(this._isDestroyed).toBe(false)
          spy()
        }
      })
      vm.$destroy()
      expect(spy).toHaveBeenCalled()
    })

    it('destroyed', function () {
      var vm = new Vue({
        destroyed: function () {
          expect(this).toBe(vm)
          expect(this._isDestroyed).toBe(true)
          spy()
        }
      })
      vm.$destroy()
      expect(spy).toHaveBeenCalled()
    })

    it('beforeCompile', function () {
      var vm = new Vue({
        template: '{{a}}',
        data: { a: 1 },
        beforeCompile: function () {
          expect(this).toBe(vm)
          expect(this.$el).toBe(el)
          expect(this.$el.textContent).toBe('{{a}}')
          spy()
        }
      })
      var el = document.createElement('div')
      vm.$mount(el)
      expect(spy).toHaveBeenCalled()
    })

    it('compiled', function () {
      var vm = new Vue({
        template: '{{a}}',
        data: { a: 1 },
        compiled: function () {
          expect(this.$el).toBe(el)
          expect(this.$el.textContent).toBe('1')
          spy()
        }
      })
      var el = document.createElement('div')
      vm.$mount(el)
      expect(spy).toHaveBeenCalled()
    })

    it('ready', function () {
      var vm = new Vue({
        ready: spy
      })
      expect(spy).not.toHaveBeenCalled()
      var el = document.createElement('div')
      vm.$mount(el)
      expect(spy).not.toHaveBeenCalled()
      vm.$appendTo(document.body)
      expect(spy).toHaveBeenCalled()
      vm.$remove()
      // try mounting on something already in dom
      el = document.createElement('div')
      document.body.appendChild(el)
      vm = new Vue({
        el: el,
        ready: spy2
      })
      expect(spy2).toHaveBeenCalled()
      vm.$remove()
    })

    it('compile v-on on child component', function () {
      var spy2 = jasmine.createSpy()
      var vm = new Vue({
        el: document.createElement('div'),
        template: '<comp v-on:hook:created="onCreated" @ready="onReady" @ok="a++"></comp>',
        data: {
          a: 0
        },
        methods: {
          onCreated: spy,
          onReady: spy
        },
        components: {
          comp: {
            compiled: function () {
              this.$emit('ready', 123)
              this.$emit('ok')
              this.$parent.onReady = spy2
              this.$emit('ready', 234)
            }
          }
        }
      })
      expect(spy.calls.count()).toBe(2)
      expect(spy).toHaveBeenCalledWith(123)
      expect(spy2.calls.count()).toBe(1)
      expect(spy2).toHaveBeenCalledWith(234)
      expect(vm.a).toBe(1)
    })

    it('warn missing handler for child component v-on', function () {
      new Vue({
        el: document.createElement('div'),
        template: '<comp @test="onThat"></comp>',
        components: {
          comp: {}
        }
      })
      expect('v-on:test="onThat" expects a function value').toHaveBeenWarned()
    })

    it('passing $arguments', function () {
      new Vue({
        el: document.createElement('div'),
        template: '<comp @ready="onReady($arguments[1])"></comp>',
        methods: {
          onReady: spy
        },
        components: {
          comp: {
            compiled: function () {
              this.$emit('ready', 123, 1234)
            }
          }
        }
      })
      expect(spy).toHaveBeenCalledWith(1234)
    })

    describe('attached/detached', function () {
      it('in DOM', function () {
        var el = document.createElement('div')
        var childEl = document.createElement('div')
        el.appendChild(childEl)
        document.body.appendChild(el)
        var parentVm = new Vue({
          el: el,
          attached: spy,
          detached: spy2
        })
        var childVm = new Vue({
          parent: parentVm,
          el: childEl,
          attached: spy,
          detached: spy2
        })
        expect(spy.calls.count()).toBe(2)
        parentVm.$remove()
        expect(spy2.calls.count()).toBe(2)
        // child should be already detached
        // so the hook should not fire again
        childVm.$remove()
        expect(spy2.calls.count()).toBe(2)
      })

      it('create then attach', function () {
        var el = document.createElement('div')
        var childEl = document.createElement('div')
        el.appendChild(childEl)
        var parentVm = new Vue({
          el: el,
          attached: spy,
          detached: spy2
        })
        var childVm = new Vue({
          parent: parentVm,
          el: childEl,
          attached: spy,
          detached: spy2
        })
        parentVm.$appendTo(document.body)
        expect(spy.calls.count()).toBe(2)
        // detach child first
        childVm.$remove()
        expect(spy2.calls.count()).toBe(1)
        // should only fire parent detach
        parentVm.$remove()
        expect(spy2.calls.count()).toBe(2)
      })

      it('should not fire on detached child', function () {
        var el = document.createElement('div')
        var childEl = document.createElement('div')
        var parentVm = new Vue({
          el: el,
          attached: spy
        })
        var childVm = new Vue({
          parent: parentVm,
          el: childEl,
          attached: spy
        })
        parentVm.$appendTo(document.body)
        expect(spy.calls.count()).toBe(1)
        childVm.$appendTo(el)
        expect(spy.calls.count()).toBe(2)
      })
    })
  })
})
