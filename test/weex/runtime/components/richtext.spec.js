import {
  compileAndStringify,
  prepareRuntime,
  resetRuntime,
  createInstance
} from '../../helpers/index'

function compileSnippet (runtime, snippet, additional) {
  const { render, staticRenderFns } = compileAndStringify(`<div>${snippet}</div>`)
  const instance = createInstance(runtime, `
    new Vue({
      el: 'body',
      render: ${render},
      staticRenderFns: ${staticRenderFns},
      ${additional}
    })
  `)
  return instance.getRealRoot().children[0]
}

describe('richtext component', () => {
  let runtime

  beforeAll(() => {
    runtime = prepareRuntime()
  })

  afterAll(() => {
    resetRuntime()
    runtime = null
  })

  it('with no child', () => {
    expect(compileSnippet(runtime, `
      <richtext></richtext>
    `)).toEqual({
      type: 'richtext'
    })
  })

  it('with single text node', () => {
    expect(compileSnippet(runtime, `
      <richtext>single</richtext>
    `)).toEqual({
      type: 'richtext',
      attr: {
        value: [{
          type: 'span',
          attr: {
            value: 'single'
          }
        }]
      }
    })
  })

  describe('span', () => {
    it('single node', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span>single</span>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            attr: {
              value: 'single'
            }
          }]
        }
      })
    })

    it('multiple node', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span>AAA</span>
          <span>BBB</span>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            attr: { value: 'AAA' }
          }, {
            type: 'span',
            attr: { value: 'BBB' }
          }]
        }
      })
    })

    it('with raw text', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          AAA
          <span>BBB</span>CCC
          <span>DDD</span>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            attr: { value: 'AAA' }
          }, {
            type: 'span',
            attr: { value: 'BBB' }
          }, {
            type: 'span',
            attr: { value: 'CCC' }
          }, {
            type: 'span',
            attr: { value: 'DDD' }
          }]
        }
      })
    })
  })

  describe('a', () => {
    it('single node', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <a href="http://whatever.com"></a>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'a',
            attr: { href: 'http://whatever.com' }
          }]
        }
      })
    })

    it('multiple node', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <a href="http://a.whatever.com"></a>
          <a href="http://b.whatever.com"></a>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'a',
            attr: { href: 'http://a.whatever.com' }
          }, {
            type: 'a',
            attr: { href: 'http://b.whatever.com' }
          }]
        }
      })
    })
  })

  describe('image', () => {
    it('single node', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <image src="path/to/profile.png"></image>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'image',
            attr: { src: 'path/to/profile.png' }
          }]
        }
      })
    })

    it('multiple node', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <image src="path/to/A.png"></image>
          <image src="path/to/B.png"></image>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'image',
            attr: { src: 'path/to/A.png' }
          }, {
            type: 'image',
            attr: { src: 'path/to/B.png' }
          }]
        }
      })
    })

    it('with width and height', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <image
            style="width:150px;height:150px;"
            src="path/to/profile.png">
          </image>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'image',
            style: { width: 150, height: 150 },
            attr: { src: 'path/to/profile.png' }
          }]
        }
      })
    })
  })

  describe('nested', () => {
    it('span', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span>AAA
            <span>
              <span>BBB</span>
              <span><span>CCC</span>DDD</span>
            </span>
          </span>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            children: [{
              type: 'span',
              attr: { value: 'AAA' }
            }, {
              type: 'span',
              children: [{
                type: 'span',
                attr: { value: 'BBB' }
              }, {
                type: 'span',
                children: [{
                  type: 'span',
                  attr: { value: 'CCC' }
                }, {
                  type: 'span',
                  attr: { value: 'DDD' }
                }]
              }]
            }]
          }]
        }
      })
    })

    it('image and a', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span>title</span>
          <a href="http://remote.com/xx.js">
            <span><span>name</span></span>
            <image src="path/to/yy.gif"></image>
          </a>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            attr: { value: 'title' }
          }, {
            type: 'a',
            attr: { href: 'http://remote.com/xx.js' },
            children: [{
              type: 'span',
              children: [{
                type: 'span',
                attr: { value: 'name' }
              }]
            }, {
              type: 'image',
              attr: { src: 'path/to/yy.gif' }
            }]
          }]
        }
      })
    })
  })

  describe('with styles', () => {
    it('inline', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span style="font-size:16px;color:#FF6600;">ABCD</span>
          <image style="width:33.33px;height:66.67px" src="path/to/A.png"></image>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            style: { fontSize: 16, color: '#FF6600' },
            attr: { value: 'ABCD' }
          }, {
            type: 'image',
            style: { width: 33.33, height: 66.67 },
            attr: { src: 'path/to/A.png' }
          }]
        }
      })
    })

    it('class list', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <image class="icon" src="path/to/A.png"></image>
          <span class="title large">ABCD</span>
        </richtext>
      `, `
        style: {
          title: { color: '#FF6600' },
          large: { fontSize: 24 },
          icon: { width: 40, height: 60 }
        }
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'image',
            style: { width: 40, height: 60 },
            attr: { src: 'path/to/A.png' }
          }, {
            type: 'span',
            style: { fontSize: 24, color: '#FF6600' },
            attr: { value: 'ABCD' }
          }]
        }
      })
    })
  })

  describe('data binding', () => {
    it('simple', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span>{{name}}</span>
        </richtext>
      `, `data: { name: 'ABCDEFG' }`)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            attr: { value: 'ABCDEFG' }
          }]
        }
      })
    })

    it('nested', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span>{{a}}</span>
          <span>{{b}}<span>{{c.d}}</span></span>
          <span>{{e}}</span>
        </richtext>
      `, `data: { a: 'A', b: 'B', c: { d: 'CD' }, e: 'E' }`))
      .toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            attr: { value: 'A' }
          }, {
            type: 'span',
            children: [{
              type: 'span',
              attr: { value: 'B' }
            }, {
              type: 'span',
              attr: { value: 'CD' }
            }]
          }, {
            type: 'span',
            attr: { value: 'E' }
          }]
        }
      })
    })

    it('update', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span>{{name}}</span>
        </richtext>
      `, `
        data: { name: 'default' },
        created: function () {
          this.name = 'updated'
        }
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            attr: { value: 'updated' }
          }]
        }
      })
    })

    it('attribute', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span :label="label">{{name}}</span>
        </richtext>
      `, `
        data: {
          label: 'uid',
          name: '10100'
        }
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            attr: {
              label: 'uid',
              value: '10100'
            }
          }]
        }
      })
    })

    it('update attribute', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span :label="label">{{name}}</span>
        </richtext>
      `, `
        data: {
          label: 'name',
          name: 'Hanks'
        },
        created: function () {
          this.label = 'uid';
          this.name = '10100';
        }
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            attr: {
              label: 'uid',
              value: '10100'
            }
          }]
        }
      })
    })

    it('inline style', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span :style="styleObject">ABCD</span>
          <span :style="{ textAlign: align, color: 'red' }">EFGH</span>
        </richtext>
      `, `
        data: {
          styleObject: { fontSize: '32px', color: '#F6F660' },
          align: 'center'
        }
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            style: { fontSize: 32, color: '#F6F660' },
            attr: { value: 'ABCD' }
          }, {
            type: 'span',
            style: { textAlign: 'center', color: 'red' },
            attr: { value: 'EFGH' }
          }]
        }
      })
    })

    it('class list', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <image :class="classList" src="path/to/A.png"></image>
          <span :class="['title', size]">ABCD</span>
          <span class="large" style="color:#F6F0F4">EFGH</span>
        </richtext>
      `, `
        style: {
          title: { color: '#FF6600' },
          large: { fontSize: 24 },
          icon: { width: 40, height: 60 }
        },
        data: {
          classList: ['unknown'],
          size: 'small'
        },
        created: function () {
          this.classList = ['icon'];
          this.size = 'large';
        }
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'image',
            style: { width: 40, height: 60 },
            attr: { src: 'path/to/A.png' }
          }, {
            type: 'span',
            style: { fontSize: 24, color: '#FF6600' },
            attr: { value: 'ABCD' }
          }, {
            type: 'span',
            style: { fontSize: 24, color: '#F6F0F4' },
            attr: { value: 'EFGH' }
          }]
        }
      })
    })

    it('update inline style', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span :style="styleObject">ABCD</span>
          <span :style="{ textAlign: align, color: 'red' }">EFGH</span>
        </richtext>
      `, `
        data: {
          styleObject: { fontSize: '32px', color: '#F6F660' }
        },
        created: function () {
          this.styleObject = { fontSize: '24px', color: 'blue' }
          this.styleObject.color = '#ABCDEF'
          this.align = 'left'
        }
      `)).toEqual({
        type: 'richtext',
        attr: {
          value: [{
            type: 'span',
            style: { fontSize: 24, color: '#ABCDEF' },
            attr: { value: 'ABCD' }
          }, {
            type: 'span',
            style: { textAlign: 'left', color: 'red' },
            attr: { value: 'EFGH' }
          }]
        }
      })
    })
  })

  describe('itself', () => {
    it('inline styles', () => {
      expect(compileSnippet(runtime, `
        <richtext style="background-color:red">
          <span>empty</span>
        </richtext>
      `)).toEqual({
        type: 'richtext',
        style: { backgroundColor: 'red' },
        attr: {
          value: [{
            type: 'span',
            attr: { value: 'empty' }
          }]
        }
      })
    })

    it('class list', () => {
      expect(compileSnippet(runtime, `
        <richtext class="title">
          <span class="large">ABCD</span>
        </richtext>
      `, `
        style: {
          title: { backgroundColor: '#FF6600', height: 200 },
          large: { fontSize: 24 }
        }
      `)).toEqual({
        type: 'richtext',
        style: { backgroundColor: '#FF6600', height: 200 },
        attr: {
          value: [{
            type: 'span',
            style: { fontSize: 24 },
            attr: { value: 'ABCD' }
          }]
        }
      })
    })

    it('update styles', () => {
      expect(compileSnippet(runtime, `
        <richtext :class="classList" :style="{ backgroundColor: color }">
          <span class="large">ABCD</span>
        </richtext>
      `, `
        data: { classList: ['unknow'], color: '#FF6600' },
        style: {
          title: { height: 200 },
          large: { fontSize: 24 }
        },
        created: function () {
          this.classList = ['title']
        }
      `)).toEqual({
        type: 'richtext',
        style: { backgroundColor: '#FF6600', height: 200 },
        attr: {
          value: [{
            type: 'span',
            style: { fontSize: 24 },
            attr: { value: 'ABCD' }
          }]
        }
      })
    })

    it('bind events', (done) => {
      const { render, staticRenderFns } = compileAndStringify(`
        <div>
          <richtext @click="handler">
            <span>Label: {{label}}</span>
          </richtext>
        </div>
      `)
      const instance = createInstance(runtime, `
        new Vue({
          el: 'body',
          render: ${render},
          staticRenderFns: ${staticRenderFns},
          data: { label: 'AAA' },
          methods: {
            handler: function () {
              this.label = 'BBB'
            }
          }
        })
      `)
      const richtext = instance.doc.body.children[0]
      instance.$fireEvent(richtext.ref, 'click', {})
      setTimeout(() => {
        expect(instance.getRealRoot().children[0]).toEqual({
          type: 'richtext',
          event: ['click'],
          attr: {
            value: [{
              type: 'span',
              attr: { value: 'Label: BBB' }
            }]
          }
        })
        done()
      }, 0)
    })

    it('v-for', () => {
      expect(compileSnippet(runtime, `
        <div>
          <richtext v-for="k in labels">
            <span>{{k}}</span>
          </richtext>
        </div>
      `, `
        data: {
          labels: ['A', 'B', 'C']
        }
      `)).toEqual({
        type: 'div',
        children: [{
          type: 'richtext',
          attr: { value: [{ type: 'span', attr: { value: 'A' }}] }
        }, {
          type: 'richtext',
          attr: { value: [{ type: 'span', attr: { value: 'B' }}] }
        }, {
          type: 'richtext',
          attr: { value: [{ type: 'span', attr: { value: 'C' }}] }
        }]
      })
    })
  })
})
