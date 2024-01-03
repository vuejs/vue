import { prefixIdentifiers } from '../src/prefixIdentifiers'
import { compile } from 'web/entry-compiler'
import { format } from 'prettier'
import { BindingTypes } from '../src/types'

const toFn = (source: string) => `function render(){${source}\n}`

it('should work', () => {
  const { render } = compile(`<div id="app">
  <div :style="{ color }">{{ foo }}</div>
  <p v-for="i in list">{{ i }}</p>
  <foo inline-template>
    <div>{{ bar }}</div>
  </foo>
</div>`)

  const result = format(prefixIdentifiers(toFn(render)), {
    semi: false,
    parser: 'babel'
  })

  expect(result).not.toMatch(`_vm._c`)
  expect(result).toMatch(`_vm.foo`)
  expect(result).toMatch(`_vm.list`)
  expect(result).toMatch(`{ color: _vm.color }`)
  expect(result).not.toMatch(`_vm.i`)
  expect(result).not.toMatch(`with (this)`)

  expect(result).toMatchInlineSnapshot(`
    "function render() {
      var _vm = this,
        _c = _vm._self._c
      return _c(
        "div",
        { attrs: { id: "app" } },
        [
          _c("div", { style: { color: _vm.color } }, [_vm._v(_vm._s(_vm.foo))]),
          _vm._v(" "),
          _vm._l(_vm.list, function (i) {
            return _c("p", [_vm._v(_vm._s(i))])
          }),
          _vm._v(" "),
          _c("foo", {
            inlineTemplate: {
              render: function () {
                var _vm = this,
                  _c = _vm._self._c
                return _c("div", [_vm._v(_vm._s(_vm.bar))])
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

it('setup bindings', () => {
  const { render } = compile(`<div @click="count++">{{ count }}</div>`)

  const result = format(
    prefixIdentifiers(toFn(render), false, false, undefined, {
      count: BindingTypes.SETUP_REF
    }),
    {
      semi: false,
      parser: 'babel'
    }
  )

  expect(result).toMatch(`_setup = _vm._self._setupProxy`)
  expect(result).toMatch(`_setup.count++`)
  expect(result).toMatch(`_vm._s(_setup.count)`)

  expect(result).toMatchInlineSnapshot(`
    "function render() {
      var _vm = this,
        _c = _vm._self._c,
        _setup = _vm._self._setupProxy
      return _c(
        "div",
        {
          on: {
            click: function ($event) {
              _setup.count++
            },
          },
        },
        [_vm._v(_vm._s(_setup.count))]
      )
    }
    "
  `)
})
