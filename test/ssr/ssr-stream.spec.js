import Vue from '../../dist/vue.common.js'
import { compileToFunctions } from '../../dist/compiler.js'
import createRenderer from '../../dist/server-renderer.js'
const { renderToStream } = createRenderer()

describe('SSR: renderToStream', () => {
  it('should render to a stream', done => {
    const stream = renderVmWithOptions({
      template: `
        <div>
          <p class="hi">yoyo</p>
          <div id="ho" :class="[testClass, { red: isRed }]"></div>
          <span>{{ test }}</span>
          <input :value="test">
          <b-comp></b-comp>
          <c-comp></c-comp>
        </div>
      `,
      data: {
        test: 'hi',
        isRed: true,
        testClass: 'a'
      },
      components: {
        bComp (resolve) {
          return resolve({
            render () {
              return this.$createElement('test-async-2')
            },
            components: {
              testAsync2 (resolve) {
                return resolve({
                  created () { this.$parent.$parent.testClass = 'b' },
                  render () {
                    return this.$createElement('div', { class: [this.$parent.$parent.testClass] }, 'test')
                  }
                })
              }
            }
          })
        },
        cComp: {
          render () {
            return this.$createElement('div', { class: [this.$parent.testClass] }, 'test')
          }
        }
      }
    })
    let res = ''
    stream.on('data', chunk => {
      res += chunk
    })
    stream.on('end', () => {
      expect(res).toContain(
        '<div server-rendered="true">' +
        '<p class="hi">yoyo</p>' +
        '<div id="ho" class="a red"></div>' +
        '<span>hi</span>' +
        '<input value="hi">' +
        '<div class="b">test</div>' +
        '<div class="b">test</div>' +
        '</div>'
      )
      done()
    })
  })
})

function renderVmWithOptions (options) {
  const res = compileToFunctions(options.template, {
    preserveWhitespace: false
  })
  Object.assign(options, res)
  delete options.template
  return renderToStream(new Vue(options))
}
