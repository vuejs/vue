import { compile } from '../../../packages/weex-template-compiler'

describe('compile class', () => {
  it('should be compiled', () => {
    const { render, staticRenderFns, errors } = compile(`<div class="a b c"></div>`)
    expect(render).not.toBeUndefined()
    expect(staticRenderFns).not.toBeUndefined()
    expect(staticRenderFns.length).toEqual(1)
    expect(staticRenderFns).toMatch(/staticClass\:\["a","b","c"\]/)
    expect(errors).toEqual([])
  })

  it('should compile dynamic class', () => {
    const { render, staticRenderFns, errors } = compile(`<div class="a {{b}} c"></div>`)
    expect(render).not.toBeUndefined()
    expect(staticRenderFns).toEqual([])
    expect(render).toMatch(/class\:\["a",_s\(b\),"c"\]/)
    expect(errors).not.toBeUndefined()
    expect(errors.length).toEqual(1)
    expect(errors[0]).toMatch(/a \{\{b\}\} c/)
    expect(errors[0]).toMatch(/v\-bind/)
  })

  it('should compile class binding of array', () => {
    const { render, staticRenderFns, errors } = compile(`<div v-bind:class="['a', 'b', c]"></div>`)
    expect(render).not.toBeUndefined()
    expect(staticRenderFns).toEqual([])
    expect(render).toMatch(/class\:\['a', 'b', c\]/)
    expect(errors).toEqual([])
  })

  it('should compile class binding of map', () => {
    const { render, staticRenderFns, errors } = compile(`<div v-bind:class="{ a: true, b: x }"></div>`)
    expect(render).not.toBeUndefined()
    expect(staticRenderFns).toEqual([])
    expect(render).toMatch(/class\:\{ a\: true, b\: x \}/)
    expect(errors).toEqual([])
  })

  it('should compile class binding of a variable', () => {
    const { render, staticRenderFns, errors } = compile(`<div v-bind:class="x"></div>`)
    expect(render).not.toBeUndefined()
    expect(staticRenderFns).toEqual([])
    expect(render).toMatch(/class\:x/)
    expect(errors).toEqual([])
  })

  it('should compile class binding by shorthand', () => {
    const { render, staticRenderFns, errors } = compile(`<div :class="['a', 'b', c]"></div>`)
    expect(render).not.toBeUndefined()
    expect(staticRenderFns).toEqual([])
    expect(render).toMatch(/class\:\['a', 'b', c\]/)
    expect(errors).toEqual([])
  })
})
