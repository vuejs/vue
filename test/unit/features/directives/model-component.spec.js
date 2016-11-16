import Vue from 'vue'

describe('Directive v-model component', () => {
  it('should work', done => {
    const spy = jasmine.createSpy()
    const vm = new Vue({
      data: {
        msg: ['hello']
      },
      watch: {
        msg: spy
      },
      template: `
        <div>
          <p>{{ msg }}</p>
          <validate v-model="msg[0]">
            <input type="text">
          </validate>
        </div>
      `,
      components: {
        validate: {
          template: '<div><slot></slot></div>',
          props: ['value'],
          methods: {
            onInput (e) {
              // something validate ...
              this.$emit('input', e.target.value)
            }
          },
          mounted () {
            this.$el.addEventListener('input', this.onInput)
          },
          destroyed () {
            this.$el.removeEventListener('input', this.onInput)
          }
        }
      }
    }).$mount()
    document.body.appendChild(vm.$el)
    waitForUpdate(() => {
      expect('v-model is not supported on element type').not.toHaveBeenWarned()
      const input = vm.$el.querySelector('input')
      input.value = 'world'
      triggerEvent(input, 'input')
    }).then(() => {
      expect(vm.msg).toEqual(['world'])
      expect(spy).toHaveBeenCalled()
    }).then(() => {
      document.body.removeChild(vm.$el)
      vm.$destroy()
    }).then(done)
  })

  it('modifier: .lazy', () => {
    const vm = new Vue({
      template: `<div><my-input ref="input" v-model.lazy="text"></my-input></div>`,
      data: { text: 'foo' },
      components: {
        'my-input': {
          template: '<input>'
        }
      }
    }).$mount()
    expect(vm.text).toBe('foo')
    vm.$refs.input.$emit('input', 'bar')
    expect(vm.text).toBe('foo')
    vm.$refs.input.$emit('change', 'bar')
    expect(vm.text).toBe('bar')
  })

  it('modifier: .number', () => {
    const vm = new Vue({
      template: `<div><my-input ref="input" v-model.number="text"></my-input></div>`,
      data: { text: 'foo' },
      components: {
        'my-input': {
          template: '<input>'
        }
      }
    }).$mount()
    expect(vm.text).toBe('foo')
    vm.$refs.input.$emit('input', 'bar')
    expect(vm.text).toBe('bar')
    vm.$refs.input.$emit('input', '123')
    expect(vm.text).toBe(123)
  })

  it('modifier: .trim', () => {
    const vm = new Vue({
      template: `<div><my-input ref="input" v-model.trim="text"></my-input></div>`,
      data: { text: 'foo' },
      components: {
        'my-input': {
          template: '<input>'
        }
      }
    }).$mount()
    expect(vm.text).toBe('foo')
    vm.$refs.input.$emit('input', '  bar  ')
    expect(vm.text).toBe('bar')
    vm.$refs.input.$emit('input', '   foo o  ')
    expect(vm.text).toBe('foo o')
  })
})
