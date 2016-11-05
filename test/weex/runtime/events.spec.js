import {
  compileAndStringify,
  prepareRuntime,
  resetRuntime,
  createInstance
} from '../helpers/index'

describe('generate events', () => {
  let runtime

  beforeAll(() => {
    runtime = prepareRuntime()
  })

  afterAll(() => {
    resetRuntime()
    runtime = null
  })

  it('should be bound and fired for native component', (done) => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div>
        <text @click="foo">Hello {{x}}</text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        data: {
          x: 'World'
        },
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        methods: {
          foo: function () {
            this.x = 'Weex'
          }
        },
        el: 'body'
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [
        {
          type: 'text',
          event: ['click'],
          attr: { value: 'Hello World' }
        }
      ]
    })

    instance.$fireEvent(instance.doc.body.children[0].ref, 'click', {})
    setTimeout(() => {
      expect(instance.getRealRoot()).toEqual({
        type: 'div',
        children: [
          {
            type: 'text',
            event: ['click'],
            attr: { value: 'Hello Weex' }
          }
        ]
      })
      done()
    })
  })

  it('should be bound and fired by custom component', (done) => {
    const subTemplate = compileAndStringify(`<text>Hello {{x}}</text>`)
    const { render, staticRenderFns } = compileAndStringify(`
      <div>
        <text>Hello {{x}}</text>
        <sub @click="foo" @click.native="bar"></sub>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        data: {
          x: 'World'
        },
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        components: {
          sub: {
            data: function () {
              return {
                x: 'Sub'
              }
            },
            render: ${subTemplate.render},
            staticRenderFns: ${subTemplate.staticRenderFns},
            created: function () {
              this.$emit('click')
            }
          }
        },
        methods: {
          foo: function () {
            this.x = 'Foo'
          },
          bar: function () {
            this.x = 'Bar'
          }
        },
        el: 'body'
      })
    `)
    setTimeout(() => {
      expect(instance.getRealRoot()).toEqual({
        type: 'div',
        children: [
          {
            type: 'text',
            attr: { value: 'Hello Foo' }
          },
          {
            type: 'text',
            event: ['click'],
            attr: { value: 'Hello Sub' }
          }
        ]
      })

      instance.$fireEvent(instance.doc.body.children[1].ref, 'click', {})
      setTimeout(() => {
        expect(instance.getRealRoot()).toEqual({
          type: 'div',
          children: [
            {
              type: 'text',
              attr: { value: 'Hello Bar' }
            },
            {
              type: 'text',
              event: ['click'],
              attr: { value: 'Hello Sub' }
            }
          ]
        })
        done()
      })
    })
  })
})
