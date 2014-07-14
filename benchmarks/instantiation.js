console.log('\nInstantiation\n')

var Vue = require('../src/vue')
var sideEffect = null
var parent = new Vue({
  data: { a: 1 }
})

function getNano () {
  var hr = process.hrtime()
  return hr[0] * 1e9 + hr[1]
}

function now () {
  return process.hrtime
    ? getNano() / 1e6
    : window.performence
      ? window.performence.now()
      : Date.now()
}

// warm up
for (var i = 0; i < 1000; i++) {
  sideEffect = new Vue()
}

function bench (desc, n, fn) {
  var s = now()
  for (var i = 0; i < n; i++) {
    fn()
  }
  var time = now() - s
  var opf = (16 / (time / n)).toFixed(2)
  console.log(desc + ' ' + n + ' times - ' + opf + ' ops/frame')
}

function simpleInstance () {
  sideEffect = new Vue({
    data: {a: 1}
  })
}

function simpleInstanceWithInheritance () {
  sideEffect = new Vue({
    parent: parent,
    data: { b:2 }
  })
}

function complexInstance () {
  sideEffect = new Vue({
    data: {
      a: {
        b: {
          c: 1
        }
      },
      c: {
        b: {
          c: { a:1 },
          d: 2,
          e: 3,
          d: 4
        }
      },
      e: [{a:1}, {a:2}, {a:3}]
    }
  })
}

bench('Simple instance', 10, simpleInstance)
bench('Simple instance', 100, simpleInstance)
bench('Simple instance', 1000, simpleInstance)

bench('Simple instance with inheritance', 10, simpleInstanceWithInheritance)
bench('Simple instance with inheritance', 100, simpleInstanceWithInheritance)
bench('Simple instance with inheritance', 1000, simpleInstanceWithInheritance)

bench('Complex instance', 10, complexInstance)
bench('Complex instance', 100, complexInstance)
bench('Complex instance', 1000, complexInstance)