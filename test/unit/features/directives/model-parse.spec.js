import { parseModel } from 'compiler/directives/model'

describe('model expression parser', () => {
  it('parse object dot notation', () => {
    const res = parseModel('a.b.c')
    expect(res.exp).toBe('a.b.c')
    expect(res.key).toBe(null)
  })

  it('parse string in brackets', () => {
    const res = parseModel('a["b"][c]')
    expect(res.exp).toBe('a["b"]')
    expect(res.key).toBe('c')
  })

  it('parse brackets with object dot notation', () => {
    const res = parseModel('a["b"][c].xxx')
    expect(res.exp).toBe('a["b"][c].xxx')
    expect(res.key).toBe(null)
  })

  it('parse nested brackets', () => {
    const res = parseModel('a[i[c]]')
    expect(res.exp).toBe('a')
    expect(res.key).toBe('i[c]')
  })

  it('combined', () => {
    const res = parseModel('test.xxx.a["asa"][test1[key]]')
    expect(res.exp).toBe('test.xxx.a["asa"]')
    expect(res.key).toBe('test1[key]')
  })
})
