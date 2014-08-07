console.log('\nDirective Parser\n')

var Cache = require('../src/cache')
var parse = require('../src/parse/directive').parse

Cache.prototype.get = Cache.prototype.put = function () {}

function bench (id, fn) {
  var s = Date.now()
  var max = i = 100000
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

bench('filters', function () {
  side = parse('a.b.c | a | b | c')
})

bench('multi', function () {
  side = parse('abc:ddd, bcd:eee, fsef:fff')
})

bench('complex exp', function () {
  side = parse('test:a.b + { c: d} + "abced{fsefesf}ede"')
})