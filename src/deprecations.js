if (process.env.NODE_ENV !== 'production') {

  var _ = require('./util')
  var warn = function (msg) {
    _.warn('{DEPRECATION} ' + msg)
  }

  _.deprecation = {

    REPEAT_ALIAS: function () {
      warn('v-repeat alias (e.g. item in items) will be required in 1.0.0.')
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
      warn('<content select="..."> will be deprecated in in 1.0.0. in favor of <content slot="...">.')
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
