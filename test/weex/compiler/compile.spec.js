import { compile } from '../../../packages/weex-template-compiler'

describe('compile basic', () => {
  it('should be compiled', () => {
    const { render, staticRenderFns, errors } = compile(`<div>{{hi}}</div>`)
    expect(render).toEqual(`with(this){return _c('div',[_v(_s(hi))])}`)
    expect(staticRenderFns.length).toBe(0)
    expect(errors).toEqual([])
  })

  it('should compile data bindings', () => {
    const { render, staticRenderFns, errors } = compile(`<div :a="b"></div>`)
    expect(render).toEqual(`with(this){return _c('div',{attrs:{"a":b}})}`)
    expect(staticRenderFns).toEqual([])
    expect(errors).toEqual([])
  })

  it('should compile event bindings', () => {
    const { render, staticRenderFns, errors } = compile(`<div @click="x"></div>`)
    expect(render).toEqual(`with(this){return _c('div',{on:{"click":x}})}`)
    expect(staticRenderFns).toEqual([])
    expect(errors).toEqual([])
  })

  it('should compile data bindings with children', () => {
    const { render, staticRenderFns, errors } = compile(`<foo :a="b"><text>Hello</text></foo>`)
    expect(render).toEqual(`with(this){return _c('foo',{attrs:{"a":b}},[_c('text',[_v("Hello")])])}`)
    expect(staticRenderFns).toEqual([])
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
    expect(render).toEqual(`with(this){return _c('refresh',{staticClass:["refresh"],staticStyle:{flexDirection:"row"},attrs:{"display":displayRefresh},on:{"refresh":handleRefresh}},[_c('loading-indicator'),_c('text',{staticStyle:{marginLeft:"36px",color:"#eee"}},[_v("Load more...")])],1)}`)
    expect(staticRenderFns).toEqual([])
    expect(errors).toEqual([])
  })
})
