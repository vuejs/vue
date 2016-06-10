import { parseComponent } from 'compiler/parser/sfc-parser'
import { SourceMapConsumer } from 'source-map'

describe('Single File Component parser', () => {
  it('should parse', () => {
    const res = parseComponent(`
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
      <div>
        <style>nested should be ignored</style>
      </div>
    `)
    expect(res.template.content.trim()).toBe('<div>hi</div>')
    expect(res.styles.length).toBe(2)
    expect(res.styles[0].src).toBe('./test.css')
    expect(res.styles[1].lang).toBe('stylus')
    expect(res.styles[1].scoped).toBe(true)
    expect(res.styles[1].content.trim()).toBe('h1\n  color red\nh2\n  color green')
    expect(res.script.content.trim()).toBe('export default {}')
  })

  it('pad content', () => {
    const res = parseComponent(`
      <template>
        <div></div>
      </template>
      <script>
        export default {}
      </script>
      <style>
        h1 { color: red }
      </style>
    `.trim(), { pad: true })
    expect(res.script.content).toBe(Array(3 + 1).join('//\n') + '\nexport default {}\n')
    expect(res.styles[0].content).toBe(Array(6 + 1).join('\n') + '\nh1 { color: red }\n')
  })

  it('source map', () => {
    const res = parseComponent(`
      <script>
        export default {}
      </script>
      <style>
        h1 { color: red }
      </style>
    `.trim(), {
      pad: true,
      map: {
        filename: 'test.vue'
      }
    })
    const scriptConsumer = new SourceMapConsumer(res.script.map)
    const scriptPos = scriptConsumer.originalPositionFor({
      line: 2,
      column: 1
    })
    expect(scriptPos.line).toBe(2)

    const styleConsumer = new SourceMapConsumer(res.styles[0].map)
    const stylePos = styleConsumer.originalPositionFor({
      line: 5,
      column: 1
    })
    expect(stylePos.line).toBe(5)
  })
})
