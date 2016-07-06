import Vue from 'vue'

describe('Options functional', () => {
  it('should work', done => {
    const vm = new Vue({
      data: { test: 'foo' },
      template: '<div><wrap :msg="test">bar</wrap></div>',
      components: {
        wrap: {
          functional: true,
          props: ['msg'],
          render (h, { props, children }) {
            return h('div', null, [props.msg, ' '].concat(children))
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<div>foo bar</div>')
    vm.test = 'qux'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<div>qux bar</div>')
    }).then(done)
  })

  it('should let vnode raw data pass through', done => {
    const onValid = jasmine.createSpy('valid')
    const vm = new Vue({
      data: { msg: 'hello' },
      template: `<div>
        <validate field="field1" @valid="onValid">
          <input type="text" v-model="msg">
        </validate>
      </div>`,
      components: {
        validate: {
          functional: true,
          props: ['field'],
          render (h, { props, children, data: { on } }) {
            props.child = children[0]
            return h('validate-control', { props, on })
          }
        },
        'validate-control': {
          props: ['field', 'child'],
          render () {
            return this.child
          },
          mounted () {
            this.$el.addEventListener('input', this.onInput)
          },
          destroyed () {
            this.$el.removeEventListener('input', this.onInput)
          },
          methods: {
            onInput (e) {
              const value = e.target.value
              if (this.validate(value)) {
                this.$emit('valid', this)
              }
            },
            // something validation logic here
            validate (val) {
              return val.length > 0
            }
          }
        }
      },
      methods: { onValid }
    }).$mount()
    document.body.appendChild(vm.$el)
    const input = vm.$el.querySelector('input')
    expect(onValid).not.toHaveBeenCalled()
    waitForUpdate(() => {
      input.value = 'foo'
      triggerEvent(input, 'input')
    }).then(() => {
      expect(onValid).toHaveBeenCalled()
    }).then(() => {
      document.body.removeChild(vm.$el)
      vm.$destroy()
    }).then(done)
  })
})
