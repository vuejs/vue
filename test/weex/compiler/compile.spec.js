import { compile } from '../../../packages/weex-template-compiler'

describe('compile class', () => {
  it('should be compiled', () => {
    const { render, staticRenderFns, errors } = compile(`<div></div>`)
    expect(render).toEqual(`with(this){return _m(0)}`)
    expect(staticRenderFns).toEqual([`with(this){return _h('div')}`])
    expect(errors).toEqual([])
  })

  it('should compile data bindings', () => {
    const { render, staticRenderFns, errors } = compile(`<div :a="b"></div>`)
    expect(render).toEqual(`with(this){return _h('div',{attrs:{"a":b}})}`)
    expect(staticRenderFns).toEqual([])
    expect(errors).toEqual([])
  })

  it('should compile event bindings', () => {
    const { render, staticRenderFns, errors } = compile(`<div @click="x"></div>`)
    expect(render).toEqual(`with(this){return _h('div',{on:{"click":x}})}`)
    expect(staticRenderFns).toEqual([])
    expect(errors).toEqual([])
  })

  it('should compile data bindings with children', () => {
    const { render, staticRenderFns, errors } = compile(`<foo :a="b"><text>Hello</text></foo>`)
    expect(render).toEqual(`with(this){return _h('foo',{attrs:{"a":b}},[_h('text',["Hello"])])}`)
    expect(errors).toEqual([])
  })

  it('should compile more complex situation', () => {
    // from examples of https://github.com/alibaba/weex
    const { render, staticRenderFns, errors } = compile(`
      <refresh class="refresh" @refresh="handleRefresh" :display="displayRefresh"
        style="flex-direction:row;">
        <loading-indicator></loading-indicator>
        <text style="margin-left:36px;color:#eee;">Load more...</text>
      </refresh>
    `)
    expect(render).toEqual(`with(this){return _h('refresh',{staticClass:["refresh"],staticStyle:{flexDirection:"row"},attrs:{"display":displayRefresh},on:{"refresh":handleRefresh}},[_h('loading-indicator'),_h('text',{staticStyle:{marginLeft:"36px",color:"#eee"}},["Load more..."])])}`)
    expect(errors).toEqual([])
  })
})
