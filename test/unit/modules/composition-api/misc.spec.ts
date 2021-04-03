import Vue from './vue'
import { ref, nextTick, isReactive } from '../src'

describe('nextTick', () => {
  it('should works with callbacks', () => {
    const vm = new Vue<{ a: number }>({
      template: `<div>{{a}}</div>`,
      setup() {
        return {
          a: ref(1),
        }
      },
    }).$mount()

    expect(vm.$el.textContent).toBe('1')
    vm.a = 2
    expect(vm.$el.textContent).toBe('1')

    nextTick(() => {
      expect(vm.$el.textContent).toBe('2')
      vm.a = 3
      expect(vm.$el.textContent).toBe('2')

      nextTick(() => {
        expect(vm.$el.textContent).toBe('3')
      })
    })
  })

  it('should works with await', async () => {
    const vm = new Vue<{ a: number }>({
      template: `<div>{{a}}</div>`,
      setup() {
        return {
          a: ref(1),
        }
      },
    }).$mount()

    expect(vm.$el.textContent).toBe('1')
    vm.a = 2
    expect(vm.$el.textContent).toBe('1')

    await nextTick()
    expect(vm.$el.textContent).toBe('2')
    vm.a = 3
    expect(vm.$el.textContent).toBe('2')

    await nextTick()
    expect(vm.$el.textContent).toBe('3')
  })
})

describe('observable', () => {
  it('observable should be reactive', () => {
    const o: Record<string, any> = Vue.observable({
      a: 1,
      b: [{ a: 1 }],
    })

    expect(isReactive(o)).toBe(true)

    expect(isReactive(o.b)).toBe(true)
    expect(isReactive(o.b[0])).toBe(true)

    // TODO new array items should be reactive
    // o.b.push({ a: 2 })
    // expect(isReactive(o.b[1])).toBe(true)
  })

  it('nested deps should keep __ob__', () => {
    const o: any = Vue.observable({
      a: { b: 1 },
    })

    expect(o.__ob__).not.toBeUndefined()
    expect(o.a.__ob__).not.toBeUndefined()
  })
})
