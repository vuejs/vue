import Vue from 'vue'

// ignore whitespace in tests
Vue.config.preserveWhitespace = false

// import all helpers
const helpersContext = require.context('../helpers', true)
helpersContext.keys().forEach(helpersContext)

// require all test files
const testsContext = require.context('./', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
