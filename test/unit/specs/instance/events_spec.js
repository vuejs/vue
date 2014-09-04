var Vue = require('../../../../src/vue')

describe('Instance Events', function () {

  describe('events', function () {

    var spy
    beforeEach(function () {
      spy = jasmine.createSpy()
    })

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
      var vm = new Vue({
        events: {
          'hook:created': spy
        }
      })
      expect(spy).toHaveBeenCalled()
    })

    it('method name strings', function () {
      var vm = new Vue({
        events: {
          'test': 'doSomething'
        },
        methods: {
          doSomething: spy
        }
      })
      vm.$emit('test', 123)
      expect(spy).toHaveBeenCalledWith(123)
    })

  })

  describe('hooks', function () {

    var spy
    beforeEach(function () {
      spy = jasmine.createSpy()
    })
    
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
          expect(this._data).toBeNull()
          spy()
        }
      })
      vm.$destroy()
      expect(spy).toHaveBeenCalled()
    })

    if (Vue.util.inBrowser) {

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
        var spy2 = jasmine.createSpy()
        vm = new Vue({
          el: el,
          ready: spy2
        })
        expect(spy2).toHaveBeenCalled()
        vm.$remove()
      })

      describe('attached/detached', function () {

        it('in DOM', function () {
          // body...
        })

        it('create then attach', function () {
          // body...
        })

        it('should not fire on detached child', function () {
          // body...
        })

      })

    }

  })

})