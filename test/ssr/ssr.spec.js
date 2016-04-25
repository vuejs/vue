import Vue from '../../dist/vue.common.js'
import { compileToFunctions } from '../../dist/compiler.common.js'
import { renderToString } from '../../dist/server-renderer.js'

describe('Server side rendering', () => {
  it('static attributes', () => {
    expect(renderVmWithOptions({
      template: '<div id="foo" bar="123"></div>'
    })).toContain('<div id="foo" bar="123"></div>')
  })

  it('unary tags', () => {
    expect(renderVmWithOptions({
      template: '<input value="123">'
    })).toContain('<input value="123">')
  })

  it('dynamic attributes', () => {
    expect(renderVmWithOptions({
      template: '<div qux="quux" :id="foo" :bar="baz"></div>',
      data: {
        foo: 'hi',
        baz: 123
      }
    })).toContain('<div qux="quux" id="hi" bar="123"></div>')
  })

  it('static class', () => {
    expect(renderVmWithOptions({
      template: '<div class="foo bar"></div>'
    })).toContain('<div class="foo bar"></div>')
  })

  it('dynamic class', () => {
    expect(renderVmWithOptions({
      template: '<div class="foo bar" :class="[a, { qux: hasQux, quux: hasQuux }]"></div>',
      data: {
        a: 'baz',
        hasQux: true,
        hasQuux: false
      }
    })).toContain('<div class="foo bar baz qux"></div>')
  })

  it('dynamic style', () => {
    expect(renderVmWithOptions({
      template: '<div style="background-color:black" :style="{ fontSize: fontSize + \'px\', color: color }"></div>',
      data: {
        fontSize: 14,
        color: 'red'
      }
    })).toContain('<div style="font-size:14px;color:red;background-color:black"></div>')
  })

  it('text interpolation', () => {

  })

  it('v-if', () => {

  })

  it('v-for', () => {

  })

  it('child component', () => {

  })

  it('everything together', () => {
    expect(renderVmWithOptions({
      template: `
        <div>
          <p class="hi">yoyo</p>
          <div id="ho" :class="{ red: isRed }"></div>
          <span>{{ test }}</span>
          <test></test>
        </div>
      `,
      data: {
        test: 'hi',
        isRed: true
      },
      components: {
        test: {
          render: function () {
            return this.$createElement('div', { class: ['a'] }, 'hahahaha')
          }
        }
      }
    })).toContain('<div><p class="hi">yoyo</p><div id="ho" class="red"></div><span>hi</span><div class="a">hahahaha</div></div>')
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
