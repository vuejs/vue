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

  - When bundling for the browser, you can turn on production mode by using Webpack's [DefinePlugin](https://webpack.github.io/docs/list-of-plugins.html#defineplugin) or Browserify's [envify](https://github.com/hughsk/envify) to replace `process.env.NODE_ENV` with the `"production"` string literal. This also allows minifiers to completely drop the warnings inside the conditional blocks. See [examples](http://vuejs.org/v2/guide/deployment.html).

  - When running Vue in Node.js (during server side rendering), Vue will pick up the actual `process.env.NODE_ENV` if set.

- ### vue.runtime.common.js

  The runtime-only (compiler-excluded) CommonJS build. **This is the default build you get from `import Vue from 'vue'` or `var Vue = require('vue')`**.

  This build does not support the `template` option, because it doesn't include the compiler. It is thus 30% lighter than the full build. However, you can still use templates in Single-File `*.vue` components via `vue-loader` or `vueify`, as these tools will pre-compile the templates into render functions for you.

- ### vue.runtime.js

  The runtime-only (compiler-excluded) browser build. You can also include this build with a script tag, but with this build, you will **not** be able to use the `template` option. Hard-coded to development mode.

- ### vue.runtime.min.js

  Same as `vue.runtime.js`, but minified AND hard-coded to production mode (with runtime checks and warnings stripped).
