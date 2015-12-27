var Vue = require('src')

describe('misc', function () {

  describe('_applyFilters', function () {

    var vm = new Vue({
      data: {
        msg: 'BBB'
      },
      filters: {
        read: function (v, arg) {
          return v + ' read:' + arg
        },
        read2: {
          read: function (v, arg) {
            return v + ' read2:' + arg
          }
        },
        write: {
          write: function (v, oldV) {
            return v + ' ' + oldV
          }
        }
      }
    })

    beforeEach(function () {
      spyWarns()
    })

    it('read', function () {
      var filters = [
        { name: 'read', args: [{dynamic: false, value: 'AAA'}] },
        { name: 'read2', args: [{dynamic: true, value: 'msg'}] }
      ]
      var val = vm._applyFilters('test', null, filters, false)
      expect(val).toBe('test read:AAA read2:BBB')
    })

    it('write', function () {
      var filters = [
        { name: 'write' }
      ]
      var val = vm._applyFilters('test', 'oldTest', filters, true)
      expect(val).toBe('test oldTest')
    })

    it('warn not found', function () {
      vm._applyFilters('what', null, [{name: 'wtf'}])
      expect(hasWarned('Failed to resolve filter')).toBe(true)
    })
  })
})
