import Vue from 'vue'

describe('Component scoped slot', () => {
  it('default slot', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot-scope="props">
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

  it('default slot (plain element)', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <span slot-scope="props">{{ props.msg }}</span>
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
          <template slot-scope="props">
            <span>{{ props.msg }} {{ props.msg2 }} {{ props.msg3 }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return {
              msg: 'hello',
              obj: { msg2: 'world', msg3: '.' }
            }
          },
          template: `
            <div>
              <slot :msg="msg" v-bind="obj" msg3="!"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>hello world !</span>')
    vm.$refs.test.msg = 'bye'
    vm.$refs.test.obj.msg2 = 'bye'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>bye bye !</span>')
    }).then(done)
  })

  it('should warn when using v-bind with no object', () => {
    new Vue({
      template: `
        <test ref="test">
          <template scope="props">
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return {
              text: 'some text'
            }
          },
          template: `
            <div>
              <slot v-bind="text"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect('slot v-bind without argument expects an Object').toHaveBeenWarned()
  })

  it('should not warn when using v-bind with object', () => {
    new Vue({
      template: `
        <test ref="test">
          <template scope="props">
          </template>
        </test>
      `,
      components: {
        test: {
          data () {
            return {
              foo: {
                text: 'some text'
              }
            }
          },
          template: `
            <div>
              <slot v-bind="foo"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect('slot v-bind without argument expects an Object').not.toHaveBeenWarned()
  })

  it('named scoped slot', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" slot-scope="props">
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

  it('named scoped slot (plain element)', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <span slot="item" slot-scope="props">{{ props.foo }} {{ props.bar }}</span>
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

    expect(vm.$el.innerHTML).toBe('<span>FOO BAR</span>')
    vm.$refs.test.foo = 'BAZ'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>BAZ BAR</span>')
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
          <template slot="item" slot-scope="props">
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
          <template slot="item" slot-scope="props">
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
          <template slot="item" slot-scope="props">
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
          <template slot="item" slot-scope="props">
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
          <template :slot="a" slot-scope="props">A {{ props.msg }}</template>
          <template :slot="b" slot-scope="props">B {{ props.msg }}</template>
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
          <template v-for="n in names" :slot="n" slot-scope="props">
            <span>{{ props.msg }}</span>
          </template>
          <template slot="abc" slot-scope="props">
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

  it('scoped slot with v-for (plain elements)', done => {
    const vm = new Vue({
      data: { names: ['foo', 'bar'] },
      template: `
        <test ref="test">
          <span v-for="n in names" :slot="n" slot-scope="props">{{ props.msg }}</span>
          <span slot="abc" slot-scope="props">{{ props.msg }}</span>
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

  // #6725
  it('scoped slot with v-if', done => {
    const vm = new Vue({
      data: {
        ok: false
      },
      template: `
        <test>
          <template v-if="ok" slot-scope="foo">
            <p>{{ foo.text }}</p>
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
              <slot :text="msg">
                <span>{{ msg }} fallback</span>
              </slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>hello fallback</span>')

    vm.ok = true
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<p>hello</p>')
    }).then(done)
  })
})

describe('Component scoped slot pass', () => {
  it('default slot pass', done => {
    const vm = new Vue({
      template: `
        <test :depth="2">
          <template slot-scope="props">
            <span>{{ props.msg }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          name: 'test',
          props: ['depth'],
          template: `
            <div>
              <slot :msg="depth"></slot>
              <test v-if="depth" :depth="depth - 1">
                <slot slot-scope></slot>
              </test>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>2</span> <div><span>1</span> <div><span>0</span> <!----></div></div>')
    done()
  })

  it('named slot pass', done => {
    const vm = new Vue({
      template: `
        <test :depth="1">
          <template slot="a" slot-scope="props">
            <h1>{{ props.msg }}</h1>
          </template>
          <template slot="b" slot-scope="props">
            <h2>{{ props.msg }}</h2>
          </template>
        </test>
      `,
      components: {
        test: {
          name: 'test',
          props: ['depth'],
          template: `
            <div>
              <slot name="a" :msg="depth"></slot>
              <slot name="b" msg="b"></slot>
              <slot name="c" msg="c"></slot>
              <test v-if="depth" :depth="depth - 1">
                <slot name="a" slot="a" slot-scope></slot>
                <slot name="b" slot="c" slot-scope></slot>
              </test>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<h1>1</h1> <h2>b</h2>  <div><h1>0</h1>  <h2>c</h2> <!----></div>')
    done()
  })

  it('dynamic target slot pass', done => {
    const vm = new Vue({
      data: {
        a: 'a',
        b: 'b'
      },
      template: `
        <test ref="test" :depth="1">
          <template :slot="a" slot-scope="props">
            <h1>{{ props.msg }}</h1>
          </template>
          <template :slot="b" slot-scope="props">
            <h2>{{ props.msg }}</h2>
          </template>
        </test>
      `,
      components: {
        test: {
          name: 'test',
          props: ['depth'],
          template: `
            <div>
              <slot name="a" :msg="depth"></slot>
              <slot name="b" msg="b"></slot>
              <test v-if="depth" :depth="depth - 1">
                <slot name="a" slot="a" slot-scope></slot>
                <slot name="b" slot="b" slot-scope></slot>
              </test>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<h1>1</h1> <h2>b</h2> <div><h1>0</h1> <h2>b</h2> <!----></div>')
    vm.a = 'b'
    vm.b = 'a'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<h2>1</h2> <h1>b</h1> <div><h2>0</h2> <h1>b</h1> <!----></div>')
    }).then(done)
  })

  it('slot with static content pass', done => {
    const vm = new Vue({
      template: `
        <test :depth="2">
          <template>
            <span>static content</span>
          </template>
        </test>
      `,
      components: {
        test: {
          name: 'test',
          props: ['depth'],
          template: `
            <div>
              <slot :msg="depth"></slot>
              <test v-if="depth" :depth="depth - 1">
                <slot slot-scope></slot>
              </test>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>static content</span> <div><span>static content</span> <div><span>static content</span> <!----></div></div>')
    expect('Duplicate presence of slot "default"').toHaveBeenWarned()
    done()
  })

  it('should render fallback if no slot passed', done => {
    const vm = new Vue({
      template: '<test :depth="2"></test>',
      components: {
        test: {
          name: 'test',
          props: ['depth'],
          template: `
            <div>
              <slot :msg="depth">fallback</slot>
              <test v-if="depth" :depth="depth - 1">
                <slot slot-scope></slot>
              </test>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('fallback <div>fallback <div>fallback <!----></div></div>')
    done()
  })

  it('slot pass with v-if', done => {
    const vm = new Vue({
      data: {
        ok: true
      },
      template: `
        <test :depth="2">
          <template v-if="ok" slot-scope="props">
            <span>{{ props.msg }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          name: 'test',
          props: ['depth'],
          template: `
            <div>
              <slot :msg="depth">fallback</slot>
              <test v-if="depth" :depth="depth - 1">
                <slot slot-scope></slot>
              </test>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>2</span> <div><span>1</span> <div><span>0</span> <!----></div></div>')
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('fallback <div>fallback <div>fallback <!----></div></div>')
    }).then(done)
  })

  it('slot with static content pass with v-if', done => {
    const vm = new Vue({
      data: {
        ok: true
      },
      template: `
        <test :depth="2">
          <span v-if="ok">static content</span>
        </test>
      `,
      components: {
        test: {
          name: 'test',
          props: ['depth'],
          template: `
            <div>
              <slot :msg="depth">fallback</slot>
              <test v-if="depth" :depth="depth - 1">
                <slot slot-scope></slot>
              </test>
            </div>
          `
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toBe('<span>static content</span> <div><span>static content</span> <div><span>static content</span> <!----></div></div>')
    expect('Duplicate presence of slot "default"').toHaveBeenWarned()
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('fallback <div>fallback <div>fallback <!----></div></div>')
    }).then(done)
  })

  it('should warn if slot-scope attribute has value', done => {
    new Vue({
      template: `
        <test :depth="1">
          <template slot-scope="props">
            <span>{{ props.msg }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          name: 'test',
          props: ['depth'],
          template: `
            <div>
              <slot :msg="depth">fallback</slot>
              <test v-if="depth" :depth="depth - 1">
                <slot slot-scope="ignored"></slot>
              </test>
            </div>
          `
        }
      }
    }).$mount()

    expect(`"slot-scope" attribute on <slot> should be used without value`).toHaveBeenWarned()
    done()
  })
})
