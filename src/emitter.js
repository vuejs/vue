// shiv to make this work for component, browserify
// and node at the same time
var Emitter
try {
    Emitter = require('emitter')
} catch (e) {}
module.exports = Emitter || require('events').EventEmitter