import { MarkdownPage } from '../page-models'

fixture `Markdown`
    .page('http://localhost:8080/examples/markdown/')

const page = new MarkdownPage()
const { src, result } = page

test('markdown', async t => {
    await t
        .expect(src.value).eql('# hello')
        .expect(page.result.innerHTML).contains('<h1 id="hello">hello</h1>')

        .typeText(src, '\n## foo\n\n- bar\n- baz', { replace: true })
        .expect(result.innerHTML).contains('<h1 id="hello">hello</h1>')
        .expect(result.innerHTML).contains(
            '<h2 id="foo">foo</h2>\n' +
            '<ul>\n<li>bar</li>\n<li>baz</li>\n</ul>'
        )
})
