import Vue from 'vue'
import 'classlist-polyfill' // for IE9
import '../helpers/to-have-been-warned.js'
import '../helpers/wait-for-update.js'
import '../helpers/trigger-event.js'
import '../helpers/vdom.js'

Vue.config.preserveWhitespace = false

// require all test files
const testsContext = require.context('./', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
