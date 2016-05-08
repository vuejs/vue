import Vue from '../../dist/vue.common.js'
import { compileToFunctions } from '../../dist/compiler.js'
import createRenderer from '../../dist/server-renderer.js'
const { renderToString } = createRenderer()

// TODO: test custom server-side directives

describe('SSR: renderToString', () => {
  it('static attributes', () => {
    expect(renderVmWithOptions({
      template: '<div id="foo" bar="123"></div>'
    })).toContain('<div id="foo" bar="123" server-rendered="true"></div>')
  })

  it('unary tags', () => {
    expect(renderVmWithOptions({
      template: '<input value="123">'
    })).toContain('<input value="123" server-rendered="true">')
  })

  it('dynamic attributes', () => {
    expect(renderVmWithOptions({
      template: '<div qux="quux" :id="foo" :bar="baz"></div>',
      data: {
        foo: 'hi',
        baz: 123
      }
    })).toContain('<div qux="quux" id="hi" bar="123" server-rendered="true"></div>')
  })

  it('static class', () => {
    expect(renderVmWithOptions({
      template: '<div class="foo bar"></div>'
    })).toContain('<div server-rendered="true" class="foo bar"></div>')
  })

  it('dynamic class', () => {
    expect(renderVmWithOptions({
      template: '<div class="foo bar" :class="[a, { qux: hasQux, quux: hasQuux }]"></div>',
      data: {
        a: 'baz',
        hasQux: true,
        hasQuux: false
      }
    })).toContain('<div server-rendered="true" class="foo bar baz qux"></div>')
  })

  it('dynamic style', () => {
    expect(renderVmWithOptions({
      template: '<div style="background-color:black" :style="{ fontSize: fontSize + \'px\', color: color }"></div>',
      data: {
        fontSize: 14,
        color: 'red'
      }
    })).toContain(
        '<div server-rendered="true" style="font-size:14px;color:red;background-color:black"></div>'
      )
  })

  it('text interpolation', () => {
    expect(renderVmWithOptions({
      template: '<div>{{ foo }} side {{ bar }}</div>',
      data: {
        foo: 'server',
        bar: 'rendering'
      }
    })).toContain('<div server-rendered="true">server side rendering</div>')
  })

  it('child component (hoc)', () => {
    expect(renderVmWithOptions({
      template: '<child class="foo" :msg="msg"></child>',
      data: {
        msg: 'hello'
      },
      components: {
        child: {
          props: ['msg'],
          data () {
            return { name: 'bar' }
          },
          render () {
            const h = this.$createElement
            return h('div', { class: ['bar'] }, [`${this.msg} ${this.name}`])
          }
        }
      }
    })).toContain('<div server-rendered="true" class="foo bar">hello bar</div>')
  })

  it('has correct lifecycle during render', () => {
    let lifecycleCount = 1
    expect(renderVmWithOptions({
      template: '<div><span>{{ val }}</span><test></test></div>',
      data: {
        val: 'hi'
      },
      init () {
        expect(lifecycleCount++).toBe(1)
      },
      created () {
        this.val = 'hello'
        expect(this.val).toBe('hello')
        expect(lifecycleCount++).toBe(2)
      },
      components: {
        test: {
          init () {
            expect(lifecycleCount++).toBe(3)
          },
          created () {
            expect(lifecycleCount++).toBe(4)
          },
          render () {
            expect(lifecycleCount++).toBeGreaterThan(4)
            return this.$createElement('span', { class: ['b'] }, 'testAsync')
          }
        }
      }
    })).toContain(
      '<div server-rendered="true">' +
        '<span>hello</span>' +
        '<span class="b">testAsync</span>' +
      '</div>'
    )
  })

  it('renders asynchronous component', () => {
    expect(renderVmWithOptions({
      template: `
        <div>
          <test-async></test-async>
        </div>
      `,
      components: {
        testAsync (resolve) {
          resolve({
            render () {
              return this.$createElement('span', { class: ['b'] }, 'testAsync')
            }
          })
        }
      }
    })).toContain('<div server-rendered="true"><span class="b">testAsync</span></div>')
  })

  it('renders asynchronous component (hoc)', () => {
    expect(renderVmWithOptions({
      template: '<test-async></test-async>',
      components: {
        testAsync (resolve) {
          resolve({
            render () {
              return this.$createElement('span', { class: ['b'] }, 'testAsync')
            }
          })
        }
      }
    })).toContain('<span server-rendered="true" class="b">testAsync</span>')
  })

  it('renders nested asynchronous component', () => {
    expect(renderVmWithOptions({
      template: `
        <div>
          <test-async></test-async>
        </div>
      `,
      components: {
        testAsync (resolve) {
          const options = compileToFunctions(`
            <span class="b">
              <test-sub-async></test-sub-async>
            </span>
          `, { preserveWhitespace: false })

          options.components = {
            testSubAsync (resolve) {
              resolve({
                render () {
                  return this.$createElement('div', { class: ['c'] }, 'testSubAsync')
                }
              })
            }
          }
          resolve(options)
        }
      }
    })).toContain(
      '<div server-rendered="true"><span class="b"><div class="c">testSubAsync</div></span></div>'
    )
  })

  it('everything together', () => {
    expect(renderVmWithOptions({
      template: `
        <div>
          <p class="hi">yoyo</p>
          <div id="ho" :class="{ red: isRed }"></div>
          <span>{{ test }}</span>
          <input :value="test">
          <img :src="imageUrl">
          <test></test>
          <test-async></test-async>
        </div>
      `,
      data: {
        test: 'hi',
        isRed: true,
        imageUrl: 'https://vuejs.org/images/logo.png'
      },
      components: {
        test: {
          render () {
            return this.$createElement('div', { class: ['a'] }, 'test')
          }
        },
        testAsync (resolve) {
          resolve({
            render () {
              return this.$createElement('span', { class: ['b'] }, 'testAsync')
            }
          })
        }
      }
    })).toContain(
      '<div server-rendered="true">' +
        '<p class="hi">yoyo</p>' +
        '<div id="ho" class="red"></div>' +
        '<span>hi</span>' +
        '<input value="hi">' +
        '<img src="https://vuejs.org/images/logo.png">' +
        '<div class="a">test</div>' +
        '<span class="b">testAsync</span>' +
      '</div>'
    )
  })

  it('normal attr', () => {
    expect(renderVmWithOptions({
      template: `
        <div>
          <span :test="'ok'">hello</span>
          <span :test="null">hello</span>
          <span :test="false">hello</span>
          <span :test="true">hello</span>
          <span :test="0">hello</span>
        </div>
      `
    })).toContain(
      '<div server-rendered="true">' +
        '<span test="ok">hello</span>' +
        '<span>hello</span>' +
        '<span>hello</span>' +
        '<span test="true">hello</span>' +
        '<span test="0">hello</span>' +
      '</div>'
    )
  })

  it('enumrated attr', () => {
    expect(renderVmWithOptions({
      template: `
        <div>
          <span :draggable="true">hello</span>
          <span :draggable="'ok'">hello</span>
          <span :draggable="null">hello</span>
          <span :draggable="false">hello</span>
          <span :draggable="''">hello</span>
          <span :draggable="'false'">hello</span>
        </div>
      `
    })).toContain(
      '<div server-rendered="true">' +
        '<span draggable="true">hello</span>' +
        '<span draggable="true">hello</span>' +
        '<span draggable="false">hello</span>' +
        '<span draggable="false">hello</span>' +
        '<span draggable="true">hello</span>' +
        '<span draggable="false">hello</span>' +
      '</div>'
    )
  })

  it('boolean attr', () => {
    expect(renderVmWithOptions({
      template: `
        <div>
          <span :disabled="true">hello</span>
          <span :disabled="'ok'">hello</span>
          <span :disabled="null">hello</span>
          <span :disabled="''">hello</span>
        </div>
      `
    })).toContain(
      '<div server-rendered="true">' +
        '<span disabled="disabled">hello</span>' +
        '<span disabled="disabled">hello</span>' +
        '<span>hello</span>' +
        '<span disabled="disabled">hello</span>' +
      '</div>'
    )
  })
})

function renderVmWithOptions (options) {
  const res = compileToFunctions(options.template, {
    preserveWhitespace: false
  })
  Object.assign(options, res)
  delete options.template
  return renderToString(new Vue(options))
}
