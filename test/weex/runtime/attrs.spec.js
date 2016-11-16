import {
  compileAndStringify,
  prepareRuntime,
  resetRuntime,
  createInstance
} from '../helpers/index'

describe('generate attribute', () => {
  let runtime

  beforeAll(() => {
    runtime = prepareRuntime()
  })

  afterAll(() => {
    resetRuntime()
    runtime = null
  })

  it('should be generated', () => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div>
        <text value="Hello World" style="font-size: 100"></text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        el: 'body'
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [
        { type: 'text', style: { fontSize: '100' }, attr: { value: 'Hello World' }}
      ]
    })
  })

  it('should be updated', (done) => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div @click="foo">
        <text :value="x"></text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        data: {
          x: 'Hello World'
        },
        methods: {
          foo: function () {
            this.x = 'Hello Vue'
          }
        },
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      event: ['click'],
      children: [
        { type: 'text', attr: { value: 'Hello World' }}
      ]
    })

    instance.$fireEvent(instance.doc.body.ref, 'click', {})
    setTimeout(() => {
      expect(instance.getRealRoot()).toEqual({
        type: 'div',
        event: ['click'],
        children: [
          { type: 'text', attr: { value: 'Hello Vue' }}
        ]
      })
      done()
    })
  })

  it('should be cleared', (done) => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div @click="foo">
        <text :value="x"></text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        data: {
          x: 'Hello World'
        },
        methods: {
          foo: function () {
            this.x = ''
          }
        },
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      event: ['click'],
      children: [
        { type: 'text', attr: { value: 'Hello World' }}
      ]
    })

    instance.$fireEvent(instance.doc.body.ref, 'click', {})
    setTimeout(() => {
      expect(instance.getRealRoot()).toEqual({
        type: 'div',
        event: ['click'],
        children: [
          { type: 'text', attr: { value: '' }}
        ]
      })
      done()
    })
  })
})
