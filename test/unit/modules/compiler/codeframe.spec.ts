import { generateCodeFrame } from 'compiler/codeframe'

describe('codeframe', () => {
  const source = `
<div>
  <template key="one"></template>
  <ul>
    <li v-for="foobar">hi</li>
  </ul>
  <template key="two"></template>
</div>
    `.trim()

  it('line near top', () => {
    const keyStart = source.indexOf(`key="one"`)
    const keyEnd = keyStart + `key="one"`.length
    expect(generateCodeFrame(source, keyStart, keyEnd)).toBe(
      `
1  |  <div>
2  |    <template key="one"></template>
   |              ^^^^^^^^^
3  |    <ul>
4  |      <li v-for="foobar">hi</li>
    `.trim()
    )
  })

  it('line in middle', () => {
    // should cover 5 lines
    const forStart = source.indexOf(`v-for=`)
    const forEnd = forStart + `v-for="foobar"`.length
    expect(generateCodeFrame(source, forStart, forEnd)).toBe(
      `
2  |    <template key="one"></template>
3  |    <ul>
4  |      <li v-for="foobar">hi</li>
   |          ^^^^^^^^^^^^^^
5  |    </ul>
6  |    <template key="two"></template>
    `.trim()
    )
  })

  it('line near bottom', () => {
    const keyStart = source.indexOf(`key="two"`)
    const keyEnd = keyStart + `key="two"`.length
    expect(generateCodeFrame(source, keyStart, keyEnd)).toBe(
      `
4  |      <li v-for="foobar">hi</li>
5  |    </ul>
6  |    <template key="two"></template>
   |              ^^^^^^^^^
7  |  </div>
    `.trim()
    )
  })

  it('multi-line highlights', () => {
    const source = `
<div attr="some
  multiline
attr
">
</div>
    `.trim()

    const attrStart = source.indexOf(`attr=`)
    const attrEnd = source.indexOf(`">`) + 1
    expect(generateCodeFrame(source, attrStart, attrEnd)).toBe(
      `
1  |  <div attr="some
   |       ^^^^^^^^^^
2  |    multiline
   |  ^^^^^^^^^^^
3  |  attr
   |  ^^^^
4  |  ">
   |  ^
    `.trim()
    )
  })
})
