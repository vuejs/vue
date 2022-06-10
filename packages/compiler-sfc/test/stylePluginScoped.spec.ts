import { compileStyle } from '../src/compileStyle'

// vue-loader/#1370
test('spaces after selector', () => {
  const { code } = compileStyle({
    source: `.foo , .bar { color: red; }`,
    filename: 'test.css',
    id: 'test'
  })

  expect(code).toMatch(`.foo[test], .bar[test] { color: red;`)
})

test('leading deep selector', () => {
  const { code } = compileStyle({
    source: `>>> .foo { color: red; }`,
    filename: 'test.css',
    id: 'test'
  })

  expect(code).toMatch(`[test] .foo { color: red;`)
})

test('scoped css', () => {
  const { code: style } = compileStyle({
    id: 'v-scope-xxx',
    scoped: true,
    filename: 'example.vue',
    source: `
.test {
  color: yellow;
}
.test:after {
  content: 'bye!';
}
h1 {
  color: green;
}
.anim {
  animation: color 5s infinite, other 5s;
}
.anim-2 {
  animation-name: color;
  animation-duration: 5s;
}
.anim-3 {
  animation: 5s color infinite, 5s other;
}
.anim-multiple {
  animation: color 5s infinite, opacity 2s;
}
.anim-multiple-2 {
  animation-name: color, opacity;
  animation-duration: 5s, 2s;
}

@keyframes color {
  from { color: red; }
  to { color: green; }
}
@-webkit-keyframes color {
  from { color: red; }
  to { color: green; }
}
@keyframes opacity {
  from { opacity: 0; }
  to { opacity: 1; }
}
@-webkit-keyframes opacity {
  from { opacity: 0; }
  to { opacity: 1; }
}
.foo p >>> .bar {
  color: red;
}
.foo div /deep/ .bar {
  color: red;
}

.foo span ::v-deep .bar {
  color: red;
}
`
  })

  expect(style).toContain(`.test[v-scope-xxx] {\n  color: yellow;\n}`)
  expect(style).toContain(`.test[v-scope-xxx]:after {\n  content: \'bye!\';\n}`)
  expect(style).toContain(`h1[v-scope-xxx] {\n  color: green;\n}`)
  // scoped keyframes
  expect(style).toContain(
    `.anim[v-scope-xxx] {\n  animation: color-v-scope-xxx 5s infinite, other 5s;`
  )
  expect(style).toContain(
    `.anim-2[v-scope-xxx] {\n  animation-name: color-v-scope-xxx`
  )
  expect(style).toContain(
    `.anim-3[v-scope-xxx] {\n  animation: 5s color-v-scope-xxx infinite, 5s other;`
  )
  expect(style).toContain(`@keyframes color-v-scope-xxx {`)
  expect(style).toContain(`@-webkit-keyframes color-v-scope-xxx {`)

  expect(style).toContain(
    `.anim-multiple[v-scope-xxx] {\n  animation: color-v-scope-xxx 5s infinite,opacity-v-scope-xxx 2s;`
  )
  expect(style).toContain(
    `.anim-multiple-2[v-scope-xxx] {\n  animation-name: color-v-scope-xxx,opacity-v-scope-xxx;`
  )
  expect(style).toContain(`@keyframes opacity-v-scope-xxx {`)
  expect(style).toContain(`@-webkit-keyframes opacity-v-scope-xxx {`)
  // >>> combinator
  expect(style).toContain(`.foo p[v-scope-xxx] .bar {\n  color: red;\n}`)
  // /deep/ alias for >>>
  expect(style).toContain(`.foo div[v-scope-xxx] .bar {\n  color: red;\n}`)
  // ::-v-deep alias for >>>
  expect(style).toContain(`.foo span[v-scope-xxx] .bar {\n  color: red;\n}`)
})

test('pseudo element', () => {
  const { code } = compileStyle({
    source: '::selection { display: none; }',
    filename: 'test.css',
    id: 'test'
  })

  expect(code).toContain('[test]::selection {')
})

test('spaces before pseudo element', () => {
  const { code } = compileStyle({
    source: '.abc, ::selection { color: red; }',
    filename: 'test.css',
    id: 'test'
  })

  expect(code).toContain('.abc[test],')
  expect(code).toContain('[test]::selection {')
})
