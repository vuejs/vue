import Vue from '../../dist/vue.common.js'
import { compileToFunctions } from '../../dist/compiler.common.js'
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
    })).toContain('<div server-rendered="true" style="font-size:14px;color:red;background-color:black"></div>')
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
            return { name: 'foo' }
          },
          created () {
            // checking setting state in created hook works in ssr
            this.name = 'bar'
          },
          render () {
            const h = this.$createElement
            return h('div', { class: ['bar'] }, [`${this.msg} ${this.name}`])
          }
        }
      }
    })).toContain('<div server-rendered="true" class="foo bar">hello bar</div>')
  })

  it('everything together', () => {
    expect(renderVmWithOptions({
      template: `
        <div>
          <p class="hi">yoyo</p>
          <div id="ho" :class="{ red: isRed }"></div>
          <span>{{ test }}</span>
          <input :value="test">
          <test></test>
          <img :src="imageUrl">
        </div>
      `,
      data: {
        test: 'hi',
        isRed: true,
        imageUrl: 'https://vuejs.org/images/logo.png'
      },
      components: {
        test: {
          render: function () {
            return this.$createElement('div', { class: ['a'] }, 'hahahaha')
          }
        }
      }
    })).toContain(
      '<div server-rendered="true">' +
        '<p class="hi">yoyo</p>' +
        '<div id="ho" class="red"></div>' +
        '<span>hi</span>' +
        '<input value="hi">' +
        '<div class="a">hahahaha</div>' +
        '<img src="https://vuejs.org/images/logo.png">' +
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
