var Observer = require('../../../../src/observer')
var Dep = require('../../../../src/observer/dep')
var _ = require('../../../../src/util')
var config = require('../../../../src/config')

describe('Observer', function () {

  beforeEach(function () {
    spyOn(_, 'warn')
  })

  it('create on non-observables', function () {
    // skip primitive value
    var ob = Observer.create(1)
    expect(ob).toBeUndefined()
    // avoid vue instance
    ob = Observer.create(new _.Vue())
    expect(ob).toBeUndefined()
    // avoid frozen objects
    ob = Observer.create(Object.freeze({}))
    expect(ob).toBeUndefined()
  })

  it('create on object', function () {
    // on object
    var obj = {
      a: {},
      b: {}
    }
    var ob = Observer.create(obj)
    expect(ob instanceof Observer).toBe(true)
    expect(ob.value).toBe(obj)
    expect(obj.__ob__).toBe(ob)
    // should've walked children
    expect(obj.a.__ob__ instanceof Observer).toBe(true)
    expect(obj.b.__ob__ instanceof Observer).toBe(true)
    // should return existing ob on already observed objects
    var ob2 = Observer.create(obj)
    expect(ob2).toBe(ob)
  })

  it('create on null', function () {
    // on null
    var obj = Object.create(null)
    obj.a = {}
    obj.b = {}
    var ob = Observer.create(obj)
    expect(ob instanceof Observer).toBe(true)
    expect(ob.value).toBe(obj)
    expect(obj.__ob__).toBe(ob)
    // should've walked children
    expect(obj.a.__ob__ instanceof Observer).toBe(true)
    expect(obj.b.__ob__ instanceof Observer).toBe(true)
    // should return existing ob on already observed objects
    var ob2 = Observer.create(obj)
    expect(ob2).toBe(ob)
  })

  it('create on already observed object', function () {
    var previousConvertAllProperties = config.convertAllProperties
    config.convertAllProperties = true

    // on object
    var obj = {}
    var val = 0
    var getCount = 0
    Object.defineProperty(obj, 'a', {
      configurable: true,
      enumerable: true,
      get: function () {
        getCount++
        return val
      },
      set: function (v) {
        val = v
      }
    })

    var ob = Observer.create(obj)
    expect(ob instanceof Observer).toBe(true)
    expect(ob.value).toBe(obj)
    expect(obj.__ob__).toBe(ob)

    getCount = 0
    // Each read of 'a' should result in only one get underlying get call
    obj.a
    expect(getCount).toBe(1)
    obj.a
    expect(getCount).toBe(2)

    // should return existing ob on already observed objects
    var ob2 = Observer.create(obj)
    expect(ob2).toBe(ob)

    // should call underlying setter
    obj.a = 10
    expect(val).toBe(10)

    config.convertAllProperties = previousConvertAllProperties
  })

  it('create on property with only getter', function () {
    var previousConvertAllProperties = config.convertAllProperties
    config.convertAllProperties = true

    // on object
    var obj = {}
    Object.defineProperty(obj, 'a', {
      configurable: true,
      enumerable: true,
      get: function () {
        return 123
      }
    })

    var ob = Observer.create(obj)
    expect(ob instanceof Observer).toBe(true)
    expect(ob.value).toBe(obj)
    expect(obj.__ob__).toBe(ob)

    // should be able to read
    expect(obj.a).toBe(123)

    // should return existing ob on already observed objects
    var ob2 = Observer.create(obj)
    expect(ob2).toBe(ob)

    // since there is no setter, you shouldn't be able to write to it
    // PhantomJS throws when a property with no setter is set
    // but other real browsers don't
    try {
      obj.a = 101
    } catch (e) {}
    expect(obj.a).toBe(123)

    config.convertAllProperties = previousConvertAllProperties
  })

  it('create on property with only setter', function () {
    var previousConvertAllProperties = config.convertAllProperties
    config.convertAllProperties = true

    // on object
    var obj = {}
    var val = 10
    Object.defineProperty(obj, 'a', { // eslint-disable-line accessor-pairs
      configurable: true,
      enumerable: true,
      set: function (v) {
        val = v
      }
    })

    var ob = Observer.create(obj)
    expect(ob instanceof Observer).toBe(true)
    expect(ob.value).toBe(obj)
    expect(obj.__ob__).toBe(ob)

    // reads should return undefined
    expect(obj.a).toBe(undefined)

    // should return existing ob on already observed objects
    var ob2 = Observer.create(obj)
    expect(ob2).toBe(ob)

    // writes should call the set function
    obj.a = 100
    expect(val).toBe(100)

    config.convertAllProperties = previousConvertAllProperties
  })

  it('create on property which is marked not configurable', function () {
    var previousConvertAllProperties = config.convertAllProperties
    config.convertAllProperties = true

    // on object
    var obj = {}
    Object.defineProperty(obj, 'a', {
      configurable: false,
      enumerable: true,
      val: 10
    })

    var ob = Observer.create(obj)
    expect(ob instanceof Observer).toBe(true)
    expect(ob.value).toBe(obj)
    expect(obj.__ob__).toBe(ob)

    config.convertAllProperties = previousConvertAllProperties
  })

  it('create on array', function () {
    // on object
    var arr = [{}, {}]
    var ob = Observer.create(arr)
    expect(ob instanceof Observer).toBe(true)
    expect(ob.value).toBe(arr)
    expect(arr.__ob__).toBe(ob)
    // should've walked children
    expect(arr[0].__ob__ instanceof Observer).toBe(true)
    expect(arr[1].__ob__ instanceof Observer).toBe(true)
  })

  it('observing object prop change', function () {
    var obj = { a: { b: 2 } }
    Observer.create(obj)
    // mock a watcher!
    var watcher = {
      deps: [],
      addDep: function (dep) {
        this.deps.push(dep)
        dep.addSub(this)
      },
      update: jasmine.createSpy()
    }
    // collect dep
    Dep.target = watcher
    obj.a.b
    Dep.target = null
    expect(watcher.deps.length).toBe(3) // obj.a + a.b + b
    obj.a.b = 3
    expect(watcher.update.calls.count()).toBe(1)
    // swap object
    obj.a = { b: 4 }
    expect(watcher.update.calls.count()).toBe(2)
    watcher.deps = []
    Dep.target = watcher
    obj.a.b
    Dep.target = null
    expect(watcher.deps.length).toBe(3)
    // set on the swapped object
    obj.a.b = 5
    expect(watcher.update.calls.count()).toBe(3)
  })

  it('observing object prop change on defined property', function () {
    var previousConvertAllProperties = config.convertAllProperties
    config.convertAllProperties = true

    var obj = { val: 2 }
    Object.defineProperty(obj, 'a', {
      configurable: true,
      enumerable: true,
      get: function () {
        return this.val
      },
      set: function (v) {
        this.val = v
        return this.val
      }
    })

    Observer.create(obj)
    // mock a watcher!
    var watcher = {
      deps: [],
      addDep: function (dep) {
        this.deps.push(dep)
        dep.addSub(this)
      },
      update: jasmine.createSpy()
    }
    // collect dep
    Dep.target = watcher
    expect(obj.a).toBe(2) // Make sure 'this' is preserved
    Dep.target = null
    obj.a = 3
    expect(obj.val).toBe(3) // make sure 'setter' was called
    obj.val = 5
    expect(obj.a).toBe(5) // make sure 'getter' was called

    config.convertAllProperties = previousConvertAllProperties
  })

  it('observing set/delete', function () {
    var obj = { a: 1 }
    var ob = Observer.create(obj)
    var dep = ob.dep
    spyOn(dep, 'notify')
    _.set(obj, 'b', 2)
    expect(obj.b).toBe(2)
    expect(dep.notify.calls.count()).toBe(1)
    _.delete(obj, 'a')
    expect(obj.hasOwnProperty('a')).toBe(false)
    expect(dep.notify.calls.count()).toBe(2)
    // set existing key, should be a plain set and not
    // trigger own ob's notify
    _.set(obj, 'b', 3)
    expect(obj.b).toBe(3)
    expect(dep.notify.calls.count()).toBe(2)
    // set non-existing key
    _.set(obj, 'c', 1)
    expect(obj.c).toBe(1)
    expect(dep.notify.calls.count()).toBe(3)
    // should ignore deleting non-existing key
    _.delete(obj, 'a')
    expect(dep.notify.calls.count()).toBe(3)
    // should work on non-observed objects
    var obj2 = { a: 1 }
    _.delete(obj2, 'a')
    expect(obj2.hasOwnProperty('a')).toBe(false)
  })

  it('observing array mutation', function () {
    var arr = []
    var ob = Observer.create(arr)
    var dep = ob.dep
    spyOn(dep, 'notify')
    var objs = [{}, {}, {}]
    arr.push(objs[0])
    arr.pop()
    arr.unshift(objs[1])
    arr.shift()
    arr.splice(0, 0, objs[2])
    arr.sort()
    arr.reverse()
    expect(dep.notify.calls.count()).toBe(7)
    // inserted elements should be observed
    objs.forEach(function (obj) {
      expect(obj.__ob__ instanceof Observer).toBe(true)
    })
  })

  it('array $set', function () {
    var arr = [1]
    var ob = Observer.create(arr)
    var dep = ob.dep
    spyOn(dep, 'notify')
    arr.$set(0, 2)
    expect(arr[0]).toBe(2)
    expect(dep.notify.calls.count()).toBe(1)
    // setting out of bound index
    arr.$set(2, 3)
    expect(arr[2]).toBe(3)
    expect(dep.notify.calls.count()).toBe(2)
  })

  it('array $remove', function () {
    var arr = [{}, {}]
    var obj1 = arr[0]
    var obj2 = arr[1]
    var ob = Observer.create(arr)
    var dep = ob.dep
    spyOn(dep, 'notify')
    // remove by identity, not in array
    arr.$remove(obj1)
    expect(arr.length).toBe(1)
    expect(arr[0]).toBe(obj2)
    expect(dep.notify.calls.count()).toBe(1)
    // remove by identity, in array
    arr.$remove(obj2)
    expect(arr.length).toBe(0)
    expect(dep.notify.calls.count()).toBe(2)
  })

  it('no proto', function () {
    _.hasProto = false
    var arr = [1, 2, 3]
    var ob2 = Observer.create(arr)
    expect(arr.$set).toBeTruthy()
    expect(arr.$remove).toBeTruthy()
    expect(arr.push).not.toBe([].push)
    var dep2 = ob2.dep
    spyOn(dep2, 'notify')
    arr.push(1)
    expect(dep2.notify).toHaveBeenCalled()
    _.hasProto = true
  })

})
