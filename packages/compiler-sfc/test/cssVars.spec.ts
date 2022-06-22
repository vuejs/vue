import { compileStyle, parse } from '../src'
import { mockId, compile, assertCode } from './util'

describe('CSS vars injection', () => {
  test('generating correct code for nested paths', () => {
    const { content } = compile(
      `<script>const a = 1</script>\n` +
        `<style>div{
          color: v-bind(color);
          font-size: v-bind('font.size');
        }</style>`
    )
    expect(content).toMatch(`_useCssVars((_vm, _setup) => ({
  "${mockId}-color": (_vm.color),
  "${mockId}-font_size": (_vm.font.size)
})`)
    assertCode(content)
  })

  test('w/ normal <script> binding analysis', () => {
    const { content } = compile(
      `<script>
      export default {
        setup() {
          return {
            size: ref('100px')
          }
        }
      }
      </script>\n` +
        `<style>
          div {
            font-size: v-bind(size);
          }
        </style>`
    )
    expect(content).toMatch(`_useCssVars((_vm, _setup) => ({
  "${mockId}-size": (_vm.size)
})`)
    expect(content).toMatch(`import { useCssVars as _useCssVars } from 'vue'`)
    assertCode(content)
  })

  test('w/ <script setup> binding analysis', () => {
    const { content } = compile(
      `<script setup>
        import { defineProps, ref } from 'vue'
        const color = 'red'
        const size = ref('10px')
        defineProps({
          foo: String
        })
        </script>\n` +
        `<style>
          div {
            color: v-bind(color);
            font-size: v-bind(size);
            border: v-bind(foo);
          }
        </style>`
    )
    // should handle:
    // 1. local const bindings
    // 2. local potential ref bindings
    // 3. props bindings (analyzed)
    expect(content).toMatch(`_useCssVars((_vm, _setup) => ({
  "${mockId}-color": (_setup.color),
  "${mockId}-size": (_setup.size),
  "${mockId}-foo": (_vm.foo)
})`)
    expect(content).toMatch(`import { useCssVars as _useCssVars } from 'vue'`)
    assertCode(content)
  })

  test('should rewrite CSS vars in compileStyle', () => {
    const { code } = compileStyle({
      source: `.foo {
        color: v-bind(color);
        font-size: v-bind('font.size');
      }`,
      filename: 'test.css',
      id: 'data-v-test'
    })
    expect(code).toMatchInlineSnapshot(`
      ".foo[data-v-test] {
              color: var(--test-color);
              font-size: var(--test-font_size);
      }"
    `)
  })

  test('prod mode', () => {
    const { content } = compile(
      `<script>const a = 1</script>\n` +
        `<style>div{
          color: v-bind(color);
          font-size: v-bind('font.size');
        }</style>`,
      { isProd: true }
    )
    expect(content).toMatch(`_useCssVars((_vm, _setup) => ({
  "4003f1a6": (_vm.color),
  "41b6490a": (_vm.font.size)
}))}`)

    const { code } = compileStyle({
      source: `.foo {
        color: v-bind(color);
        font-size: v-bind('font.size');
      }`,
      filename: 'test.css',
      id: mockId,
      isProd: true
    })
    expect(code).toMatchInlineSnapshot(`
      ".foo[xxxxxxxx] {
              color: var(--4003f1a6);
              font-size: var(--41b6490a);
      }"
    `)
  })

  describe('codegen', () => {
    test('<script> w/ no default export', () => {
      assertCode(
        compile(
          `<script>const a = 1</script>\n` +
            `<style>div{ color: v-bind(color); }</style>`
        ).content
      )
    })

    test('<script> w/ default export', () => {
      assertCode(
        compile(
          `<script>export default { setup() {} }</script>\n` +
            `<style>div{ color: v-bind(color); }</style>`
        ).content
      )
    })

    test('<script> w/ default export in strings/comments', () => {
      assertCode(
        compile(
          `<script>
          // export default {}
          export default {}
        </script>\n` + `<style>div{ color: v-bind(color); }</style>`
        ).content
      )
    })

    test('w/ <script setup>', () => {
      assertCode(
        compile(
          `<script setup>const color = 'red'</script>\n` +
            `<style>div{ color: v-bind(color); }</style>`
        ).content
      )
    })

    //#4185
    test('should ignore comments', () => {
      const { content } = compile(
        `<script setup>const color = 'red';const width = 100</script>\n` +
          `<style>
            /* comment **/
            div{ /* color: v-bind(color); */ width:20; }
            div{ width: v-bind(width); }
            /* comment */
          </style>`
      )

      expect(content).not.toMatch(`"${mockId}-color": (_setup.color)`)
      expect(content).toMatch(`"${mockId}-width": (_setup.width)`)
      assertCode(content)
    })

    test('w/ <script setup> using the same var multiple times', () => {
      const { content } = compile(
        `<script setup>
        const color = 'red'
        </script>\n` +
          `<style>
          div {
            color: v-bind(color);
          }
          p {
            color: v-bind(color);
          }
        </style>`
      )
      // color should only be injected once, even if it is twice in style
      expect(content).toMatch(`_useCssVars((_vm, _setup) => ({
  "${mockId}-color": (_setup.color)
})`)
      assertCode(content)
    })

    test('should work with w/ complex expression', () => {
      const { content } = compile(
        `<script setup>
        let a = 100
        let b = 200
        let foo = 300
        </script>\n` +
          `<style>
          p{
            width: calc(v-bind(foo) - 3px);
            height: calc(v-bind('foo') - 3px);
            top: calc(v-bind(foo + 'px') - 3px);
          }
          div {
            color: v-bind((a + b) / 2 + 'px' );
          }
          div {
            color: v-bind    ((a + b) / 2 + 'px' );
          }
          p {
            color: v-bind(((a + b)) / (2 * a));
          }
        </style>`
      )
      expect(content).toMatch(`_useCssVars((_vm, _setup) => ({
  "${mockId}-foo": (_setup.foo),
  "${mockId}-foo____px_": (_setup.foo + 'px'),
  "${mockId}-_a___b____2____px_": ((_setup.a + _setup.b) / 2 + 'px'),
  "${mockId}-__a___b______2___a_": (((_setup.a + _setup.b)) / (2 * _setup.a))
})`)
      assertCode(content)
    })

    // #6022
    test('should be able to parse incomplete expressions', () => {
      const { cssVars } = parse({
        source: `<script setup>let xxx = 1</script>
        <style scoped>
        label {
          font-weight: v-bind("count.toString(");
          font-weight: v-bind(xxx);
        }
        </style>`
      })
      expect(cssVars).toMatchObject([`count.toString(`, `xxx`])
    })
  })
})
