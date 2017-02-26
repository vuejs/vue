import Vue from 'vue'
import Watcher from 'core/observer/watcher'

describe('Watcher', () => {
  let vm, spy
  beforeEach(() => {
    vm = new Vue({
      template: '<div></div>',
      data: {
        a: 1,
        b: {
          c: 2,
          d: 4
        },
        c: 'c',
        msg: 'yo'
      }
    }).$mount()
    spy = jasmine.createSpy('watcher')
  })

  it('path', done => {
    const watcher = new Watcher(vm, 'b.c', spy)
    expect(watcher.value).toBe(2)
    vm.b.c = 3
    waitForUpdate(() => {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.b = { c: 4 } // swapping the object
    }).then(() => {
      expect(watcher.value).toBe(4)
      expect(spy).toHaveBeenCalledWith(4, 3)
    }).then(done)
  })

  it('non-existent path, set later', done => {
    const watcher1 = new Watcher(vm, 'b.e', spy)
    expect(watcher1.value).toBeUndefined()
    // check $add should not affect isolated children
    const child2 = new Vue({ parent: vm })
    const watcher2 = new Watcher(child2, 'b.e', spy)
    expect(watcher2.value).toBeUndefined()
    Vue.set(vm.b, 'e', 123)
    waitForUpdate(() => {
      expect(watcher1.value).toBe(123)
      expect(watcher2.value).toBeUndefined()
      expect(spy.calls.count()).toBe(1)
      expect(spy).toHaveBeenCalledWith(123, undefined)
    }).then(done)
  })

  it('delete', done => {
    const watcher = new Watcher(vm, 'b.c', spy)
    expect(watcher.value).toBe(2)
    Vue.delete(vm.b, 'c')
    waitForUpdate(() => {
      expect(watcher.value).toBeUndefined()
      expect(spy).toHaveBeenCalledWith(undefined, 2)
    }).then(done)
  })

  it('path containing $data', done => {
    const watcher = new Watcher(vm, '$data.b.c', spy)
    expect(watcher.value).toBe(2)
    vm.b = { c: 3 }
    waitForUpdate(() => {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.$data.b.c = 4
    }).then(() => {
      expect(watcher.value).toBe(4)
      expect(spy).toHaveBeenCalledWith(4, 3)
    }).then(done)
  })

  it('deep watch', done => {
    let oldB
    new Watcher(vm, 'b', spy, {
      deep: true
    })
    vm.b.c = { d: 4 }
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
      oldB = vm.b
      vm.b = { c: [{ a: 1 }] }
    }).then(() => {
      expect(spy).toHaveBeenCalledWith(vm.b, oldB)
      expect(spy.calls.count()).toBe(2)
      vm.b.c[0].a = 2
    }).then(() => {
      expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
      expect(spy.calls.count()).toBe(3)
    }).then(done)
  })

  it('deep watch $data', done => {
    new Watcher(vm, '$data', spy, {
      deep: true
    })
    vm.b.c = 3
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(vm.$data, vm.$data)
    }).then(done)
  })

  it('deep watch with circular references', done => {
    new Watcher(vm, 'b', spy, {
      deep: true
    })
    Vue.set(vm.b, '_', vm.b)
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
      expect(spy.calls.count()).toBe(1)
      vm.b._.c = 1
    }).then(() => {
      expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
      expect(spy.calls.count()).toBe(2)
    }).then(done)
  })

  it('fire change for prop addition/deletion in non-deep mode', done => {
    new Watcher(vm, 'b', spy)
    Vue.set(vm.b, 'e', 123)
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
      expect(spy.calls.count()).toBe(1)
      Vue.delete(vm.b, 'e')
    }).then(() => {
      expect(spy.calls.count()).toBe(1)
    }).then(done)
  })

  it('fire change on prop watcher upon addition/deletion', done => {
    new Watcher(vm, 'b.y', spy)
    expect(spy.calls.count()).toBe(0)
    // should NOT trigger notify since 'y' went from undefined to undefined
    Vue.set(vm.b, 'x', 123)
    waitForUpdate(() => {
      expect(spy.calls.count()).toBe(0)
      // should trigger notify since 'y' does not exist on the object yet
      Vue.set(vm.b, 'y', 234)
    }).then(() => {
      expect(spy).toHaveBeenCalledWith(234, undefined)
      expect(spy.calls.count()).toBe(1)
      // should NOT trigger notify since watcher depends on 'y', not 'x'
      Vue.set(vm.b, 'x', 345)
    }).then(() => {
      expect(spy.calls.count()).toBe(1)
      // should trigger notify since watcher depends on 'y'
      Vue.set(vm.b, 'y', 456)
    }).then(() => {
      expect(spy).toHaveBeenCalledWith(456, 234)
      expect(spy.calls.count()).toBe(2)
      // should NOT trigger notify since watcher depends on 'y', not 'x'
      Vue.delete(vm.b, 'x')
    }).then(() => {
      expect(spy.calls.count()).toBe(2)
      // should trigger notify since watcher depends on 'y'
      Vue.delete(vm.b, 'y')
    }).then(() => {
      expect(spy).toHaveBeenCalledWith(undefined, 456)
      expect(spy.calls.count()).toBe(3)
    }).then(done)
  })

  it('do not mix Vue.get() with . or []', done => {
    let spy2 = jasmine.createSpy('watcher')
    let spy3 = jasmine.createSpy('watcher')
    // An initial watcher using '.' will not leave any traces on q.
    new Watcher(vm, () => { return vm.b.q }, spy)
    // Calling Vue.get() will create the field without notifying
    // the first watcher.
    new Watcher(vm, () => { return Vue.get(vm.b, 'q') }, spy2)
    // We can now create a watcher using '.' since the field exists.
    new Watcher(vm, () => { return vm.b.q }, spy3)
    waitForUpdate(() => {
      expect(spy.calls.count()).toBe(0)
      expect(spy2.calls.count()).toBe(0)
      expect(spy3.calls.count()).toBe(0)
      Vue.set(vm.b, 'q', 123)
    }).then(() => {
      expect(spy.calls.count()).toBe(0)
      expect(spy2.calls.count()).toBe(1)
      expect(spy3.calls.count()).toBe(1)
      Vue.delete(vm.b, 'q')
    }).then(() => {
      expect(spy.calls.count()).toBe(0)
      expect(spy2.calls.count()).toBe(2)
      expect(spy3.calls.count()).toBe(2)
    }).then(done)
  })

  it('watch function', done => {
    const watcher = new Watcher(vm, function () {
      return this.a + this.b.d
    }, spy)
    expect(watcher.value).toBe(5)
    vm.a = 2
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(6, 5)
      vm.b = { d: 2 }
    }).then(() => {
      expect(spy).toHaveBeenCalledWith(4, 6)
    }).then(done)
  })

  it('lazy mode', done => {
    const watcher = new Watcher(vm, function () {
      return this.a + this.b.d
    }, null, { lazy: true })
    expect(watcher.lazy).toBe(true)
    expect(watcher.value).toBeUndefined()
    expect(watcher.dirty).toBe(true)
    watcher.evaluate()
    expect(watcher.value).toBe(5)
    expect(watcher.dirty).toBe(false)
    vm.a = 2
    waitForUpdate(() => {
      expect(watcher.value).toBe(5)
      expect(watcher.dirty).toBe(true)
      watcher.evaluate()
      expect(watcher.value).toBe(6)
      expect(watcher.dirty).toBe(false)
    }).then(done)
  })

  it('teardown', done => {
    const watcher = new Watcher(vm, 'b.c', spy)
    watcher.teardown()
    vm.b.c = 3
    waitForUpdate(() => {
      expect(watcher.active).toBe(false)
      expect(spy).not.toHaveBeenCalled()
    }).then(done)
  })

  it('warn not support path', () => {
    new Watcher(vm, 'd.e + c', spy)
    expect('Failed watching path:').toHaveBeenWarned()
  })
})
