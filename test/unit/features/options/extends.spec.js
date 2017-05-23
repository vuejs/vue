import Vue from 'vue'

describe('Options extends', () => {
  it('should work on objects', () => {
    const A = {
      data () {
        return { a: 1 }
      }
    }
    const B = {
      extends: A,
      data () {
        return { b: 2 }
      }
    }
    const vm = new Vue({
      extends: B,
      data: {
        c: 3
      }
    })
    expect(vm.a).toBe(1)
    expect(vm.b).toBe(2)
    expect(vm.c).toBe(3)
  })

  it('should work on extended constructors', () => {
    const A = Vue.extend({
      data () {
        return { a: 1 }
      }
    })
    const B = Vue.extend({
      extends: A,
      data () {
        return { b: 2 }
      }
    })
    const vm = new Vue({
      extends: B,
      data: {
        c: 3
      }
    })
    expect(vm.a).toBe(1)
    expect(vm.b).toBe(2)
    expect(vm.c).toBe(3)
  })
})

describe('Options extends with Object.prototype.watch', () => {
  beforeAll(function () {
    if (!Object.prototype.watch) {
      // eslint-disable-next-line no-extend-native
      Object.prototype.watch = {
        remove: true
      }
    }
  })
  afterAll(function () {
    if (Object.prototype.watch && Object.prototype.watch.remove) {
      delete Object.prototype.watch
    }
  })
  it('should work with global mixins', done => {
    Vue.use({
      install: function () {
        Vue.mixin({})
      }
    })
    const spy = jasmine.createSpy('watch')
    const A = Vue.extend({
      data: function () {
        return { a: 1 }
      },
      watch: {
        a: spy
      },
      created: function () {
        this.a = 2
      }
    })
    new Vue({
      extends: A
    })
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(2, 1)
    }).then(done)
  })
})
