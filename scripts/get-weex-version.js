const coreVersion = require('../package.json').version
const weexVersion = require('../packages/weex-vue-framework/package.json').version
let weexBaseVersion = weexVersion.match(/^[\d.]+/)[0]
let weexSubVersion = Number(weexVersion.match(/-weex\.(\d+)$/)[1])

if (weexBaseVersion === coreVersion) {
  // same core version, increment sub version
  weexSubVersion++
} else {
  // new core version, reset sub version
  weexBaseVersion = coreVersion
  weexSubVersion = 1
}

if (process.argv[2] === '-c') {
  console.log(weexVersion)
} else {
  console.log(weexBaseVersion + '-weex.' + weexSubVersion)
}

module.exports = {
  base: weexBaseVersion,
  sub: weexSubVersion
}
