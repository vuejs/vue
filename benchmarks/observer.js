var Observer = require('../src/observer/observer')
var Emitter = require('../src/emitter')
var OldObserver = require('../../vue/src/observer')
var sideEffect = 0
var runs = 1000
function cb () {
  sideEffect++
}

var loadTime = getNano()

function getNano () {
  var hr = process.hrtime()
  return hr[0] * 1e9 + hr[1]
}

function now () {
  return (getNano() - loadTime) / 1e6
}

function bench (desc, fac, run) {
  var objs = []
  for (var i = 0; i < runs; i++) {
    objs.push(fac(i))
  }
  var s = now()
  for (var i = 0; i < runs; i++) {
    run(objs[i])
  }
  var passed = now() - s
  console.log(desc + ' - ' + (16 / (passed / runs)).toFixed(2) + ' ops/frame')
}

bench(
  'observe (simple object)        ',
  function (i) {
    return {a:i}
  },
  function (o) {
    new Observer().observe('', o)
  }
)

bench(
  'old observe (simple object)    ',
  function (i) {
    return {a:i}
  },
  function (o) {
    OldObserver.observe(o, '', new Emitter())
  }
)

bench(
  'observe (3 nested objects)     ',
  function (i) {
    return {a:{b:{c:i}}}
  },
  function (o) {
    new Observer().observe('', o)
  }
)

bench(
  'old observe (3 nested objects) ',
  function (i) {
    return {a:{b:{c:i}}}
  },
  function (o) {
    OldObserver.observe(o, '', new Emitter())
  }
)

bench(
  'observe (array, 3 objects)     ',
  function (i) {
    return [{a:i}, {a:i+1}, {a:i+2}]
  },
  function (o) {
    new Observer().observe('', o)
  }
)

bench(
  'old observe (array, 3 objects) ',
  function (i) {
    return [{a:i}, {a:i+1}, {a:i+2}]
  },
  function (o) {
    OldObserver.observe(o, '', new Emitter())
  }
)

bench(
  'observe (array, 30 objects)    ',
  function () {
    var a = [], i = 30
    while (i--) {
      a.push({a:i})
    }
    return a
  },
  function (o) {
    new Observer().observe('', o)
  }
)

bench(
  'old observe (array, 30 objects)',
  function () {
    var a = [], i = 30
    while (i--) {
      a.push({a:i})
    }
    return a
  },
  function (o) {
    OldObserver.observe(o, '', new Emitter())
  }
)

Observer.emitGet = true
OldObserver.shouldGet = true

bench(
  'simple get    ',
  function () {
    var a = {a:1}
    var ob = new Observer()
    ob.observe('', a)
    ob.on('get', cb)
    return a
  },
  function (o) {
    var v = o.a
  }
)

bench(
  'old simple get',
  function () {
    var a = {a:1}
    var ob = new Emitter()
    OldObserver.observe(a, '', ob)
    ob.on('get', cb)
    return a
  },
  function (o) {
    var v = o.a
  }
)

bench(
  'nested get    ',
  function () {
    var a = {a:{b:{c:1}}}
    var ob = new Observer()
    ob.observe('', a)
    ob.on('get', cb)
    return a
  },
  function (o) {
    var v = o.a.b.c
  }
)

bench(
  'old nested get',
  function () {
    var a = {a:{b:{c:1}}}
    var ob = new Emitter()
    OldObserver.observe(a, '', ob)
    ob.on('get', cb)
    return a
  },
  function (o) {
    var v = o.a.b.c
  }
)

Observer.emitGet = false
OldObserver.shouldGet = false

bench(
  'simple set    ',
  function () {
    var a = {a:1}
    var ob = new Observer()
    ob.observe('', a)
    ob.on('set', cb)
    return a
  },
  function (o) {
    o.a = 12345
  }
)

bench(
  'old simple set',
  function () {
    var a = {a:1}
    var ob = new Emitter()
    OldObserver.observe(a, '', ob)
    ob.on('set', cb)
    return a
  },
  function (o) {
    o.a = 12345
  }
)

bench(
  'nested set    ',
  function () {
    var a = {a:{b:{c:1}}}
    var ob = new Observer()
    ob.observe('', a)
    ob.on('set', cb)
    return a
  },
  function (o) {
    o.a.b.c = 2
  }
)

bench(
  'old nested set',
  function () {
    var a = {a:{b:{c:1}}}
    var ob = new Emitter()
    OldObserver.observe(a, '', ob)
    ob.on('set', cb)
    return a
  },
  function (o) {
    o.a.b.c = 2
  }
)

bench(
  'array mutation (5 objects)     ',
  function () {
    var a = [], i = 5
    while (i--) {
      a.push({a:i})
    }
    var ob = new Observer()
    ob.observe('', a)
    ob.on('mutation', cb)
    return a
  },
  function (o) {
    o.reverse()
  }
)

bench(
  'old array mutation (5 objects) ',
  function () {
    var a = [], i = 5
    while (i--) {
      a.push({a:i})
    }
    var ob = new Emitter()
    OldObserver.observe(a, '', ob)
    ob.on('mutation', cb)
    return a
  },
  function (o) {
    o.reverse()
  }
)

bench(
  'array mutation (50 objects)    ',
  function () {
    var a = [], i = 50
    while (i--) {
      a.push({a:i})
    }
    var ob = new Observer()
    ob.observe('', a)
    ob.on('mutation', cb)
    return a
  },
  function (o) {
    o.reverse()
  }
)

bench(
  'old array mutation (50 objects)',
  function () {
    var a = [], i = 50
    while (i--) {
      a.push({a:i})
    }
    var ob = new Emitter()
    OldObserver.observe(a, '', ob)
    ob.on('mutation', cb)
    return a
  },
  function (o) {
    o.reverse()
  }
)