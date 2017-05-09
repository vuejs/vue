import Vue from 'vue'

describe('Component scoped slot', () => {
  it('default slot', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template scope="props">
            <span>{{ props.msg }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot :msg="msg"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>hello</span>')
    vm.$refs.test.msg = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>world</span>')
    }).then(done)
  })

  it('with v-bind', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template scope="props">
            <span>{{ props.msg }} {{ props.msg2 }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return {
              msg: 'hello',
              obj: { msg2: 'world' }
            }
          },
          template: `
            <div>
              <slot :msg="msg" v-bind="obj"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>hello world</span>')
    vm.$refs.test.msg = 'bye'
    vm.$refs.test.obj.msg2 = 'bye'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>bye bye</span>')
    }).then(done)
  })

  it('template slot', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" scope="props">
            <span>{{ props.foo }}</span><span>{{ props.bar }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return { foo: 'FOO', bar: 'BAR' }
          },
          template: `
            <div>
              <slot name="item" :foo="foo" :bar="bar"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>FOO</span><span>BAR</span>')
    vm.$refs.test.foo = 'BAZ'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>BAZ</span><span>BAR</span>')
    }).then(done)
  })

  it('fallback content', () => {
    const vm = new Vue({
      template: `<test></test>`,
      components: {
        test: {
          data () {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot name="item" :text="msg">
                <span>{{ msg }} fallback</span>
              </slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>hello fallback</span>')
  })

  it('slot with v-for', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" scope="props">
            <span>{{ props.text }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return {
              items: ['foo', 'bar', 'baz']
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

    function assertOutput () {
      expect(vm.$el.innerHTML).toBe(vm.$refs.test.items.map(item => {
        return `<span>${item}</span>`
      }).join(''))
    }

    assertOutput()
    vm.$refs.test.items.reverse()
    waitForUpdate(assertOutput).then(() => {
      vm.$refs.test.items.push('qux')
    }).then(assertOutput).then(done)
  })

  it('slot inside v-for', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" scope="props">
            <span>{{ props.text }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return {
              items: ['foo', 'bar', 'baz']
            }
          },
          template: `
            <ul>
              <li v-for="item in items">
                <slot name="item" :text="item"></slot>
              </li>
            </ul>
          `
        }
      }
    }).$mount()

    function assertOutput () {
      expect(vm.$el.innerHTML).toBe(vm.$refs.test.items.map(item => {
        return `<li><span>${item}</span></li>`
      }).join(''))
    }

    assertOutput()
    vm.$refs.test.items.reverse()
    waitForUpdate(assertOutput).then(() => {
      vm.$refs.test.items.push('qux')
    }).then(assertOutput).then(done)
  })

  it('scoped slot without scope alias', () => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <span slot="item">I am static</span>
        </test>
      `,
      components: {
        test: {
          data () {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot name="item" :text="msg"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>I am static</span>')
  })

  it('non-scoped slot with scope alias', () => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" scope="props">
            <span>{{ props.text || 'meh' }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot name="item"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>meh</span>')
  })

  it('warn key on slot', () => {
    new Vue({
      template: `
        <test ref="test">
          <template slot="item" scope="props">
            <span>{{ props.text }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return {
              items: ['foo', 'bar', 'baz']
            }
          },
          template: `
            <div>
              <slot v-for="item in items" name="item" :text="item" :key="item"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(`\`key\` does not work on <slot>`).toHaveBeenWarned()
  })

  it('render function usage (named, via data)', done => {
    const vm = new Vue({
      render (h) {
        return h('test', {
          ref: 'test',
          scopedSlots: {
            item: props => h('span', props.text)
          }
        })
      },
      components: {
        test: {
          data () {
            return { msg: 'hello' }
          },
          render (h) {
            return h('div', [
              this.$scopedSlots.item({
                text: this.msg
              })
            ])
          }
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>hello</span>')
    vm.$refs.test.msg = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>world</span>')
    }).then(done)
  })

  it('render function usage (default, as children)', () => {
    const vm = new Vue({
      render (h) {
        return h('test', [
          props => h('span', [props.msg])
        ])
      },
      components: {
        test: {
          data () {
            return { msg: 'hello' }
          },
          render (h) {
            return h('div', [
              this.$scopedSlots.default({ msg: this.msg })
            ])
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>hello</span>')
  })

  // #4779
  it('should support dynamic slot target', done => {
    const Child = {
      template: `
        <div>
          <slot name="a" msg="a" />
          <slot name="b" msg="b" />
        </div>
      `
    }

    const vm = new Vue({
      data: {
        a: 'a',
        b: 'b'
      },
      template: `
        <child>
          <template :slot="a" scope="props">A {{ props.msg }}</template>
          <template :slot="b" scope="props">B {{ props.msg }}</template>
        </child>
      `,
      components: { Child }
    }).$mount()

    expect(vm.$el.textContent.trim()).toBe('A a B b')

    // switch slots
    vm.a = 'b'
    vm.b = 'a'
    waitForUpdate(() => {
      expect(vm.$el.textContent.trim()).toBe('B a A b')
    }).then(done)
  })

  it('render function usage (JSX)', () => {
    const vm = new Vue({
      render (h) {
        return <test>{
          props => <span>{props.msg}</span>
        }</test>
      },
      components: {
        test: {
          data () {
            return { msg: 'hello' }
          },
          render (h) {
            return <div>
              {this.$scopedSlots.default({ msg: this.msg })}
            </div>
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>hello</span>')
  })

  // #5615
  it('scoped slot with v-for', done => {
    const vm = new Vue({
      data: { names: ['foo', 'bar'] },
      template: `
        <test ref="test">
          <template v-for="n in names" :slot="n" scope="props">
            <span>{{ props.msg }}</span>
          </template>
          <template slot="abc" scope="props">
            <span>{{ props.msg }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data: () => ({ msg: 'hello' }),
          template: `
            <div>
              <slot name="foo" :msg="msg + ' foo'"></slot>
              <slot name="bar" :msg="msg + ' bar'"></slot>
              <slot name="abc" :msg="msg + ' abc'"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>hello foo</span> <span>hello bar</span> <span>hello abc</span>')
    vm.$refs.test.msg = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>world foo</span> <span>world bar</span> <span>world abc</span>')
    }).then(done)
  })
})
