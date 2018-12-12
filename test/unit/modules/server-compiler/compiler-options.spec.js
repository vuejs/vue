import { ssrCompile } from 'web/server/compiler'

describe('ssrCompile options', () => {
  it('comments', () => {
    const compiled = ssrCompile(`
      <div>
        <!-- test comments -->
      </div>
    `, { comments: true })

    expect(compiled.render).toContain('<!-- test comments -->')
  })
})
