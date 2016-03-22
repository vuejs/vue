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
        },
        duplex1: {
          read: function (v) {
            return v.split('').reverse().join('')
          },
          write: function (v) {
            return v.split('').reverse().join('')
          }
        },
        duplex2: {
          read: function (v) {
            return v + 'hi'
          },
          write: function (v) {
            return v.replace('hi', '')
          }
        }
      }
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

    it('chained read + write', function () {
      var filters = [
        { name: 'duplex1' },
        { name: 'duplex2' }
      ]
      var val = vm._applyFilters('test', 'oldTest', filters)
      expect(val).toBe('tsethi')
      val = vm._applyFilters('tsethi', 'oldTest', filters, true)
      expect(val).toBe('test')
    })

    it('warn not found', function () {
      vm._applyFilters('what', null, [{name: 'wtf'}])
      expect('Failed to resolve filter').toHaveBeenWarned()
    })
  })
})
