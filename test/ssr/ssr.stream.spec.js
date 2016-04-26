import Vue from '../../dist/vue.common.js'
import { compileToFunctions } from '../../dist/compiler.common.js'
import { renderToStream } from '../../dist/server-renderer.js'

describe('SSR: renderToStream', () => {
  it('should render to a stream', done => {
    const stream = renderVmWithOptions({
      template: `
        <div>
          <p class="hi">yoyo</p>
          <div id="ho" :class="{ red: isRed }"></div>
          <span>{{ test }}</span>
          <input :value="test">
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
    })

    let res = ''
    stream.on('data', chunk => {
      res += chunk
    })
    stream.on('end', () => {
      expect(res).toContain(
        '<div server-rendered="true">' +
          '<p class="hi">yoyo</p>' +
          '<div id="ho" class="red"></div>' +
          '<span>hi</span>' +
          '<input value="hi">' +
          '<div class="a">hahahaha</div>' +
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
