var Vue = require('../src/vue')

window.model = {
  a: 'parent a',
  b: 'parent b',
  c: {
    d: 3
  },
  arr: [{a: 'item a'}],
  go: function () {
    console.log(this.a)
  }
}

window.vm = new Vue({
  data: model
})

window.child = new Vue({
  parent: vm,
  data: {
    a: 'child a',
    change: function () {
      this.c.d = 4
      this.b = 456 // Unlike Angular, setting primitive values in Vue WILL affect outer scope,
                   // unless you overwrite it in the instantiation data!
    }
  }
})

window.item = new Vue({
  parent: vm,
  data: vm.arr[0]
})

vm._observer.on('set', function (key, val) {
  console.log('vm set:' + key.replace(/[\b]/g, '.'), val)
})

child._observer.on('set', function (key, val) {
  console.log('child set:' + key.replace(/[\b]/g, '.'), val)
})

item._observer.on('set', function (key, val) {
  console.log('item set:' + key.replace(/[\b]/g, '.'), val)
})

// TODO turn these into tests

console.log(vm.a) // 'parent a'
console.log(child.a) // 'child a'
console.log(child.b) // 'parent b'
console.log(item.a) // 'item a'
console.log(item.b) // 'parent b'

// set shadowed parent property
vm.a = 'haha!' // vm set:a haha!

// set shadowed child property
child.a = 'hmm' // child set:a hmm

// test parent scope change downward propagation
vm.b = 'hoho!' // child set:b hoho!
               // item set:b hoho!
               // vm set:b hoho!

// set child owning an array item
item.a = 'wow' // child set:arr.0.a wow
               // item set:arr.0.a wow
               // vm set:arr.0.a wow
               // item set:a wow