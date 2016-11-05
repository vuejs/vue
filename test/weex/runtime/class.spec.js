import {
  compileAndStringify,
  prepareRuntime,
  resetRuntime,
  createInstance
} from '../helpers/index'

describe('generate class', () => {
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
        <text class="a b c">Hello World</text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        style: {
          a: {
            fontSize: '100'
          },
          b: {
            color: '#ff0000'
          },
          c: {
            fontWeight: 'bold'
          }
        },
        el: 'body'
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [
        { type: 'text', style: { fontSize: '100', color: '#ff0000', fontWeight: 'bold' }, attr: { value: 'Hello World' }}
      ]
    })
  })

  it('should be updated', (done) => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div>
        <text :class="['a', x]" @click="foo">Hello World</text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        data: {
          x: 'b'
        },
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        style: {
          a: {
            fontSize: '100'
          },
          b: {
            color: '#ff0000'
          },
          c: {
            fontWeight: 'bold'
          },
          d: {
            color: '#0000ff',
            fontWeight: 'bold'
          }
        },
        methods: {
          foo: function () {
            this.x = 'd'
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
          style: { fontSize: '100', color: '#ff0000' },
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
            style: { fontSize: '100', color: '#0000ff', fontWeight: 'bold' },
            attr: { value: 'Hello World' }
          }
        ]
      })
      done()
    })
  })

  it('should be applied in order', (done) => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div>
        <text :class="arr" @click="foo">Hello World</text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        data: {
          arr: ['b', 'a']
        },
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        style: {
          a: {
            color: '#ff0000'
          },
          b: {
            color: '#00ff00'
          },
          c: {
            color: '#0000ff'
          }
        },
        methods: {
          foo: function () {
            this.arr.push('c')
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
          style: { color: '#ff0000' },
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
            style: { color: '#0000ff' },
            attr: { value: 'Hello World' }
          }
        ]
      })
      done()
    })
  })

  it('should be cleared', (done) => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div>
        <text :class="['a', x]" @click="foo">Hello World</text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        data: {
          x: 'b'
        },
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        style: {
          a: {
            fontSize: '100'
          },
          b: {
            color: '#ff0000'
          },
          c: {
            fontWeight: 'bold'
          }
        },
        methods: {
          foo: function () {
            this.x = 'c'
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
          style: { fontSize: '100', color: '#ff0000' },
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
            style: { fontSize: '100', color: '', fontWeight: 'bold' },
            attr: { value: 'Hello World' }
          }
        ]
      })
      done()
    })
  })
})
