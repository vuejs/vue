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
            return h('div', this.$scopedSlots.item({
              text: this.msg
            }))
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
            return h('div', this.$scopedSlots.default({ msg: this.msg }))
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>hello</span>')
  })

  it('render function usage (default, as root)', () => {
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
            const res = this.$scopedSlots.default({ msg: this.msg })
            // all scoped slots should be normalized into arrays
            expect(Array.isArray(res)).toBe(true)
            return res
          }
        }
      }
    }).$mount()
    expect(vm.$el.outerHTML).toBe('<span>hello</span>')
  })

  // new in 2.6, unifying all slots as functions
  it('non-scoped slots should also be available on $scopedSlots', () => {
    const vm = new Vue({
      template: `<foo>before <div slot="bar" slot-scope="{ msg }">{{ msg }}</div> after</foo>`,
      components: {
        foo: {
          render(h) {
            return h('div', [
              this.$scopedSlots.default(),
              this.$scopedSlots.bar({ msg: 'hi' })
            ])
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe(`before  after<div>hi</div>`)
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

  // 2.6 new slot syntax
  if (process.env.NEW_SLOT_SYNTAX) {
    describe('v-slot syntax', () => {
      const Foo = {
        render(h) {
          return h('div', [
            this.$scopedSlots.default && this.$scopedSlots.default('from foo default'),
            this.$scopedSlots.one && this.$scopedSlots.one('from foo one'),
            this.$scopedSlots.two && this.$scopedSlots.two('from foo two')
          ])
        }
      }

      const Bar = {
        render(h) {
          return this.$scopedSlots.default && this.$scopedSlots.default('from bar')
        }
      }

      const Baz = {
        render(h) {
          return this.$scopedSlots.default && this.$scopedSlots.default('from baz')
        }
      }

      const toNamed = (syntax, name) => syntax[0] === '#'
        ? `#${name}` // shorthand
        : `${syntax}:${name}` // full syntax

      function runSuite(syntax) {
        it('default slot', () => {
          const vm = new Vue({
            template: `<foo ${syntax}="foo">{{ foo }}<div>{{ foo }}</div></foo>`,
            components: { Foo }
          }).$mount()
          expect(vm.$el.innerHTML).toBe(`from foo default<div>from foo default</div>`)
        })

        it('nested default slots', () => {
          const vm = new Vue({
            template: `
              <foo ${syntax}="foo">
                <bar ${syntax}="bar">
                  <baz ${syntax}="baz">
                    {{ foo }} | {{ bar }} | {{ baz }}
                  </baz>
                </bar>
              </foo>
            `,
            components: { Foo, Bar, Baz }
          }).$mount()
          expect(vm.$el.innerHTML.trim()).toBe(`from foo default | from bar | from baz`)
        })

        it('default + named slots', () => {
          const vm = new Vue({
            template: `
              <foo #default="foo">
                {{ foo }}
                <template ${toNamed(syntax, 'one')}="one">
                  {{ one }}
                </template>
                <template ${toNamed(syntax, 'two')}="two">
                  {{ two }}
                </template>
              </foo>
            `,
            components: { Foo }
          }).$mount()
          expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(`from foo default from foo one from foo two`)
        })

        it('nested + named + default slots', () => {
          const vm = new Vue({
            template: `
              <foo>
                <template ${toNamed(syntax, 'one')}="one">
                  <bar ${syntax}="bar">
                    {{ one }} {{ bar }}
                  </bar>
                </template>
                <template ${toNamed(syntax, 'two')}="two">
                  <baz ${syntax}="baz">
                    {{ two }} {{ baz }}
                  </baz>
                </template>
              </foo>
            `,
            components: { Foo, Bar, Baz }
          }).$mount()
          expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(`from foo one from bar from foo two from baz`)
        })

        it('should warn v-slot usage on non-component elements', () => {
          const vm = new Vue({
            template: `<div ${syntax}="foo"/>`
          }).$mount()
          expect(`v-slot can only be used on components or <template>`).toHaveBeenWarned()
        })

        it('should warn mixed usage', () => {
          const vm = new Vue({
            template: `<foo><bar slot="one" slot-scope="bar" ${syntax}="bar"></bar></foo>`,
            components: { Foo, Bar }
          }).$mount()
          expect(`Unexpected mixed usage of different slot syntaxes`).toHaveBeenWarned()
        })
      }

      // run tests for both full syntax and shorthand
      runSuite('v-slot')
      runSuite('#default')

      it('shorthand named slots', () => {
        const vm = new Vue({
          template: `
            <foo #default="foo">
              {{ foo }}
              <template #one="one">
                {{ one }}
              </template>
              <template #two="two">
                {{ two }}
              </template>
            </foo>
          `,
          components: { Foo }
        }).$mount()
        expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(`from foo default from foo one from foo two`)
      })

      it('shorthand without scope variable', () => {
        const vm = new Vue({
          template: `
            <foo>
              <template #one>one</template>
              <template #two>two</template>
            </foo>
          `,
          components: { Foo }
        }).$mount()
        expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(`onetwo`)
      })

      it('shorthand named slots on root', () => {
        const vm = new Vue({
          template: `
            <foo #one="one">
              {{ one }}
            </foo>
          `,
          components: { Foo }
        }).$mount()
        expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(`from foo one`)
      })

      it('dynamic slot name', () => {
        const vm = new Vue({
          data: {
            a: 'one',
            b: 'two'
          },
          template: `
            <foo>
              <template #[a]="one">{{ one }} </template>
              <template v-slot:[b]="two">{{ two }}</template>
            </foo>
          `,
          components: { Foo }
        }).$mount()
        expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(`from foo one from foo two`)
      })
    })
  }
})
