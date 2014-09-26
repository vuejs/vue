var _ = require('../../../../src/util')

describe('Util - Language Enhancement', function () {

  it('toString', function () {
    expect(_.toString('hi')).toBe('hi')
    expect(_.toString(1.234)).toBe('1.234')
    expect(_.toString(null)).toBe('')
    expect(_.toString(undefined)).toBe('')
  })

  it('toNumber', function () {
    expect(_.toNumber('12')).toBe(12)
    expect(_.toNumber('1e5')).toBe(1e5)
    expect(_.toNumber('0x2F')).toBe(0x2F)
    expect(_.toNumber(null)).toBe(null)
    expect(_.toNumber(true)).toBe(true)
    expect(_.toNumber('hello')).toBe('hello')
  })

  it('strip quotes', function () {
    expect(_.stripQuotes('"123"')).toBe('123')
    expect(_.stripQuotes("'fff'")).toBe('fff')
    expect(_.stripQuotes("'fff")).toBe(false)
  })

  it('camelize', function () {
    expect(_.camelize('abc')).toBe('Abc')
    expect(_.camelize('some-long-name')).toBe('SomeLongName')
    expect(_.camelize('what_about_this')).toBe('WhatAboutThis')
  })

  it('bind', function () {
    var original = function (a) {
      return this.a + a
    }
    var ctx = { a: 'ctx a ' }
    var bound = _.bind(original, ctx)
    var res = bound('arg a')
    expect(res).toBe('ctx a arg a')
  })
  
  it('toArray', function () {
    // should make a copy of original array
    var arr = [1,2,3]
    var res = _.toArray(arr)
    expect(Array.isArray(res)).toBe(true)
    expect(res.toString()).toEqual('1,2,3')
    expect(res).not.toBe(arr)

    // should work on arguments
    ;(function () {
      var res = _.toArray(arguments)
      expect(Array.isArray(res)).toBe(true)
      expect(res.toString()).toEqual('1,2,3')
    })(1,2,3)
  })

  it('extend', function () {
    var from = {a:1,b:2}
    var to = {}
    _.extend(to, from)
    expect(to.a).toBe(from.a)
    expect(to.b).toBe(from.b)
  })

  it('isObject', function () {
    expect(_.isObject({})).toBe(true)
    expect(_.isObject([])).toBe(true)
    expect(_.isObject(null)).toBeFalsy()
    expect(_.isObject(123)).toBeFalsy()
    expect(_.isObject(true)).toBeFalsy()
    expect(_.isObject('hi')).toBeFalsy()
    expect(_.isObject(undefined)).toBeFalsy()
    expect(_.isObject(function(){})).toBeFalsy()
  })

  it('isPlainObject', function () {
    expect(_.isPlainObject({})).toBe(true)
    expect(_.isPlainObject([])).toBe(false)
    expect(_.isPlainObject(null)).toBe(false)
    expect(_.isPlainObject(null)).toBeFalsy()
    expect(_.isPlainObject(123)).toBeFalsy()
    expect(_.isPlainObject(true)).toBeFalsy()
    expect(_.isPlainObject('hi')).toBeFalsy()
    expect(_.isPlainObject(undefined)).toBeFalsy()
    expect(_.isPlainObject(function(){})).toBe(false)
    if (_.inBrowser) {
      expect(_.isPlainObject(window)).toBe(false)
    }
  })

  it('isArray', function () {
    expect(_.isArray([])).toBe(true)
    expect(_.isArray({})).toBe(false)
    expect(_.isArray(arguments)).toBe(false)
  })

  it('define', function () {
    var obj = {}
    _.define(obj, 'test', 123)
    expect(obj.test).toBe(123)
    var desc = Object.getOwnPropertyDescriptor(obj, 'test')
    expect(desc.enumerable).toBe(false)

    _.define(obj, 'test2', 123, true)
    expect(obj.test2).toBe(123)
    desc = Object.getOwnPropertyDescriptor(obj, 'test2')
    expect(desc.enumerable).toBe(true)
  })

})