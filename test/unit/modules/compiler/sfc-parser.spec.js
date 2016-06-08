import { parseSFC } from 'compiler/parser/sfc-parser'

describe('SFC parser', () => {
  it('should parse', () => {
    const res = parseSFC(`
      <template>
        <div>hi</div>
      </template>
      <style src="./test.css"></style>
      <style lang="stylus" scoped>
        h1
          color red
        h2
          color green
      </style>
      <script>
        export default {}
      </script>
    `)
    expect(res.template.content.trim()).toBe('<div>hi</div>')
    expect(res.styles.length).toBe(2)
    expect(res.styles[0].src).toBe('./test.css')
    expect(res.styles[1].lang).toBe('stylus')
    expect(res.styles[1].scoped).toBe(true)
    expect(res.styles[1].content.trim()).toBe('h1\n  color red\nh2\n  color green')
    expect(res.script.content.trim()).toBe('export default {}')
  })
})
