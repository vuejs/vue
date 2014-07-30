console.log('\nInstantiation\n')

var done = null
var OldVue = require('../../vue')
var Vue = require('../src/vue')
var sideEffect = null
var parent = new Vue({
  data: { a: 1 }
})
var oldParent = new OldVue({
  data: { a: 1 }
})

function now () {
  return window.performence
    ? window.performence.now()
    : Date.now()
}

// warm up
for (var i = 0; i < 1000; i++) {
  sideEffect = new Vue()
}

var queue = []

function bench (desc, n, fn) {
  queue.push(function () {
    var s = now()
    for (var i = 0; i < n; i++) {
      fn()
    }
    var time = now() - s
    var opf = (16 / (time / n)).toFixed(2)
    console.log(desc + ' ' + n + ' times - ' + opf + ' ops/frame')
  })
}

function run () {
  queue.shift()()
  if (queue.length) {
    setTimeout(run, 0)
  } else {
    done && done()
  }
}

function simpleInstance () {
  sideEffect = new Vue({
    el: document.createElement('div'),
    data: {a: 1}
  })
}

function oldSimpleInstance () {
  sideEffect = new OldVue({
    data: {a: 1}
  })
}

function simpleInstanceWithInheritance () {
  sideEffect = new Vue({
    el: document.createElement('div'),
    parent: parent,
    data: { b:2 }
  })
}

function oldSimpleInstanceWithInheritance () {
  sideEffect = new OldVue({
    parent: oldParent,
    data: { b:2 }
  })
}

function complexInstance () {
  sideEffect = new Vue({
    el: document.createElement('div'),
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

function oldComplexInstance () {
  sideEffect = new OldVue({
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

bench('Simple instance (old)', 10, oldSimpleInstance)
bench('Simple instance (old)', 100, oldSimpleInstance)
bench('Simple instance (old)', 1000, oldSimpleInstance)

bench('Simple instance with inheritance', 10, simpleInstanceWithInheritance)
bench('Simple instance with inheritance', 100, simpleInstanceWithInheritance)
bench('Simple instance with inheritance', 1000, simpleInstanceWithInheritance)

bench('Simple instance with inheritance (old)', 10, oldSimpleInstanceWithInheritance)
bench('Simple instance with inheritance (old)', 100, oldSimpleInstanceWithInheritance)
bench('Simple instance with inheritance (old)', 1000, oldSimpleInstanceWithInheritance)

bench('Complex instance', 10, complexInstance)
bench('Complex instance', 100, complexInstance)
bench('Complex instance', 1000, complexInstance)

bench('Complex instance (old)', 10, oldComplexInstance)
bench('Complex instance (old)', 100, oldComplexInstance)
bench('Complex instance (old)', 1000, oldComplexInstance)

exports.run = function (cb) {
  done = cb
  run()
}