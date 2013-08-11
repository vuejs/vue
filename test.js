var ARGS_RE = /^function\s*?\((.+)\)/,
    SCOPE_RE_STR = '\\.scope\\.[\\.A-Za-z0-9_$]+',
    noop = function () {}

function test (fn) {
    var s = Date.now()
    var scope = {},
        str = fn.toString()
    console.log(Date.now() - s)
    var args = str.match(ARGS_RE)
    console.log(Date.now() - s)
    if (!args) return scope
    var argRE = new RegExp(args[1] + SCOPE_RE_STR, 'g'),
        matches = str.match(argRE)
    console.log(Date.now() - s)
    if (!matches) return scope
    var i = matches.length, j, path, key, level
    while (i--) {
        level = scope
        path = matches[i].slice(args[1].length + 7).split('.')
        j = 0
        while (j < path.length) {
            key = path[j]
            if (!level[key]) level[key] = noop
            level = level[key]
            j++
        }
    }
    console.log(scope)
    console.log(Date.now() - s)
    return scope
}

process.nextTick(function () {
    test(function (e) {
        return e.scope.a
    })
})