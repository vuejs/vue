import { rewriteDefault } from '../src'

describe('compiler sfc: rewriteDefault', () => {
  test('without export default', () => {
    expect(rewriteDefault(`export  a = {}`, 'script')).toMatchInlineSnapshot(`
      "export  a = {}
      const script = {}"
    `)
  })

  test('rewrite export default', () => {
    expect(
      rewriteDefault(`export  default {}`, 'script')
    ).toMatchInlineSnapshot(`"const script = {}"`)
  })

  test('rewrite export named default', () => {
    expect(
      rewriteDefault(
        `const a = 1 \n export { a as b, a as default, a as c}`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "const a = 1 
       export { a as b,  a as c}
      const script = a"
    `)

    expect(
      rewriteDefault(
        `const a = 1 \n export { a as b, a as default    , a as c}`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "const a = 1 
       export { a as b,  a as c}
      const script = a"
    `)
  })

  test('w/ comments', async () => {
    expect(rewriteDefault(`// export default\nexport default {}`, 'script'))
      .toMatchInlineSnapshot(`
      "// export default
      const script = {}"
    `)
  })

  test('export named default multiline', () => {
    expect(
      rewriteDefault(`let App = {}\n export {\nApp as default\n}`, '_sfc_main')
    ).toMatchInlineSnapshot(`
      "let App = {}
       export {
      
      }
      const _sfc_main = App"
    `)
  })

  test('export named default multiline /w comments', () => {
    expect(
      rewriteDefault(
        `const a = 1 \n export {\n a as b,\n a as default,\n a as c}\n` +
          `// export { myFunction as default }`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "const a = 1 
       export {
       a as b,
       
       a as c}
      // export { myFunction as default }
      const script = a"
    `)

    expect(
      rewriteDefault(
        `const a = 1 \n export {\n a as b,\n a as default      ,\n a as c}\n` +
          `// export { myFunction as default }`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "const a = 1 
       export {
       a as b,
       
       a as c}
      // export { myFunction as default }
      const script = a"
    `)
  })

  test(`export { default } from '...'`, async () => {
    expect(
      rewriteDefault(`export { default, foo } from './index.js'`, 'script')
    ).toMatchInlineSnapshot(`
    "import { default as __VUE_DEFAULT__ } from './index.js'
    export {  foo } from './index.js'
    const script = __VUE_DEFAULT__"
    `)

    expect(
      rewriteDefault(`export { default    , foo } from './index.js'`, 'script')
    ).toMatchInlineSnapshot(`
    "import { default as __VUE_DEFAULT__ } from './index.js'
    export {  foo } from './index.js'
    const script = __VUE_DEFAULT__"
    `)

    expect(
      rewriteDefault(`export { foo,   default } from './index.js'`, 'script')
    ).toMatchInlineSnapshot(`
    "import { default as __VUE_DEFAULT__ } from './index.js'
    export { foo,    } from './index.js'
    const script = __VUE_DEFAULT__"
    `)

    expect(
      rewriteDefault(
        `export { foo as default, bar } from './index.js'`,
        'script'
      )
    ).toMatchInlineSnapshot(`
    "import { foo } from './index.js'
    export {  bar } from './index.js'
    const script = foo"
    `)

    expect(
      rewriteDefault(
        `export { foo as default     , bar } from './index.js'`,
        'script'
      )
    ).toMatchInlineSnapshot(`
    "import { foo } from './index.js'
    export {  bar } from './index.js'
    const script = foo"
    `)

    expect(
      rewriteDefault(
        `export { bar,   foo as default } from './index.js'`,
        'script'
      )
    ).toMatchInlineSnapshot(`
    "import { foo } from './index.js'
    export { bar,    } from './index.js'
    const script = foo"
    `)
  })

  test('export default class', async () => {
    expect(rewriteDefault(`export default class Foo {}`, 'script'))
      .toMatchInlineSnapshot(`
      "class Foo {}
      const script = Foo"
    `)
  })

  test('export default class w/ comments', async () => {
    expect(
      rewriteDefault(`// export default\nexport default class Foo {}`, 'script')
    ).toMatchInlineSnapshot(`
      "// export default
      class Foo {}
      const script = Foo"
    `)
  })

  test('export default class w/ comments 2', async () => {
    expect(
      rewriteDefault(
        `export default {}\n` + `// export default class Foo {}`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "const script = {}
      // export default class Foo {}"
    `)
  })

  test('export default class w/ comments 3', async () => {
    expect(
      rewriteDefault(
        `/*\nexport default class Foo {}*/\n` + `export default class Bar {}`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "/*
      export default class Foo {}*/
      class Bar {}
      const script = Bar"
    `)
  })

  test('@Component\nexport default class', async () => {
    expect(rewriteDefault(`@Component\nexport default class Foo {}`, 'script'))
      .toMatchInlineSnapshot(`
      "@Component
      class Foo {}
      const script = Foo"
    `)
  })

  test('@Component\nexport default class w/ comments', async () => {
    expect(
      rewriteDefault(`// export default\n@Component\nexport default class Foo {}`, 'script')
    ).toMatchInlineSnapshot(`
      "// export default
      @Component
      class Foo {}
      const script = Foo"
    `)
  })

  test('@Component\nexport default class w/ comments 2', async () => {
    expect(
      rewriteDefault(
        `export default {}\n` + `// @Component\n// export default class Foo {}`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "const script = {}
      // @Component
      // export default class Foo {}"
    `)
  })

  test('@Component\nexport default class w/ comments 3', async () => {
    expect(
      rewriteDefault(
        `/*\n@Component\nexport default class Foo {}*/\n` + `export default class Bar {}`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "/*
      @Component
      export default class Foo {}*/
      class Bar {}
      const script = Bar"
    `)
  })
})
