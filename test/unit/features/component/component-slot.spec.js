import Vue from 'vue'

describe('Component slot', () => {
  let vm, child
  function mount (options) {
    vm = new Vue({
      data: {
        msg: 'parent message'
      },
      template: `<div><test>${options.parentContent || ''}</test></div>`,
      components: {
        test: {
          template: options.childTemplate,
          data () {
            return {
              msg: 'child message'
            }
          }
        }
      }
    }).$mount()
    child = vm.$children[0]
  }

  it('no content', () => {
    mount({
      childTemplate: '<div><slot></slot></div>'
    })
    expect(child.$el.childNodes.length).toBe(0)
  })

  it('default content', done => {
    mount({
      childTemplate: '<div><slot></slot></div>',
      parentContent: '<p>{{ msg }}</p>'
    })
    expect(child.$el.tagName).toBe('DIV')
    expect(child.$el.children[0].tagName).toBe('P')
    expect(child.$el.children[0].textContent).toBe('parent message')
    vm.msg = 'changed'
    waitForUpdate(() => {
      expect(child.$el.children[0].textContent).toBe('changed')
    }).then(done)
  })

  it('fallback content', () => {
    mount({
      childTemplate: '<div><slot><p>{{msg}}</p></slot></div>'
    })
    expect(child.$el.children[0].tagName).toBe('P')
    expect(child.$el.textContent).toBe('child message')
  })

  it('fallback content with multiple named slots', () => {
    mount({
      childTemplate: `
        <div>
          <slot name="a"><p>fallback a</p></slot>
          <slot name="b">fallback b</slot>
        </div>
      `,
      parentContent: '<p slot="b">slot b</p>'
    })
    expect(child.$el.childNodes.length).toBe(2)
    expect(child.$el.firstChild.textContent).toBe('fallback a')
    expect(child.$el.lastChild.textContent).toBe('slot b')
  })

  it('fallback content with mixed named/unamed slots', () => {
    mount({
      childTemplate: `
        <div>
          <slot><p>fallback a</p></slot>
          <slot name="b">fallback b</slot>
        </div>
      `,
      parentContent: '<p slot="b">slot b</p>'
    })
    expect(child.$el.childNodes.length).toBe(2)
    expect(child.$el.firstChild.textContent).toBe('fallback a')
    expect(child.$el.lastChild.textContent).toBe('slot b')
  })

  it('selector matching multiple elements', () => {
    mount({
      childTemplate: '<div><slot name="t"></slot></div>',
      parentContent: '<p slot="t">1</p><div></div><p slot="t">2</p>'
    })
    expect(child.$el.innerHTML).toBe('<p>1</p><p>2</p>')
  })

  it('default content should only render parts not selected', () => {
    mount({
      childTemplate: `
        <div>
          <slot name="a"></slot>
          <slot></slot>
          <slot name="b"></slot>
        </div>
      `,
      parentContent: '<div>foo</div><p slot="a">1</p><p slot="b">2</p>'
    })
    expect(child.$el.innerHTML).toBe('<p>1</p><div>foo</div><p>2</p>')
  })

  it('name should only match children', function () {
    mount({
      childTemplate: `
        <div>
          <slot name="a"><p>fallback a</p></slot>
          <slot name="b">fallback b</slot>
          <slot name="c">fallback c</slot>
        </div>
      `,
      parentContent: `
        '<p slot="b">select b</p>
        '<span><p slot="b">nested b</p></span>
        '<span><p slot="c">nested c</p></span>
      `
    })
    expect(child.$el.childNodes.length).toBe(3)
    expect(child.$el.firstChild.textContent).toBe('fallback a')
    expect(child.$el.childNodes[1].textContent).toBe('select b')
    expect(child.$el.lastChild.textContent).toBe('fallback c')
  })

  it('should accept expressions in slot attribute and slot names', () => {
    mount({
      childTemplate: `<div><slot :name="'a'"></slot></div>`,
      parentContent: `<p>one</p><p :slot="'a'">two</p>`
    })
    expect(child.$el.innerHTML).toBe('<p>two</p>')
  })

  it('slot inside v-if', done => {
    const vm = new Vue({
      data: {
        a: 1,
        b: 2,
        show: true
      },
      template: '<test :show="show"><p slot="b">{{b}}</a><p>{{a}}</p></test>',
      components: {
        test: {
          props: ['show'],
          template: '<div v-if="show"><slot></slot><slot name="b"></slot></div>'
        }
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('12')
    vm.a = 2
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('22')
      vm.show = false
    }).then(() => {
      expect(vm.$el.textContent).toBe('')
      vm.show = true
      vm.a = 3
    }).then(() => {
      expect(vm.$el.textContent).toBe('32')
    }).then(done)
  })

  it('slot inside v-for', () => {
    mount({
      childTemplate: '<div><slot v-for="i in 3" :name="i"></slot></div>',
      parentContent: '<p v-for="i in 3" :slot="i">{{ i - 1 }}</p>'
    })
    expect(child.$el.innerHTML).toBe('<p>0</p><p>1</p><p>2</p>')
  })

  it('nested slots', done => {
    const vm = new Vue({
      template: '<test><test2><p>{{ msg }}</p></test2></test>',
      data: {
        msg: 'foo'
      },
      components: {
        test: {
          template: '<div><slot></slot></div>'
        },
        test2: {
          template: '<div><slot></slot></div>'
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<div><p>foo</p></div>')
    vm.msg = 'bar'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<div><p>bar</p></div>')
    }).then(done)
  })

  it('v-if on inserted content', done => {
    const vm = new Vue({
      template: '<test><p v-if="ok">{{ msg }}</p></test>',
      data: {
        ok: true,
        msg: 'hi'
      },
      components: {
        test: {
          template: '<div><slot>fallback</slot></div>'
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<p>hi</p>')
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('fallback')
      vm.ok = true
      vm.msg = 'bye'
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<p>bye</p>')
    }).then(done)
  })

  it('template slot', function () {
    const vm = new Vue({
      template: '<test><template slot="test">hello</template></test>',
      components: {
        test: {
          template: '<div><slot name="test"></slot> world</div>'
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('hello world')
  })

  it('combined with v-for', () => {
    const vm = new Vue({
      template: '<div><test v-for="i in 3">{{ i }}</test></div>',
      components: {
        test: {
          template: '<div><slot></slot></div>'
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<div>1</div><div>2</div><div>3</div>')
  })

  it('inside template v-if', () => {
    mount({
      childTemplate: `
        <div>
          <template v-if="true"><slot></slot></template>
        </div>
      `,
      parentContent: 'foo'
    })
    expect(child.$el.innerHTML).toBe('foo')
  })

  it('default slot should use fallback content if has only whitespace', () => {
    Vue.config.preserveWhitespace = true
    mount({
      childTemplate: `
        <div>
          <slot name="first"><p>first slot</p></slot>
          <slot><p>this is the default slot</p></slot>
          <slot name="second"><p>second named slot</p></slot>
        </div>
      `,
      parentContent: `<div slot="first">1</div> <div slot="second">2</div>`
    })
    expect(child.$el.innerHTML).toBe(
      '<div>1</div> <p>this is the default slot</p> <div>2</div>'
    )
    Vue.config.preserveWhitespace = false
  })

  it('programmatic access to $slots', () => {
    const vm = new Vue({
      template: '<test><p slot="a">A</p><div>C</div><p slot="b">B</div></p></test>',
      components: {
        test: {
          render () {
            expect(this.$slots.a.length).toBe(1)
            expect(this.$slots.a[0].tag).toBe('p')
            expect(this.$slots.a[0].children.length).toBe(1)
            expect(this.$slots.a[0].children[0].text).toBe('A')

            expect(this.$slots.b.length).toBe(1)
            expect(this.$slots.b[0].tag).toBe('p')
            expect(this.$slots.b[0].children.length).toBe(1)
            expect(this.$slots.b[0].children[0].text).toBe('B')

            expect(this.$slots.default.length).toBe(1)
            expect(this.$slots.default[0].tag).toBe('div')
            expect(this.$slots.default[0].children.length).toBe(1)
            expect(this.$slots.default[0].children[0].text).toBe('C')

            return this.$slots.default[0]
          }
        }
      }
    }).$mount()
    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.textContent).toBe('C')
  })

  it('warn if user directly returns array', () => {
    new Vue({
      template: '<test><div></div></test>',
      components: {
        test: {
          render () {
            return this.$slots.default
          }
        }
      }
    }).$mount()
    expect('Render function should return a single root node').toHaveBeenWarned()
  })
})
