# [2.7.0-beta.7](https://github.com/vuejs/vue/compare/v2.7.0-beta.6...v2.7.0-beta.7) (2022-06-27)


### Bug Fixes

* types/v3-directive not published ([#12571](https://github.com/vuejs/vue/issues/12571)) ([11e4bfe](https://github.com/vuejs/vue/commit/11e4bfe806b574747495edfb9ba22f78676ceb7c))



# [2.7.0-beta.6](https://github.com/vuejs/vue/compare/v2.7.0-beta.5...v2.7.0-beta.6) (2022-06-26)


### Bug Fixes

* **reactivity:** readonly() compat with classes ([44ab1cd](https://github.com/vuejs/vue/commit/44ab1cda746252a1a81f88e1a9658d33f484ed41)), closes [#12574](https://github.com/vuejs/vue/issues/12574)
* **watch:** template ref watcher should fire after owner instance mounted hook ([089b27c](https://github.com/vuejs/vue/commit/089b27c30b470acd98286ffe072525beb2320dea)), closes [#12578](https://github.com/vuejs/vue/issues/12578)



# [2.7.0-beta.5](https://github.com/vuejs/vue/compare/v2.7.0-beta.4...v2.7.0-beta.5) (2022-06-22)


### Bug Fixes

* **types:** fix instance type inference for setup() with no return value ([65531f5](https://github.com/vuejs/vue/commit/65531f580314d832f44ecd5c782f79da3e977da7)), closes [#12568](https://github.com/vuejs/vue/issues/12568)
* **watch:** fix pre watchers not flushed on mount for nested component ([7a3aa3f](https://github.com/vuejs/vue/commit/7a3aa3faac6b8eb066f32813788b4c1d16f34c6b)), closes [#12569](https://github.com/vuejs/vue/issues/12569)



# [2.7.0-beta.4](https://github.com/vuejs/vue/compare/v2.7.0-beta.3...v2.7.0-beta.4) (2022-06-21)


### Bug Fixes

* **compiler-sfc:** properly handle shorthand property in template expressions ([9b9f2bf](https://github.com/vuejs/vue/commit/9b9f2bf1c8429136e7122d146e0e39bdeada5d1d)), closes [#12566](https://github.com/vuejs/vue/issues/12566)



# [2.7.0-beta.3](https://github.com/vuejs/vue/compare/v2.7.0-beta.2...v2.7.0-beta.3) (2022-06-20)


### Bug Fixes

* remove wrong observe toggle, properly disable tracking in setup() ([2d67641](https://github.com/vuejs/vue/commit/2d676416566c06d7c789899c92bf0f6924ec284a))
* **setup:** setup props should pass isReactive check ([52cf912](https://github.com/vuejs/vue/commit/52cf912d855a7fae8d8c89452f0d275846e26a87)), closes [#12561](https://github.com/vuejs/vue/issues/12561)
* **template-ref:** preserve ref removal behavior in non-composition-api usage ([2533a36](https://github.com/vuejs/vue/commit/2533a360a838c41238dc9b9b840932f2957c65d4)), closes [#12554](https://github.com/vuejs/vue/issues/12554)


### Features

* **sfc:** css v-bind ([8ab0074](https://github.com/vuejs/vue/commit/8ab0074bab83473fd025ae538a3455e3277320c4))
* **sfc:** parse needMap compat ([d3916b6](https://github.com/vuejs/vue/commit/d3916b69b491bb0964102b69a8bb2e9336f7677b))
* useCssModules ([0fabda7](https://github.com/vuejs/vue/commit/0fabda7a3b016c1c0cb5d92f5d8efc35f0dbde40))



# [2.7.0-beta.2](https://github.com/vuejs/vue/compare/v2.7.0-beta.1...v2.7.0-beta.2) (2022-06-17)


### Bug Fixes

* **compiler-sfc:** do not transform external and data urls in templates ([328ebff](https://github.com/vuejs/vue/commit/328ebff04198143385371c857ad23f739be9509d))



# [2.7.0-beta.1](https://github.com/vuejs/vue/compare/v2.7.0-alpha.12...v2.7.0-beta.1) (2022-06-17)


### Bug Fixes

* **compiler-sfc:** expose src on custom blocks as well ([cdfc4c1](https://github.com/vuejs/vue/commit/cdfc4c134ddadc33f3b50d53ec6316b0c96f4567))


### Features

* **compiler-sfc:** support includeAbsolute in transformAssetUrl ([8f5817a](https://github.com/vuejs/vue/commit/8f5817a7c9a0664438e4299f82ac41a67f156f89))
* warn top level await usage in `<script setup>` ([efa8a74](https://github.com/vuejs/vue/commit/efa8a749644cfd6a0d6e9e92a1f342e2eff77d5a))



# [2.7.0-alpha.12](https://github.com/vuejs/vue/compare/v2.7.0-alpha.11...v2.7.0-alpha.12) (2022-06-16)


### Features

* further align compiler-sfc api + expose rewriteDefault ([8ce585d](https://github.com/vuejs/vue/commit/8ce585d70c2e1adb04650801b03dcc9552cbaf95))



# [2.7.0-alpha.11](https://github.com/vuejs/vue/compare/v2.7.0-alpha.10...v2.7.0-alpha.11) (2022-06-16)


### Bug Fixes

* further align types with v3 ([2726b6d](https://github.com/vuejs/vue/commit/2726b6d9ff3030af63012a304c33781163461a23))



# [2.7.0-alpha.10](https://github.com/vuejs/vue/compare/v2.7.0-alpha.9...v2.7.0-alpha.10) (2022-06-16)


### Bug Fixes

* avoid warning when accessing _setupProxy ([cdfd9f3](https://github.com/vuejs/vue/commit/cdfd9f321e35981774785806bb1629a73ec58064))


### Features

* export version as named export ([749b96d](https://github.com/vuejs/vue/commit/749b96d84e6551c5187694a93c5493702035a239))



# [2.7.0-alpha.9](https://github.com/vuejs/vue/compare/v2.7.0-alpha.8...v2.7.0-alpha.9) (2022-06-16)


### Features

* defineExpose() support ([3c2707b](https://github.com/vuejs/vue/commit/3c2707b62e1a355f182c08f85cf7bc9bca1bb34e))
* directive resolution for `<script setup>` ([aa2b1f4](https://github.com/vuejs/vue/commit/aa2b1f4d93bdd257ae26a73994168709369aa6a0))
* resolve components from `<script setup>` ([4b19339](https://github.com/vuejs/vue/commit/4b193390fbc203cc5bae46fe288b1c20c442cc03))
* types for `<script setup>` macros ([7173ad4](https://github.com/vuejs/vue/commit/7173ad42729fa0913c3e7de94d251341929ee7c6))



# [2.7.0-alpha.8](https://github.com/vuejs/vue/compare/v2.7.0-alpha.7...v2.7.0-alpha.8) (2022-06-14)

### Features

- Basic `<script setup>` support. Requires `vue-loader@^15.10.0-beta.1`.
  - Component resolution doesn't work yet
  - Types for `defineXXX` macros not supported yet

# [2.7.0-alpha.7](https://github.com/vuejs/vue/compare/v2.7.0-alpha.6...v2.7.0-alpha.7) (2022-06-14)



# [2.7.0-alpha.6](https://github.com/vuejs/vue/compare/v2.7.0-alpha.5...v2.7.0-alpha.6) (2022-06-09)

### Features

* Add JSX types for Volar integration. No longer requires `@vue/runtime-dom` for component props validation in templates.


# [2.7.0-alpha.5](https://github.com/vuejs/vue/compare/v2.7.0-alpha.4...v2.7.0-alpha.5) (2022-06-06)


### Bug Fixes

* fix scopedSlots regression ([4f2a04e](https://github.com/vuejs/vue/commit/4f2a04e6a8e1fc71080eed49fd4059d6a53afc1c))



# [2.7.0-alpha.4](https://github.com/vuejs/vue/compare/v2.7.0-alpha.3...v2.7.0-alpha.4) (2022-06-01)


### Bug Fixes

* guard against non-object provide value ([c319cc7](https://github.com/vuejs/vue/commit/c319cc7a74a790414c33db74ad9f1070851de76b))

### Features

* `defineComponent` [206f8a7f](https://github.com/vuejs/vue/commit/206f8a7f0949a50ae062d9d71061716ae3c3a749)

# [2.7.0-alpha.3](https://github.com/vuejs/vue/compare/v2.7.0-alpha.2...v2.7.0-alpha.3) (2022-06-01)



# [2.7.0-alpha.2](https://github.com/vuejs/vue/compare/v2.7.0-alpha.1...v2.7.0-alpha.2) (2022-06-01)


### Features

* add exports field + mjs build ([d317237](https://github.com/vuejs/vue/commit/d3172377e0c2df9e84244ede6fc9a091344e6f1c))
* expose set/del as named exports ([5673363](https://github.com/vuejs/vue/commit/5673363eda9e6082a9ff0300b8c4e79c9388891b))



# [2.7.0-alpha.1](https://github.com/vuejs/vue/compare/v2.6.14...v2.7.0-alpha.1) (2022-05-31)

This release includes full [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) support, including:

- `setup()` support in components
- Reactivity APIs (`ref()`, `reactive()` etc.)
- Lifecycle hooks (`onMounted()` etc.)
- `provide()` and `inject()`
- `useSlots()` and `useAttrs()`
- template refs with `setup()`

### Behavior difference from Vue 3

- The reactivity system is still getter/setter based and does not use Proxies, so all Vue 2 change detection caveats still apply.
- `reactive()`, `ref()`, and `shallowReactive()` will directly convert original objects instead of creating proxies. They also do not convert properties with symbol keys.
- Avoid using arrays as root values in `reactive()` because without property access the array's mutation won't be tracked (this will result in a warning).
- `readonly()` **does** create a separate object, but it won't track newly added properties and does not work on arrays.

### Notes on API exposure

- In ESM builds, these APIs are provided as named exports (and named exports only):

  ```js
  import Vue, { ref } from 'vue'

  Vue.ref // undefined, use named export instead
  ```

- When bundling with CJS builds externalized, bundlers should be able to handle ESM interop when externalizing CJS builds.

- In UMD builds, these APIs are exposed on the global `Vue` object.

In addition:

- `h()`, `set()`, `del()` and `nextTick()` are now also provided as named exports in ESM builds.

### Bug Fixes

- **v-on:** add removing all dom event listeners when vnode destroyed ([#10085](https://github.com/vuejs/vue/issues/10085)) ([3d29ba8](https://github.com/vuejs/vue/commit/3d29ba863b89fd90dabd0856c0507eacdf5fef22))

### Features

- **compiler:** condenses staticClass whitespace (fix [#12113](https://github.com/vuejs/vue/issues/12113)) ([#12195](https://github.com/vuejs/vue/issues/12195)) ([515467a](https://github.com/vuejs/vue/commit/515467a618479792abedf01a7b1dcef2ac2a17ed))

## [2.6.14](https://github.com/vuejs/vue/compare/v2.6.13...v2.6.14) (2021-06-07)

### Bug Fixes

- **types:** async Component types ([#11906](https://github.com/vuejs/vue/issues/11906)) ([c52427b](https://github.com/vuejs/vue/commit/c52427b0d2c1d203deea6eb69f2b4b181d56022c))
- **v-slot:** fix scoped slot normalization combined with v-if ([#12104](https://github.com/vuejs/vue/issues/12104)) ([38f71de](https://github.com/vuejs/vue/commit/38f71de380d566e4eef60968a8eca6bd6f482dd5))

### Features

- **ssr:** vue-ssr-webpack-plugin compatible with webpack 5 ([#12002](https://github.com/vuejs/vue/issues/12002)) ([80e7730](https://github.com/vuejs/vue/commit/80e7730946538e0371e213100a0fe81299c2f4b2))

## [2.6.13](https://github.com/vuejs/vue/compare/v2.6.12...v2.6.13) (2021-06-01)

### Bug Fixes

- **attrs:** do not consider translate attribute as boolean ([#11392](https://github.com/vuejs/vue/issues/11392)) ([cd57393](https://github.com/vuejs/vue/commit/cd57393fd3e2c169d450607bc4f03652d106bcc2)), closes [#11391](https://github.com/vuejs/vue/issues/11391)
- **compiler:** Allow BigInt usage in templates ([#11152](https://github.com/vuejs/vue/issues/11152)) ([c42b706](https://github.com/vuejs/vue/commit/c42b7066cae7947e9fd877e495aeb38623c2354d))
- **compiler:** avoid converting &nbps; to spaces ([#11065](https://github.com/vuejs/vue/issues/11065)) ([55a30cf](https://github.com/vuejs/vue/commit/55a30cf9db247eba2aca817439fdb3cd15e9184f))
- **compiler:** event handlers with modifiers swallowing arguments (fix [#10867](https://github.com/vuejs/vue/issues/10867)) ([#10958](https://github.com/vuejs/vue/issues/10958)) ([8620706](https://github.com/vuejs/vue/commit/862070662dd4871cb834664435ec836df57c7d57))
- **core:** fix sameVnode for async component ([#11107](https://github.com/vuejs/vue/issues/11107)) ([5260830](https://github.com/vuejs/vue/commit/52608302e9bca84fb9e9f0499e89acade78d3d07))
- **core:** remove trailing comma in function signature ([#10845](https://github.com/vuejs/vue/issues/10845)) ([579e1ff](https://github.com/vuejs/vue/commit/579e1ff9df1d454f85fac386d098b7bf1a42c4f2)), closes [#10843](https://github.com/vuejs/vue/issues/10843)
- **errorHandler:** async error handling for watchers ([#9484](https://github.com/vuejs/vue/issues/9484)) ([e4dea59](https://github.com/vuejs/vue/commit/e4dea59f84dfbf32cda1cdd832380dd90b1a6fd1))
- force update between two components with and without slot ([#11795](https://github.com/vuejs/vue/issues/11795)) ([77b5330](https://github.com/vuejs/vue/commit/77b5330c5498a6b14a83197371e9a2dbf9939a9c))
- give correct namespace in foreignObject ([#11576](https://github.com/vuejs/vue/issues/11576)) ([af5e05d](https://github.com/vuejs/vue/commit/af5e05d87ecd218f73302a1b08dcaedd2b46814a)), closes [#11575](https://github.com/vuejs/vue/issues/11575)
- handle async placeholders in normalizeScopedSlot ([#11963](https://github.com/vuejs/vue/issues/11963)) ([af54514](https://github.com/vuejs/vue/commit/af54514cf97e724d224408c1ecc6c81ddccd4b75))
- **keep-alive:** cache what is really needed not the whole VNode data ([#12015](https://github.com/vuejs/vue/issues/12015)) ([e7baaa1](https://github.com/vuejs/vue/commit/e7baaa12055231c9367fa1c7bf917e534bd8a739))
- **parser:** allow multiple slots with new syntax ([#9785](https://github.com/vuejs/vue/issues/9785)) ([67825c2](https://github.com/vuejs/vue/commit/67825c24bcb0a9f64055bda1b1e4af66aad3c529)), closes [#9781](https://github.com/vuejs/vue/issues/9781)
- pause dep collection during immediate watcher invocation ([#11943](https://github.com/vuejs/vue/issues/11943)) ([987f322](https://github.com/vuejs/vue/commit/987f322b8f419cc307f4294173f8792a706ed73f))
- **props:** correctly warn when a provided prop is Symbol ([#10529](https://github.com/vuejs/vue/issues/10529)) ([abb5ef3](https://github.com/vuejs/vue/commit/abb5ef35dd02919dce19c895ad12113071712df0)), closes [#10519](https://github.com/vuejs/vue/issues/10519)
- **props:** support BigInt in props type validation ([#11191](https://github.com/vuejs/vue/issues/11191)) ([fa1f81e](https://github.com/vuejs/vue/commit/fa1f81e91062e9de6161708209cd7354733aa354))
- **slot:** add a function to return the slot fallback content ([#12014](https://github.com/vuejs/vue/issues/12014)) ([ce457f9](https://github.com/vuejs/vue/commit/ce457f9f4d48548d5e8763c47d013e23c2b65c12))
- **ssr:** avoid missing files in manifest ([#11609](https://github.com/vuejs/vue/issues/11609)) ([b97606c](https://github.com/vuejs/vue/commit/b97606cdc658448b56518ac27af98fc82999d05f))
- **ssr:** inheritAttrs false adds attributes to html ([#11706](https://github.com/vuejs/vue/issues/11706)) ([7e5dc6b](https://github.com/vuejs/vue/commit/7e5dc6bd9ebc1620624191804d2ace43cae557a8))
- **ssr:** textarea keeps undefined/null values ([#11121](https://github.com/vuejs/vue/issues/11121)) ([b8bd149](https://github.com/vuejs/vue/commit/b8bd149d8aa3f175a1a656d62f7b6ec60c31a364))
- **types:** add types for Vue.util.warn function ([#11964](https://github.com/vuejs/vue/issues/11964)) ([e0274e4](https://github.com/vuejs/vue/commit/e0274e4320f68bb93bd7f90bb1ef701ccf9b6f2a)), closes [/github.com/vuejs/vue/blob/v2.6.12/src/core/util/debug.js#L18-L26](https://github.com//github.com/vuejs/vue/blob/v2.6.12/src/core/util/debug.js/issues/L18-L26)
- **types:** allow string for watch handlers in options ([#10396](https://github.com/vuejs/vue/issues/10396)) ([668e1e6](https://github.com/vuejs/vue/commit/668e1e637461ff630803e85bf99158415d276d4c))
- **types:** allow symbol & boolean for vnode key ([#11914](https://github.com/vuejs/vue/issues/11914)) ([5c459f0](https://github.com/vuejs/vue/commit/5c459f0fd6911daca09ad205aecf5423a9d05698))
- **types:** changed expression type to optional string ([#11189](https://github.com/vuejs/vue/issues/11189)) ([7c75462](https://github.com/vuejs/vue/commit/7c754623541c492161f7976203f0b1697a9a0113)), closes [#10871](https://github.com/vuejs/vue/issues/10871)
- **types:** make $refs undefined possible ([#11112](https://github.com/vuejs/vue/issues/11112)) ([2b93e86](https://github.com/vuejs/vue/commit/2b93e86aa1437168476cbb5100cfb3bbbac55efa))
- **v-on:** avoid events with empty keyCode (autocomplete) ([#11326](https://github.com/vuejs/vue/issues/11326)) ([c6d7a6f](https://github.com/vuejs/vue/commit/c6d7a6fce795ffbd6b8a599787eca986bb260a25))
- **v-pre:** do not alter attributes ([#10088](https://github.com/vuejs/vue/issues/10088)) ([0664cb0](https://github.com/vuejs/vue/commit/0664cb01434f3d52efd076b6aafe54066a2a762a)), closes [#10087](https://github.com/vuejs/vue/issues/10087)
- **vdom:** avoid executing root level script tags ([#11487](https://github.com/vuejs/vue/issues/11487)) ([fb16d7b](https://github.com/vuejs/vue/commit/fb16d7bfa1e32c21a2f4b627fb8864d3c5c6b655)), closes [#11483](https://github.com/vuejs/vue/issues/11483)
- **warn:** better message with no constructors props ([#9241](https://github.com/vuejs/vue/issues/9241)) ([6940131](https://github.com/vuejs/vue/commit/69401311f4bf55e58550a2134c33ceb8ae1f180e))
- **warns:** modify `maybeComponent` function in parser ([#10167](https://github.com/vuejs/vue/issues/10167)) ([0603ff6](https://github.com/vuejs/vue/commit/0603ff695d2f41286239298210113cbe2b209e28)), closes [#10152](https://github.com/vuejs/vue/issues/10152)

### Features

- **warns:** avoid warning native modifiers on dynamic components ([#11052](https://github.com/vuejs/vue/issues/11052)) ([3d46692](https://github.com/vuejs/vue/commit/3d46692ee4e8ec67b5bc0f66cdabf4667fa4de88))
- **warn:** warn computed conflict with methods ([#10119](https://github.com/vuejs/vue/issues/10119)) ([3ad60fe](https://github.com/vuejs/vue/commit/3ad60fea73d042fc9a127d19de8329948d3f2ef0))

### Performance Improvements

- preinitialize typeCheck RegExp ([#10990](https://github.com/vuejs/vue/issues/10990)) ([2488a6a](https://github.com/vuejs/vue/commit/2488a6a1e9779f0cca4a64163ef44ac30530a450))

## [2.6.12](https://github.com/vuejs/vue/compare/v2.6.11...v2.6.12) (2020-08-20)

### Bug Fixes

- **security:** upgrade serialize-javascript ([#11434](https://github.com/vuejs/vue/issues/11434)) ([5b39961](https://github.com/vuejs/vue/commit/5b399612d8323ad0bb8b3f6fa8b2982ab73c0e6e))

## [2.6.11](https://github.com/vuejs/vue/compare/v2.6.10...v2.6.11) (2019-12-13)

### Bug Fixes

- **compiler:** Remove the warning for valid v-slot value ([#9917](https://github.com/vuejs/vue/issues/9917)) ([085d188](https://github.com/vuejs/vue/commit/085d188379af98e9f482d7e2009ebfd771bd7ca5))
- fix function expression regex ([#9922](https://github.com/vuejs/vue/issues/9922)) ([569b728](https://github.com/vuejs/vue/commit/569b728ab19d1956bf935a98c9c65a03d92ac85f)), closes [#9920](https://github.com/vuejs/vue/issues/9920)
- **types:** fix global namespace declaration for UMD bundle ([#9912](https://github.com/vuejs/vue/issues/9912)) ([ab50e8e](https://github.com/vuejs/vue/commit/ab50e8e1da2f4f944af683252481728485fedf16))
- **types:** fix prop constructor type inference ([#10779](https://github.com/vuejs/vue/issues/10779)) ([4821149](https://github.com/vuejs/vue/commit/4821149b8bbd4650b1d9c9c3cfbb539ac1e24589))

## [2.6.10](https://github.com/vuejs/vue/compare/v2.6.9...v2.6.10) (2019-03-20)

### Bug Fixes

- **codegen:** support named function expression in v-on ([#9709](https://github.com/vuejs/vue/issues/9709)) ([3433ba5](https://github.com/vuejs/vue/commit/3433ba5beef9a6dd97705943c3441ebbee222afd)), closes [#9707](https://github.com/vuejs/vue/issues/9707)
- **core:** cleanup timeouts for async components ([#9649](https://github.com/vuejs/vue/issues/9649)) ([02d21c2](https://github.com/vuejs/vue/commit/02d21c265c239682e73b2b3f98028f2da5e7205d)), closes [#9648](https://github.com/vuejs/vue/issues/9648)
- **core:** only unset dom prop when not present ([f11449d](https://github.com/vuejs/vue/commit/f11449d916a468651d4fd5024c37e3eebbc9941f)), closes [#9650](https://github.com/vuejs/vue/issues/9650)
- **core:** use window.performance for compatibility in JSDOM ([#9700](https://github.com/vuejs/vue/issues/9700)) ([653c74e](https://github.com/vuejs/vue/commit/653c74e64e5ccd66cda94c77577984f8afa8386d)), closes [#9698](https://github.com/vuejs/vue/issues/9698)
- **scheduler:** revert timeStamp check ([22790b2](https://github.com/vuejs/vue/commit/22790b250cd5239a8379b4ec8cc3a9b570dac4bc)), closes [#9729](https://github.com/vuejs/vue/issues/9729) [#9632](https://github.com/vuejs/vue/issues/9632)
- **slots:** fix slots not updating when passing down normal slots as $scopedSlots ([ebc1893](https://github.com/vuejs/vue/commit/ebc1893faccd1a9d953a8e8feddcb49cf1b9004d)), closes [#9699](https://github.com/vuejs/vue/issues/9699)
- **types:** allow using functions on the PropTypes ([#9733](https://github.com/vuejs/vue/issues/9733)) ([df4af4b](https://github.com/vuejs/vue/commit/df4af4bd1906b9f23b62816142fdfbd6336d3d2f)), closes [#9692](https://github.com/vuejs/vue/issues/9692)
- **types:** support string type for style in VNode data ([#9728](https://github.com/vuejs/vue/issues/9728)) ([982d5a4](https://github.com/vuejs/vue/commit/982d5a492fb95577217e2dacaa044eabe78a8601)), closes [#9727](https://github.com/vuejs/vue/issues/9727)

## [2.6.9](https://github.com/vuejs/vue/compare/v2.6.8...v2.6.9) (2019-03-14)

### Bug Fixes

- **compiler:** whitespace: 'condense' should honor pre tag as well ([#9660](https://github.com/vuejs/vue/issues/9660)) ([f1bdd7f](https://github.com/vuejs/vue/commit/f1bdd7ff9d1fc86f7a8ad8d5cb6d9abc7b2e47f3))
- event timeStamp check for Qt ([7591b9d](https://github.com/vuejs/vue/commit/7591b9dc6dde314f2d32dcd7a8355f696a330979)), closes [#9681](https://github.com/vuejs/vue/issues/9681)
- **scheduler:** fix getNow check in IE9 ([#9647](https://github.com/vuejs/vue/issues/9647)) ([da77d6a](https://github.com/vuejs/vue/commit/da77d6a98bdccd8a2c8bfdfe6b9cb46efcb1193c)), closes [#9632](https://github.com/vuejs/vue/issues/9632)
- **scheduler:** getNow detection can randomly fail ([#9667](https://github.com/vuejs/vue/issues/9667)) ([ef2a380](https://github.com/vuejs/vue/commit/ef2a380c6eb6bd1a7ff516c357dafa717e75a745))
- should consider presence of normal slots when caching normalized scoped slots ([9313cf9](https://github.com/vuejs/vue/commit/9313cf91740e1d43c43cf9e73d905dbab913beb5)), closes [#9644](https://github.com/vuejs/vue/issues/9644)
- should not swallow user catch on rejected promise in methods ([7186940](https://github.com/vuejs/vue/commit/7186940143704acc4ec046132f6a56e9c983e510)), closes [#9694](https://github.com/vuejs/vue/issues/9694)
- should use fallback for scoped slots with single falsy v-if ([781c705](https://github.com/vuejs/vue/commit/781c70514e01bc402828946805bfad7437c7175e)), closes [#9658](https://github.com/vuejs/vue/issues/9658)
- **ssr:** fix nested async functional componet rendering ([#9673](https://github.com/vuejs/vue/issues/9673)) ([8082d2f](https://github.com/vuejs/vue/commit/8082d2f910d963f14c151fb445e0fcc5c975cca9)), closes [#9643](https://github.com/vuejs/vue/issues/9643)
- **ssr:** not push non-async css files into map ([#9677](https://github.com/vuejs/vue/issues/9677)) ([d282400](https://github.com/vuejs/vue/commit/d28240009c4c49fb2ef42a79206f0d9ad03f736c))
- **transition:** fix appear check for transition wrapper components ([#9668](https://github.com/vuejs/vue/issues/9668)) ([4de4649](https://github.com/vuejs/vue/commit/4de4649d9637262a9b007720b59f80ac72a5620c))
- v-bind object should be overridable by single bindings ([#9653](https://github.com/vuejs/vue/issues/9653)) ([0b57380](https://github.com/vuejs/vue/commit/0b57380f10986c6b07e3c240acc06bfd2eddfd1b)), closes [#9641](https://github.com/vuejs/vue/issues/9641)

## [2.6.8](https://github.com/vuejs/vue/compare/v2.6.7...v2.6.8) (2019-03-01)

### Bug Fixes

- avoid compression of unicode sequences by using regexps ([#9595](https://github.com/vuejs/vue/issues/9595)) ([7912f75](https://github.com/vuejs/vue/commit/7912f75c5eb09e0aef3e4bfd8a3bb78cad7540d7)), closes [#9456](https://github.com/vuejs/vue/issues/9456)
- **compiler:** set end location for incomplete elements ([#9598](https://github.com/vuejs/vue/issues/9598)) ([cbad54a](https://github.com/vuejs/vue/commit/cbad54aa52847cfc934bb925d53c53ee57fc153d))
- fix modifier parsing for dynamic argument with deep path ([#9585](https://github.com/vuejs/vue/issues/9585)) ([060c3b9](https://github.com/vuejs/vue/commit/060c3b98efa44a9f21bcc038a2593b1cc3c782e9)), closes [#9577](https://github.com/vuejs/vue/issues/9577)
- further adjust max stack size ([571a488](https://github.com/vuejs/vue/commit/571a4880fc06b491a280325b79fd4cbb59ceb47e)), closes [#9562](https://github.com/vuejs/vue/issues/9562)
- handle async component when parent is toggled before resolve ([#9572](https://github.com/vuejs/vue/issues/9572)) ([ed34113](https://github.com/vuejs/vue/commit/ed341137b23315b76ba391db1b0e537950c091e1)), closes [#9571](https://github.com/vuejs/vue/issues/9571)
- scoped slots dynamic check should include v-for on element itself ([2277b23](https://github.com/vuejs/vue/commit/2277b2322cf81b5830a5b85f6600e1896edc7aa9)), closes [#9596](https://github.com/vuejs/vue/issues/9596)
- **types:** allow scoped slots to return a single VNode ([#9563](https://github.com/vuejs/vue/issues/9563)) ([241eea1](https://github.com/vuejs/vue/commit/241eea19a64550bfdb3f9d7e4197127997572842))
- **types:** update this for nextTick api ([#9541](https://github.com/vuejs/vue/issues/9541)) ([f333016](https://github.com/vuejs/vue/commit/f33301619d18b9392597c5230af17921c0b42466))

## [2.6.7](https://github.com/vuejs/vue/compare/v2.6.6...v2.6.7) (2019-02-21)

### Bug Fixes

- **#9511:** avoid promise catch multiple times ([#9526](https://github.com/vuejs/vue/issues/9526)) ([2f3020e](https://github.com/vuejs/vue/commit/2f3020e9cc1ad5c878606b56bb73a30b1d9bb7d9)), closes [#9511](https://github.com/vuejs/vue/issues/9511) [#9511](https://github.com/vuejs/vue/issues/9511) [#9511](https://github.com/vuejs/vue/issues/9511) [#9511](https://github.com/vuejs/vue/issues/9511)
- avoid errors thrown during dom props update ([8a80a23](https://github.com/vuejs/vue/commit/8a80a23ecba23f92f278d664388050ffcd121385)), closes [#9459](https://github.com/vuejs/vue/issues/9459)
- avoid possible infinite loop by accessing observables in error handler ([#9489](https://github.com/vuejs/vue/issues/9489)) ([ee29e41](https://github.com/vuejs/vue/commit/ee29e41ef469b3ca3c793f04289075e3b128447f))
- **compiler:** handle negative length in codeframe repeat ([7a8de91](https://github.com/vuejs/vue/commit/7a8de91cd78f523fabe8452652513250871a01c6))
- ensure generated scoped slot code is compatible with 2.5 ([7ec4627](https://github.com/vuejs/vue/commit/7ec4627902020cccd7b3f4fbc63e1b0d6b9798cd)), closes [#9545](https://github.com/vuejs/vue/issues/9545)
- ensure scoped slots update in conditional branches ([d9b27a9](https://github.com/vuejs/vue/commit/d9b27a92bd5277ee23a4e68a8bd31ecc72f4c99b)), closes [#9534](https://github.com/vuejs/vue/issues/9534)
- scoped slots should update when inside v-for ([8f004ea](https://github.com/vuejs/vue/commit/8f004ea44e06d7764fa884212fa95c2033515928)), closes [#9506](https://github.com/vuejs/vue/issues/9506)

## [2.6.6](https://github.com/vuejs/vue/compare/v2.6.5...v2.6.6) (2019-02-12)

### Bug Fixes

- ensure scoped slot containing passed down slot content updates properly ([21fca2f](https://github.com/vuejs/vue/commit/21fca2fffc3a75235a6656eb85ae40835e04bf69))
- fix keyCode check for Chrome autofill fake key events ([29c348f](https://github.com/vuejs/vue/commit/29c348f3cf60c50a52cc98123f8c54fa8f5672fc)), closes [#9441](https://github.com/vuejs/vue/issues/9441)

## [2.6.5](https://github.com/vuejs/vue/compare/v2.6.4...v2.6.5) (2019-02-11)

### Bug Fixes

- allow passing multiple arguments to scoped slot ([e7d49cd](https://github.com/vuejs/vue/commit/e7d49cdcf2fd9a612e0dac7a7bea318824210881)), closes [#9468](https://github.com/vuejs/vue/issues/9468)
- bail out of event blocking for iOS bug ([0bad7e2](https://github.com/vuejs/vue/commit/0bad7e2a3508b55abaa8aec2a1bd9c1127305cb4)), closes [#9462](https://github.com/vuejs/vue/issues/9462)
- do not cache scoped slots when mixed with normal slots ([060686d](https://github.com/vuejs/vue/commit/060686d6ea4d013129b4d2e93d7d2e5c93e09686))

## [2.6.4](https://github.com/vuejs/vue/compare/v2.6.3...v2.6.4) (2019-02-08)

### Bug Fixes

- avoid breaking avoriaz edge case ([9011b83](https://github.com/vuejs/vue/commit/9011b83db79cf2f3563f8fccb2e41b5b863c3ee9))
- avoid logging same error twice when thrown by user in global handler ([ca57920](https://github.com/vuejs/vue/commit/ca57920edb56000bfc87bb64f4e5e3450c03e13a)), closes [#9445](https://github.com/vuejs/vue/issues/9445)
- empty scoped slot should return undefined ([57bc80a](https://github.com/vuejs/vue/commit/57bc80a546acb2bd092edd393228324b453ae4e2)), closes [#9452](https://github.com/vuejs/vue/issues/9452)
- expose v-slot slots without scope on this.$slots ([0e8560d](https://github.com/vuejs/vue/commit/0e8560d0fc1c0fbf3a52464939701e0e44543b00)), closes [#9421](https://github.com/vuejs/vue/issues/9421) [#9458](https://github.com/vuejs/vue/issues/9458)
- new syntax slots without scope should also be exposed on functional slots() ([8a80086](https://github.com/vuejs/vue/commit/8a800867fe61e5aa642e1e3da91bb890d07312f7))

### Performance Improvements

- cache result from functional ctx.slots() calls ([7a0dfd0](https://github.com/vuejs/vue/commit/7a0dfd0badf3054c95ac1ec66cc6e213f1592c95))
- skip scoped slots normalization when possible ([099f3ba](https://github.com/vuejs/vue/commit/099f3ba60085a089ff369442bdb835f3868e47c0))

## [2.6.3](https://github.com/vuejs/vue/compare/v2.6.2...v2.6.3) (2019-02-06)

### Bug Fixes

- async component should use render owner as force update context ([b9de23b](https://github.com/vuejs/vue/commit/b9de23b1008b52deca7e7df40843e318a42f3f53)), closes [#9432](https://github.com/vuejs/vue/issues/9432)
- avoid exposing internal flags on $scopedSlots ([24b4640](https://github.com/vuejs/vue/commit/24b4640c1f268722f5ab8f03e68e2df897cfbdf6)), closes [#9443](https://github.com/vuejs/vue/issues/9443)
- bail out scoped slot optimization when there are nested scopes ([4d4d22a](https://github.com/vuejs/vue/commit/4d4d22a3f6017c46d08b67afe46af43027b06629)), closes [#9438](https://github.com/vuejs/vue/issues/9438)
- **compiler:** fix v-bind dynamic arguments on slot outlets ([96a09aa](https://github.com/vuejs/vue/commit/96a09aad99bdecbcc0e5c420077bf41893d4a745)), closes [#9444](https://github.com/vuejs/vue/issues/9444)
- skip microtask fix if event is fired from different document ([dae7e41](https://github.com/vuejs/vue/commit/dae7e4182fbbb41e599953cc22e5d54dbb164070)), closes [#9448](https://github.com/vuejs/vue/issues/9448)
- skip microtask fix in Firefix <= 53 ([7bc88f3](https://github.com/vuejs/vue/commit/7bc88f30c3eadded07dd5b460d1e7cb9342d017c)), closes [#9446](https://github.com/vuejs/vue/issues/9446)
- **types:** add Vue.version to types ([#9431](https://github.com/vuejs/vue/issues/9431)) ([54e6a12](https://github.com/vuejs/vue/commit/54e6a121e992f20c03f104533caa4c59e59b1ee7))

### Reverts

- feat: expose all scoped slots on this.$slots ([d5ade28](https://github.com/vuejs/vue/commit/d5ade28652b07303ac6b713813792752ae5e4e04))

## [2.6.2](https://github.com/vuejs/vue/compare/v2.6.1...v2.6.2) (2019-02-05)

### Bug Fixes

- always set transformed model value on attrs ([b034abf](https://github.com/vuejs/vue/commit/b034abf48e793189ce8796c259eed2fbfb79bcd0))
- restore slot-scope + v-if behavior ([44a4ca3](https://github.com/vuejs/vue/commit/44a4ca33b95070e9aa53c6924479519d86dd9b36)), closes [#9422](https://github.com/vuejs/vue/issues/9422)

### Features

- expose all scoped slots on this.$slots ([0129b0e](https://github.com/vuejs/vue/commit/0129b0eb12a1f98a722f100892bfc5e60b0f51ce)), closes [#9421](https://github.com/vuejs/vue/issues/9421)

## [2.6.1](https://github.com/vuejs/vue/compare/v2.6.0...v2.6.1) (2019-02-04)

### Bug Fixes

- avoid blocking first input event in IE when it shouldn't ([#9297](https://github.com/vuejs/vue/issues/9297)) ([0fb03b7](https://github.com/vuejs/vue/commit/0fb03b7831693b4abc90dd0bfe971c36c02d82a6)), closes [#7138](https://github.com/vuejs/vue/issues/7138) [#9042](https://github.com/vuejs/vue/issues/9042) [#9383](https://github.com/vuejs/vue/issues/9383)
- avoid isPromise check when handler return value is Vue instance ([b6b42ca](https://github.com/vuejs/vue/commit/b6b42ca8c41963be292caa266ce4330603f4c4eb)), closes [#9418](https://github.com/vuejs/vue/issues/9418)
- **compiler:** fix inline-template crashing ([#9365](https://github.com/vuejs/vue/issues/9365)) ([55bfb94](https://github.com/vuejs/vue/commit/55bfb94a33ecc9b33131ec0fb78bba2946e8fc75)), closes [#9361](https://github.com/vuejs/vue/issues/9361)
- decode single quotes in html attributes ([#9341](https://github.com/vuejs/vue/issues/9341)) ([c27fe24](https://github.com/vuejs/vue/commit/c27fe24dc6088b517ab17c799a1852f97c22c076))
- **template-compiler:** allow comments on the root node in templates ([#9408](https://github.com/vuejs/vue/issues/9408)) ([1922e7d](https://github.com/vuejs/vue/commit/1922e7d4d99d0397223b3919a1643aacb7afbbab)), closes [#9407](https://github.com/vuejs/vue/issues/9407)
- **v-model:** add value to $attrs if not defined in props ([#9331](https://github.com/vuejs/vue/issues/9331)) ([66fd3c8](https://github.com/vuejs/vue/commit/66fd3c8dd1577d4b634731adf4be4d3db5bf1df6)), closes [#9330](https://github.com/vuejs/vue/issues/9330)

# [2.6.0](https://github.com/vuejs/vue/compare/v2.6.0-beta.3...v2.6.0) (2019-02-04)

### Bug Fixes

- allow more enumerated values for contenteditable ([e632e9a](https://github.com/vuejs/vue/commit/e632e9a0759532e1d902871ca07b02c9ac267e7c)), closes [#9397](https://github.com/vuejs/vue/issues/9397)
- fix child forceUpdate regression ([44a17ba](https://github.com/vuejs/vue/commit/44a17ba2cde7fb9a673486d44de7f29feb5c1882)), closes [#9396](https://github.com/vuejs/vue/issues/9396)
- fix v-bind:style for camelCase properties with !important ([#9386](https://github.com/vuejs/vue/issues/9386)) ([539e481](https://github.com/vuejs/vue/commit/539e481f38706a6202f0eacf54c579362fbd5bb4))
- template v-slot should work with v-else conditions ([2807fd2](https://github.com/vuejs/vue/commit/2807fd24b0c17179336f84d1725b69cd3c7a0aca))

### Features

- move v-bind.prop shorthand behind flag ([64f863b](https://github.com/vuejs/vue/commit/64f863bbb9c8147819ef4547dfdadba0239c6d59))

# [2.6.0-beta.3](https://github.com/vuejs/vue/compare/v2.6.0-beta.2...v2.6.0-beta.3) (2019-01-30)

### Features

- detect and warn invalid dynamic argument expressions ([c9e3a5d](https://github.com/vuejs/vue/commit/c9e3a5d1d92500ac1e1d1eb6f3866a9df5eecf53))

# [2.6.0-beta.2](https://github.com/vuejs/vue/compare/v2.6.0-beta.1...v2.6.0-beta.2) (2019-01-26)

### Bug Fixes

- async edge case fix should apply to more browsers ([ba0ebd4](https://github.com/vuejs/vue/commit/ba0ebd4771ddb5c56c1261f82c842b57ca7163a6))
- fix checkbox event edge case in Firefox ([1868561](https://github.com/vuejs/vue/commit/1868561442507690f07579c258f4db19a650fb9a))

### Features

- adjust v-slot per RFC + enable flag ([67e85de](https://github.com/vuejs/vue/commit/67e85deae2b9720624ed7b20223b905a882942a0))
- dynamic directive arguments for v-on, v-bind and custom directives ([#9373](https://github.com/vuejs/vue/issues/9373)) ([dbc0582](https://github.com/vuejs/vue/commit/dbc0582587f90e78867809bb6ae683301cd0626b))
- **ssr:** allow template option to be function in renderToString ([#9324](https://github.com/vuejs/vue/issues/9324)) ([b65f6d7](https://github.com/vuejs/vue/commit/b65f6d78e0e480601b0042b1b5e8259343b629fb))
- update new slot syntax per RFC revision ([4fca045](https://github.com/vuejs/vue/commit/4fca0454bd716a5d3ba32057ff2ed510af933c8d))
- warning for ambiguous v-slot usage ([8d84572](https://github.com/vuejs/vue/commit/8d8457246daac543c5935aa3cbf62d362431da43))

### Performance Improvements

- improve scoped slots change detection accuracy ([#9371](https://github.com/vuejs/vue/issues/9371)) ([f219bed](https://github.com/vuejs/vue/commit/f219bedae8f9cab131eb5529769bcfdc91ce2912))

# [2.6.0-beta.1](https://github.com/vuejs/vue/compare/v2.5.22...v2.6.0-beta.1) (2019-01-16)

### Bug Fixes

- allow \_ in watch paths (element compat) ([8b382b3](https://github.com/vuejs/vue/commit/8b382b3efb14986e9ea5213d0b57c244b70ae0e7))
- always use microtasks for nextTick ([#8450](https://github.com/vuejs/vue/issues/8450)) ([850555d](https://github.com/vuejs/vue/commit/850555d1faa9be7d8306adffd95c7dee5e58717f)), closes [#7109](https://github.com/vuejs/vue/issues/7109) [#7546](https://github.com/vuejs/vue/issues/7546) [#7707](https://github.com/vuejs/vue/issues/7707) [#7834](https://github.com/vuejs/vue/issues/7834) [#8109](https://github.com/vuejs/vue/issues/8109) [#6566](https://github.com/vuejs/vue/issues/6566)
- **core:** dedupe lifecycle hooks during options merge ([edf7df0](https://github.com/vuejs/vue/commit/edf7df0c837557dd3ea8d7b42ad8d4b21858ade0)), closes [#9199](https://github.com/vuejs/vue/issues/9199)
- **core:** fix merged twice bug when passing extended constructor to mixins ([#9199](https://github.com/vuejs/vue/issues/9199)) ([5371617](https://github.com/vuejs/vue/commit/537161779ea329c1d0a993997555f1c692b8cac1)), closes [#9198](https://github.com/vuejs/vue/issues/9198)
- cover more cases in v-on inline return value ([9432737](https://github.com/vuejs/vue/commit/9432737cf871335c42ce0dc0a0baa21a4d8c3832))
- ensure only nromalize a scoped slot when it is present ([5fb23d4](https://github.com/vuejs/vue/commit/5fb23d4e2971480d14fbee0146e3416a07bc0b9f))
- ensure proxied normal slot uses correct key ([b32c4b6](https://github.com/vuejs/vue/commit/b32c4b693535c35ae10742eb3351cbc123b15941))
- make transition-group key warning a tip to avoid breaking compilation ([d08b49f](https://github.com/vuejs/vue/commit/d08b49f520e0704f9d4e61be4f751e3b2cdac6a8))
- **next-tick:** revert 60da366 ([080dd97](https://github.com/vuejs/vue/commit/080dd971f77f7c631650c4e3027d1802f4e804d8)), closes [#8436](https://github.com/vuejs/vue/issues/8436)
- **provide/inject:** Merges symbol provides ([#7926](https://github.com/vuejs/vue/issues/7926)) ([1933ee8](https://github.com/vuejs/vue/commit/1933ee80ff808b81a691fa6a135c1588d218bc0a))
- return inline invocation return value in v-on handlers ([0ebb0f3](https://github.com/vuejs/vue/commit/0ebb0f39dfee0a5c03adb2f312f617cca37b44d6)), closes [#7628](https://github.com/vuejs/vue/issues/7628)
- **runtime:** DevTools recommendation shows for all browsers ([#8638](https://github.com/vuejs/vue/issues/8638)) ([22ad266](https://github.com/vuejs/vue/commit/22ad26615104c15fd09bc69692e3042bb1bb58e9)), closes [#8634](https://github.com/vuejs/vue/issues/8634)
- **scoped-slots:** ensure $scopedSlots calls always return Arrays ([c7c13c2](https://github.com/vuejs/vue/commit/c7c13c2a156269d29fd9c9f8f6a3e53a2f2cac3d)), closes [#8056](https://github.com/vuejs/vue/issues/8056)
- **ssr:** properly handle invalid and numeric style properties ([7d9cfeb](https://github.com/vuejs/vue/commit/7d9cfebe39ffd531e0948668e688474b276cdec1)), closes [#9231](https://github.com/vuejs/vue/issues/9231)
- **ssr:** should not render invalid numeric style values ([17d8bcb](https://github.com/vuejs/vue/commit/17d8bcb60edc14b2c23f5e6cc92f030897092e21))
- **ssr:** should render 0 as valid value for style property with unit ([aef5b4e](https://github.com/vuejs/vue/commit/aef5b4e47811cb842315bd27d6919650da45279b))

### Features

- add browser ESM build ([861abf4](https://github.com/vuejs/vue/commit/861abf4bb940e89a6ae3c5c3e2dad4ed0bd53b3e))
- add Vue.observable() for explicitly creating observable objects ([c50bbde](https://github.com/vuejs/vue/commit/c50bbde41c4a1868a8a0b33df3238346840bd37c))
- **compiler/watch:** allow unicode characters in component names and watch paths ([#8666](https://github.com/vuejs/vue/issues/8666)) ([9c71852](https://github.com/vuejs/vue/commit/9c718522bac60d13d3b48d6b6512fccfd5cf8858)), closes [#8564](https://github.com/vuejs/vue/issues/8564)
- **compiler:** add whitespace option, deprecate preserveWhitespace option ([e1abedb](https://github.com/vuejs/vue/commit/e1abedb9e66b21da8a7e93e175b9dabe334dfebd)), closes [#9208](https://github.com/vuejs/vue/issues/9208)
- **compiler:** expose generateCodeFrame method ([a4ed58c](https://github.com/vuejs/vue/commit/a4ed58c076649a4536b40a9c98c974c77602c76b))
- **compiler:** output codeframe in browser compiler ([325fc76](https://github.com/vuejs/vue/commit/325fc7693c1574e69fe542f1dbc334030a4b1ec3))
- **compiler:** output source range for compiler errors ([#7127](https://github.com/vuejs/vue/issues/7127)) ([b31a1aa](https://github.com/vuejs/vue/commit/b31a1aa8870474b2ca782c45d55edac2932d4cc2)), closes [#6338](https://github.com/vuejs/vue/issues/6338)
- **compiler:** support deindent: false in vue-template-compiler ([#7215](https://github.com/vuejs/vue/issues/7215)) ([bf0efb0](https://github.com/vuejs/vue/commit/bf0efb02b1f52cceb0bad8588cf6c90e22349049)), closes [#7054](https://github.com/vuejs/vue/issues/7054)
- **config:** expose config.useEventDelegation and default to false ([3be1c5d](https://github.com/vuejs/vue/commit/3be1c5d67e8bdfc9387122317bf3779261010d45))
- **core:** expose all slots on $scopedSlots as functions ([5d52262](https://github.com/vuejs/vue/commit/5d52262f1ce56d080c3438c4773a81dc5c8397aa))
- **errors:** sync/async error handling for lifecycle hooks and v-on handlers ([#8395](https://github.com/vuejs/vue/issues/8395)) ([6e9fcfc](https://github.com/vuejs/vue/commit/6e9fcfc81d922a1b188268bf50d7e67c07d6d662)), closes [#6953](https://github.com/vuejs/vue/issues/6953) [#7653](https://github.com/vuejs/vue/issues/7653)
- expose performance measures ([9ae80ac](https://github.com/vuejs/vue/commit/9ae80acde59d9d149ee5e4e2097f209eac6f834f)), closes [#7570](https://github.com/vuejs/vue/issues/7570)
- **functional:** add scopedSlots to context in functional components ([#7941](https://github.com/vuejs/vue/issues/7941)) ([fb6aa06](https://github.com/vuejs/vue/commit/fb6aa0609045e69a0b6050bc7b6466b63be8d69d))
- new scoped slot syntax implementation update per rfc ([c5c354d](https://github.com/vuejs/vue/commit/c5c354d593d6f6344e78ca098f1ae1fa3e83d6ed))
- **ssr:** Add 'nonce' option to context for ssr outlet script ([#8047](https://github.com/vuejs/vue/issues/8047)) ([f036cce](https://github.com/vuejs/vue/commit/f036cce16377cec328bee03a3a4069275b320312)), closes [#7479](https://github.com/vuejs/vue/issues/7479)
- **ssr:** add custom state serializer option ([4494012](https://github.com/vuejs/vue/commit/44940121eef4e2df5f3cb3c21f3f468af8b336bc)), closes [#6614](https://github.com/vuejs/vue/issues/6614)
- **ssr:** allow opting-out of caching by returning false in serverCacheKey ([ab24285](https://github.com/vuejs/vue/commit/ab24285458c98e25d5749beb4edebef73672de4b)), closes [#8790](https://github.com/vuejs/vue/issues/8790)
- **ssr:** ssrPrefetch option + context.rendered hook ([#9017](https://github.com/vuejs/vue/issues/9017)) ([d7a533d](https://github.com/vuejs/vue/commit/d7a533d6f85aae52aed03202fa5ccb774f0cb2ec))
- support .property shorthand syntax for v-bind.prop modifier ([d2902ca](https://github.com/vuejs/vue/commit/d2902ca8ec5fd184fe81479fea1318553fdb8323)), closes [#7582](https://github.com/vuejs/vue/issues/7582)
- support custom toString() in text interpolation and v-html ([#8217](https://github.com/vuejs/vue/issues/8217)) ([0e4e45e](https://github.com/vuejs/vue/commit/0e4e45ec741416e0042c29a53bbc0e58c8663f6e)), closes [#8093](https://github.com/vuejs/vue/issues/8093)
- support slot-props and its shorthand ([584e89d](https://github.com/vuejs/vue/commit/584e89da4ab17e1ebdae0ae10be77ef9d230c7a0))
- support v-html for SVG elements ([#8652](https://github.com/vuejs/vue/issues/8652)) ([a981c80](https://github.com/vuejs/vue/commit/a981c80d2aedb0d56f98865e39c981819fbf65d0))
- **types:** add Prop to main type declaration file ([#6856](https://github.com/vuejs/vue/issues/6856)) ([5791072](https://github.com/vuejs/vue/commit/57910723c6ba68386c15e095e42c1ed9603c7bcf)), closes [#6850](https://github.com/vuejs/vue/issues/6850)
- **types:** add types for vue-template-compiler ([#7918](https://github.com/vuejs/vue/issues/7918)) ([ced774b](https://github.com/vuejs/vue/commit/ced774be6ddbc53884d7a5d395514a9f62e32336))
- use event delegation when possible ([b7f7f27](https://github.com/vuejs/vue/commit/b7f7f2756928f409950186c5d641034f362b392a)), closes [#6566](https://github.com/vuejs/vue/issues/6566)
- v-bind.sync also listens for kebab-case update event ([#8297](https://github.com/vuejs/vue/issues/8297)) ([3fca527](https://github.com/vuejs/vue/commit/3fca52792ef83fa58a5c28882706d9e8a039790d)), closes [#6428](https://github.com/vuejs/vue/issues/6428)
- **v-for:** support iterables in v-for ([#8179](https://github.com/vuejs/vue/issues/8179)) ([d40eb9c](https://github.com/vuejs/vue/commit/d40eb9c2880c8dd27fedb9fbc508823a15742274))

## [2.5.22](https://github.com/vuejs/vue/compare/v2.5.21...v2.5.22) (2019-01-11)

### Bug Fixes

- **async component:** memory leak after synchronous async loading ([#9275](https://github.com/vuejs/vue/issues/9275)) ([d21e931](https://github.com/vuejs/vue/commit/d21e93139697be2c0a6fdc4ee74d30d2834a729f)), closes [#9229](https://github.com/vuejs/vue/issues/9229)
- **core:** dedupe lifecycle hooks during options merge ([0d2e9c4](https://github.com/vuejs/vue/commit/0d2e9c46f16e9ec5bd0f3eebd2aa31c7f7493856)), closes [#9199](https://github.com/vuejs/vue/issues/9199)
- **core:** fix merged twice bug when passing extended constructor to mixins ([#9199](https://github.com/vuejs/vue/issues/9199)) ([743edac](https://github.com/vuejs/vue/commit/743edacdb6fa0bb711e860b68373274f50c8baa5)), closes [#9198](https://github.com/vuejs/vue/issues/9198)
- **ssr:** support rendering comment ([#9128](https://github.com/vuejs/vue/issues/9128)) ([b06c784](https://github.com/vuejs/vue/commit/b06c784b81a244e1bc2d028216fcd2ab873730b9))

## [2.5.21](https://github.com/vuejs/vue/compare/v2.5.20...v2.5.21) (2018-12-11)

### Bug Fixes

- fix single v-for child optimization ([847e493](https://github.com/vuejs/vue/commit/847e493768371cec4718969e02bdb7f8463f4e03))
- fix v-for component with undefined value ([4748760](https://github.com/vuejs/vue/commit/47487607fbb99339038cf84990ba341c25b5e20d)), closes [#9181](https://github.com/vuejs/vue/issues/9181)
- **lifecycle:** beforeUpdated should not be called if component is destroyed ([#9171](https://github.com/vuejs/vue/issues/9171)) ([87bad80](https://github.com/vuejs/vue/commit/87bad80f0cb9a30b95d9410120ff6e3e2022a723)), closes [#8076](https://github.com/vuejs/vue/issues/8076)
- **types:** accept primatives and falsy values in createElement children ([#9154](https://github.com/vuejs/vue/issues/9154)) ([d780dd2](https://github.com/vuejs/vue/commit/d780dd2e2adcf71f40c086055a659a9a2b4a8282)), closes [#8498](https://github.com/vuejs/vue/issues/8498)
- **v-model:** properly handle multiline v-model expressions ([#9184](https://github.com/vuejs/vue/issues/9184)) ([3d44937](https://github.com/vuejs/vue/commit/3d449376d557c4533a9664f95df3a168ecee9bfa)), closes [#9183](https://github.com/vuejs/vue/issues/9183)
- **weex:** support data class type that is string ([#9139](https://github.com/vuejs/vue/issues/9139)) ([d8285c5](https://github.com/vuejs/vue/commit/d8285c57a613c42eddf2d4f2b75c1cea6aa4703a)), closes [#9124](https://github.com/vuejs/vue/issues/9124)

### Performance Improvements

- skip normalization on single child element v-for ([4074104](https://github.com/vuejs/vue/commit/4074104fac219e61e542f4da3a4800975a8063f2))

### Reverts

- "chore: use keypress in TodoMVC example for IME input methods ([#9172](https://github.com/vuejs/vue/issues/9172))" ([80fb6b8](https://github.com/vuejs/vue/commit/80fb6b8da144bd9c2313702e23a35d72fa620135))

## [2.5.20](https://github.com/vuejs/vue/compare/v2.5.19...v2.5.20) (2018-12-10)

### Bug Fixes

- **types:** avoid `this` in VueConstructor signature ([#9173](https://github.com/vuejs/vue/issues/9173)) ([e06d2af](https://github.com/vuejs/vue/commit/e06d2af276fc8d626a3b048f4d138a243aa690a4)), closes [/github.com/vuejs/vue-class-component/issues/294#issuecomment-445526936](https://github.com//github.com/vuejs/vue-class-component/issues/294/issues/issuecomment-445526936)

## [2.5.19](https://github.com/vuejs/vue/compare/v2.5.18...v2.5.19) (2018-12-09)

### Bug Fixes

- **ssr:** should not warn for custom directives that do not have ssr implementation ([780dac5](https://github.com/vuejs/vue/commit/780dac561b9cd6c3cec28f154f76e7d28352ebf3)), closes [#9167](https://github.com/vuejs/vue/issues/9167)
- **vdom:** remove unnecessary sameVnode condition ([0d4b35f](https://github.com/vuejs/vue/commit/0d4b35f55975946cb0eb4f7f5f35efe3d078473e)), closes [#9168](https://github.com/vuejs/vue/issues/9168)

### Reverts

- fix(sfc): avoid deindent when pad option is specified ([#7647](https://github.com/vuejs/vue/issues/7647)) ([5d721a4](https://github.com/vuejs/vue/commit/5d721a42b140865e50a78445fe21c5f270bde703))

## [2.5.18](https://github.com/vuejs/vue/compare/v2.5.18-beta.0...v2.5.18) (2018-12-07)

### Bug Fixes

- **compiler:** fix codegen for v-for component inside template ([1b4a8a0](https://github.com/vuejs/vue/commit/1b4a8a0c1edaf9c7eb129ba61bca94ba607bbf56)), closes [#9142](https://github.com/vuejs/vue/issues/9142)
- fix keyName checking for space and delete in IE11 ([#9150](https://github.com/vuejs/vue/issues/9150)) ([0ed0aad](https://github.com/vuejs/vue/commit/0ed0aad77228b95e9a61a87386736938837527f8)), closes [#9112](https://github.com/vuejs/vue/issues/9112)
- **ssr:** fix ssr template publicPath generation ([f077ed1](https://github.com/vuejs/vue/commit/f077ed17af14bb2675db64b2aa2d023769219624)), closes [#9145](https://github.com/vuejs/vue/issues/9145)
- **transition-group:** fix activeInstance regression ([8a2dbf5](https://github.com/vuejs/vue/commit/8a2dbf50105ea729125a42fecfe2c2f0371d7836)), closes [#9151](https://github.com/vuejs/vue/issues/9151)
- **types:** correct scopedSlot types ([#9131](https://github.com/vuejs/vue/issues/9131)) ([448ba65](https://github.com/vuejs/vue/commit/448ba65d2b139b29f1e6891add9925ac22ffe10b)), closes [#8946](https://github.com/vuejs/vue/issues/8946)
- **types:** type support for advanced async components ([#8438](https://github.com/vuejs/vue/issues/8438)) ([dfaf9e2](https://github.com/vuejs/vue/commit/dfaf9e24361e10ae68ce3951eaf48262cf90f0ec))

## [2.5.18-beta.0](https://github.com/vuejs/vue/compare/v2.5.17-beta.0...v2.5.18-beta.0) (2018-12-02)

### Bug Fixes

- actually disable dep collection when invoking lifecycle hooks ([#9095](https://github.com/vuejs/vue/issues/9095)) ([0d62bb8](https://github.com/vuejs/vue/commit/0d62bb84ffa1af7a4826aecc11c429c7a020645c)), closes [#9046](https://github.com/vuejs/vue/issues/9046)
- **compiler:** wrap scoped slots v-if conditions in parens ([#9119](https://github.com/vuejs/vue/issues/9119)) ([ef8524a](https://github.com/vuejs/vue/commit/ef8524ab7db8d64ac449ce74f5858aa9d91357ad)), closes [#9114](https://github.com/vuejs/vue/issues/9114)
- **compiler:** maybeComponent should return true when "is" attribute exists ([#8114](https://github.com/vuejs/vue/issues/8114)) ([aef2a5f](https://github.com/vuejs/vue/commit/aef2a5f3dbd5e52ec9d5ce026d7b858539057186)), closes [#8101](https://github.com/vuejs/vue/issues/8101)
- **compiler:** normalize potential functional component children in v-for ([#8558](https://github.com/vuejs/vue/issues/8558)) ([d483a49](https://github.com/vuejs/vue/commit/d483a49c86874b2e75863b661f81feecd46ae721)), closes [#8468](https://github.com/vuejs/vue/issues/8468)
- **compiler:** should keep newline after unary tags in <pre> ([#8965](https://github.com/vuejs/vue/issues/8965)) ([05001e6](https://github.com/vuejs/vue/commit/05001e695ebd0b0504d664197a4771463a0f5328)), closes [#8950](https://github.com/vuejs/vue/issues/8950)
- **compiler:** templates inside v-pre should be rendered to HTML ([#8146](https://github.com/vuejs/vue/issues/8146)) ([ecac831](https://github.com/vuejs/vue/commit/ecac831691d27cf7a10ec73a004d3fbad7623d1a)), closes [#8041](https://github.com/vuejs/vue/issues/8041)
- **component:** clean up memory leak after loading async component completes (fix [#8740](https://github.com/vuejs/vue/issues/8740)) ([#8755](https://github.com/vuejs/vue/issues/8755)) ([2e472c5](https://github.com/vuejs/vue/commit/2e472c5e5e559a7a4083b4164ffe0c3911ce0651))
- **core:** avoid mutating original children when cloning vnode ([097f622](https://github.com/vuejs/vue/commit/097f6229dffc34af452b106ad2a3b58845588807)), closes [#7975](https://github.com/vuejs/vue/issues/7975)
- **core:** properly handle reused vnodes ([530ca1b](https://github.com/vuejs/vue/commit/530ca1b2db315fbd0e360807b2031d26665c5d3d)), closes [#7913](https://github.com/vuejs/vue/issues/7913)
- **core:** skip mixins and extends if child is already merged ([#8870](https://github.com/vuejs/vue/issues/8870)) ([80f17fa](https://github.com/vuejs/vue/commit/80f17fa498f5df0388412877799dbd7573c44b2d)), closes [#8865](https://github.com/vuejs/vue/issues/8865)
- **data:** skip recursive call if values are identical ([#8967](https://github.com/vuejs/vue/issues/8967)) ([a7658e0](https://github.com/vuejs/vue/commit/a7658e03a16dc507f0abeba41aee705f773727d0))
- **error handling:** handle errors on immediate watcher execution ([#8581](https://github.com/vuejs/vue/issues/8581)) ([2686818](https://github.com/vuejs/vue/commit/2686818beb5728e3b7aa22f47a3b3f0d39d90c8e)), closes [#8567](https://github.com/vuejs/vue/issues/8567)
- fix potential xss vulnerability in ssr when using v-bind ([3d36a44](https://github.com/vuejs/vue/commit/3d36a443c755bf16f2656a8595dda9076f021a4a))
- fix server env detection in wechat mini program ([#9075](https://github.com/vuejs/vue/issues/9075)) ([05e8bcf](https://github.com/vuejs/vue/commit/05e8bcfe5d308f280f3640df96bd170fbcf1a9b5))
- **for:** use IE compatible regex in v-for regex ([#8048](https://github.com/vuejs/vue/issues/8048)) ([ecc239e](https://github.com/vuejs/vue/commit/ecc239e47516d7f9a93b2cd49da4a2000960b8f7)), closes [#7946](https://github.com/vuejs/vue/issues/7946)
- handle undefined style properties in jsdom (fix [#7444](https://github.com/vuejs/vue/issues/7444)) ([#8281](https://github.com/vuejs/vue/issues/8281)) ([5cfdf1a](https://github.com/vuejs/vue/commit/5cfdf1a2484fa73b572eae4afd196dcf9e1912ba))
- **lifecycle:** updated should not be called after component being destroyed ([#8381](https://github.com/vuejs/vue/issues/8381)) ([a64ff19](https://github.com/vuejs/vue/commit/a64ff1957c35270b818aa9cfdfb2acb6e42ce2a9)), closes [#8076](https://github.com/vuejs/vue/issues/8076)
- make sure global state is restored in the case of an exception in macrotask callback ([#9093](https://github.com/vuejs/vue/issues/9093)) ([b111de4](https://github.com/vuejs/vue/commit/b111de486b1bdc747fe0f5795fe22697d151bb8c))
- **parser:** allow CRLFs in string interpolations ([#8408](https://github.com/vuejs/vue/issues/8408)) ([8f04135](https://github.com/vuejs/vue/commit/8f04135dbaa5f5f0500d42c0968beba8043f5363)), closes [#8103](https://github.com/vuejs/vue/issues/8103)
- replace hardcoded .parentNode with abstract ops, fix [#8713](https://github.com/vuejs/vue/issues/8713) ([#8714](https://github.com/vuejs/vue/issues/8714)) ([1e1ce0c](https://github.com/vuejs/vue/commit/1e1ce0cac7d6c22c980021cbd3cb207a47e85dfb))
- **server:** use path.posix.join to generate public path ([#8177](https://github.com/vuejs/vue/issues/8177)) ([46b8d2c](https://github.com/vuejs/vue/commit/46b8d2c59dc259995a71662229ed52b8b8beeb38)), closes [#8167](https://github.com/vuejs/vue/issues/8167)
- **sfc:** avoid deindent when pad option is specified ([#7647](https://github.com/vuejs/vue/issues/7647)) ([9d2f9a0](https://github.com/vuejs/vue/commit/9d2f9a034f9c40d5ba6d8b1e131b1bfb675dc1cf))
- **shared:** check dates in looseEqual ([#7940](https://github.com/vuejs/vue/issues/7940)) ([db7287c](https://github.com/vuejs/vue/commit/db7287c23b11bdc032fb0786e6617f3c6c40c835)), closes [#7928](https://github.com/vuejs/vue/issues/7928)
- **ssr:** adjust call stack size defer threshold ([e4b1b57](https://github.com/vuejs/vue/commit/e4b1b57fd7117a19cdb376dcb156606e0cc32a94)), closes [#8545](https://github.com/vuejs/vue/issues/8545)
- **ssr:** check js assets more accurate in ssr webpack plugin ([#8639](https://github.com/vuejs/vue/issues/8639)) ([5624278](https://github.com/vuejs/vue/commit/5624278fbe5d85cfe578d749da12b1e73c3e61a9))
- **ssr:** computed properties should pass vm as first argument in ssr ([#9090](https://github.com/vuejs/vue/issues/9090)) ([33e669b](https://github.com/vuejs/vue/commit/33e669b22f69a1f9c9147528360fe0bba85534f0)), closes [#8977](https://github.com/vuejs/vue/issues/8977)
- **ssr:** fix double escaping of staticClass values ([#7859](https://github.com/vuejs/vue/issues/7859)) ([#8037](https://github.com/vuejs/vue/issues/8037)) ([c21b89e](https://github.com/vuejs/vue/commit/c21b89ebeda4c45024c2a71bc7a292d47ebc7ee1))
- **ssr:** remove trailing hash in webpack module identifier when ([ae6dcd6](https://github.com/vuejs/vue/commit/ae6dcd63a017059644502f8741d8a514f3e9cf84))
- **ssr:** render initial and used async css chunks ([#7902](https://github.com/vuejs/vue/issues/7902)) ([575b6e7](https://github.com/vuejs/vue/commit/575b6e77ab82b0bbc581aec3ea9b07135d2d1fcd)), closes [#7897](https://github.com/vuejs/vue/issues/7897)
- **ssr:** resolve server directives the same as on client ([#9129](https://github.com/vuejs/vue/issues/9129)) ([3078352](https://github.com/vuejs/vue/commit/307835284a326569ea12c4a22c7dcb8f36d2d8ca)), closes [#8961](https://github.com/vuejs/vue/issues/8961)
- support modifier combination of click.right + .once ([#8492](https://github.com/vuejs/vue/issues/8492)) ([eb60452](https://github.com/vuejs/vue/commit/eb604529c62e9954305889122f34499ad75b3b45))
- **transition:** check existence of `el.parentNode` ([#8422](https://github.com/vuejs/vue/issues/8422)) ([0b16927](https://github.com/vuejs/vue/commit/0b16927c9d382b9cf134b131b898350340c2ee41)), closes [#8199](https://github.com/vuejs/vue/issues/8199)
- **transition:** handle local-formatted floats in toMs function. ([#8495](https://github.com/vuejs/vue/issues/8495)) ([59d4351](https://github.com/vuejs/vue/commit/59d4351ad8fc042bc263a16ed45a56e9ff5b013e)), closes [#4894](https://github.com/vuejs/vue/issues/4894)
- **transition:** transition-group should only listen for first-level children's end events ([#8374](https://github.com/vuejs/vue/issues/8374)) ([504d5da](https://github.com/vuejs/vue/commit/504d5da7eff1c77117c2f57b0c4238e56de80fc5))
- **types:** accept `number` type as key on Vue.set/delete ([#8707](https://github.com/vuejs/vue/issues/8707)) ([#8709](https://github.com/vuejs/vue/issues/8709)) ([0ba79e2](https://github.com/vuejs/vue/commit/0ba79e2588309ba386f570ed84d372611c4dd165))
- **types:** fix `renderError`arguments type ([#8636](https://github.com/vuejs/vue/issues/8636)) ([ac217d2](https://github.com/vuejs/vue/commit/ac217d2472bb92ce901ef1f46595b44a1b5d1a18)), closes [#8635](https://github.com/vuejs/vue/issues/8635)
- **types:** fix vm.$once argument type ([#8995](https://github.com/vuejs/vue/issues/8995)) ([97086f3](https://github.com/vuejs/vue/commit/97086f365808a040f6cf1ddb12e2b3f63d7769bf)), closes [#8983](https://github.com/vuejs/vue/issues/8983)
- **types:** make VNodeDirective properties optional, fix [#8013](https://github.com/vuejs/vue/issues/8013) ([#8003](https://github.com/vuejs/vue/issues/8003)) ([99a51b4](https://github.com/vuejs/vue/commit/99a51b452fa13fc4392e87215a8c3024adf5f710))
- **types:** relax the return type of props default option ([#8537](https://github.com/vuejs/vue/issues/8537)) ([a9eb198](https://github.com/vuejs/vue/commit/a9eb198413e7b1baaf364e93ec3c093734529fe8))
- **types:** support chain call for Vue.use and Vue.mixin ([#8595](https://github.com/vuejs/vue/issues/8595)) ([c711ec1](https://github.com/vuejs/vue/commit/c711ec189aaf46399756e34d933ba5e0b6576c36))
- **types:** support typing $el as SVGElement ([#8809](https://github.com/vuejs/vue/issues/8809)) ([3cd4af4](https://github.com/vuejs/vue/commit/3cd4af4af0a8a67f5887d5fc967147d433c8612c))
- v-bind object should be overridable with kebab-cased props ([#8845](https://github.com/vuejs/vue/issues/8845)) ([7585241](https://github.com/vuejs/vue/commit/758524134e71ae025238e16a4c1f2b30a1310fe8))
- **v-model:** avoid duplicate model transforms ([7b7164c](https://github.com/vuejs/vue/commit/7b7164c11cbb74ed44ee086f0a82acfcc1ff47a2)), closes [#8436](https://github.com/vuejs/vue/issues/8436)
- **v-on:** correctly remove once listener ([#8036](https://github.com/vuejs/vue/issues/8036)) ([19c33a7](https://github.com/vuejs/vue/commit/19c33a7e4072b03069f803263ed0c49feb5f73a9)), closes [#8032](https://github.com/vuejs/vue/issues/8032)
- **v-pre:** skip compiling custom component tags in v-pre blocks (fix [#8286](https://github.com/vuejs/vue/issues/8286)) ([#8376](https://github.com/vuejs/vue/issues/8376)) ([a71853b](https://github.com/vuejs/vue/commit/a71853bfc5b6ee117af05408f4d75c80893d44e2))

### Features

- add async option ([#8240](https://github.com/vuejs/vue/issues/8240)) ([c944827](https://github.com/vuejs/vue/commit/c94482743c41e9bfc745aa06d63f7f83bdd56991))
- **devtools:** store functional render context on vnode in development ([#8586](https://github.com/vuejs/vue/issues/8586)) ([4ecc21c](https://github.com/vuejs/vue/commit/4ecc21c29ec12bb33d3b426cb4d42c579e9b0f2d))
- **server, webpack-plugin:** webpack 4 support ([#7839](https://github.com/vuejs/vue/issues/7839)) ([ef0b250](https://github.com/vuejs/vue/commit/ef0b25097957ae9ef9970be732d6e65cc78902e9))
- **weex:** support object syntax of class ([#7930](https://github.com/vuejs/vue/issues/7930)) ([6226503](https://github.com/vuejs/vue/commit/62265035c0c400ad6ec213541dd7cca58dd71f6e))

### Reverts

- Revert "perf: avoid unnecessary re-renders when computed property value did not change (#7824)" ([6b1d431](https://github.com/vuejs/vue/commit/6b1d431a89f3f7438d01d8cc98546397f0983287)), closes [#7824](https://github.com/vuejs/vue/issues/7824)

## [2.5.17-beta.0](https://github.com/vuejs/vue/compare/v2.5.16...v2.5.17-beta.0) (2018-03-23)

### Bug Fixes

- add missing `asyncMeta` during VNode cloning ([#7861](https://github.com/vuejs/vue/issues/7861)) ([8227fb3](https://github.com/vuejs/vue/commit/8227fb35240ab1f301c30a6ad5d4d25071fa7996))
- beforeUpdate should be called before render and allow state mutation ([#7822](https://github.com/vuejs/vue/issues/7822)) ([b7445a2](https://github.com/vuejs/vue/commit/b7445a2b945dcded287601ace8e711ab5cf35ab5)), closes [#7481](https://github.com/vuejs/vue/issues/7481)
- **codegen:** support IE11 and Edge use of "Esc" key ([#7887](https://github.com/vuejs/vue/issues/7887)) ([1bd6196](https://github.com/vuejs/vue/commit/1bd6196fb234c28754d9a27095afe0b5b84990ad)), closes [#7880](https://github.com/vuejs/vue/issues/7880)
- correct the `has` implementation in the `_renderProxy` ([#7878](https://github.com/vuejs/vue/issues/7878)) ([7b38739](https://github.com/vuejs/vue/commit/7b387390aa917edffc0eabce0b4186ea1ef40e2c))
- ensure init/prepatch hooks are still repsected ([de42278](https://github.com/vuejs/vue/commit/de42278d34f6a800cec5c7eb781c1b8b83a829dd)), closes [vue-router#1338](https://github.com/vue-router/issues/1338)
- invoke component node create hooks before insertion ([#7823](https://github.com/vuejs/vue/issues/7823)) ([f43ce3a](https://github.com/vuejs/vue/commit/f43ce3a5d8f73e273f2d03c9d86ea5662cda481a)), closes [#7531](https://github.com/vuejs/vue/issues/7531)
- **observer:** invoke getters on initial observation if setter defined ([#7828](https://github.com/vuejs/vue/issues/7828)) ([7a145d8](https://github.com/vuejs/vue/commit/7a145d86430bad65271f4d6ab1344b215fefe52a))

### Performance Improvements

- avoid unnecessary re-renders when computed property value did not change ([#7824](https://github.com/vuejs/vue/issues/7824)) ([653aac2](https://github.com/vuejs/vue/commit/653aac2c57d15f0e93a2c1cc7e6fad156658df19)), closes [#7767](https://github.com/vuejs/vue/issues/7767)

### Reverts

- Revert "refactor: remove unnecessary checks (#7875)" ([903be9b](https://github.com/vuejs/vue/commit/903be9b91f7c41d40e228676df9d66d2c064fe23)), closes [#7875](https://github.com/vuejs/vue/issues/7875)

## [2.5.16](https://github.com/vuejs/vue/compare/v2.5.15...v2.5.16) (2018-03-13)

### Bug Fixes

- allow multiline expression in v-for ([71b4b25](https://github.com/vuejs/vue/commit/71b4b25375fa4bcd929e1161c35cab133e4a7c23)), closes [#7792](https://github.com/vuejs/vue/issues/7792)
- **core:** Make set/delete warning condition for undefined, null and ([#7818](https://github.com/vuejs/vue/issues/7818)) ([9084747](https://github.com/vuejs/vue/commit/9084747e307dc9b415ff8e2a788c6a585a2a8f6c)), closes [#7452](https://github.com/vuejs/vue/issues/7452)
- fix keyName checking for arrow keys in IE11 ([4378fc5](https://github.com/vuejs/vue/commit/4378fc5124067c2b3a3517dd7f527edd9be2ad37)), closes [#7806](https://github.com/vuejs/vue/issues/7806)
- fix regression on duplicate component init when using shared data objects ([984927a](https://github.com/vuejs/vue/commit/984927a1a98d10ad8af44f2accfb08d34d517610)), closes [#7805](https://github.com/vuejs/vue/issues/7805)
- fix wrongly matched named slots in functional components ([62a922e](https://github.com/vuejs/vue/commit/62a922e865f5e578f67b386cb614abfc173d7851)), closes [#7817](https://github.com/vuejs/vue/issues/7817)
- **keep-alive:** run prune after render for correct active component check ([215f877](https://github.com/vuejs/vue/commit/215f877d1b7eb6583f7adf15676ead8611f07379)), closes [#7566](https://github.com/vuejs/vue/issues/7566)
- **model:** fix static input type being overwritten by v-bind object ([#7819](https://github.com/vuejs/vue/issues/7819)) ([a6169d1](https://github.com/vuejs/vue/commit/a6169d1eb71d64eacddf1738e72d21725e2bff00)), closes [#7811](https://github.com/vuejs/vue/issues/7811)
- named slots for nested functional components ([6dd73e9](https://github.com/vuejs/vue/commit/6dd73e9ee44c09f04d3f616fcce18750a55e2e4f)), closes [#7710](https://github.com/vuejs/vue/issues/7710)
- **ssr:** fix SSR for async functional components ([882e719](https://github.com/vuejs/vue/commit/882e7199fd8eee039291c4b9f7f324dcf46f32fd)), closes [#7784](https://github.com/vuejs/vue/issues/7784)
- **ssr:** fix v-show inline style rendering when style binding is array ([#7814](https://github.com/vuejs/vue/issues/7814)) ([1a979c4](https://github.com/vuejs/vue/commit/1a979c44d6543d89f8a7e26ad7f995b1bf2aee3c)), closes [#7813](https://github.com/vuejs/vue/issues/7813)

## [2.5.15](https://github.com/vuejs/vue/compare/v2.5.14...v2.5.15) (2018-03-10)

### Bug Fixes

- do not traverse VNodes when regsitering dependencies ([84a9a9d](https://github.com/vuejs/vue/commit/84a9a9d61057f6f40a9ad2bee456b39ef0a8f001)), closes [#7786](https://github.com/vuejs/vue/issues/7786)

## [2.5.14](https://github.com/vuejs/vue/compare/v2.5.13...v2.5.14) (2018-03-09)

### Bug Fixes

- address potential regex backtrack ([cd33407](https://github.com/vuejs/vue/commit/cd334070f3b82d3f5892c4999cc290ccd4f56fd8))
- allow codebase to be inlined directly in HTML ([#7314](https://github.com/vuejs/vue/issues/7314)) ([dccd182](https://github.com/vuejs/vue/commit/dccd182b6763d8ef1871949029c85495ca958246)), closes [#7298](https://github.com/vuejs/vue/issues/7298)
- always install composition event listeners ([f7ca21e](https://github.com/vuejs/vue/commit/f7ca21eab1e0d661945aa6070fc988028c90966f)), closes [#7367](https://github.com/vuejs/vue/issues/7367)
- clean up custom events when patched component no longer have events ([d8b0838](https://github.com/vuejs/vue/commit/d8b08387a293c99b95c1efcf2517447335a618db)), closes [#7294](https://github.com/vuejs/vue/issues/7294)
- **codegen:** support filters with () in older browsers ([#7545](https://github.com/vuejs/vue/issues/7545)) ([dc97a39](https://github.com/vuejs/vue/commit/dc97a39c2f41ce57431d42d8b41811866f8e105c)), closes [#7544](https://github.com/vuejs/vue/issues/7544)
- **core:** disable dependency collection in lifecycle hooks and data getter ([#7596](https://github.com/vuejs/vue/issues/7596)) ([318f29f](https://github.com/vuejs/vue/commit/318f29fcdf3372ff57a09be6d1dc595d14c92e70)), closes [#7573](https://github.com/vuejs/vue/issues/7573)
- **core:** handle edge cases for functional component returning arrays ([8335217](https://github.com/vuejs/vue/commit/8335217cb4bd13fb07e08a76c07df0fceed6c197)), closes [#7282](https://github.com/vuejs/vue/issues/7282)
- do not special case attributes for custom elements ([50b711a](https://github.com/vuejs/vue/commit/50b711af43708426e63b4ea529436b49fafc3f2e)), closes [#6864](https://github.com/vuejs/vue/issues/6864) [#6885](https://github.com/vuejs/vue/issues/6885)
- fix config.productionTip ([ced00b1](https://github.com/vuejs/vue/commit/ced00b1dec8326a653cce225133927fe5b4a3109)), closes [#7565](https://github.com/vuejs/vue/issues/7565)
- fix ssr env detection in weex ([#7375](https://github.com/vuejs/vue/issues/7375)) ([3eb37ac](https://github.com/vuejs/vue/commit/3eb37acf98e2d9737de897ebe7bdb7e9576bcc21))
- **inject:** use hasOwn instead of 'in' for provideKey check ([#7460](https://github.com/vuejs/vue/issues/7460)) ([733c1be](https://github.com/vuejs/vue/commit/733c1be7f5983cdd9e8089a8088b235ba21a4dee)), closes [#7284](https://github.com/vuejs/vue/issues/7284)
- install ssr helpers for functional context during SSR ([9b22d86](https://github.com/vuejs/vue/commit/9b22d86ab315a3c6061a6a4776eab1964304f92e)), closes [#7443](https://github.com/vuejs/vue/issues/7443) [nuxt/nuxt.js#2565](https://github.com/nuxt/nuxt.js/issues/2565)
- **model:** fix array index binding for v-model checkbox ([#7671](https://github.com/vuejs/vue/issues/7671)) ([550c3c0](https://github.com/vuejs/vue/commit/550c3c0d14af5485bb7e507c504664a7136e9bf9)), closes [#7670](https://github.com/vuejs/vue/issues/7670)
- **observer:** do not invoke getters on initial observation ([#7302](https://github.com/vuejs/vue/issues/7302)) ([7392dfc](https://github.com/vuejs/vue/commit/7392dfcc1d5fd7b257df5ae134f9eb2f0cc0a51e)), closes [#7280](https://github.com/vuejs/vue/issues/7280)
- **ref:** allow ref key to be zero ([#7676](https://github.com/vuejs/vue/issues/7676)) ([e396eb3](https://github.com/vuejs/vue/commit/e396eb3445904f11232f2355f03e8356173d0e31)), closes [#7669](https://github.com/vuejs/vue/issues/7669)
- respect type order when boolean casting multi-typed props ([81e1e47](https://github.com/vuejs/vue/commit/81e1e47cabbd479e2a285f03120944f1efffe749)), closes [#7485](https://github.com/vuejs/vue/issues/7485)
- **show:** prevent transitions from starting on change truthy values ([#7524](https://github.com/vuejs/vue/issues/7524)) ([013d980](https://github.com/vuejs/vue/commit/013d98092868a0c6721831e91616c64f99119b74)), closes [#7523](https://github.com/vuejs/vue/issues/7523)
- skip v-model & value binding collision check with dynamic type binding ([#7406](https://github.com/vuejs/vue/issues/7406)) ([1c0b4af](https://github.com/vuejs/vue/commit/1c0b4af5fd2f9e8173b8f4718018ee80a6313872)), closes [#7404](https://github.com/vuejs/vue/issues/7404)
- support KeyboardEvent.key in built-in keyboard event modifiers ([#7121](https://github.com/vuejs/vue/issues/7121)) ([1c8e2e8](https://github.com/vuejs/vue/commit/1c8e2e88ed2d74a02178217b318564b73a096c18)), closes [#6900](https://github.com/vuejs/vue/issues/6900)
- **transition:** should not add transition class when cancelled ([#7391](https://github.com/vuejs/vue/issues/7391)) ([5191f13](https://github.com/vuejs/vue/commit/5191f13472d1fc37bdd601079970201fde6bf13e)), closes [#7390](https://github.com/vuejs/vue/issues/7390)
- **types:** add missing `listeners` type on RenderContext ([#7584](https://github.com/vuejs/vue/issues/7584)) ([db1b18c](https://github.com/vuejs/vue/commit/db1b18ceec51761f1bcd6160c51e02b36b86a9c2))
- **types:** contravariant generic default in ComponentOption ([#7369](https://github.com/vuejs/vue/issues/7369)) ([6ee6849](https://github.com/vuejs/vue/commit/6ee684983b1f3384a4050d7c47cee7c6a325db8b))
- **types:** fix wrong errorCaptured type ([#7712](https://github.com/vuejs/vue/issues/7712)) ([6b8516b](https://github.com/vuejs/vue/commit/6b8516b2dde52be643ee6855b45b253a17ed0461))
- **types:** make render option in functional components to optional ([#7663](https://github.com/vuejs/vue/issues/7663)) ([b2092db](https://github.com/vuejs/vue/commit/b2092dbff9ab0ccfa8e59ed3ca540cca0715c683))
- **types:** make VNodeChildrenArrayContents type more accurate ([#7287](https://github.com/vuejs/vue/issues/7287)) ([49aae6b](https://github.com/vuejs/vue/commit/49aae6bb157e0650507974b7a9a1b0f2215e400b))
- **types:** prefer normal component over functional one ([#7687](https://github.com/vuejs/vue/issues/7687)) ([144bf5a](https://github.com/vuejs/vue/commit/144bf5a99e2ebd644f80bc8ab61cd1bf0366961a))
- **v-model:** handle trailing whitespaces in expression ([#7737](https://github.com/vuejs/vue/issues/7737)) ([db58493](https://github.com/vuejs/vue/commit/db584931e20f9ad4b423cfc14d587f9d0240a565))
- **v-on:** return handler value when using modifiers ([#7704](https://github.com/vuejs/vue/issues/7704)) ([6bc75ca](https://github.com/vuejs/vue/commit/6bc75cacb72c0cc7f3d1041b5d9ff447ac2f5f69))
- **vdom:** svg inside foreignObject should be rendered with correct namespace (fix [#7330](https://github.com/vuejs/vue/issues/7330)) ([#7350](https://github.com/vuejs/vue/issues/7350)) ([0529961](https://github.com/vuejs/vue/commit/05299610ea3e89ddbcfe4d8ede0c298223766423))
- **weex:** default value for editor, fix [#7165](https://github.com/vuejs/vue/issues/7165) ([#7286](https://github.com/vuejs/vue/issues/7286)) ([e055df8](https://github.com/vuejs/vue/commit/e055df82fec0e76e4bc65e5a265b42e208595430))

### Features

- support v-model dynamic type binding for v-bind="object" ([41838c8](https://github.com/vuejs/vue/commit/41838c8e8632ba78791996fbc697080b2764bb6a)), closes [#7296](https://github.com/vuejs/vue/issues/7296)
- **weex:** adjust framework entry APIs and add flow annotations ([#7272](https://github.com/vuejs/vue/issues/7272)) ([472a289](https://github.com/vuejs/vue/commit/472a2896bd4f156be168edfecb6ac432b853beb4))
- **weex:** support parse object literal in binding attrs and styles ([#7291](https://github.com/vuejs/vue/issues/7291)) ([ff8fcd2](https://github.com/vuejs/vue/commit/ff8fcd2e2b95694527018f7836bab781f8600d25))
- **weex:** update new syntax for <recycle-list> ([7cc0b55](https://github.com/vuejs/vue/commit/7cc0b559e9e57fcb3baeae5d8d4c8964aa335b5e))
- **weex:** update weex recycle-list compiler ([#7610](https://github.com/vuejs/vue/issues/7610)) ([d6200d7](https://github.com/vuejs/vue/commit/d6200d70261c4a8943190900e0721ede1c4a4f2b))

## [2.5.13](https://github.com/vuejs/vue/compare/v2.5.12...v2.5.13) (2017-12-19)

### Reverts

- Revert "feat: auto cache inline prop literals to avoid child re-render" ([aac7634](https://github.com/vuejs/vue/commit/aac76349e70fe0971ee24a7a1f3dada0e3459fb8))

## [2.5.12](https://github.com/vuejs/vue/compare/v2.5.11...v2.5.12) (2017-12-19)

### Bug Fixes

- **warning:** allow symbol as vdom key ([#7271](https://github.com/vuejs/vue/issues/7271)) ([bacb911](https://github.com/vuejs/vue/commit/bacb911f7df09ff4868b4c848a6d7778872dff5c))
- **weex:** append as tree by default for recycle-list and cell-slot ([#7216](https://github.com/vuejs/vue/issues/7216)) ([d544d05](https://github.com/vuejs/vue/commit/d544d052a9c5ec113c253895211296120d58b6ab))
- **weex:** update recycle-list v-for transform ([0ee81b2](https://github.com/vuejs/vue/commit/0ee81b24b5146bca315503e2f5aa3b01832735f1))

### Features

- **$compiler:** compile weex native directives in preTransformNode ([2d09ee3](https://github.com/vuejs/vue/commit/2d09ee3b8ce37e201d3973587d1cb442d5e08f31))
- **$compiler:** supports compiling v-bind to the weex native directive in recycle-list ([8b893c1](https://github.com/vuejs/vue/commit/8b893c13d6ffa79f294fec76a228509ec48e4706))
- **$compiler:** supports compiling v-else-if and v-else to the weex native directive ([2a1ce0d](https://github.com/vuejs/vue/commit/2a1ce0d92cb12c18f945f69ee5cb6914b389e35e))
- **$compiler:** supports compiling v-for to the weex native directive ([9bd1483](https://github.com/vuejs/vue/commit/9bd1483803d046877bef4f7adf1d3a942085ea1b))
- **$event:** support binding parameters on event handler within weex recycle-list ([acdc3c4](https://github.com/vuejs/vue/commit/acdc3c46e98919faa50b3e4cc308ab73b1a60bfe))
- auto cache inline prop literals to avoid child re-render ([996eb00](https://github.com/vuejs/vue/commit/996eb00a0a0933376c9364c2d187e2bf0512ff0d))
- **compile:** supports compiling v-if to the weex native directive ([7ad368e](https://github.com/vuejs/vue/commit/7ad368ebb6987bd4044f9df184d73ce14ca680f2))
- **types:** extract VueConfiguration type for easy expansion ([#7273](https://github.com/vuejs/vue/issues/7273)) ([#7274](https://github.com/vuejs/vue/issues/7274)) ([c0d516c](https://github.com/vuejs/vue/commit/c0d516c283aa1a1c238b6eb8b8e55f64770d27e8))
- **weex:** generate "[@render](https://github.com/render)" function for weex recycle-list ([#6987](https://github.com/vuejs/vue/issues/6987)) ([0c11aa8](https://github.com/vuejs/vue/commit/0c11aa8addf5ad852e37da358ce2887af72e4193))
- **weex:** partially support lifecycles of virtual component ([#7242](https://github.com/vuejs/vue/issues/7242)) ([661bfe5](https://github.com/vuejs/vue/commit/661bfe552e16d3a7036012021ae3746cfc02710e))
- **weex:** pass stateless component test case ([452a65c](https://github.com/vuejs/vue/commit/452a65c98a9354bb529185638475b72d8ca19543))
- **weex:** recycle-list support stateful child component ([70b97ac](https://github.com/vuejs/vue/commit/70b97ac2f43099a57ce2fb0a23dea0553ba95189))
- **weex:** recycle-list support WIP ([5254ee3](https://github.com/vuejs/vue/commit/5254ee31c481ac16cf8f822b0b4df0f7815ffff3))
- **weex:** split text into separate module ([c104cc5](https://github.com/vuejs/vue/commit/c104cc582d647f5e10b90563cb80907b9e30ec12))
- **weex:** support compiling `v-on` in the weex native directive ([#6892](https://github.com/vuejs/vue/issues/6892)) ([2cb8ea3](https://github.com/vuejs/vue/commit/2cb8ea3fee741807a15bf8f3049ab062a7d9508c))
- **weex:** update weex utils ([#7115](https://github.com/vuejs/vue/issues/7115)) ([3b32652](https://github.com/vuejs/vue/commit/3b32652aa68a06d881e3149bb21ac8711887e7f6))
- **weex:** WIP adjust component transform stage ([62e47c9](https://github.com/vuejs/vue/commit/62e47c9eb4446da79d66ad2385c199f31b4348d8))
- **weex:** WIP fix flow + handle errors in recycle-list template render ([5c2ce00](https://github.com/vuejs/vue/commit/5c2ce0017ff8929e70ce9f701b91d950fb351adb))
- **weex:** WIP implement virtual component ([#7165](https://github.com/vuejs/vue/issues/7165)) ([b8d33ec](https://github.com/vuejs/vue/commit/b8d33ecd9ab8b7a46d8558b4e2caf506235cd165))
- **weex:** WIP invoke recycle-list child component with backing instance ([801f793](https://github.com/vuejs/vue/commit/801f793625273b39fd3f25abbaa04508d6651563))
- **weex:** WIP mark recycle list child component root ([88f3889](https://github.com/vuejs/vue/commit/88f3889f19678981944339be8d22c3ebcd11f822))
- **wip:** recycle list template inline expand ([ac99957](https://github.com/vuejs/vue/commit/ac999573ea6e4be3a421cdff79d66a5274ec58eb))

### Reverts

- revert prop object validation ([01c0750](https://github.com/vuejs/vue/commit/01c07503bf6af902dde06fafa8a0008ee3e303aa)), closes [#7279](https://github.com/vuejs/vue/issues/7279)
- **weex:** remove the "receiveTasks" api and support component hook ([#7053](https://github.com/vuejs/vue/issues/7053)) ([0bf0cbe](https://github.com/vuejs/vue/commit/0bf0cbef76a9d107ea0d4fbd8f54f640a2c5b221))

## [2.5.11](https://github.com/vuejs/vue/compare/v2.5.10...v2.5.11) (2017-12-14)

### Bug Fixes

- avoid unnecessary lowercase coersion in component name validation ([3f0c628](https://github.com/vuejs/vue/commit/3f0c628e2c0fe6bfaecc521c96c6cc12ff24c7c4)), closes [#7237](https://github.com/vuejs/vue/issues/7237)

### Features

- warn misspelled keys on prop validation object ([#7198](https://github.com/vuejs/vue/issues/7198)) ([d02bb37](https://github.com/vuejs/vue/commit/d02bb37efb3c4ee14b8cf9db22d1ab3340ba2c0f))

## [2.5.10](https://github.com/vuejs/vue/compare/v2.5.9...v2.5.10) (2017-12-12)

### Bug Fixes

- **core:** warn duplicate keys in all cases ([#7200](https://github.com/vuejs/vue/issues/7200)) ([023f171](https://github.com/vuejs/vue/commit/023f171f58f7f1b36f0b3e69fc6d330366bfdf43)), closes [#7199](https://github.com/vuejs/vue/issues/7199)
- data() should be called with vm as first argument in mixins ([bd4819e](https://github.com/vuejs/vue/commit/bd4819e6cf1c8d70d25aba2636e01f40faf59443)), closes [#7191](https://github.com/vuejs/vue/issues/7191)
- more consistent component naming warnings across the API ([644274c](https://github.com/vuejs/vue/commit/644274cbd34e14e74e8931fa979b22dc2db04895)), closes [#7212](https://github.com/vuejs/vue/issues/7212)
- revert shared static tree cache to avoid memory leak ([5875c7c](https://github.com/vuejs/vue/commit/5875c7c4906873c31b2feb66bb3ab6a19af6f5d7)), closes [#7184](https://github.com/vuejs/vue/issues/7184)
- should not update in-focus input value with lazy modifier ([60da366](https://github.com/vuejs/vue/commit/60da366a2653a3984d79331d02ebb2ecf7e73a9a)), closes [#7153](https://github.com/vuejs/vue/issues/7153)
- **ssr:** fix double escaping of ssrNode attribute values ([#7224](https://github.com/vuejs/vue/issues/7224)) ([73a89bf](https://github.com/vuejs/vue/commit/73a89bf9e53c0f7f00f193e1b1bb195a71ab761f)), closes [#7223](https://github.com/vuejs/vue/issues/7223)
- **ssr:** properly handle errors in async component ([8936b8d](https://github.com/vuejs/vue/commit/8936b8d9c147441555fcfd4ac748d817ba5ff60e)), closes [#6778](https://github.com/vuejs/vue/issues/6778)
- **v-for:** support array and nested destructuring in v-for ([f5ce6b5](https://github.com/vuejs/vue/commit/f5ce6b50cffef2e0eb8895c462b2433d8f8a701f))
- **weex:** send createFinish signal after root component mounted ([#7154](https://github.com/vuejs/vue/issues/7154)) ([0da8bce](https://github.com/vuejs/vue/commit/0da8bced77654beb14c39ff3b4543b2ef37d1aff))

## [2.5.9](https://github.com/vuejs/vue/compare/v2.5.8...v2.5.9) (2017-11-27)

### Bug Fixes

- block unnecessary input event on textarea placeholder in IE ([0f7c443](https://github.com/vuejs/vue/commit/0f7c443dca800204bc2e00876365869ee79e2d7b)), closes [#7138](https://github.com/vuejs/vue/issues/7138)
- ensure functionalContext is cloned during slot clones ([604e081](https://github.com/vuejs/vue/commit/604e081d0456ed136b24b5f759c608d153dfae93)), closes [#7106](https://github.com/vuejs/vue/issues/7106)
- fix async component resolving in sibling mounted hook ([dd21eac](https://github.com/vuejs/vue/commit/dd21eacc33fee8f8e6151fe1dcb419644f8f98c2)), closes [#7107](https://github.com/vuejs/vue/issues/7107)
- fix v-for iterator parsing destructuring + parens without index ([aa82625](https://github.com/vuejs/vue/commit/aa8262540ac0115d56b53863302b9f8e69f8a03d))
- **keep-alive:** should not destroy active instance when pruning cache ([3932a45](https://github.com/vuejs/vue/commit/3932a451a1419a97ea0200c5cb8096afe9a3e7e7)), closes [#7105](https://github.com/vuejs/vue/issues/7105)
- **types:** add missing ssr renderToString signature ([14e9908](https://github.com/vuejs/vue/commit/14e99086c02f4bcda55e639fb0baf2c664591448))
- **types:** add Promise signature for bundleRenderer.renderToString ([#7098](https://github.com/vuejs/vue/issues/7098)) ([3554eb2](https://github.com/vuejs/vue/commit/3554eb27269e151a0ef3d8c4ad9b29ec6664c471))
- **types:** bump ts version and fix typing bugs ([#7135](https://github.com/vuejs/vue/issues/7135)) ([a71e653](https://github.com/vuejs/vue/commit/a71e653108e4ba56a70107662f3ee30cead59c18))
- **types:** improve and test bundleRenderer.renderToString Promise types ([fcc1229](https://github.com/vuejs/vue/commit/fcc122931b504655c8255645d57612bc74c0f594))
- **types:** use object and string instead of Object and String ([#7126](https://github.com/vuejs/vue/issues/7126)) ([d2e1d49](https://github.com/vuejs/vue/commit/d2e1d49c41ac633ea9410e1062b8e3e01f9d6b6d))

## [2.5.8](https://github.com/vuejs/vue/compare/v2.5.7...v2.5.8) (2017-11-21)

### Bug Fixes

- fix v-for alias deconstruct regression ([ebcef58](https://github.com/vuejs/vue/commit/ebcef58645af1582ca3c8a19ec26967946970301)), closes [#7096](https://github.com/vuejs/vue/issues/7096)

## [2.5.7](https://github.com/vuejs/vue/compare/v2.5.6...v2.5.7) (2017-11-20)

### Bug Fixes

- allow traversing reactive objects which are sealed ([#7080](https://github.com/vuejs/vue/issues/7080)) ([4c22d1d](https://github.com/vuejs/vue/commit/4c22d1d17ffd3a9340c3b17443c7989d04ab14c5))
- fix <keep-alive> include/exclude logic for anonymous components ([a23b913](https://github.com/vuejs/vue/commit/a23b913796a7d18e76185607f250655e18a390c8))
- improve error detector v-for identifier check ([d891cd1](https://github.com/vuejs/vue/commit/d891cd1761df22e1e0b1953c6ed7947fdb79d915)), closes [#6971](https://github.com/vuejs/vue/issues/6971)
- **ssr:** fix bundle renderer require path on windows ([#7085](https://github.com/vuejs/vue/issues/7085)) ([063acb7](https://github.com/vuejs/vue/commit/063acb79ebc02344ab277196d4aea0577b113926))

### Features

- feat: add warning for ambiguous combined usage of slot-scope and v-for ([c264335](https://github.com/vuejs/vue/commit/c264335fbd1b1d838e3c1085b7d6dcd1c752aa43)), closes [#6817](https://github.com/vuejs/vue/issues/6817)

## [2.5.6](https://github.com/vuejs/vue/compare/v2.5.5...v2.5.6) (2017-11-18)

### Bug Fixes

- fix v-model :value warning on custom component ([59dea37](https://github.com/vuejs/vue/commit/59dea374037ec2e6b1f5570a30774f2de0a44adc)), closes [#7084](https://github.com/vuejs/vue/issues/7084)

## [2.5.5](https://github.com/vuejs/vue/compare/v2.5.4...v2.5.5) (2017-11-17)

### Bug Fixes

- init \_staticTrees to avoid runtime reference warning ([f5cd29e](https://github.com/vuejs/vue/commit/f5cd29e1d8197613c4dfb4013b240784c3b64e43)), closes [#7075](https://github.com/vuejs/vue/issues/7075)
- keep-alive should not cache anonymous components ([4d8226f](https://github.com/vuejs/vue/commit/4d8226fb2c84fa2e13a2d8a86dea8a9a5c6ea95f)), closes [#6938](https://github.com/vuejs/vue/issues/6938)
- should warn unknown components inside <keep-alive> ([6d6b373](https://github.com/vuejs/vue/commit/6d6b3739e132723915bc2209663db1b825307865))

### Features

- warn if both v-model and v-bind:value used on same element ([#7056](https://github.com/vuejs/vue/issues/7056)) ([1e14603](https://github.com/vuejs/vue/commit/1e146037fa4280b502d0edf95936bc67e87fd339)), closes [#7048](https://github.com/vuejs/vue/issues/7048) [#7048](https://github.com/vuejs/vue/issues/7048) [#7048](https://github.com/vuejs/vue/issues/7048)

## [2.5.4](https://github.com/vuejs/vue/compare/v2.5.3...v2.5.4) (2017-11-16)

### Bug Fixes

- clone slot nodes for render fn usage as well ([13196b2](https://github.com/vuejs/vue/commit/13196b25b8a0a84b3936982177195d2e04f13f79)), closes [#7041](https://github.com/vuejs/vue/issues/7041)
- normlaize [@click](https://github.com/click).right and [@click](https://github.com/click).middle ([daed1e7](https://github.com/vuejs/vue/commit/daed1e73557d57df244ad8d46c9afff7208c9a2d)), closes [#7020](https://github.com/vuejs/vue/issues/7020)
- should warn unknown components during hydration ([df82aeb](https://github.com/vuejs/vue/commit/df82aeb0bf7454ac99d403000a1ac993e8d8d4de)), closes [#6998](https://github.com/vuejs/vue/issues/6998)
- **ssr:** ensure hydrated class & style bindings are reactive ([5db86b4](https://github.com/vuejs/vue/commit/5db86b4e94857fdde3ae6b71e24da637bc116baa)), closes [#7063](https://github.com/vuejs/vue/issues/7063)
- **transition:** fix out-in transition getting stuck with v-if ([#7023](https://github.com/vuejs/vue/issues/7023)) ([45d7ba8](https://github.com/vuejs/vue/commit/45d7ba842917a075d6cb2563c78210e3b9210a58)), closes [#6687](https://github.com/vuejs/vue/issues/6687)
- **types:** expose VueConstructor ([#7002](https://github.com/vuejs/vue/issues/7002)) ([267ada0](https://github.com/vuejs/vue/commit/267ada04e8dd66f5c159dd6ba1b9f88fbbe78676))
- **weex:** donot rethrow the captured error on weex platform ([#7024](https://github.com/vuejs/vue/issues/7024)) ([c2b1cfe](https://github.com/vuejs/vue/commit/c2b1cfe9ccd08835f2d99f6ce60f67b4de55187f))

### Features

- **weex:** support batch update styles and attributes ([#7046](https://github.com/vuejs/vue/issues/7046)) ([7cf188e](https://github.com/vuejs/vue/commit/7cf188e134fe7bfc9e8a16b763fb85b18eff1eac))

## [2.5.3](https://github.com/vuejs/vue/compare/v2.5.2...v2.5.3) (2017-11-03)

### Bug Fixes

- $set should respect properties on prototype chain ([83ed926](https://github.com/vuejs/vue/commit/83ed92608d81349e1cac2e481ed079e51a490b2b)), closes [#6845](https://github.com/vuejs/vue/issues/6845)
- also clone component slot children during deepClone ([1cf02ef](https://github.com/vuejs/vue/commit/1cf02efda206185cb72bbaafb00037fa6269e3f3)), closes [#6891](https://github.com/vuejs/vue/issues/6891) [#6915](https://github.com/vuejs/vue/issues/6915)
- clean up target variables to avoid memory leaks ([#6932](https://github.com/vuejs/vue/issues/6932)) ([c355319](https://github.com/vuejs/vue/commit/c3553196b8b15a71f982bd5e04c61be52e87c828)), closes [#6931](https://github.com/vuejs/vue/issues/6931)
- **core:** static trees should be cached on options ([#6826](https://github.com/vuejs/vue/issues/6826)) ([#6837](https://github.com/vuejs/vue/issues/6837)) ([b6c384d](https://github.com/vuejs/vue/commit/b6c384dd78b56bd247e6a34d5aea0d3903f5b7fd))
- **events:** properly $off array of events ([#6949](https://github.com/vuejs/vue/issues/6949)) ([c24f3e4](https://github.com/vuejs/vue/commit/c24f3e4208cd045832002ee9916559f6fe0dc2b5))
- handle encoded tabs and newlines in attributes for Chrome a[href] and IE/Edge ([cfd73c2](https://github.com/vuejs/vue/commit/cfd73c2386623341fdbb3ac636c4baf84ea89c2c)), closes [#6828](https://github.com/vuejs/vue/issues/6828) [#6916](https://github.com/vuejs/vue/issues/6916)
- **keep-alive:** higher priority for exclude than include ([#6905](https://github.com/vuejs/vue/issues/6905)) ([604230f](https://github.com/vuejs/vue/commit/604230fe953f864be5dc70bd7d34f64ae43e4f7e))
- **model:** correctly set select v-model initial value on patch ([#6910](https://github.com/vuejs/vue/issues/6910)) ([58a39df](https://github.com/vuejs/vue/commit/58a39dfa0e8c4a51959e9a84369dad8fbca0e6ac))
- properly mark slot rendered flag in production mode ([4fe1a95](https://github.com/vuejs/vue/commit/4fe1a95d2953ecf765e27677fa70ebadb176d4c3)), closes [#6997](https://github.com/vuejs/vue/issues/6997)
- **slots:** properly handle nested named slot passing ([5a9da95](https://github.com/vuejs/vue/commit/5a9da95b8a865416f082952a48416ffc091e4078)), closes [#6996](https://github.com/vuejs/vue/issues/6996)
- special case for static muted attribute in firefox ([f2e00f7](https://github.com/vuejs/vue/commit/f2e00f756fb540fb09ce3414289c652ce172d85c)), closes [#6887](https://github.com/vuejs/vue/issues/6887)
- **ssr:** properly render <select v-model> initial state ([e1657fd](https://github.com/vuejs/vue/commit/e1657fd7ce49bff3c3ecad3c56ae527347505c34)), closes [#6986](https://github.com/vuejs/vue/issues/6986)
- **ssr:** properly render textarea value ([79c0d7b](https://github.com/vuejs/vue/commit/79c0d7bcfbcd1ac492e7ceb77f5024d09efdc6b3)), closes [#6986](https://github.com/vuejs/vue/issues/6986)
- **ssr:** should not optimize root if conditions ([4ad9a56](https://github.com/vuejs/vue/commit/4ad9a56b229b156e633f3d575cd0e99ba5e474d9)), closes [#6907](https://github.com/vuejs/vue/issues/6907)
- **types:** improve typing for better completion ([#6886](https://github.com/vuejs/vue/issues/6886)) ([98ea0a3](https://github.com/vuejs/vue/commit/98ea0a3b48e37719f278c10a8ee5fb94d7d5db4e))
- **typing:** relax $options type for TS2.6+ ([#6819](https://github.com/vuejs/vue/issues/6819)) ([9caed00](https://github.com/vuejs/vue/commit/9caed00d20f37c750e39db4ec86d278b453f0e5d))
- **v-model:** v-if / v-else not working with :type + v-model ([#6955](https://github.com/vuejs/vue/issues/6955)) ([0c703e3](https://github.com/vuejs/vue/commit/0c703e34d1a2083d9f162fcf0885deefb803182e)), closes [#6918](https://github.com/vuejs/vue/issues/6918)
- **weex:** stop trim css units in richtext component ([#6927](https://github.com/vuejs/vue/issues/6927)) ([8a784d8](https://github.com/vuejs/vue/commit/8a784d8d2333f0a05569f6c11c5a0fb0ab3a164e))

## [2.5.2](https://github.com/vuejs/vue/compare/v2.5.1...v2.5.2) (2017-10-13)

### Bug Fixes

- further adjust nextTick strategy ([4e0c485](https://github.com/vuejs/vue/commit/4e0c48511d49f331fde31fc87b6ca428330f32d1)), closes [#6813](https://github.com/vuejs/vue/issues/6813)

## [2.5.1](https://github.com/vuejs/vue/compare/v2.5.0...v2.5.1) (2017-10-13)

### Bug Fixes

- backwards compat with checkbox code generated in < 2.5 ([5665eaf](https://github.com/vuejs/vue/commit/5665eaf985a56cfd183ce8ce93c4d813edbd2cf8)), closes [#6803](https://github.com/vuejs/vue/issues/6803)
- fix empty array edge case in normalizeChildren ([1f84dd1](https://github.com/vuejs/vue/commit/1f84dd1c2488d12ef144d4b548b0e80647f9403c)), closes [#6790](https://github.com/vuejs/vue/issues/6790)
- **ssr:** add semicolon before self-removal script ([#6794](https://github.com/vuejs/vue/issues/6794)) ([5a15a8d](https://github.com/vuejs/vue/commit/5a15a8d2089bb833b892123c31a2ca04a511c4c8))
- **transition-group:** work around rollup tree shaking ([#6796](https://github.com/vuejs/vue/issues/6796)) ([60b1af9](https://github.com/vuejs/vue/commit/60b1af9e02b93d9223d2ed1f23e0a618537a4c96)), closes [#6792](https://github.com/vuejs/vue/issues/6792)
- **v-model:** allow arbitrary naems for type binding ([#6802](https://github.com/vuejs/vue/issues/6802)) ([15031b8](https://github.com/vuejs/vue/commit/15031b85427df5409f0bc4c10589cc6259f8a5b2)), closes [#6800](https://github.com/vuejs/vue/issues/6800)
- v-on="object" listeners should fire after high-priority ones ([08a7fb5](https://github.com/vuejs/vue/commit/08a7fb539f9d3ab5b08a3c6cec9a6628929be3be)), closes [#6805](https://github.com/vuejs/vue/issues/6805)

# [2.5.0](https://github.com/vuejs/vue/compare/v2.4.4...v2.5.0) (2017-10-13)

### Bug Fixes

- add slot v-bind warning ([#6736](https://github.com/vuejs/vue/issues/6736)) ([514b90b](https://github.com/vuejs/vue/commit/514b90b64770cba9f905d2dff59dfa0e064e580c)), closes [#6677](https://github.com/vuejs/vue/issues/6677)
- allow an object's Symbols to be observed ([#6704](https://github.com/vuejs/vue/issues/6704)) ([4fd2ce8](https://github.com/vuejs/vue/commit/4fd2ce813cd0a59bd544defe07f44a5731e45f84))
- **compiler:** warn when inline-template component has no children (fix [#6703](https://github.com/vuejs/vue/issues/6703)) ([#6715](https://github.com/vuejs/vue/issues/6715)) ([baabd6d](https://github.com/vuejs/vue/commit/baabd6d14016c730fe40a4202ae9b8f75e80041c))
- **core:** avoid observing VNodes ([4459b87](https://github.com/vuejs/vue/commit/4459b87de902cf3ba496a104304ca80d1c9824c1)), closes [#6610](https://github.com/vuejs/vue/issues/6610)
- ensure nextTick are passed to errorHandler ([#6730](https://github.com/vuejs/vue/issues/6730)) ([ae347a5](https://github.com/vuejs/vue/commit/ae347a52259b24507a9c747c80d78a6beaa36de0))
- fallback to Promise in non-DOM environments ([6d1f4cb](https://github.com/vuejs/vue/commit/6d1f4cb89a156bf5f84942b1031354aa93916cb7))
- fix scoped CSS for nested nodes in functional components ([4216588](https://github.com/vuejs/vue/commit/421658884f7ca786747abf9b89e00925fdfdfba8))
- handle errors in errorHandler ([2b5c83a](https://github.com/vuejs/vue/commit/2b5c83af6d8b15510424af4877d58c261ea02e16)), closes [#6714](https://github.com/vuejs/vue/issues/6714)
- perperly handle v-if on <template> scoped slot ([68bdbf5](https://github.com/vuejs/vue/commit/68bdbf508b915872627676d6bf987bdac9e5fe97)), closes [#6725](https://github.com/vuejs/vue/issues/6725)
- prevent memory leak due to circular reference in vnodes ([405d8e9](https://github.com/vuejs/vue/commit/405d8e9f4c3201db2ae0e397d9191d9b94edc219)), closes [#6759](https://github.com/vuejs/vue/issues/6759)
- properly render value on <progress> in IE/Edge ([c64f9ae](https://github.com/vuejs/vue/commit/c64f9ae1649175ee8cac1c7ecf3283897c948202)), closes [#6666](https://github.com/vuejs/vue/issues/6666)
- **ref:** preserve ref on components after removing root element ([#6718](https://github.com/vuejs/vue/issues/6718)) ([6ad44e1](https://github.com/vuejs/vue/commit/6ad44e13e990951ff152a0fd7042613c5a87f1c0)), closes [#6632](https://github.com/vuejs/vue/issues/6632) [#6641](https://github.com/vuejs/vue/issues/6641)
- resolve async component default for native dynamic import ([2876ed8](https://github.com/vuejs/vue/commit/2876ed870c5368a1767fbeddf06e94b55ebd6234)), closes [#6751](https://github.com/vuejs/vue/issues/6751)
- **ssr:** fix hydration mismatch with adjacent text node from slots ([b080a14](https://github.com/vuejs/vue/commit/b080a14138262f0f274d0888555a11bd7387d576)), closes [vuejs/vue-loader#974](https://github.com/vuejs/vue-loader/issues/974)
- **ssr:** handle inline template compilation error ([dff85b2](https://github.com/vuejs/vue/commit/dff85b230abda63839ed6b80d56ccfc6068b9ae0)), closes [#6766](https://github.com/vuejs/vue/issues/6766)
- use correct ns inside <foreignObject> as root node ([cf1ff5b](https://github.com/vuejs/vue/commit/cf1ff5b0dc3d15c1e16821cb5e4fc984c74f07c1)), closes [#6642](https://github.com/vuejs/vue/issues/6642)
- use MessageChannel for nextTick ([6e41679](https://github.com/vuejs/vue/commit/6e41679a96582da3e0a60bdbf123c33ba0e86b31)), closes [#6566](https://github.com/vuejs/vue/issues/6566) [#6690](https://github.com/vuejs/vue/issues/6690)
- warn slot-scope when used as a prop ([8295f71](https://github.com/vuejs/vue/commit/8295f716657ffe516f30e84f29ca94f4a0aefabf))
- work around old Chrome bug ([0f2cb09](https://github.com/vuejs/vue/commit/0f2cb09444e8b2a5fa41aaf8c94e6f2f43e00c2f)), closes [#6601](https://github.com/vuejs/vue/issues/6601)

### Features

- add .exact event modifier ([#5977](https://github.com/vuejs/vue/issues/5977)) ([9734e87](https://github.com/vuejs/vue/commit/9734e878ec4efe59f40fc97d9ef86273ad58a430)), closes [#5976](https://github.com/vuejs/vue/issues/5976)
- add catchError option ([b3cd9bc](https://github.com/vuejs/vue/commit/b3cd9bc3940eb1e01da7081450929557d9c1651e))
- add in-browser build for vue-template-compiler ([a5e5b31](https://github.com/vuejs/vue/commit/a5e5b31455e0d64f834dd691b7488e0e105d32c3))
- add max prop for <keep-alive> ([2cba6d4](https://github.com/vuejs/vue/commit/2cba6d4cb1db8273ee45cccb8e50ebd87191244e))
- **core:** call data method with this value ([#6760](https://github.com/vuejs/vue/issues/6760)) ([3a5432a](https://github.com/vuejs/vue/commit/3a5432a9e3f470ebafcef905281b830537897037)), closes [#6739](https://github.com/vuejs/vue/issues/6739)
- functional component support for compiled templates ([ea0d227](https://github.com/vuejs/vue/commit/ea0d227d2ddfa5fc5e1112acf9cd485b4eae62cb))
- improve template expression error message ([e38d006](https://github.com/vuejs/vue/commit/e38d0067521eee85febedc5f3ed3c24b5454c3a9)), closes [#6771](https://github.com/vuejs/vue/issues/6771)
- **inject:** support providing default values for injections ([#6322](https://github.com/vuejs/vue/issues/6322)) ([88423fc](https://github.com/vuejs/vue/commit/88423fc66a2a4917dcdb7631a4594f05446283b1))
- make vue and basic server renderer compatible in pure js runtimes ([c5d0fa0](https://github.com/vuejs/vue/commit/c5d0fa0503631b53338e5255bc8640da4b2fd4cb))
- rename catchError -> errorCaptured ([6dac3db](https://github.com/vuejs/vue/commit/6dac3dbe441302cebb945b675f78f8e7247e2a97))
- rename inject alias from "name" to "from" ([6893499](https://github.com/vuejs/vue/commit/68934997444c0047c49e419761dfad7fbc043a5d))
- scoped CSS support for functional components ([050bb33](https://github.com/vuejs/vue/commit/050bb33f9b02589357c037623ea8cbf8ff13555b))
- **ssr:** add shouldPrefetch option ([7bc899c](https://github.com/vuejs/vue/commit/7bc899ce0ec10be3fbd4bd7e78b66dd357249c81)), closes [#5964](https://github.com/vuejs/vue/issues/5964)
- **ssr:** auto-remove initial state script if prod ([#6763](https://github.com/vuejs/vue/issues/6763)) ([2d32b5d](https://github.com/vuejs/vue/commit/2d32b5d1b663fa331ec256b73e937af15eb6e3d5)), closes [#6761](https://github.com/vuejs/vue/issues/6761)
- **ssr:** renderToString return Promise ([f881dd1](https://github.com/vuejs/vue/commit/f881dd175a6764f6f80077df20f950dba63ca447)), closes [#6160](https://github.com/vuejs/vue/issues/6160)
- support denoting normal elements as scoped slot ([dae173d](https://github.com/vuejs/vue/commit/dae173d96d15f47de6ce6961354d5c05e4273005))
- support RegExp in ignoredElements ([#6769](https://github.com/vuejs/vue/issues/6769)) ([795b908](https://github.com/vuejs/vue/commit/795b908095b29e76435479879c1ade7ef759ce7b))
- **types:** further improve Vue type declarations for canonical usage ([#6391](https://github.com/vuejs/vue/issues/6391)) ([db138e2](https://github.com/vuejs/vue/commit/db138e2254d71f6b96e033acf66ba43ad269841a))
- **v-model:** craete non-existent properties as reactive ([e1da0d5](https://github.com/vuejs/vue/commit/e1da0d585c797860533d6cb10ea3d09c7fb711fc)), closes [#5932](https://github.com/vuejs/vue/issues/5932)
- **v-model:** support dynamic input type binding ([f3fe012](https://github.com/vuejs/vue/commit/f3fe012d5499f607656b152ce5fcb506c641f9f4))
- v-on automatic key inference ([4987eeb](https://github.com/vuejs/vue/commit/4987eeb3a734a16a4978d1061f73039002d351e6))

### Reverts

- fix(v-model): fix input listener with modifier blocking v-model update ([62405aa](https://github.com/vuejs/vue/commit/62405aa9035d5f547c0440263f16f21c1325f100))

## [2.4.4](https://github.com/vuejs/vue/compare/v2.4.3...v2.4.4) (2017-09-14)

### Bug Fixes

- **ssr:** fix bundleRenderer Promise rejection regression ([0c9534f](https://github.com/vuejs/vue/commit/0c9534ff0069b5289ea9598bcb4f5e5ac346c979))
- **ssr:** fix style injection regression ([a2f73f2](https://github.com/vuejs/vue/commit/a2f73f2c2e28771e6597334bd86f82851ce0955e)), closes [#6603](https://github.com/vuejs/vue/issues/6603) [#6353](https://github.com/vuejs/vue/issues/6353)

## [2.4.3](https://github.com/vuejs/vue/compare/v2.4.2...v2.4.3) (2017-09-13)

### Bug Fixes

- $off should ignore undefined handler argument ([fa6a729](https://github.com/vuejs/vue/commit/fa6a7290e3b8cb62fb7f999389f476617b56503e)), closes [#6591](https://github.com/vuejs/vue/issues/6591)
- computed properties should not be cached during SSR ([06741f3](https://github.com/vuejs/vue/commit/06741f326625e2db78d092e586923b97ba006906)), closes [vuejs/vuex#877](https://github.com/vuejs/vuex/issues/877)
- deep clone slot vnodes on re-render ([0529040](https://github.com/vuejs/vue/commit/0529040c17b8632032a43d142aac88386f6b4a1f)), closes [#6372](https://github.com/vuejs/vue/issues/6372)
- **directive:** should invoke unbind & inserted on inner component root element change ([538ad20](https://github.com/vuejs/vue/commit/538ad20d8a37fe7ee2463ff20ac9557af70e0d33)), closes [#6513](https://github.com/vuejs/vue/issues/6513)
- do not use MutationObserver in IE11 ([844a540](https://github.com/vuejs/vue/commit/844a540c647dfa93dc714540953524830dd3475a)), closes [#6466](https://github.com/vuejs/vue/issues/6466)
- ensure $attrs and $listeners are always objects ([#6441](https://github.com/vuejs/vue/issues/6441)) ([59dbd4a](https://github.com/vuejs/vue/commit/59dbd4a414394a3ce581f9fbd9554da9af9e4b1d)), closes [#6263](https://github.com/vuejs/vue/issues/6263)
- ensure outer bindings on nested HOC are properly re-applied on inner root element change ([a744497](https://github.com/vuejs/vue/commit/a7444975343f7828004d90bfb0deeb98db0f46e7))
- handle special case for allowfullscreen on <embed> ([d77b953](https://github.com/vuejs/vue/commit/d77b95317cedae299605fb692e2c7c67796b17cb)), closes [#6202](https://github.com/vuejs/vue/issues/6202)
- inherit SVG ns on component root node ([#6511](https://github.com/vuejs/vue/issues/6511)) ([89f0d29](https://github.com/vuejs/vue/commit/89f0d29f2d541aa5a1ac9690258cd7c7ee576ef6)), closes [#6506](https://github.com/vuejs/vue/issues/6506)
- **inject:** exclude not enumerable keys of inject object ([#6346](https://github.com/vuejs/vue/issues/6346)) ([3ee62fd](https://github.com/vuejs/vue/commit/3ee62fd59e20030dd63c08c2390e803d034928fe)), closes [#6574](https://github.com/vuejs/vue/issues/6574)
- preserve slot attribute if not resolved by Vue ([684cd7d](https://github.com/vuejs/vue/commit/684cd7d21aa7cb9a40fb4a8542c4e08fb3801a86)), closes [#6553](https://github.com/vuejs/vue/issues/6553)
- **provide:** provide should default to parentVal during merging ([#6473](https://github.com/vuejs/vue/issues/6473)) ([3c21675](https://github.com/vuejs/vue/commit/3c216755f6eb656c6d864265a8dc7b51b3ae971b)), closes [#6436](https://github.com/vuejs/vue/issues/6436)
- set value as domProp for <progress> ([7116af4](https://github.com/vuejs/vue/commit/7116af4e07520040ed7328c39d0a456808bfe1e1)), closes [#6561](https://github.com/vuejs/vue/issues/6561)
- **ssr:** address possible xss vector ([5091e2c](https://github.com/vuejs/vue/commit/5091e2c9847601e329ac36d17eae90bb5cb77a91))
- **ssr:** better handle v-html hydration ([0f00f8f](https://github.com/vuejs/vue/commit/0f00f8fc2b83b964bb929b729a7c9e3675b52106)), closes [#6519](https://github.com/vuejs/vue/issues/6519)
- **ssr:** expose context.styles when no lifecycle styles are injected ([1f52a2a](https://github.com/vuejs/vue/commit/1f52a2a9f433452c15715131ed74433a43d5cfb7)), closes [#6353](https://github.com/vuejs/vue/issues/6353)
- **ssr:** fix cachedEscape memory issue ([02f8b80](https://github.com/vuejs/vue/commit/02f8b806768d70c589e646c384e592e93387b994)), closes [#6332](https://github.com/vuejs/vue/issues/6332)
- **ssr:** handle v-text/v-html with non-string value ([09106f0](https://github.com/vuejs/vue/commit/09106f066a1ba71431e4f9f26246aaf619153e2e)), closes [#6572](https://github.com/vuejs/vue/issues/6572)
- **ssr:** should also escape static text content ([172dbf9](https://github.com/vuejs/vue/commit/172dbf9faf4cb71dff72c77fdfe80fa1932d1ba3)), closes [#6345](https://github.com/vuejs/vue/issues/6345)
- support prop type checking for primitive wrapper objects ([#6450](https://github.com/vuejs/vue/issues/6450)) ([679cd1f](https://github.com/vuejs/vue/commit/679cd1fef448989bf645313c391e4134ecd9f593)), closes [#6447](https://github.com/vuejs/vue/issues/6447)
- **transition:** consider async placeholder as valid child to return ([#6369](https://github.com/vuejs/vue/issues/6369)) ([a43d667](https://github.com/vuejs/vue/commit/a43d66743be2bd62b2398090663e41eeaf0dc75f)), closes [#6256](https://github.com/vuejs/vue/issues/6256)
- **types:** add `inject` option in functional component options type ([#6530](https://github.com/vuejs/vue/issues/6530)) ([1baa0a7](https://github.com/vuejs/vue/commit/1baa0a7884cfa147df7623a34ee277f7d39c7a21))
- **types:** allow variadic plugin use ([#6363](https://github.com/vuejs/vue/issues/6363)) ([38d5218](https://github.com/vuejs/vue/commit/38d52182bf8915628314e2aea7d2cc41ec39a0d6)), closes [#6357](https://github.com/vuejs/vue/issues/6357)
- **v-model:** Allow using array value with array v-model in checkboxes ([#6220](https://github.com/vuejs/vue/issues/6220)) ([d6e6f1d](https://github.com/vuejs/vue/commit/d6e6f1deb180a4f47e94496724623b9e6d8e08b3)), closes [#6219](https://github.com/vuejs/vue/issues/6219)
- **v-model:** avoid unnecessary change event on select options change ([d4d553c](https://github.com/vuejs/vue/commit/d4d553ced75d8c73e75b85cec398be4b09f6f669)), closes [#6193](https://github.com/vuejs/vue/issues/6193) [#6194](https://github.com/vuejs/vue/issues/6194)
- **v-model:** fix input listener with modifier blocking v-model update ([6f312d6](https://github.com/vuejs/vue/commit/6f312d636c3d6049dc9e60007f88ea871b8e8173)), closes [#6552](https://github.com/vuejs/vue/issues/6552)
- **vdom:** avoid diff de-opt when both head/tail are different ([230c6ae](https://github.com/vuejs/vue/commit/230c6ae7822347b9b2a659503291e45fcc58fe41)), closes [#6502](https://github.com/vuejs/vue/issues/6502)
- **vdom:** Don't replace input for text-like type change ([#6344](https://github.com/vuejs/vue/issues/6344)) ([f76d16e](https://github.com/vuejs/vue/commit/f76d16ed9507d4c2a90243ea3d77ccf00df29346)), closes [#6313](https://github.com/vuejs/vue/issues/6313)

### Features

- **weex richtext:** support events and add more test cases ([d627161](https://github.com/vuejs/vue/commit/d627161a91b77ca15e0e30c0313abb33d6c17cbc))
- **weex richtext:** support to parse styles and classList ([b609642](https://github.com/vuejs/vue/commit/b60964256c876de2516977c776201ef56ab13fb7))
- **weex richtext:** treat richtext as runtime components ([3e4d926](https://github.com/vuejs/vue/commit/3e4d926336dfdbb5cc4f9d0daed44eb84b53b0de))
- **weex:** add basic support of richtext ([f1c96e7](https://github.com/vuejs/vue/commit/f1c96e72b2369f3f8cc0078adb732a25cc7bfbfe))
- **weex:** remove **weex_require_module** api ([a8146c0](https://github.com/vuejs/vue/commit/a8146c0c1074cfd8214a62309c372b25035fd838))
- **weex:** return instance in createInstance ([0dc27dc](https://github.com/vuejs/vue/commit/0dc27dcdec72c1c2e12fb49fb95dceca45e84115))
- **weex:** support nested components in richtext ([0ea2bb4](https://github.com/vuejs/vue/commit/0ea2bb4fb4d9c4d846ae5852c871c472c17f4e34))
- **weex:** wrap IFFE for appCode ([f975fac](https://github.com/vuejs/vue/commit/f975fac2a8657590dcc23ea8ccae791d125bc935))

### Performance Improvements

- **core:** prevent iteration of arrays that should not be observable ([#6467](https://github.com/vuejs/vue/issues/6467)) ([aa820cb](https://github.com/vuejs/vue/commit/aa820cba37b69772868c9cdb69235c424e23f529)), closes [#6284](https://github.com/vuejs/vue/issues/6284)
- deep clone slot vnodes on re-render ([#6478](https://github.com/vuejs/vue/issues/6478)) ([5346361](https://github.com/vuejs/vue/commit/53463619e5d19d35dfad1a4245a8dc583681feb3))
- optimize the performance of hyphenate method. ([#6274](https://github.com/vuejs/vue/issues/6274)) ([14ee9e7](https://github.com/vuejs/vue/commit/14ee9e74bf68024fcb53c305b1f15c6aab6e89d3))
- **v-model:** tweak setSelected ([41d774d](https://github.com/vuejs/vue/commit/41d774d112946f986bf0b0e3f30fd962c01ceba2))

## [2.4.2](https://github.com/vuejs/vue/compare/v2.4.1...v2.4.2) (2017-07-21)

### Bug Fixes

- checkbox v-model="array" ignore false-value ([#6180](https://github.com/vuejs/vue/issues/6180)) ([3d14e85](https://github.com/vuejs/vue/commit/3d14e855e422b656859d1b419af43b94320fcfce)), closes [#6178](https://github.com/vuejs/vue/issues/6178)
- **compile:** properly generate comments with special character ([#6156](https://github.com/vuejs/vue/issues/6156)) ([d03fa26](https://github.com/vuejs/vue/commit/d03fa26687605a43d9a0c3f395d1d32375f7eaee)), closes [#6150](https://github.com/vuejs/vue/issues/6150)
- ensure looseEqual is not dependant on key enumeration order ([a8ac129](https://github.com/vuejs/vue/commit/a8ac129a5876a7eeae0137bf2f1b0968d4d6ffad)), closes [#5908](https://github.com/vuejs/vue/issues/5908)
- include boolean in isPrimitive check ([#6127](https://github.com/vuejs/vue/issues/6127)) ([be3dc9c](https://github.com/vuejs/vue/commit/be3dc9c6e923248bcf81eb8240dd4f3c168fac59)), closes [#6126](https://github.com/vuejs/vue/issues/6126)
- **parser:** only ignore the first newline in <pre> ([082fc39](https://github.com/vuejs/vue/commit/082fc3967db4d3290e901a38504dcd9bb698e561)), closes [#6146](https://github.com/vuejs/vue/issues/6146)
- **provide/inject:** merge provide properly from mixins ([3036551](https://github.com/vuejs/vue/commit/303655116f8ec78f3b0ac99569637ad868dfe246)), closes [#6175](https://github.com/vuejs/vue/issues/6175)
- **provide/inject:** resolve inject properly from mixins ([#6107](https://github.com/vuejs/vue/issues/6107)) ([b0f00e3](https://github.com/vuejs/vue/commit/b0f00e31e7d06edfdc733e2e7f24d5ca448759f9)), closes [#6093](https://github.com/vuejs/vue/issues/6093)
- **transition:** should trigger transition hooks for v-show in ie9 ([9b4dbba](https://github.com/vuejs/vue/commit/9b4dbba384bc81a99abe429476729f80cb06d19a)), closes [#5525](https://github.com/vuejs/vue/issues/5525)
- **v-bind:** respect .prop modifier on components ([#6159](https://github.com/vuejs/vue/issues/6159)) ([06b9b0b](https://github.com/vuejs/vue/commit/06b9b0bbadcc6c5afd300ed7748294e62ba00803))
- **v-model:** use stricter check for <select> option update ([c70addf](https://github.com/vuejs/vue/commit/c70addf7d1a8e820ed80b6ab14aace5aa7b604c5)), closes [#6112](https://github.com/vuejs/vue/issues/6112)
- **v-on:** revert component root data.on/data.nativeOn behavior for ([1713061](https://github.com/vuejs/vue/commit/17130611261fdbab70d0e5ab45036e4b612b17fe)), closes [#6109](https://github.com/vuejs/vue/issues/6109)
- work around IE/Edge bug when accessing document.activeElement from iframe ([fc3d7cd](https://github.com/vuejs/vue/commit/fc3d7cd7a93534d76840418467f303d4b301fbcd)), closes [#6157](https://github.com/vuejs/vue/issues/6157)

### Features

- warn when assigning to computed property with no setter ([eb9168c](https://github.com/vuejs/vue/commit/eb9168cfc1816b53ddb1eccd6310173a37803897)), closes [#6078](https://github.com/vuejs/vue/issues/6078)

### Reverts

- perf: remove src directory from npm module ([#6072](https://github.com/vuejs/vue/issues/6072)) ([ec4b1be](https://github.com/vuejs/vue/commit/ec4b1be42a30a452cca53bbdfdc8404c7a53e890))

## [2.4.1](https://github.com/vuejs/vue/compare/v2.4.0...v2.4.1) (2017-07-13)

# [2.4.0](https://github.com/vuejs/vue/compare/v2.3.3...v2.4.0) (2017-07-13)

### Bug Fixes

- check enterToClass/leaveToClass existence before adding it ([#5912](https://github.com/vuejs/vue/issues/5912)) ([34d8c79](https://github.com/vuejs/vue/commit/34d8c796ac6a8e47bf23155bad71d07fafd1aa51)), closes [#5800](https://github.com/vuejs/vue/issues/5800)
- **core:** add merge strategy for provide option ([#6025](https://github.com/vuejs/vue/issues/6025)) ([306997e](https://github.com/vuejs/vue/commit/306997eaf4ff36f4757c753c8a00ce3851e29cca)), closes [#6008](https://github.com/vuejs/vue/issues/6008)
- **core:** should preserve reactivity-ness of injected objects ([8d66691](https://github.com/vuejs/vue/commit/8d66691ee264969447390822971b8caa029cac3e)), closes [#5913](https://github.com/vuejs/vue/issues/5913)
- ensure cleanup in watcher.get ([#5988](https://github.com/vuejs/vue/issues/5988)) ([f6cd44c](https://github.com/vuejs/vue/commit/f6cd44c48b83640e5d3fbbea46d7b1b9cb439543)), closes [#5975](https://github.com/vuejs/vue/issues/5975)
- handle arrays in v-on object syntax ([086e6d9](https://github.com/vuejs/vue/commit/086e6d98f4217542afcc2794717119c62dde89b8))
- improve Vue.set/Vue.delete API to support multi type of array index ([#5973](https://github.com/vuejs/vue/issues/5973)) ([eea0920](https://github.com/vuejs/vue/commit/eea0920f14d0ea63d1b94c648eeb36ac7dfb4b05)), closes [#5884](https://github.com/vuejs/vue/issues/5884)
- multiple merged vnode hooks not invoked properly ([91deb4f](https://github.com/vuejs/vue/commit/91deb4fd910afd51137820f120d4c26d0a99e629)), closes [#6076](https://github.com/vuejs/vue/issues/6076)
- **parser:** the first newline following pre and textarea tag should be ignored ([#6022](https://github.com/vuejs/vue/issues/6022)) ([4d68079](https://github.com/vuejs/vue/commit/4d680794a5a345078827a3fee3db8658bd35ec3a))
- prefetch should not have `as` attribute ([#5683](https://github.com/vuejs/vue/issues/5683)) ([ebca266](https://github.com/vuejs/vue/commit/ebca266d10febb5ab5ca0cfbcd0dfbff2f2c2170))
- **ref:** refactor function registerRef ([#6039](https://github.com/vuejs/vue/issues/6039)) ([254d85c](https://github.com/vuejs/vue/commit/254d85cfc42d58bf9e3d0626ba959379bdc32d6f)), closes [#5997](https://github.com/vuejs/vue/issues/5997)
- **ssr:** fix bundleRenderer mapped async chunks caching check ([#5963](https://github.com/vuejs/vue/issues/5963)) ([de42186](https://github.com/vuejs/vue/commit/de42186d52562a0ce506580484ff64fe86b765bd))
- **ssr:** reference error when create $ssrContext for root component ([#5981](https://github.com/vuejs/vue/issues/5981)) ([5581654](https://github.com/vuejs/vue/commit/55816543c46e75aa53481ac95a89ff6f87a2d704)), closes [#5941](https://github.com/vuejs/vue/issues/5941)
- support plugin with multi version vue ([#5985](https://github.com/vuejs/vue/issues/5985)) ([049f317](https://github.com/vuejs/vue/commit/049f3171a9d2e97f62c209a4b78a71ec9dae810f)), closes [#5970](https://github.com/vuejs/vue/issues/5970)
- transition group should work with dynamic name ([#6006](https://github.com/vuejs/vue/issues/6006)) ([#6019](https://github.com/vuejs/vue/issues/6019)) ([d8d4ca6](https://github.com/vuejs/vue/commit/d8d4ca6763af55e1715bbc1e0fadd10e5be41db3))
- v-bind object should not override props on scopedSlots ([#5995](https://github.com/vuejs/vue/issues/5995)) ([458030a](https://github.com/vuejs/vue/commit/458030ae19a51982d028dcacfc77ab2cfac8ac26))
- **v-model:** fix input change check for type="number" ([0a9aab5](https://github.com/vuejs/vue/commit/0a9aab510bcca85c78ef06487b5dcf25d76d780d)), closes [#6069](https://github.com/vuejs/vue/issues/6069)
- **v-model:** should generate component-specific code for tags with "is" attribute ([a1d1145](https://github.com/vuejs/vue/commit/a1d1145c9123f7175f3ac20b503cfa507ad455f4)), closes [#6066](https://github.com/vuejs/vue/issues/6066)
- **v-model:** use consistent behavior during IME composition for other text-like input types (fix [#5902](https://github.com/vuejs/vue/issues/5902)) ([4acc8c8](https://github.com/vuejs/vue/commit/4acc8c8be1971112be45e0feb7fb7eddbfc9d247))

### Features

- add .editorconfig ([#5691](https://github.com/vuejs/vue/issues/5691)) ([0cc0b07](https://github.com/vuejs/vue/commit/0cc0b0726d389fca535b35e4593a5ecca3dde6c9))
- add `comments` option to allow preserving comments in template ([#5951](https://github.com/vuejs/vue/issues/5951)) ([e4da249](https://github.com/vuejs/vue/commit/e4da249ab8ef32a0b8156c840c9d2b9773090f8a)), closes [#5392](https://github.com/vuejs/vue/issues/5392)
- Add `defer` to body scripts ([#5704](https://github.com/vuejs/vue/issues/5704)) ([f3757eb](https://github.com/vuejs/vue/commit/f3757eb37bfe38cb2e8d87983a1f83d31ea9d30a))
- **core:** $attrs, $listeners & inheritAttrs option ([6118759](https://github.com/vuejs/vue/commit/61187596b9af48f1cb7b1848ad3eccc02ac2509d)), closes [#5983](https://github.com/vuejs/vue/issues/5983)
- **keep-alive:** support Array for include and exclude ([#5956](https://github.com/vuejs/vue/issues/5956)) ([51c595a](https://github.com/vuejs/vue/commit/51c595a7cef24e12094f66e0f8934fa41edde07d))
- resolve ES module default when resolving async components ([0cd6ef3](https://github.com/vuejs/vue/commit/0cd6ef321b3168d6c46c7a870c3d2a53fd9d4bde))
- **ssr:** inheritAttrs support in SSR ([6bf9772](https://github.com/vuejs/vue/commit/6bf97721f1e38713353d5ac9906c88dca2cdad9b))
- support sync modifier for v-bind="object" ([#5943](https://github.com/vuejs/vue/issues/5943)) ([3965e50](https://github.com/vuejs/vue/commit/3965e5053a7d2f22e90f81d4a153d65c1c670897)), closes [#5937](https://github.com/vuejs/vue/issues/5937)
- **types:** add declaration for inheritAttrs ([1f9e924](https://github.com/vuejs/vue/commit/1f9e924971d7894517075f7f0efeeb85994a7ba0))
- **types:** expose $vnode ([1b7ddd7](https://github.com/vuejs/vue/commit/1b7ddd7a35fab8773508ed47f56d0716081cfa1a))
- **v-on:** support v-on object syntax with no arguments ([11614d6](https://github.com/vuejs/vue/commit/11614d63b7862b68b11cc45c0891437c62a832d7))
- **weex:** implement "weex.supports" api to support feature detection ([#6053](https://github.com/vuejs/vue/issues/6053)) ([b1512d8](https://github.com/vuejs/vue/commit/b1512d8b136e0a12aca8dde9e72bf5200d3afe09))

### Performance Improvements

- remove src directory from npm module ([#6072](https://github.com/vuejs/vue/issues/6072)) ([e761573](https://github.com/vuejs/vue/commit/e7615737f142e3350b53d09d3a46d7ec143d1ef4))

## [2.3.3](https://github.com/vuejs/vue/compare/v2.3.2...v2.3.3) (2017-05-09)

## [2.3.2](https://github.com/vuejs/vue/compare/v2.3.1...v2.3.2) (2017-05-02)

## [2.3.1](https://github.com/vuejs/vue/compare/v2.3.0...v2.3.1) (2017-05-02)

# [2.3.0](https://github.com/vuejs/vue/compare/v2.3.0-beta.1...v2.3.0) (2017-04-27)

# [2.3.0-beta.1](https://github.com/vuejs/vue/compare/v2.2.6...v2.3.0-beta.1) (2017-04-26)

## [2.2.6](https://github.com/vuejs/vue/compare/v2.2.5...v2.2.6) (2017-03-27)

## [2.2.5](https://github.com/vuejs/vue/compare/v2.2.4...v2.2.5) (2017-03-24)

### Bug Fixes

- **inject:** change warn message when trying to mutate an injected value ([#5243](https://github.com/vuejs/vue/issues/5243)) ([23a058e](https://github.com/vuejs/vue/commit/23a058ed13e7faa667ada2b96e242eb7488b601c))

## [2.2.4](https://github.com/vuejs/vue/compare/v2.2.3...v2.2.4) (2017-03-13)

## [2.2.3](https://github.com/vuejs/vue/compare/v2.2.2...v2.2.3) (2017-03-13)

## [2.2.2](https://github.com/vuejs/vue/compare/v2.2.1...v2.2.2) (2017-03-09)

## [2.2.1](https://github.com/vuejs/vue/compare/v2.2.0...v2.2.1) (2017-02-26)

# [2.2.0](https://github.com/vuejs/vue/compare/v2.2.0-beta.2...v2.2.0) (2017-02-26)

# [2.2.0-beta.2](https://github.com/vuejs/vue/compare/v2.2.0-beta.1...v2.2.0-beta.2) (2017-02-25)

### Reverts

- Revert "[WIP] Support for ref callback (#4807)" ([e7a2510](https://github.com/vuejs/vue/commit/e7a2510e631bd25f46b4e1125b83a9236a50ff1d)), closes [#4807](https://github.com/vuejs/vue/issues/4807)

# [2.2.0-beta.1](https://github.com/vuejs/vue/compare/v2.1.10...v2.2.0-beta.1) (2017-02-24)

### Bug Fixes

- **sfc:** component contains '<' only ([#4753](https://github.com/vuejs/vue/issues/4753)) ([938fa4e](https://github.com/vuejs/vue/commit/938fa4efcc9bf6232bf5ace5920398dc2e128ac9))

### Features

- allow customization of component v-model prop/event via model option (close [#4515](https://github.com/vuejs/vue/issues/4515)) ([9d6c8ec](https://github.com/vuejs/vue/commit/9d6c8ec268f659a715e3b38c97a1e03964961703))
- config.performance ([689c107](https://github.com/vuejs/vue/commit/689c107de4624879a5b6282ce43eed5ea3907b38))
- implement template option for vue-server-renderer ([1c79592](https://github.com/vuejs/vue/commit/1c79592524339773d6397b264b2b489606cd55cb))
- provide/inject (close [#4029](https://github.com/vuejs/vue/issues/4029)) ([f916bcf](https://github.com/vuejs/vue/commit/f916bcf37105903290ad2353db9a9436536d6859))
- renderError ([1861ee9](https://github.com/vuejs/vue/commit/1861ee9570730149e01f225323c3a52392e5900f))
- support multi-chunk bundles in ssr bundle renderer ([561447d](https://github.com/vuejs/vue/commit/561447d278da26e95c488ea75856823557b66c5e))

## [2.1.10](https://github.com/vuejs/vue/compare/v2.1.9...v2.1.10) (2017-01-17)

## [2.1.9](https://github.com/vuejs/vue/compare/v2.1.8...v2.1.9) (2017-01-16)

### Reverts

- Revert "also bind static special attrs as props (fix #4530)" ([ab0a225](https://github.com/vuejs/vue/commit/ab0a2259e0ef3f4ebdc8d0d4b929fae3e3f579d8)), closes [#4530](https://github.com/vuejs/vue/issues/4530)
- Revert "Mark node with static props as static (#4662)" ([4e830ba](https://github.com/vuejs/vue/commit/4e830ba3c3c92e78bf3ffbea82a583865deaa52a)), closes [#4662](https://github.com/vuejs/vue/issues/4662)

## [2.1.8](https://github.com/vuejs/vue/compare/v2.1.7...v2.1.8) (2016-12-28)

### Reverts

- Revert "remove no longer necessary code" ([fcc98d5](https://github.com/vuejs/vue/commit/fcc98d52e21bb634c3f0c50eeb4ee87494a7196f))
- Revert "ensure leave transitions and enter transitions are triggered in the same frame (fix #4510)" ([02e2d99](https://github.com/vuejs/vue/commit/02e2d99e277a1ba1bd42e1b81b2273903fdb7fbc)), closes [#4510](https://github.com/vuejs/vue/issues/4510)
- Revert "fix enter transition flicker regression (fix #4576)" ([0bb2d4e](https://github.com/vuejs/vue/commit/0bb2d4e2b621950f5d44ed83b7e9ce15e282db68)), closes [#4576](https://github.com/vuejs/vue/issues/4576)

## [2.1.7](https://github.com/vuejs/vue/compare/v2.1.6...v2.1.7) (2016-12-24)

## [2.1.6](https://github.com/vuejs/vue/compare/v2.1.5...v2.1.6) (2016-12-13)

## [2.1.5](https://github.com/vuejs/vue/compare/v2.1.4...v2.1.5) (2016-12-13)

## [2.1.4](https://github.com/vuejs/vue/compare/v2.1.3...v2.1.4) (2016-12-02)

## [2.1.3](https://github.com/vuejs/vue/compare/v2.1.2...v2.1.3) (2016-11-24)

## [2.1.2](https://github.com/vuejs/vue/compare/v2.1.1...v2.1.2) (2016-11-23)

## [2.1.1](https://github.com/vuejs/vue/compare/v2.1.0...v2.1.1) (2016-11-23)

# [2.1.0](https://github.com/vuejs/vue/compare/v2.0.8...v2.1.0) (2016-11-22)

## [2.0.8](https://github.com/vuejs/vue/compare/v2.0.7...v2.0.8) (2016-11-20)

## [2.0.7](https://github.com/vuejs/vue/compare/v2.0.6...v2.0.7) (2016-11-16)

## [2.0.6](https://github.com/vuejs/vue/compare/v2.0.5...v2.0.6) (2016-11-15)

### Reverts

- Revert "fix #4041, warn overriding Vue's internal methods (#4111)" ([1bcc571](https://github.com/vuejs/vue/commit/1bcc571739d7228db0bc947ee67c20dde5aeb7e0)), closes [#4041](https://github.com/vuejs/vue/issues/4041) [#4111](https://github.com/vuejs/vue/issues/4111)

## [2.0.5](https://github.com/vuejs/vue/compare/v2.0.4...v2.0.5) (2016-11-05)

## [2.0.4](https://github.com/vuejs/vue/compare/v2.0.3...v2.0.4) (2016-11-04)

## [2.0.3](https://github.com/vuejs/vue/compare/v2.0.2...v2.0.3) (2016-10-13)

## [2.0.2](https://github.com/vuejs/vue/compare/v2.0.1...v2.0.2) (2016-10-12)

### Reverts

- Revert "fix select multiple first option auto-selected in Chrome/FF (fix #3852)" ([d0cfd54](https://github.com/vuejs/vue/commit/d0cfd549ba24edc7dced17ef7b8f410c4ea197f0)), closes [#3852](https://github.com/vuejs/vue/issues/3852)

## [2.0.1](https://github.com/vuejs/vue/compare/v2.0.0...v2.0.1) (2016-09-30)

# [2.0.0](https://github.com/vuejs/vue/compare/v2.0.0-rc.8...v2.0.0) (2016-09-30)

# [2.0.0-rc.8](https://github.com/vuejs/vue/compare/v2.0.0-rc.7...v2.0.0-rc.8) (2016-09-27)

# [2.0.0-rc.7](https://github.com/vuejs/vue/compare/v2.0.0-rc.6...v2.0.0-rc.7) (2016-09-23)

# [2.0.0-rc.6](https://github.com/vuejs/vue/compare/v2.0.0-rc.5...v2.0.0-rc.6) (2016-09-13)

# [2.0.0-rc.5](https://github.com/vuejs/vue/compare/v2.0.0-rc.4...v2.0.0-rc.5) (2016-09-08)

# [2.0.0-rc.4](https://github.com/vuejs/vue/compare/v2.0.0-rc.3...v2.0.0-rc.4) (2016-08-29)

# [2.0.0-rc.3](https://github.com/vuejs/vue/compare/v2.0.0-rc.2...v2.0.0-rc.3) (2016-08-20)

# [2.0.0-rc.2](https://github.com/vuejs/vue/compare/v2.0.0-rc.1...v2.0.0-rc.2) (2016-08-16)

### Reverts

- Revert "support transition on component with v-show in root node (fix #3431)" ([68be112](https://github.com/vuejs/vue/commit/68be112652060f9a7123b594a3b18ca5fc31b033)), closes [#3431](https://github.com/vuejs/vue/issues/3431)

# [2.0.0-rc.1](https://github.com/vuejs/vue/compare/v2.0.0-beta.8...v2.0.0-rc.1) (2016-08-11)

# [2.0.0-beta.8](https://github.com/vuejs/vue/compare/v2.0.0-beta.7...v2.0.0-beta.8) (2016-08-10)

# [2.0.0-beta.7](https://github.com/vuejs/vue/compare/v2.0.0-beta.6...v2.0.0-beta.7) (2016-08-05)

# [2.0.0-beta.6](https://github.com/vuejs/vue/compare/v2.0.0-beta.5...v2.0.0-beta.6) (2016-08-01)

# [2.0.0-beta.5](https://github.com/vuejs/vue/compare/v2.0.0-beta.4...v2.0.0-beta.5) (2016-07-27)

### Reverts

- Revert "remove parser pre/post transforms (not used)" ([bee95f8](https://github.com/vuejs/vue/commit/bee95f8c08af2dd5af653847ec569bd801112c90))

# [2.0.0-beta.4](https://github.com/vuejs/vue/compare/v2.0.0-beta.3...v2.0.0-beta.4) (2016-07-26)

# [2.0.0-beta.3](https://github.com/vuejs/vue/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2016-07-24)

# [2.0.0-beta.2](https://github.com/vuejs/vue/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2016-07-17)

# [2.0.0-beta.1](https://github.com/vuejs/vue/compare/v2.0.0-alpha.8...v2.0.0-beta.1) (2016-07-07)

# [2.0.0-alpha.8](https://github.com/vuejs/vue/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2016-06-28)

# [2.0.0-alpha.7](https://github.com/vuejs/vue/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2016-06-28)

# [2.0.0-alpha.6](https://github.com/vuejs/vue/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2016-06-22)

# [2.0.0-alpha.5](https://github.com/vuejs/vue/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2016-06-17)

# [2.0.0-alpha.4](https://github.com/vuejs/vue/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2016-06-16)

# [2.0.0-alpha.3](https://github.com/vuejs/vue/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2016-06-15)

# [2.0.0-alpha.2](https://github.com/vuejs/vue/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2016-06-13)

# [2.0.0-alpha.1](https://github.com/vuejs/vue/compare/5b30f3eab89db88cb61894de617bdce53e82393e...v2.0.0-alpha.1) (2016-06-10)

### Reverts

- Revert "simplify array change detection" ([5b30f3e](https://github.com/vuejs/vue/commit/5b30f3eab89db88cb61894de617bdce53e82393e))
