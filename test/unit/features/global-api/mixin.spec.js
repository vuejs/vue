import Vue from 'vue'

describe('Global API: mixin', () => {
  let options
  beforeEach(() => { options = Vue.options })
  afterEach(() => { Vue.options = options })

  it('should work', () => {
    const spy = jasmine.createSpy('global mixin')
    Vue.mixin({
      created () {
        spy(this.$options.myOption)
      }
    })
    new Vue({
      myOption: 'hello'
    })
    expect(spy).toHaveBeenCalledWith('hello')
  })

  it('should work for constructors created before mixin is applied', () => {
    const calls = []
    const Test = Vue.extend({
      name: 'test',
      init () {
        calls.push(this.$options.myOption + ' local')
      }
    })
    Vue.mixin({
      init () {
        calls.push(this.$options.myOption + ' global')
      }
    })
    expect(Test.options.name).toBe('test')
    new Test({
      myOption: 'hello'
    })
    expect(calls).toEqual(['hello global', 'hello local'])
  })
})
