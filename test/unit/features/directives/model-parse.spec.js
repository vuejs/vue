import { parseModel } from 'compiler/helpers'

describe('model expression parser', () => {
  it('parse string in brackets', () => {
    const res = parseModel('a["b"][c]')
    expect(res.exp).toBe('a["b"]')
    expect(res.idx).toBe('c')
  })

  it('parse nested brackets', () => {
    const res = parseModel('a[i[c]]')
    expect(res.exp).toBe('a')
    expect(res.idx).toBe('i[c]')
  })

  it('combined', () => {
    const res = parseModel('test.xxx.a["asa"][test1[idx]]')
    expect(res.exp).toBe('test.xxx.a["asa"]')
    expect(res.idx).toBe('test1[idx]')
  })
})
