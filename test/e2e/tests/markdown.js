import { MarkdownPage } from '../page-models'
import { getInnerHtml } from '../testing-helpers'

fixture `Markdown`
    .page('http://localhost:8080/examples/markdown/')

const page = new MarkdownPage()
const { src, result } = page

test('markdown', async t => {
    await t
        .expect(src.value).eql('# hello')
        .expect(await getInnerHtml(page.result)).contains('<h1 id="hello">hello</h1>')

        .typeText(src, '\n## foo\n\n- bar\n- baz', { replace: true })
        .expect(await getInnerHtml(result)).contains('<h1 id="hello">hello</h1>')
        .expect(result.find('ul').exists).ok()
})
