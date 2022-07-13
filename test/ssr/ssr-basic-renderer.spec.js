import Vue from '../../dist/vue.runtime.common.js'
import renderToString from '../../packages/vue-server-renderer/basic'

describe('SSR: basicRenderer', () => {
  it('should work', done => {
    renderToString(new Vue({
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
    }), (err, result) => {
      expect(err).toBeNull()
      expect(result).toContain(
        '<div data-server-rendered="true">' +
          '<p class="hi">yoyo</p> ' +
          '<div id="ho" class="red"></div> ' +
          '<span>hi</span> ' +
          '<input value="hi"> ' +
          '<img src="https://vuejs.org/images/logo.png"> ' +
          '<div class="a">test</div> ' +
          '<span class="b">testAsync</span>' +
        '</div>'
      )
      done()
    })
  })

  // #5941
  it('should work properly when accessing $ssrContext in root component', done => {
    let ssrContext
    renderToString(new Vue({
      template: `
        <div></div>
      `,
      created () {
        ssrContext = this.$ssrContext
      }
    }), (err) => {
      expect(err).toBeNull()
      expect(ssrContext).toBeUndefined()
      done()
    })
  })

  // #12374
  it('should keep CSS variables in style attributes', done => {
    renderToString(new Vue({
      template: `
        <div :style="{ zIndex: 1, '--css-var1': 1, '--css_var2': 2, '--cssVar3': 3 }"></div>
      `,
    }), (err, html) => {
      expect(err).toBeNull()
      expect(html).toContain('style="z-index:1;--css-var1:1;--css_var2:2;--cssVar3:3;"')
      done()
    })
  })
})
