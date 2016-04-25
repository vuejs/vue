var util = require('util')
var events = require('events')

var waitFor = function () {
  events.EventEmitter.call(this)
}

util.inherits(waitFor, events.EventEmitter)

waitFor.prototype.command = function (ms, cb) {
  var self = this

  ms = ms || 1000

  setTimeout(function () {
    // if we have a callback, call it right before the complete event
    if (cb) {
      cb.call(self.client.api)
    }

    self.emit('complete')
  }, ms)

  return this
}

module.exports = waitFor
