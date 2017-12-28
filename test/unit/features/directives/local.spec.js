import Vue from 'vue'

describe('Directive v-local', () => {
  it('should work', () => {
    const vm = new Vue({
      template: '<div><span v-local:v="foo.bar">{{v.baz}}</span></div>',
      data: {
        foo: {
          bar: {
            baz: 1
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>1</span>')
  })

  it('should update', done => {
    const vm = new Vue({
      template: '<div><span v-local:v="foo.bar">{{v.baz}}</span></div>',
      data: {
        foo: {
          bar: {
            baz: 1
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>1</span>')
    vm.foo.bar.baz = 2
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>2</span>')
      vm.foo.bar.baz = 'a'
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>a</span>')
    }).then(done)
  })

  it('should work with v-if', done => {
    const vm = new Vue({
      template: '<div><span v-if="v.show" v-local:v="foo.bar">{{v.baz}}</span></div>',
      data: {
        foo: {
          bar: {
            baz: 1,
            show: true
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>1</span>')
    vm.foo.bar.show = false
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<!---->')
      vm.foo.bar.baz = 2
      vm.foo.bar.show = true
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>2</span>')
    }).then(done)
  })

  it('should work with v-for', done => {
    const vm = new Vue({
      template: '<div><span v-for="item in items" v-local:v="item.foo.bar">{{v.baz}}</span></div>',
      data: {
        items: [
          {
            foo: {
              bar: {
                baz: 1
              }
            }
          }
        ]
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>1</span>')
    vm.items.push({
      foo: {
        bar: {
          baz: 2
        }
      }
    })
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>1</span><span>2</span>')
      vm.items.shift()
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>2</span>')
      vm.items = []
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('')
    }).then(done)
  })

  it('should been called once', () => {
    const spy = jasmine.createSpy()
    const vm = new Vue({
      template: '<div><span v-local:v="getValue()">{{v.foo}}-{{v.bar}}</span></div>',
      data: {
        foo: {
          bar: {
            baz: 1
          }
        }
      },
      methods: {
        getValue () {
          spy()
          return {
            foo: this.foo.bar.baz + 1,
            bar: this.foo.bar.baz + 2
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>2-3</span>')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should work with scoped-slot', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" slot-scope="props" v-local:v="props.text.foo.bar.baz">
            <span>{{ v }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return {
              items: [{
                foo: {
                  bar: {
                    baz: 1
                  }
                }
              }]
            }
          },
          template: `
            <div>
              <slot v-for="item in items" name="item" :text="item"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>1</span>')
    vm.$refs.test.items.push({
      foo: {
        bar: {
          baz: 2
        }
      }
    })
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>1</span><span>2</span>')
      vm.$refs.test.items = []
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('')
    }).then(done)
  })
})
