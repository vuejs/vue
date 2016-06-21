import { parseComponent } from 'sfc/parser'

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

  it('should parse template with closed input', () => {
    const res = parseComponent(`
      <template>
        <input type="text"/>
      </template>
    `)

    expect(res.template.content.trim()).toBe('<input type="text"/>')
  })

  it('should handle nested template', () => {
    const res = parseComponent(`
      <template>
        <div><template v-if="ok">hi</template></div>
      </template>
    `)
    expect(res.template.content.trim()).toBe('<div><template v-if="ok">hi</template></div>')
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
})
