import Vue from 'vue'

describe('Data API', () => {
  let vm
  beforeEach(() => {
    vm = new Vue({
      data () {
        return {
          a: 1,
          b: {
            c: true
          },
          foo: 'bar'
        }
      }
    }).$mount()
  })
  it('get data', () => {
    expect(vm.a).toBe(1)
    expect(vm.b['c']).toBe(true)
    expect(vm.foo).toBe('bar')
    expect(vm.c).toBeUndefined()
  })

  it('alter data', done => {
    vm.a = 'foo'
    waitForUpdate(() => {
      expect(vm.a).toBe('foo')
      vm.b['c'] = false
    }).then(() => {
      expect(vm.b['c']).toBe(false)
      vm.foo = 'baz'
    }).then(() => {
      expect(vm.foo).toBe('baz')
      done()
    }).catch(done)
  })
})
