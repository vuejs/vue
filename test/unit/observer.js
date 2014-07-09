var Observer = require('../../src/observer/observer')

describe('Observer', function () {

  it('should work', function () {
    var obj = {}
    var ob = Observer.create(obj)
    ob.init()
    expect(obj.$add).toBeDefined()
  })

})