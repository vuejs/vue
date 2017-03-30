import Vue from '../../dist/vue.runtime.common.js'
import VM from 'vm'
import { createRenderer } from '../../packages/vue-server-renderer'
const { renderToString } = createRenderer()

describe('SSR: renderToString', () => {
  it('static attributes', done => {
    renderVmWithOptions({
      template: '<div id="foo" bar="123"></div>'
    }, result => {
      expect(result).toContain('<div id="foo" bar="123" data-server-rendered="true"></div>')
      done()
    })
  })

  it('unary tags', done => {
    renderVmWithOptions({
      template: '<input value="123">'
    }, result => {
      expect(result).toContain('<input value="123" data-server-rendered="true">')
      done()
    })
  })

  it('dynamic attributes', done => {
    renderVmWithOptions({
      template: '<div qux="quux" :id="foo" :bar="baz"></div>',
      data: {
        foo: 'hi',
        baz: 123
      }
    }, result => {
      expect(result).toContain('<div qux="quux" id="hi" bar="123" data-server-rendered="true"></div>')
      done()
    })
  })

  it('static class', done => {
    renderVmWithOptions({
      template: '<div class="foo bar"></div>'
    }, result => {
      expect(result).toContain('<div data-server-rendered="true" class="foo bar"></div>')
      done()
    })
  })

  it('dynamic class', done => {
    renderVmWithOptions({
      template: '<div class="foo bar" :class="[a, { qux: hasQux, quux: hasQuux }]"></div>',
      data: {
        a: 'baz',
        hasQux: true,
        hasQuux: false
      }
    }, result => {
      expect(result).toContain('<div data-server-rendered="true" class="foo bar baz qux"></div>')
      done()
    })
  })

  it('custom component class', done => {
    renderVmWithOptions({
      template: '<div><cmp class="cmp"></cmp></div>',
      components: {
        cmp: {
          render: h => h('div', 'test')
        }
      }
    }, result => {
      expect(result).toContain('<div data-server-rendered="true"><div class="cmp">test</div></div>')
      done()
    })
  })

  it('nested component class', done => {
    renderVmWithOptions({
      template: '<cmp class="outer" :class="cls"></cmp>',
      data: { cls: { 'success': 1 }},
      components: {
        cmp: {
          render: h => h('div', [h('nested', { staticClass: 'nested', 'class': { 'error': 1 }})]),
          components: {
            nested: {
              render: h => h('div', { staticClass: 'inner' }, 'test')
            }
          }
        }
      }
    }, result => {
      expect(result).toContain('<div data-server-rendered="true" class="outer success">' +
          '<div class="inner nested error">test</div>' +
        '</div>')
      done()
    })
  })

  it('dynamic style', done => {
    renderVmWithOptions({
      template: '<div style="background-color:black" :style="{ fontSize: fontSize + \'px\', color: color }"></div>',
      data: {
        fontSize: 14,
        color: 'red'
      }
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true" style="background-color:black;font-size:14px;color:red;"></div>'
      )
      done()
    })
  })

  it('dynamic string style', done => {
    renderVmWithOptions({
      template: '<div :style="style"></div>',
      data: {
        style: 'color:red'
      }
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true" style="color:red;"></div>'
      )
      done()
    })
  })

  it('custom component style', done => {
    renderVmWithOptions({
      template: '<section><comp :style="style"></comp></section>',
      data: {
        style: 'color:red'
      },
      components: {
        comp: {
          template: '<div></div>'
        }
      }
    }, result => {
      expect(result).toContain(
        '<section data-server-rendered="true"><div style="color:red;"></div></section>'
      )
      done()
    })
  })

  it('nested custom component style', done => {
    renderVmWithOptions({
      template: '<comp style="color: blue" :style="style"></comp>',
      data: {
        style: 'color:red'
      },
      components: {
        comp: {
          template: '<nested style="text-align: left;" :style="{fontSize:\'520rem\'}"></nested>',
          components: {
            nested: {
              template: '<div></div>'
            }
          }
        }
      }
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true" style="text-align:left;font-size:520rem;color:red;"></div>'
      )
      done()
    })
  })

  it('component style not passed to child', done => {
    renderVmWithOptions({
      template: '<comp :style="style"></comp>',
      data: {
        style: 'color:red'
      },
      components: {
        comp: {
          template: '<div><div></div></div>'
        }
      }
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true" style="color:red;"><div></div></div>'
      )
      done()
    })
  })

  it('component style not passed to slot', done => {
    renderVmWithOptions({
      template: '<comp :style="style"><span style="color:black"></span></comp>',
      data: {
        style: 'color:red'
      },
      components: {
        comp: {
          template: '<div><slot></slot></div>'
        }
      }
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true" style="color:red;"><span style="color:black;"></span></div>'
      )
      done()
    })
  })

  it('attrs merging on components', done => {
    const Test = {
      render: h => h('div', {
        attrs: { id: 'a' }
      })
    }
    renderVmWithOptions({
      render: h => h(Test, {
        attrs: { id: 'b', name: 'c' }
      })
    }, res => {
      expect(res).toContain(
        '<div id="b" data-server-rendered="true" name="c"></div>'
      )
      done()
    })
  })

  it('domProps merging on components', done => {
    const Test = {
      render: h => h('div', {
        domProps: { innerHTML: 'a' }
      })
    }
    renderVmWithOptions({
      render: h => h(Test, {
        domProps: { innerHTML: 'b', value: 'c' }
      })
    }, res => {
      expect(res).toContain(
        '<div data-server-rendered="true" value="c">b</div>'
      )
      done()
    })
  })

  it('v-show directive render', done => {
    renderVmWithOptions({
      template: '<div v-show="false"><span>inner</span></div>'
    }, res => {
      expect(res).toContain(
        '<div data-server-rendered="true" style="display:none;"><span>inner</span></div>'
      )
      done()
    })
  })

  it('v-show directive not passed to child', done => {
    renderVmWithOptions({
      template: '<foo v-show="false"></foo>',
      components: {
        foo: {
          template: '<div><span>inner</span></div>'
        }
      }
    }, res => {
      expect(res).toContain(
        '<div data-server-rendered="true" style="display:none;"><span>inner</span></div>'
      )
      done()
    })
  })

  it('v-show directive not passed to slot', done => {
    renderVmWithOptions({
      template: '<foo v-show="false"><span>inner</span></foo>',
      components: {
        foo: {
          template: '<div><slot></slot></div>'
        }
      }
    }, res => {
      expect(res).toContain(
        '<div data-server-rendered="true" style="display:none;"><span>inner</span></div>'
      )
      done()
    })
  })

  it('v-show directive merging on components', done => {
    renderVmWithOptions({
      template: '<foo v-show="false"></foo>',
      components: {
        foo: {
          render: h => h('bar', {
            directives: [{
              name: 'show',
              value: true
            }]
          }),
          components: {
            bar: {
              render: h => h('div', 'inner')
            }
          }
        }
      }
    }, res => {
      expect(res).toContain(
        '<div data-server-rendered="true" style="display:none;">inner</div>'
      )
      done()
    })
  })

  it('text interpolation', done => {
    renderVmWithOptions({
      template: '<div>{{ foo }} side {{ bar }}</div>',
      data: {
        foo: 'server',
        bar: '<span>rendering</span>'
      }
    }, result => {
      expect(result).toContain('<div data-server-rendered="true">server side &lt;span&gt;rendering&lt;/span&gt;</div>')
      done()
    })
  })

  it('v-html', done => {
    renderVmWithOptions({
      template: '<div v-html="text"></div>',
      data: {
        text: '<span>foo</span>'
      }
    }, result => {
      expect(result).toContain('<div data-server-rendered="true"><span>foo</span></div>')
      done()
    })
  })

  it('v-text', done => {
    renderVmWithOptions({
      template: '<div v-text="text"></div>',
      data: {
        text: '<span>foo</span>'
      }
    }, result => {
      expect(result).toContain('<div data-server-rendered="true">&lt;span&gt;foo&lt;/span&gt;</div>')
      done()
    })
  })

  it('child component (hoc)', done => {
    renderVmWithOptions({
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
    }, result => {
      expect(result).toContain('<div data-server-rendered="true" class="foo bar">hello bar</div>')
      done()
    })
  })

  it('has correct lifecycle during render', done => {
    let lifecycleCount = 1
    renderVmWithOptions({
      template: '<div><span>{{ val }}</span><test></test></div>',
      data: {
        val: 'hi'
      },
      beforeCreate () {
        expect(lifecycleCount++).toBe(1)
      },
      created () {
        this.val = 'hello'
        expect(this.val).toBe('hello')
        expect(lifecycleCount++).toBe(2)
      },
      components: {
        test: {
          beforeCreate () {
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
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true">' +
          '<span>hello</span>' +
          '<span class="b">testAsync</span>' +
        '</div>'
      )
      done()
    })
  })

  it('computed properties', done => {
    renderVmWithOptions({
      template: '<div>{{ b }}</div>',
      data: {
        a: {
          b: 1
        }
      },
      computed: {
        b () {
          return this.a.b + 1
        }
      },
      created () {
        this.a.b = 2
        expect(this.b).toBe(3)
      }
    }, result => {
      expect(result).toContain('<div data-server-rendered="true">3</div>')
      done()
    })
  })

  it('renders asynchronous component', done => {
    renderVmWithOptions({
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
    }, result => {
      expect(result).toContain('<div data-server-rendered="true"><span class="b">testAsync</span></div>')
      done()
    })
  })

  it('renders asynchronous component (hoc)', done => {
    renderVmWithOptions({
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
    }, result => {
      expect(result).toContain('<span data-server-rendered="true" class="b">testAsync</span>')
      done()
    })
  })

  it('renders nested asynchronous component', done => {
    renderVmWithOptions({
      template: `
        <div>
          <test-async></test-async>
        </div>
      `,
      components: {
        testAsync (resolve) {
          const options = {
            template: `
              <span class="b">
                <test-sub-async></test-sub-async>
              </span>
            `
          }

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
    }, result => {
      expect(result).toContain('<div data-server-rendered="true"><span class="b"><div class="c">testSubAsync</div></span></div>')
      done()
    })
  })

  it('everything together', done => {
    renderVmWithOptions({
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
    }, result => {
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

  it('normal attr', done => {
    renderVmWithOptions({
      template: `
        <div>
          <span :test="'ok'">hello</span>
          <span :test="null">hello</span>
          <span :test="false">hello</span>
          <span :test="true">hello</span>
          <span :test="0">hello</span>
        </div>
      `
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true">' +
          '<span test="ok">hello</span> ' +
          '<span>hello</span> ' +
          '<span>hello</span> ' +
          '<span test="true">hello</span> ' +
          '<span test="0">hello</span>' +
        '</div>'
      )
      done()
    })
  })

  it('enumerated attr', done => {
    renderVmWithOptions({
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
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true">' +
          '<span draggable="true">hello</span> ' +
          '<span draggable="true">hello</span> ' +
          '<span draggable="false">hello</span> ' +
          '<span draggable="false">hello</span> ' +
          '<span draggable="true">hello</span> ' +
          '<span draggable="false">hello</span>' +
        '</div>'
      )
      done()
    })
  })

  it('boolean attr', done => {
    renderVmWithOptions({
      template: `
        <div>
          <span :disabled="true">hello</span>
          <span :disabled="'ok'">hello</span>
          <span :disabled="null">hello</span>
          <span :disabled="''">hello</span>
        </div>
      `
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true">' +
          '<span disabled="disabled">hello</span> ' +
          '<span disabled="disabled">hello</span> ' +
          '<span>hello</span> ' +
          '<span disabled="disabled">hello</span>' +
        '</div>'
      )
      done()
    })
  })

  it('v-bind object', done => {
    renderVmWithOptions({
      data: {
        test: { id: 'a', class: ['a', 'b'], value: 'c' }
      },
      template: '<input v-bind="test">'
    }, result => {
      expect(result).toContain('<input id="a" data-server-rendered="true" value="c" class="a b">')
      done()
    })
  })

  it('custom directives', done => {
    const renderer = createRenderer({
      directives: {
        'class-prefixer': (node, dir) => {
          if (node.data.class) {
            node.data.class = `${dir.value}-${node.data.class}`
          }
          if (node.data.staticClass) {
            node.data.staticClass = `${dir.value}-${node.data.staticClass}`
          }
        }
      }
    })
    renderer.renderToString(new Vue({
      render () {
        const h = this.$createElement
        return h('p', {
          class: 'class1',
          staticClass: 'class2',
          directives: [{
            name: 'class-prefixer',
            value: 'my'
          }]
        }, ['hello world'])
      }
    }), (err, result) => {
      expect(err).toBeNull()
      expect(result).toContain('<p data-server-rendered="true" class="my-class2 my-class1">hello world</p>')
      done()
    })
  })

  it('_scopeId', done => {
    renderVmWithOptions({
      _scopeId: '_v-parent',
      template: '<div id="foo"><p><child></child></p></div>',
      components: {
        child: {
          _scopeId: '_v-child',
          render () {
            const h = this.$createElement
            return h('div', null, [h('span', null, ['foo'])])
          }
        }
      }
    }, result => {
      expect(result).toContain(
        '<div id="foo" data-server-rendered="true" _v-parent>' +
          '<p _v-parent>' +
            '<div _v-child _v-parent><span _v-child>foo</span></div>' +
          '</p>' +
        '</div>'
      )
      done()
    })
  })

  it('_scopeId on slot content', done => {
    renderVmWithOptions({
      _scopeId: '_v-parent',
      template: '<div><child><p>foo</p></child></div>',
      components: {
        child: {
          _scopeId: '_v-child',
          render () {
            const h = this.$createElement
            return h('div', null, this.$slots.default)
          }
        }
      }
    }, result => {
      expect(result).toContain(
        '<div data-server-rendered="true" _v-parent>' +
          '<div _v-child _v-parent><p _v-child _v-parent>foo</p></div>' +
        '</div>'
      )
      done()
    })
  })

  it('comment nodes', done => {
    renderVmWithOptions({
      template: '<div><transition><div v-if="false"></div></transition></div>'
    }, result => {
      expect(result).toContain(`<div data-server-rendered="true"><!----></div>`)
      done()
    })
  })

  it('should catch error', done => {
    Vue.config.silent = true
    renderToString(new Vue({
      render () {
        throw new Error('oops')
      }
    }), err => {
      expect(err instanceof Error).toBe(true)
      Vue.config.silent = false
      done()
    })
  })

  it('default value Foreign Function', () => {
    const FunctionConstructor = VM.runInNewContext('Function')
    const func = () => 123
    const vm = new Vue({
      props: {
        a: {
          type: FunctionConstructor,
          default: func
        }
      },
      propsData: {
        a: undefined
      }
    })
    expect(vm.a).toBe(func)
  })
})

function renderVmWithOptions (options, cb) {
  renderToString(new Vue(options), (err, res) => {
    expect(err).toBeNull()
    cb(res)
  })
}
