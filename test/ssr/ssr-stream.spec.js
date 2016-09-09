import Vue from '../../dist/vue.common.js'
import { createRenderer } from '../../packages/vue-server-renderer'
const { renderToStream } = createRenderer()

describe('SSR: renderToStream', () => {
  it('should render to a stream', done => {
    const stream = renderToStream(new Vue({
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
            render (h) {
              return h('test-async-2')
            },
            components: {
              testAsync2 (resolve) {
                return resolve({
                  created () { this.$parent.$parent.testClass = 'b' },
                  render (h) {
                    return h('div', { class: [this.$parent.$parent.testClass] }, 'test')
                  }
                })
              }
            }
          })
        },
        cComp: {
          render (h) {
            return h('div', { class: [this.$parent.testClass] }, 'test')
          }
        }
      }
    }))
    let res = ''
    stream.on('data', chunk => {
      res += chunk
    })
    stream.on('end', () => {
      expect(res).toContain(
        '<div server-rendered="true">' +
          '<p class="hi">yoyo</p> ' +
          '<div id="ho" class="a red"></div> ' +
          '<span>hi</span> ' +
          '<input value="hi"> ' +
          '<div class="b">test</div> ' +
          '<div class="b">test</div>' +
        '</div>'
      )
      done()
    })
  })

  it('should catch error', done => {
    const stream = renderToStream(new Vue({
      render () {
        throw new Error('oops')
      }
    }))
    stream.on('error', err => {
      expect(err.toString()).toMatch(/oops/)
      done()
    })
    stream.on('data', _ => _)
  })
})
