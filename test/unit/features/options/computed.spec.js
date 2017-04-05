import Vue from 'vue'

describe('Options computed', () => {
  it('basic usage', done => {
    const vm = new Vue({
      template: '<div>{{ b }}</div>',
      data: {
        a: 1
      },
      computed: {
        b () {
          return this.a + 1
        }
      }
    }).$mount()
    expect(vm.b).toBe(2)
    expect(vm.$el.textContent).toBe('2')
    vm.a = 2
    expect(vm.b).toBe(3)
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('3')
    }).then(done)
  })

  it('with setter', done => {
    const vm = new Vue({
      template: '<div>{{ b }}</div>',
      data: {
        a: 1
      },
      computed: {
        b: {
          get () { return this.a + 1 },
          set (v) { this.a = v - 1 }
        }
      }
    }).$mount()
    expect(vm.b).toBe(2)
    expect(vm.$el.textContent).toBe('2')
    vm.a = 2
    expect(vm.b).toBe(3)
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('3')
      vm.b = 1
      expect(vm.a).toBe(0)
    }).then(() => {
      expect(vm.$el.textContent).toBe('1')
    }).then(done)
  })

  it('warn with setter and no getter', () => {
    const vm = new Vue({
      template: `
        <div>
          <test></test>
        </div>
      `,
      components: {
        test: {
          data () {
            return {
              a: 1
            }
          },
          computed: {
            b: {
              set (v) { this.a = v }
            }
          },
          template: `<div>{{a}}</div>`
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<div>1</div>')
    expect('No getter function has been defined for computed property "b".').toHaveBeenWarned()
  })

  it('watching computed', done => {
    const spy = jasmine.createSpy('watch computed')
    const vm = new Vue({
      data: {
        a: 1
      },
      computed: {
        b () { return this.a + 1 }
      }
    })
    vm.$watch('b', spy)
    vm.a = 2
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(3, 2)
    }).then(done)
  })

  it('caching', () => {
    const spy = jasmine.createSpy('cached computed')
    const vm = new Vue({
      data: {
        a: 1
      },
      computed: {
        b () {
          spy()
          return this.a + 1
        }
      }
    })
    expect(spy.calls.count()).toBe(0)
    vm.b
    expect(spy.calls.count()).toBe(1)
    vm.b
    expect(spy.calls.count()).toBe(1)
  })

  it('cache: false', () => {
    const spy = jasmine.createSpy('cached computed')
    const vm = new Vue({
      data: {
        a: 1
      },
      computed: {
        b: {
          cache: false,
          get () {
            spy()
            return this.a + 1
          }
        }
      }
    })
    expect(spy.calls.count()).toBe(0)
    vm.b
    expect(spy.calls.count()).toBe(1)
    vm.b
    expect(spy.calls.count()).toBe(2)
  })

  it('as component', done => {
    const Comp = Vue.extend({
      template: `<div>{{ b }} {{ c }}</div>`,
      data () {
        return { a: 1 }
      },
      computed: {
        // defined on prototype
        b () {
          return this.a + 1
        }
      }
    })

    const vm = new Comp({
      computed: {
        // defined at instantiation
        c () {
          return this.b + 1
        }
      }
    }).$mount()
    expect(vm.b).toBe(2)
    expect(vm.c).toBe(3)
    expect(vm.$el.textContent).toBe('2 3')
    vm.a = 2
    expect(vm.b).toBe(3)
    expect(vm.c).toBe(4)
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('3 4')
    }).then(done)
  })
})
