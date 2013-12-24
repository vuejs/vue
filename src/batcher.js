var config = require('./config'),
    utils = require('./utils'),
    queue, has, waiting

reset()

exports.queue = function (binding, method) {
    if (!config.async) {
        binding['_' + method]()
        return
    }
    if (!has[binding.id]) {
        queue.push({
            binding: binding,
            method: method
        })
        has[binding.id] = true
        if (!waiting) {
            waiting = true
            utils.nextTick(flush)
        }
    }
}

function flush () {
    for (var i = 0; i < queue.length; i++) {
        var task = queue[i],
            b = task.binding
        if (b.unbound) continue
        b['_' + task.method]()
        has[b.id] = false
    }
    reset()
}

function reset () {
    queue = []
    has = utils.hash()
    waiting = false
}