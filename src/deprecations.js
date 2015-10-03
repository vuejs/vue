if (process.env.NODE_ENV !== 'production') {

  var _ = require('./util')
  var warn = function (msg) {
    _.warn('{DEPRECATION} ' + msg)
  }

  var newBindingSyntaxLink = ' See https://github.com/yyx990803/vue/issues/1325 for details.'

  _.deprecation = {

    REPEAT: function () {
      warn(
        'v-repeat will be deprecated in favor of v-for in 1.0.0. ' +
        'See https://github.com/yyx990803/vue/issues/1200 for details.'
      )
    },

    ADD: function () {
      warn(
        '$add() will be deprecated in 1.0.0. Use $set() instead. ' +
        'See https://github.com/yyx990803/vue/issues/1171 for details.'
      )
    },

    SET: function () {
      warn(
        '$set() on plain objects will be deperecated in 1.0.0. ' +
        'Use `Vue.set(obj, key, value)` instead.'
      )
    },

    DELETE: function () {
      warn(
        '$delete() on plain objects will be deperecated in 1.0.0. ' +
        'Use `Vue.delete(obj, key)` instead.'
      )
    },

    WAIT_FOR: function () {
      warn(
        '"wait-for" will be deprecated in 1.0.0. Use `activate` hook instead. ' +
        'See https://github.com/yyx990803/vue/issues/1169 for details.'
      )
    },

    STRICT_MODE: function (type, id) {
      warn(
        'Falling through to parent when resolving ' + type + ' with id "' + id +
        '". Strict mode will be the default in 1.0.0. ' +
        'See https://github.com/yyx990803/vue/issues/1170 for details.'
      )
    },

    CONTENT: function () {
      warn(
        '<content> insertion points will be deprecated in in 1.0.0. in favor of <slot>. ' +
        'See https://github.com/yyx990803/vue/issues/1167 for details.'
      )
    },

    DATA_AS_PROP: function () {
      warn(
        '$data will no longer be usable as a prop in 1.0.0. ' +
        'See https://github.com/yyx990803/vue/issues/1198 for details.'
      )
    },

    INHERIT: function () {
      warn(
        'The "inherit" option will be deprecated in 1.0.0. ' +
        'See https://github.com/yyx990803/vue/issues/1198 for details.'
      )
    },

    DIR_ARGS: function (exp) {
      warn(
        exp + ': Directive arguments will be moved into the attribute name in 1.0.0 - ' +
        'use v-dirname:arg="expression" syntax instead.' + newBindingSyntaxLink
      )
    },

    MULTI_CLAUSES: function () {
      warn(
        'Directives will no longer support multiple clause syntax in 1.0.0.' +
        newBindingSyntaxLink
      )
    },

    V_TRANSITION: function () {
      warn(
        'v-transition will no longer be a directive in 1.0.0; It will become a ' +
        'special attribute without the prefix. Use "transition" instead.'
      )
    },

    V_REF: function () {
      warn(
        'v-ref will no longer take an attribute value in 1.0.0. Use "v-ref:id" syntax ' +
        'instead. Also, refs will be registered under vm.$refs instead of vm.$. ' +
        'See https://github.com/yyx990803/vue/issues/1292 for more details.'
      )
    },

    V_EL: function () {
      warn(
        'v-el will no longer take an attribute value in 1.0.0. Use "v-el:id" syntax ' +
        'instead. Also, nodes will be registered under vm.$els instead of vm.$$. ' +
        'See https://github.com/yyx990803/vue/issues/1292 for more details.'
      )
    },

    V_ATTR: function () {
      warn(
        'v-attr will be renamed to v-bind in 1.0.0. Also, use v-bind:attr="expression" ' +
        'syntax instead.' + newBindingSyntaxLink
      )
    },

    V_CLASS: function () {
      warn(
        'v-class will be deprecated in 1.0.0. Use v-bind:class or just :class instead.' +
        newBindingSyntaxLink
      )
    },

    V_STYLE: function () {
      warn(
        'v-style will be deprecated in 1.0.0. Use v-bind:style or just :style instead.' +
        newBindingSyntaxLink
      )
    },

    ATTR_ONETIME: function (name, value) {
      warn(
        name + '="' + value + '": One-time interpolations inside attributes will ' +
        'no longer be supported in 1.0.0.'
      )
    },

    ATTR_INVALID: function (name) {
      warn(
        'Mustache interpolation found in non-native attribute "' + name + '": ' +
        'attribute interpolation will be limited to native attributes only ' +
        'in 1.0.0. Use v-bind for custom attributes and props.'
      )
    },

    PROPS: function (attr, value) {
      warn(
        'Prop ' + attr + '="' + value + '": props no longer use mustache tags ' +
        'to indicate a dynamic binding. Use the "v-bind:prop-name" or the colon ' +
        'shorthand instead.' + newBindingSyntaxLink
      )
    },

    DATA_PROPS: function (attr, value) {
      warn(
        'Prop ' + attr + '="' + value + '": props will no longer support the ' +
        '"data-" prefix in 1.0.0.' + newBindingSyntaxLink
      )
    },

    PROP_CASTING: function (attr, value) {
      warn(
        'Prop ' + attr + '="' + value + '": literal props will no longer be ' +
        'auto-casted into booleans/numbers in 1.0.0 - they will all be treated ' +
        'as literal strings. Use "v-bind" or the colon shorthand for ' +
        'boolean/number literals instead.'
      )
    },

    BIND_IS: function () {
      warn(
        '<component is="{{view}}"> syntax will be deprecated in 1.0.0. Use ' +
        '<component v-bind:is="view"> or <component :is="view"> instead.'
      )
    },

    PARTIAL_NAME: function (id) {
      warn(
        '<partial name="' + id + '">: mustache interpolations inside attributes ' +
        'will only be allowed in native attributes in 1.0.0. ' +
        'Use v-bind:name="expression" or just :name="expression" instead.'
      )
    },

    REF_IN_CHILD: function () {
      warn(
        'v-ref can no longer be used on a component root in its own ' +
        'template in 1.0.0. Use it in the parent template instead.'
      )
    },

    KEY_FILTER: function () {
      warn(
        'The "key" filter will be deprecated in 1.0.0. Use the new ' +
        'v-on:keyup.key="handler" syntax instead.'
      )
    },

    PROPAGATION: function (event) {
      warn(
        'No need to return false in handler for event "' + event + '": events ' +
        'no longer propagate beyond the first triggered handler unless the ' +
        'handler explicitly returns true. See https://github.com/yyx990803/vue/issues/1175 ' +
        'for more details.'
      )
    },

    MODEL_EXP: function (exp) {
      warn(
        'Params "exp", "true-exp" and "false-exp" for v-model will be deprecated in 1.0.0. ' +
        'Use "v-bind:value", "v-bind:true-value" and "v-bind:false-value" instead.'
      )
    },

    SELECT_OPTIONS: function () {
      warn(
        'The "options" param for <select v-model> will be deprecated in 1.0.0. ' +
        'Use v-for to render the options. See https://github.com/yyx990803/vue/issues/1229 ' +
        'for more details.'
      )
    },

    INTERPOLATE: function () {
      /* istanbul ignore next */
      warn(
        'The global "interpolate" config will be deprecated in 1.0.0. Use "v-pre" ' +
        'on elements that should be skipped by the template compiler.'
      )
    },

    LITERAL: function () {
      warn(
        'It is no longer necessary to declare literal directives in 1.0.0. Just ' +
        'add the ".literal" modifier at the end (v-dir.literal="string") to ' +
        'pass a literal value.'
      )
    },

    PREFIX: function () {
      warn(
        'The "prefix" global config will be deprecated in 1.0.0. All directives ' +
        'will consistently use the v- prefix.'
      )
    },

    V_COMPONENT: function () {
      warn(
        'v-component will be deprecated in 1.0.0. Use "is" attribute instead. ' +
        'See https://github.com/yyx990803/vue/issues/1278 for more details.'
      )
    }

  }

  // ensure warning get warned only once
  var warned = {}
  Object.keys(_.deprecation).forEach(function (key) {
    var fn = _.deprecation[key]
    _.deprecation[key] = function () {
      if (!warned[key]) {
        warned[key] = true
        fn.apply(null, arguments)
      }
    }
  })
}
