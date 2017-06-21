import { compile } from '../../../packages/weex-template-compiler'
import { strToRegExp } from '../helpers/index'

describe('append props', () => {
  it('append="tree"', () => {
    const { render, staticRenderFns, errors } = compile(`<list><cell></cell></list>`)
    expect(render).not.toBeUndefined()
    expect(staticRenderFns).not.toBeUndefined()
    expect(staticRenderFns.length).toEqual(1)
    expect(staticRenderFns).toMatch(strToRegExp(`appendAsTree:true`))
    expect(staticRenderFns).toMatch(strToRegExp(`attrs:{"append":"tree"}`))
    expect(errors).toEqual([])
  })
})
