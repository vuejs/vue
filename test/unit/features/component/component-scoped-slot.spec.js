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
      template: `<foo>before <div slot="bar" slot-scope="scope">{{ scope.msg }}</div> after</foo>`,
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

  // #9422
  // the behavior of the new syntax is slightly different.
  it('scoped slot v-if using slot-scope value', () => {
    const Child = {
      template: '<div><slot value="foo"/></div>',
    }
    const vm = new Vue({
      components: { Child },
      template: `
        <child>
          <template slot-scope="{ value }" v-if="value">
            foo {{ value }}
          </template>
        </child>
      `
    }).$mount()
    expect(vm.$el.textContent).toMatch(`foo foo`)
  })

  // 2.6 new slot syntax
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

      it('named slots', () => {
        const vm = new Vue({
          template: `
            <foo>
              <template ${toNamed(syntax, 'default')}="foo">
                {{ foo }}
              </template>
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

      it('should warn invalid parameter expression', () => {
        new Vue({
          template: `<foo ${syntax}="1"></foo>`,
          components: { Foo }
        }).$mount();
        expect('invalid function parameter expression').toHaveBeenWarned()
      })

      it('should allow destructuring props with default value', () => {
        new Vue({
          template: `<foo ${syntax}="{ foo = { bar: '1' } }"></foo>`,
          components: { Foo }
        }).$mount();
        expect('invalid function parameter expression').not.toHaveBeenWarned()
      })
    }

    // run tests for both full syntax and shorthand
    runSuite('v-slot')
    runSuite('#default')

    it('shorthand named slots', () => {
      const vm = new Vue({
        template: `
          <foo>
            <template #default="foo">
              {{ foo }}
            </template>
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

    it('should warn mixed root-default and named slots', () => {
      const vm = new Vue({
        template: `
          <foo #default="foo">
            {{ foo }}
            <template #one="one">
              {{ one }}
            </template>
          </foo>
        `,
        components: { Foo }
      }).$mount()
      expect(`default slot should also use <template>`).toHaveBeenWarned()
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

    it('dynamic slot name', done => {
      const vm = new Vue({
        data: {
          a: 'one',
          b: 'two'
        },
        template: `
          <foo>
            <template #[a]="one">a {{ one }} </template>
            <template v-slot:[b]="two">b {{ two }} </template>
          </foo>
        `,
        components: { Foo }
      }).$mount()
      expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(`a from foo one b from foo two`)
      vm.a = 'two'
      vm.b = 'one'
      waitForUpdate(() => {
        expect(vm.$el.innerHTML.replace(/\s+/g, ' ')).toMatch(`b from foo one a from foo two `)
      }).then(done)
    })

    it('should work with v-if/v-else', done => {
      const vm = new Vue({
        data: { flag: true },
        template: `
          <foo>
            <template v-if="flag" v-slot:one="one">a {{ one }} </template>
            <template v-else v-slot:two="two">b {{ two }} </template>
          </foo>
        `,
        components: { Foo }
      }).$mount()
      expect(vm.$el.innerHTML).toBe(`a from foo one `)
      vm.flag = false
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(`b from foo two `)
      }).then(done)
    })

    it('warn when v-slot used on non-root <template>', () => {
      const vm = new Vue({
        template: `
          <foo>
            <template v-if="true">
              <template v-slot:one>foo</template>
            </template>
          </foo>
        `,
        components: { Foo }
      }).$mount()
      expect(`<template v-slot> can only appear at the root level`).toHaveBeenWarned()
    })
  })

  // 2.6 scoped slot perf optimization
  it('should have accurate tracking for scoped slots', done => {
    const parentUpdate = jasmine.createSpy()
    const childUpdate = jasmine.createSpy()
    const vm = new Vue({
      template: `
        <div>{{ parentCount }}<foo #default>{{ childCount }}</foo></div>
      `,
      data: {
        parentCount: 0,
        childCount: 0
      },
      updated: parentUpdate,
      components: {
        foo: {
          template: `<div><slot/></div>`,
          updated: childUpdate
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toMatch(`0<div>0</div>`)

    vm.parentCount++
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toMatch(`1<div>0</div>`)
      // should only trigger parent update
      expect(parentUpdate.calls.count()).toBe(1)
      expect(childUpdate.calls.count()).toBe(0)

      vm.childCount++
    }).then(() => {
      expect(vm.$el.innerHTML).toMatch(`1<div>1</div>`)
      // should only trigger child update
      expect(parentUpdate.calls.count()).toBe(1)
      expect(childUpdate.calls.count()).toBe(1)
    }).then(done)
  })

  // #9432: async components inside a scoped slot should trigger update of the
  // component that invoked the scoped slot, not the lexical context component.
  it('async component inside scoped slot', done => {
    let p
    const vm = new Vue({
      template: `
        <foo>
          <template #default>
            <bar />
          </template>
        </foo>
      `,
      components: {
        foo: {
          template: `<div>foo<slot/></div>`
        },
        bar: resolve => {
          setTimeout(() => {
            resolve({
              template: `<div>bar</div>`
            })
            next()
          }, 0)
        }
      }
    }).$mount()

    function next () {
      waitForUpdate(() => {
        expect(vm.$el.textContent).toBe(`foobar`)
      }).then(done)
    }
  })

  // regression #9396
  it('should not force update child with no slot content', done => {
    const Child = {
      updated: jasmine.createSpy(),
      template: `<div></div>`
    }

    const parent = new Vue({
      template: `<div>{{ count }}<child/></div>`,
      data: {
        count: 0
      },
      components: { Child }
    }).$mount()

    expect(parent.$el.textContent).toBe(`0`)
    parent.count++
    waitForUpdate(() => {
      expect(parent.$el.textContent).toBe(`1`)
      expect(Child.updated).not.toHaveBeenCalled()
    }).then(done)
  })

  // regression #9438
  it('nested scoped slots update', done => {
    const Wrapper = {
      template: `<div><slot/></div>`
    }

    const Inner = {
      props: ['foo'],
      template: `<div>{{ foo }}</div>`
    }

    const Outer = {
      data: () => ({ foo: 1 }),
      template: `<div><slot :foo="foo" /></div>`
    }

    const vm = new Vue({
      components: { Outer, Wrapper, Inner },
      template: `
        <outer ref="outer" v-slot="props">
          <wrapper v-slot>
            <inner :foo="props.foo"/>
          </wrapper>
        </outer>
      `
    }).$mount()

    expect(vm.$el.textContent).toBe(`1`)

    vm.$refs.outer.foo++
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe(`2`)
    }).then(done)
  })

  it('dynamic v-bind arguments on <slot>', done => {
    const Foo = {
      data() {
        return {
          key: 'msg'
        }
      },
      template: `<div><slot :[key]="'hello'"/></div>`
    }

    const vm = new Vue({
      components: { Foo },
      template: `
        <foo ref="foo" v-slot="props">{{ props }}</foo>
      `
    }).$mount()

    expect(vm.$el.textContent).toBe(JSON.stringify({ msg: 'hello' }, null, 2))

    vm.$refs.foo.key = 'changed'
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe(JSON.stringify({ changed: 'hello' }, null, 2))
    }).then(done)
  })

  // #9452
  it('fallback for scoped slots passed multiple levels down', () => {
    const inner = {
      template: `<div><slot>fallback</slot></div>`
    }

    const wrapper = {
      template: `
        <inner>
          <template #default>
            <slot/>
          </template>
        </inner>
      `,
      components: { inner }
    }

    const vm = new Vue({
      components: { wrapper, inner },
      template: `<wrapper/>`
    }).$mount()

    expect(vm.$el.textContent).toBe(`fallback`)
  })

  it('should expose v-slot without scope on this.$slots', () => {
    const vm = new Vue({
      template: `<foo><template v-slot>hello</template></foo>`,
      components: {
        foo: {
          render(h) {
            return h('div', this.$slots.default)
          }
        }
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('hello')
  })

  it('should not expose legacy syntax scoped slot on this.$slots', () => {
    const vm = new Vue({
      template: `<foo><template slot-scope="foo">hello</template></foo>`,
      components: {
        foo: {
          render(h) {
            expect(this.$slots.default).toBeUndefined()
            return h('div', this.$slots.default)
          }
        }
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('')
  })

  it('should expose v-slot without scope on ctx.slots() in functional', () => {
    const vm = new Vue({
      template: `<foo><template v-slot>hello</template></foo>`,
      components: {
        foo: {
          functional: true,
          render(h, ctx) {
            return h('div', ctx.slots().default)
          }
        }
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('hello')
  })

  it('should not cache scoped slot normalization when there are a mix of normal and scoped slots', done => {
    const foo = {
      template: `<div><slot name="foo" /> <slot name="bar" /></div>`
    }

    const vm = new Vue({
      data: {
        msg: 'foo'
      },
      template: `
        <foo>
          <div slot="foo">{{ msg }}</div>
          <template #bar><div>bar</div></template>
        </foo>
      `,
      components: { foo }
    }).$mount()

    expect(vm.$el.textContent).toBe(`foo bar`)
    vm.msg = 'baz'
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe(`baz bar`)
    }).then(done)
  })

  // #9468
  it('should support passing multiple args to scoped slot function', () => {
    const foo = {
      render() {
        return this.$scopedSlots.default('foo', 'bar')
      }
    }

    const vm = new Vue({
      template: `<foo v-slot="foo, bar">{{ foo }} {{ bar }}</foo>`,
      components: { foo }
    }).$mount()

    expect(vm.$el.textContent).toBe('foo bar')
  })

  it('should not skip updates when a scoped slot contains parent <slot/> content', done => {
    const inner = {
      template: `<div><slot/></div>`
    }

    const wrapper = {
      template: `<inner v-slot><slot/></inner>`,
      components: { inner }
    }

    const vm = new Vue({
      data() {
        return {
          ok: true
        }
      },
      components: { wrapper },
      template: `<wrapper><div>{{ ok ? 'foo' : 'bar' }}</div></wrapper>`
    }).$mount()

    expect(vm.$el.textContent).toBe('foo')
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('bar')
    }).then(done)
  })

  it('should not skip updates for v-slot inside v-for', done => {
    const test = {
      template: `<div><slot></slot></div>`
    }

    const vm = new Vue({
      template: `
      <div>
        <div v-for="i in numbers">
          <test v-slot>{{ i }}</test>
        </div>
      </div>
      `,
      components: { test },
      data: {
        numbers: [1]
      }
    }).$mount()

    expect(vm.$el.textContent).toBe(`1`)
    vm.numbers = [2]
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe(`2`)
    }).then(done)
  })

  // #9534
  it('should detect conditional reuse with different slot content', done => {
    const Foo = {
      template: `<div><slot :n="1" /></div>`
    }

    const vm = new Vue({
      components: { Foo },
      data: {
        ok: true
      },
      template: `
        <div>
          <div v-if="ok">
            <foo v-slot="{ n }">{{ n }}</foo>
          </div>
          <div v-if="!ok">
            <foo v-slot="{ n }">{{ n + 1 }}</foo>
          </div>
        </div>
      `
    }).$mount()

    expect(vm.$el.textContent.trim()).toBe(`1`)
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$el.textContent.trim()).toBe(`2`)
    }).then(done)
  })

  // #9644
  it('should factor presence of normal slots into scoped slots caching', done => {
    const Wrapper = {
      template: `<div>
        <p>Default:<slot/></p>
        <p>Content:<slot name='content'/></p>
      </div>`
    }

    const vm = new Vue({
      data: { ok: false },
      components: { Wrapper },
      template: `<wrapper>
        <p v-if='ok'>ok</p>
        <template #content>
          <p v-if='ok'>ok</p>
        </template>
      </wrapper>`
    }).$mount()

    expect(vm.$el.textContent).not.toMatch(`Default:ok`)
    expect(vm.$el.textContent).not.toMatch(`Content:ok`)
    vm.ok = true
    waitForUpdate(() => {
      expect(vm.$el.textContent).toMatch(`Default:ok`)
      expect(vm.$el.textContent).toMatch(`Content:ok`)
      vm.ok = false
    }).then(() => {
      expect(vm.$el.textContent).not.toMatch(`Default:ok`)
      expect(vm.$el.textContent).not.toMatch(`Content:ok`)
      vm.ok = true
    }).then(() => {
      expect(vm.$el.textContent).toMatch(`Default:ok`)
      expect(vm.$el.textContent).toMatch(`Content:ok`)
    }).then(done)
  })

  //#9658
  it('fallback for scoped slot with single v-if', () => {
    const vm = new Vue({
      template: `<test v-slot><template v-if="false">hi</template></test>`,
      components: {
        Test: {
          template: `<div><slot>fallback</slot></div>`
        }
      }
    }).$mount()
    expect(vm.$el.textContent).toMatch('fallback')
  })

  // #9699
  // Component only has normal slots, but is passing down $scopedSlots directly
  // $scopedSlots should not be marked as stable in this case
  it('render function passing $scopedSlots w/ normal slots down', done => {
    const one = {
      template: `<div><slot name="footer"/></div>`
    }

    const two = {
      render(h) {
        return h(one, {
          scopedSlots: this.$scopedSlots
        })
      }
    }

    const vm = new Vue({
      data: { count: 0 },
      render(h) {
        return h(two, [
          h('span', { slot: 'footer' }, this.count)
        ])
      }
    }).$mount()

    expect(vm.$el.textContent).toMatch(`0`)
    vm.count++
    waitForUpdate(() => {
      expect(vm.$el.textContent).toMatch(`1`)
    }).then(done)
  })

  // #11652
  it('should update when switching between two components with slot and without slot', done => {
    const Child = {
      template: `<div><slot/></div>`
    }

    const parent = new Vue({
      template: `<div>
        <child v-if="flag"><template #default>foo</template></child>
        <child v-else></child>
      </div>`,
      data: {
        flag: true
      },
      components: { Child }
    }).$mount()

    expect(parent.$el.textContent).toMatch(`foo`)
    parent.flag=false
    waitForUpdate(()=>{
      expect(parent.$el.textContent).toMatch(``)
    }).then(done)
  })
})
