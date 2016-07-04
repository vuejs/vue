var Vue = require('src')

describe('Events API', function () {
  var vm, spy
  beforeEach(function () {
    vm = new Vue()
    spy = jasmine.createSpy('emitter')
  })

  it('$on', function () {
    vm.$on('test', function () {
      // expect correct context
      expect(this).toBe(vm)
      spy.apply(this, arguments)
    })
    vm.$emit('test', 1, 2, 3, 4)
    expect(spy.calls.count()).toBe(1)
    expect(spy).toHaveBeenCalledWith(1, 2, 3, 4)
  })

  it('$once', function () {
    vm.$once('test', spy)
    vm.$emit('test', 1, 2, 3)
    vm.$emit('test', 2, 3, 4)
    expect(spy.calls.count()).toBe(1)
    expect(spy).toHaveBeenCalledWith(1, 2, 3)
  })

  it('$off', function () {
    vm.$on('test1', spy)
    vm.$on('test2', spy)
    vm.$off()
    vm.$emit('test1')
    vm.$emit('test2')
    expect(spy).not.toHaveBeenCalled()
  })

  it('$off event', function () {
    vm.$on('test1', spy)
    vm.$on('test2', spy)
    vm.$off('test1')
    vm.$off('test1') // test off something that's already off
    vm.$emit('test1', 1)
    vm.$emit('test2', 2)
    expect(spy.calls.count()).toBe(1)
    expect(spy).toHaveBeenCalledWith(2)
  })

  it('$off event + fn', function () {
    var spy2 = jasmine.createSpy('emitter')
    vm.$on('test', spy)
    vm.$on('test', spy2)
    vm.$off('test', spy)
    vm.$emit('test', 1, 2, 3)
    expect(spy).not.toHaveBeenCalled()
    expect(spy2.calls.count()).toBe(1)
    expect(spy2).toHaveBeenCalledWith(1, 2, 3)
  })

  it('$broadcast', function () {
    var child1 = new Vue({ parent: vm })
    var child2 = new Vue({ parent: vm })
    var child3 = new Vue({ parent: child1 })
    child1.$on('test', spy)
    child2.$on('test', spy)
    child3.$on('test', spy)
    vm.$broadcast('test')
    expect(spy.calls.count()).toBe(2) // should not propagate by default
  })

  it('$broadcast with propagation', function () {
    var child1 = new Vue({ parent: vm })
    var child2 = new Vue({ parent: vm })
    var child3 = new Vue({ parent: child1 })
    child1.$on('test', function () {
      spy()
      return true
    })
    child2.$on('test', spy)
    child3.$on('test', spy)
    vm.$broadcast('test')
    expect(spy.calls.count()).toBe(3)
  })

  it('$broadcast optimization', function () {
    var child = new Vue({ parent: vm })
    var child2 = new Vue({ parent: child })
    // hooks should not incurr the bookkeeping cost
    child.$on('hook:created', function () {})
    expect(vm._eventsCount['hook:created']).toBeUndefined()

    function handler () {
      spy()
      return true
    }

    child.$on('test', handler)
    expect(vm._eventsCount['test']).toBe(1)
    // child2's $emit & $broadcast
    // shouldn't get called if no child listens to the event
    child2.$emit = spy
    child2.$broadcast = spy
    vm.$broadcast('test')
    expect(spy.calls.count()).toBe(1)
    // check $off bookkeeping
    child.$off('test', handler)
    expect(vm._eventsCount['test']).toBe(0)
    function noop () {}
    child.$on('test', noop)
    child2.$on('test', noop)
    expect(vm._eventsCount['test']).toBe(2)
    child.$off('test')
    expect(vm._eventsCount['test']).toBe(1)
    child.$on('test', noop)
    child2.$on('test', noop)
    expect(vm._eventsCount['test']).toBe(3)
    child.$off()
    child2.$off()
    expect(vm._eventsCount['test']).toBe(0)
  })

  it('$broadcast cancel', function () {
    var child = new Vue({ parent: vm })
    var child2 = new Vue({ parent: child })
    child.$on('test', function () {
      return false
    })
    child2.$on('test', spy)
    vm.$broadcast('test')
    expect(spy).not.toHaveBeenCalled()
  })

  it('$dispatch', function () {
    var child = new Vue({ parent: vm })
    var child2 = new Vue({ parent: child })
    child2.$on('test', spy)
    child.$on('test', spy)
    vm.$on('test', spy)
    child2.$dispatch('test')
    expect(spy.calls.count()).toBe(2) // should trigger on self, but not propagate to root
  })

  it('$dispatch with propagation', function () {
    var child = new Vue({ parent: vm })
    var child2 = new Vue({ parent: child })
    var child3 = new Vue({ parent: child2 })
    child.$on('test', function () {
      spy()
      return true
    })
    vm.$on('test', spy)
    child3.$dispatch('test')
    expect(spy.calls.count()).toBe(2)
  })

  it('handle $dispatch by v-on inline-statement', function () {
    var parent = new Vue({
      el: document.createElement('div'),
      template: '<child1 @test="onTest()" v-ref:child></child1>',
      methods: {
        onTest: function () {
          spy()
        }
      },
      components: {
        child1: {
          template: '<child2 @test="onTest" v-ref:child></child2>',
          methods: {
            onTest: function () {
              spy()
            }
          },
          components: {
            child2: {
              template: '<child3 @test="onTest()" v-ref:child></child3>',
              methods: {
                onTest: function () {
                  spy()
                  return true
                }
              },
              components: {
                child3: {
                  template: '<child4 @test="onTest" v-ref:child></child4>',
                  methods: {
                    onTest: function () {
                      spy()
                      return true
                    }
                  },
                  components: {
                    child4: {}
                  }
                }
              }
            }
          }
        }
      }
    })
    parent
      .$refs.child // child1
      .$refs.child // child2
      .$refs.child // child3
      .$refs.child // child4
      .$dispatch('test')
    expect(spy.calls.count()).toBe(3)
  })

  it('$dispatch forward on immediate inline component handler', function () {
    var shouldPropagate = true
    var parent = new Vue({
      el: document.createElement('div'),
      template: '<child @test="onTest" v-ref:child></child>',
      events: {
        test: spy
      },
      methods: {
        onTest: function () {
          spy()
          return shouldPropagate
        }
      },
      components: {
        child: {}
      }
    })
    parent.$refs.child.$dispatch('test')
    expect(spy.calls.count()).toBe(2)
    shouldPropagate = false
    parent.$refs.child.$dispatch('test')
    expect(spy.calls.count()).toBe(3)
  })
})
