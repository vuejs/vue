import {
  compileAndStringify,
  prepareRuntime,
  resetRuntime,
  createInstance
} from '../../helpers/index'

function compileSnippet (runtime, snippet) {
  const { render, staticRenderFns } = compileAndStringify(`<div>${snippet}</div>`)
  const instance = createInstance(runtime, `
    new Vue({
      render: ${render},
      staticRenderFns: ${staticRenderFns},
      el: 'body'
    })
  `)
  const result = instance.getRealRoot().children[0]
  return result
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
    // pending('work in progress')
    expect(compileSnippet(runtime, `
      <richtext></richtext>
    `)).toEqual({
      type: 'richtext'
    })
  })

  it('with single text node', () => {
    // pending('work in progress')
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
    // pending('work in progress')
    it('inline', () => {
      expect(compileSnippet(runtime, `
        <richtext>
          <span style="font-size:16px;color:#FF6600;">ABCD</span>
          <image style="width:40px;height:60px" src="path/to/A.png"></image>
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
            style: { width: 40, height: 60 },
            attr: { src: 'path/to/A.png' }
          }]
        }
      })
    })
  })
})
