console.log('\Expression Parser\n')

var Cache = require('../src/cache')
var parse = require('../src/parse/expression').parse

Cache.prototype.get = Cache.prototype.put = function () {}

function bench (id, fn) {
  var s = Date.now()
  var max = i = 10000
  while (i--) {
    fn()
  }
  var used = Date.now() - s
  var ops = Math.round(16 / (used / max))
  console.log(id + ': ' + ops + ' ops/frame')
}

var side

bench('simple path', function () {
  side = parse('a.b.c')
})

bench('complex path', function () {
  side = parse('a["b"].c')
})

bench('simple exp', function () {
  side = parse('a.b + c')
})

bench('complex exp', function () {
  side = parse('a.b + c')
})