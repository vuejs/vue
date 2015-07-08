var version =
  process.env.VUE_VERSION ||
  require('../package.json').version

module.exports =
  'Vue.js v' + version + '\n' +
  '(c) ' + new Date().getFullYear() + ' Evan You\n' +
  'Released under the MIT License.'
