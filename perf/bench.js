function bench (fn, n) {
  var s = Date.now()
  var vms = []
  for (var i = 0; i < n; i++) {
    vms.push(fn())
  }
  console.log(n + ' ' + fn.desciption + ': ' + (Date.now() - s) + 'ms')
}

function emptyInstance () {
  return new Vue()
}
emptyInstance.desciption = 'empty instances'

var options = {
  template: '{{hi}}',
  data: function () {
    return {
      hi: 'msg'
    }
  },
  ready: function () {},
  filters: {
    that: function () {}
  }
}

function instanceWithOption () {
  return new Vue(options)
}
instanceWithOption.desciption = 'instance with options'

var Test = Vue.extend(options)
function extendedInstance () {
  return new Test()
}
extendedInstance.desciption = 'extended instances'

function extendedInstanceWithOptions () {
  return new Test({
    data: function () {
      return {
        b: 'lol'
      }
    },
    ready: function () {},
    directives: {
      that: function () {
        
      }
    }
  })
}
extendedInstanceWithOptions.desciption = 'extended instances with options'

bench(emptyInstance, 100)
bench(emptyInstance, 1000)
bench(emptyInstance, 10000)

bench(instanceWithOption, 100)
bench(instanceWithOption, 1000)
bench(instanceWithOption, 10000)

bench(extendedInstance, 100)
bench(extendedInstance, 1000)
bench(extendedInstance, 10000)

bench(extendedInstanceWithOptions, 100)
bench(extendedInstanceWithOptions, 1000)
bench(extendedInstanceWithOptions, 10000)

// TODO:
//
// - rendering performance
//   - simple v-repeat
//   - component v-repeat
//   - v-repeat with nested components
//
// - data observation performance
//   - simple objects
//   - complex objects
//   - small array
//   - large array
//
// - dependency tracking performance
//   - simple watcher
//   - complex watcher
