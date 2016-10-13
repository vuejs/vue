# vue-template-compiler

> This package is auto-generated. For pull requests please see [src/entries/web-compiler.js](https://github.com/vuejs/vue/blob/dev/src/entries/web-compiler.js).

This package can be used to pre-compile Vue 2.0 templates into render functions to avoid runtime-compilation overhead and CSP restrictions. You will only need it if you are writing build tools with very specific needs. In most cases you should be using [vue-loader](https://github.com/vuejs/vue-loader) or [vueify](https://github.com/vuejs/vueify) instead, both of which use this package internally.

## Installation

``` bash
npm install vue-template-compiler
```

``` js
const compiler = require('vue-template-compiler')
```

## API

### compiler.compile(template, [options])

Compiles a template string and returns compiled JavaScript code. The returned result is an object of the following format:

``` js
{
  render: string, // main render function code
  staticRenderFns: Array<string>, // render code for static sub trees, if any
  errors: Array<string> // template syntax errors, if any
}
```

Note the returned function code uses `with` and thus cannot be used in strict mode code.

#### Options

It's possible to hook into the compilation process to support custom template features. **However, beware that by injecting custom compile-time modules, your templates will not work with other build tools built on standard built-in modules, e.g `vue-loader` and `vueify`.**

The optional `options` object can contain the following:

- `modules`

  An array of compiler modules. For details on compiler modules, refer to its [type definition](https://github.com/vuejs/vue/blob/dev/flow/compiler.js#L31) and the [built-in modules](https://github.com/vuejs/vue/tree/dev/src/platforms/web/compiler/modules).

- `directives`

  An object where the key is the directive name and the value is a function that transforms an template AST node. For example:

  ``` js
  compiler.compile('<div v-test></div>', {
    directives: {
      test (node, directiveMeta) {
        // transform node based on directiveMeta
      }
  })
  ```

  By default, a compile-time directive will extract the directive and the directive will not be present at runtime. If you want the directive to also be handled by a runtime definition, return `true` in the transform function.

  Refer to the implementation of some [built-in compile-time directives](https://github.com/vuejs/vue/tree/next/src/platforms/web/compiler/directives).

- `preserveWhitespace`

  Defaults to `true`. This means the compiled render function respects all the whitespaces between HTML tags. If set to `false`, all whitespaces between tags will be ignored. This can result in slightly better performance but may affect layout for inline elements.

---

### compiler.compileToFunctions(template)

Similar to `compiler.compile`, but directly returns instantiated functions:

``` js
{
  render: Function,
  staticRenderFns: Array<Function>
}
```

This is only useful at runtime with pre-configured builds, so it doesn't accept any compile-time options. In addition, this method uses `new Function()` so it is not CSP-compliant.

---

### compiler.parseComponent(file, [options])

Parse a SFC (single-file component, or `*.vue` file) into a [descriptor](https://github.com/vuejs/vue/blob/dev/flow/compiler.js#L131). This is used in SFC build tools like `vue-loader` and `vueify`.

#### Options

- `pad`: with `{ pad: true }`, the extracted content for each block will be padded with newlines to ensure that the line numbers align with the original file. This is useful when you are piping the extracted content into other pre-processors, as you will get correct line numbers if there are any syntax errors.
