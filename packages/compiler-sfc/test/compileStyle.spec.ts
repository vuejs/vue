import { parse } from '../src/parse'
import { compileStyle, compileStyleAsync } from '../src/compileStyle'

test('preprocess less', () => {
  const style = parse({
    source:
      '<style lang="less">\n' +
      '@red: rgb(255, 0, 0);\n' +
      '.color { color: @red; }\n' +
      '</style>\n',
    filename: 'example.vue',
    sourceMap: true
  }).styles[0]

  const result = compileStyle({
    id: 'v-scope-xxx',
    filename: 'example.vue',
    source: style.content,
    map: style.map,
    scoped: false,
    preprocessLang: style.lang
  })

  expect(result.errors.length).toBe(0)
  expect(result.code).toEqual(expect.stringContaining('color: #ff0000;'))
  expect(result.map).toBeTruthy()
})

test('preprocess scss', () => {
  const style = parse({
    source:
      '<style lang="scss">\n' +
      '$red: red;\n' +
      '.color { color: $red; }\n' +
      '</style>\n',
    filename: 'example.vue',
    sourceMap: true
  }).styles[0]
  const result = compileStyle({
    id: 'v-scope-xxx',
    filename: 'example.vue',
    source: style.content,
    map: style.map,
    scoped: false,
    preprocessLang: style.lang
  })

  expect(result.errors.length).toBe(0)
  expect(result.code).toMatch('color: red;')
  expect(result.map).toBeTruthy()
})

test('preprocess sass', () => {
  const style = parse({
    source:
      '<style lang="sass">\n' +
      '$red: red\n' +
      '.color\n' +
      '   color: $red\n' +
      '</style>\n',
    filename: 'example.vue',
    sourceMap: true
  }).styles[0]
  const result = compileStyle({
    id: 'v-scope-xxx',
    filename: 'example.vue',
    source: style.content,
    map: style.map,
    scoped: false,
    preprocessLang: style.lang
  })

  expect(result.errors.length).toBe(0)
  expect(result.code).toMatch('color: red;')
  expect(result.map).toBeTruthy()
})

test('preprocess stylus', () => {
  const style = parse({
    source:
      '<style lang="styl">\n' +
      'red-color = rgb(255, 0, 0);\n' +
      '.color\n' +
      '   color: red-color\n' +
      '</style>\n',
    filename: 'example.vue',
    sourceMap: true
  }).styles[0]
  const result = compileStyle({
    id: 'v-scope-xxx',
    filename: 'example.vue',
    source: style.content,
    map: style.map,
    scoped: false,
    preprocessLang: style.lang
  })

  expect(result.errors.length).toBe(0)
  expect(result.code).toEqual(expect.stringContaining('color: #f00;'))
  expect(result.map).toBeTruthy()
})

test('custom postcss plugin', () => {
  const spy = vi.fn()

  compileStyle({
    id: 'v-scope-xxx',
    filename: 'example.vue',
    source: '.foo { color: red }',
    scoped: false,
    postcssPlugins: [require('postcss').plugin('test-plugin', () => spy)()]
  })

  expect(spy).toHaveBeenCalled()
})

test('custom postcss options', () => {
  const result = compileStyle({
    id: 'v-scope-xxx',
    filename: 'example.vue',
    source: '.foo { color: red }',
    scoped: false,
    postcssOptions: { random: 'foo' }
  })

  expect((result.rawResult as any).opts.random).toBe('foo')
})

test('async postcss plugin in sync mode', () => {
  const result = compileStyle({
    id: 'v-scope-xxx',
    filename: 'example.vue',
    source: '.foo { color: red }',
    scoped: false,
    postcssPlugins: [
      require('postcss').plugin(
        'test-plugin',
        () => async (result: any) => result
      )
    ]
  })

  expect(result.errors).toHaveLength(1)
})

test('async postcss plugin', async () => {
  const promise = compileStyleAsync({
    id: 'v-scope-xxx',
    filename: 'example.vue',
    source: '.foo { color: red }',
    scoped: false,
    postcssPlugins: [
      require('postcss').plugin(
        'test-plugin',
        () => async (result: any) => result
      )
    ]
  })

  expect(promise instanceof Promise).toBe(true)

  const result = await promise
  expect(result.errors).toHaveLength(0)
  expect(result.code).toEqual(expect.stringContaining('color: red'))
})

test('media query', () => {
  const result = compileStyle({
    id: 'v-scope-xxx',
    scoped: true,
    filename: 'example.vue',
    source: `
@media print {
  .foo {
    color: #000;
  }
}`
  })

  expect(result.errors).toHaveLength(0)
  expect(result.code).toContain(
    '@media print {\n.foo[v-scope-xxx] {\n    color: #000;\n}\n}'
  )
})

test('supports query', () => {
  const result = compileStyle({
    id: 'v-scope-xxx',
    scoped: true,
    filename: 'example.vue',
    source: `
@supports ( color: #000 ) {
  .foo {
    color: #000;
  }
}`
  })

  expect(result.errors).toHaveLength(0)
  expect(result.code).toContain(
    '@supports ( color: #000 ) {\n.foo[v-scope-xxx] {\n    color: #000;\n}\n}'
  )
})
