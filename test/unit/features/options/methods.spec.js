import Vue from 'vue'

describe('Options methods', () => {
  it('should have correct context', () => {
    const vm = new Vue({
      data: {
        a: 1
      },
      methods: {
        plus () {
          this.a++
        }
      }
    })
    vm.plus()
    expect(vm.a).toBe(2)
  })

  it('should warn undefined methods', () => {
    new Vue({
      methods: {
        hello: undefined
      }
    })
    expect(`Method "hello" is undefined in options`).toHaveBeenWarned()
  })
})
