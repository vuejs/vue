try {
  var vueVersion = require('vue').version
} catch (e) {}

var packageName = require('./package.json').name
var packageVersion = require('./package.json').version
if (vueVersion && vueVersion !== packageVersion) {
  var vuePath = require.resolve('vue')
  var packagePath = require.resolve('./package.json')
  throw new Error(
    '\n\nVue packages version mismatch:\n\n' +
    '- vue@' + vueVersion + ' (' + vuePath + ')\n' +
    '- ' + packageName + '@' + packageVersion + ' (' + packagePath + ')\n\n' +
    'This may cause things to work incorrectly. Make sure to use the same version for both.\n' +
    'If you are using vue-loader@>=10.0, simply update vue-template-compiler.\n' +
    'If you are using vue-loader@<10.0 or vueify, re-installing vue-loader/vueify should bump ' + packageName + ' to the latest.\n'
  )
}

module.exports = require('./build')
