if (process.env.NODE_ENV !== 'production') {

  var _ = require('./util')
  var warn = function (msg) {
    _.warn('{DEPRECATION} ' + msg)
  }

  _.deprecation = {

    REPEAT: function () {
      warn(
        'v-repeat will be deprecated in favor of v-for in 1.0.0. ' +
        'See https://github.com/yyx990803/vue/issues/1200 for details.'
      )
    },

    ADD: function () {
      warn('$add() will be deprecated in 1.0.0. Use $set() instead.')
    },

    WAIT_FOR: function () {
      warn('"wait-for" will be deprecated in 1.0.0. Use `activate` hook instead.')
    },

    STRICT_MODE: function () {
      warn('Strict mode will default to `true` in 1.0.0.')
    },

    CONTENT_SELECT: function () {
      warn('<content select="..."> will be deprecated in in 1.0.0. in favor of <slot name="...">.')
    },

    DATA_AS_PROP: function () {
      warn('$data will no longer be usable as a prop in 1.0.0.')
    },

    INHERIT: function () {
      warn('The "inherit" option will be deprecated in 1.0.0.')
    },

    V_EL: function () {
      warn('v-el will be deprecated in 1.0.0.')
    }

  }

  // ensure warning get warned only once
  var warned = {}
  Object.keys(_.deprecation).forEach(function (key) {
    var fn = _.deprecation[key]
    _.deprecation[key] = function () {
      if (!warned[key]) {
        warned[key] = true
        fn()
      }
    }
  })
}
