## Explanation of Build Files

- ### vue.js

  The full (compiler-included) browser build. This is the build you can just include with a script tag:

  ```
  <script src="https://unkpg.com/vue/dist/vue.js"><script>
  ```

  Note that this build is hard-coded to development mode.

- ### vue.min.js

  Same as `vue.js`, but minified AND is hard-coded to production mode (with runtime checks and warnings stripped).

- ### vue.common.js

  The full (compiler-included) CommonJS build. This is the build intended to be used with a Node-compatible bundler, e.g. Webpack or Browserify.

  The difference between the browser build and the CommonJS build is that the latter preserves the `process.env.NODE_ENV` check for development/production modes (defaults to development mode). This gives you more control over what mode the code should run in:

  - When bundling for the browser, you can turn on production mode by using Webpack's [DefinePlugin](https://webpack.github.io/docs/list-of-plugins.html#defineplugin) to replace `process.env.NODE_ENV` with the `"production"` string literal:

    ``` js
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      })
    ]
    ```

    This also allows minifiers to completely drop the warnings inside the conditional blocks. For Browserify, you can use [envify](https://github.com/hughsk/envify) to achieve the same.

  - When running Vue in Node.js (during server side rendering), Vue will pick up the actual `process.env.NODE_ENV` if set.

- ### vue.runtime.common.js

  The runtime-only (compiler-excluded) CommonJS build.

  This build does not support the `template` option, because it doesn't include the compiler. It is thus 30% lighter than the full build. However, you can still use templates in Single-File `*.vue` components via `vue-loader` or `vueify`, as these tools will pre-compile the templates into render functions for you.

  **This is the default build you get from `import Vue from 'vue'` or `var Vue = require('vue')`**. To use the full CommonJS build instead, configure Webpack via the `resolve.alias` option:

  ``` js
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.common.js'
    }
  }
  ```

  For Browserify, use the [aliasify](https://github.com/benbria/aliasify) transform.

- ### vue.runtime.js

  The runtime-only (compiler-excluded) browser build. You can also include this build with a script tag, but with this build, you will **not** be able to use the `template` option. Hard-coded to development mode.

- ### vue.runtime.min.js

  Same as `vue.runtime.js`, but minified AND hard-coded to production mode (with runtime checks and warnings stripped).
