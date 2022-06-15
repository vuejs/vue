import { prefixIdentifiers } from '../src/prefixIdentifiers'
import { compile } from 'web/entry-compiler'
import { format } from 'prettier'

it('should work', () => {
  const { render } = compile(`<div id="app">
  <div>{{ foo }}</div>
  <p v-for="i in list">{{ i }}</p>
  <foo inline-template>
    <div>{{ bar }}</div>
  </foo>
</div>`)

  const result = format(prefixIdentifiers(render, `render`), {
    semi: false,
    parser: 'babel'
  })

  expect(result).not.toMatch(`_vm._c`)
  expect(result).toMatch(`_vm.foo`)
  expect(result).toMatch(`_vm.list`)
  expect(result).not.toMatch(`_vm.i`)
  expect(result).not.toMatch(`with (this)`)

  expect(result).toMatchInlineSnapshot(`
    "function render() {
      var _vm = this,
        _c = _vm._self._c
      return _c(
        \\"div\\",
        { attrs: { id: \\"app\\" } },
        [
          _c(\\"div\\", [_vm._v(_vm._s(_vm.foo))]),
          _vm._v(\\" \\"),
          _vm._l(_vm.list, function (i) {
            return _c(\\"p\\", [_vm._v(_vm._s(i))])
          }),
          _vm._v(\\" \\"),
          _c(\\"foo\\", {
            inlineTemplate: {
              render: function () {
                var _vm = this,
                  _c = _vm._self._c
                return _c(\\"div\\", [_vm._v(_vm._s(_vm.bar))])
              },
              staticRenderFns: [],
            },
          }),
        ],
        2
      )
    }
    "
  `)
})
