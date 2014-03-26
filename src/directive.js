var utils      = require('./utils'),
    dirId      = 1,

    // match up to the first single pipe, ignore those within quotes.
    KEY_RE          = /^(?:['"](?:\\.|[^'"])*['"]|\\.|[^\|]|\|\|)+/,
    ARG_RE          = /^([\w-$ ]+):(.+)$/,
    FILTERS_RE      = /\|[^\|]+/g,
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'|[^\s"]+|"[^"]+"/g,
    NESTING_RE      = /^\$(parent|root)\./,
    SINGLE_VAR_RE   = /^[\w\.$]+$/,
    QUOTE_RE        = /"/g

/**
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive (dirname, definition, expression, rawKey, compiler, node) {

    this.id             = dirId++
    this.name           = dirname
    this.compiler       = compiler
    this.vm             = compiler.vm
    this.el             = node
    this.computeFilters = false

    var isEmpty   = expression === ''

    // mix in properties from the directive definition
    if (typeof definition === 'function') {
        this[isEmpty ? 'bind' : '_update'] = definition
    } else {
        for (var prop in definition) {
            if (prop === 'unbind' || prop === 'update') {
                this['_' + prop] = definition[prop]
            } else {
                this[prop] = definition[prop]
            }
        }
    }

    // empty expression, we're done.
    if (isEmpty || this.isEmpty) {
        this.isEmpty = true
        return
    }

    this.expression = (
        this.isLiteral
            ? compiler.eval(expression)
            : expression
    ).trim()
    
    var parsed = Directive.parseArg(rawKey)
    this.key = parsed.key
    this.arg = parsed.arg
    
    var filters = Directive.parseFilters(this.expression.slice(rawKey.length)),
        filter, fn, i, l, computed
    if (filters) {
        this.filters = []
        for (i = 0, l = filters.length; i < l; i++) {
            filter = filters[i]
            fn = this.compiler.getOption('filters', filter.name)
            if (fn) {
                filter.apply = fn
                this.filters.push(filter)
                if (fn.computed) {
                    computed = true
                }
            }
        }
    }

    if (!this.filters || !this.filters.length) {
        this.filters = null
    }

    if (computed) {
        this.computedKey = Directive.inlineFilters(this.key, this.filters)
        this.filters = null
    }

    this.isExp =
        computed ||
        !SINGLE_VAR_RE.test(this.key) ||
        NESTING_RE.test(this.key)

}

var DirProto = Directive.prototype

/**
 *  called when a new value is set 
 *  for computed properties, this will only be called once
 *  during initialization.
 */
DirProto.update = function (value, init) {
    if (init || value !== this.value || (value && typeof value === 'object')) {
        this.value = value
        if (this._update) {
            this._update(
                this.filters && !this.computeFilters
                    ? this.applyFilters(value)
                    : value,
                init
            )
        }
    }
}

/**
 *  pipe the value through filters
 */
DirProto.applyFilters = function (value) {
    var filtered = value, filter
    for (var i = 0, l = this.filters.length; i < l; i++) {
        filter = this.filters[i]
        filtered = filter.apply.apply(this.vm, [filtered].concat(filter.args))
    }
    return filtered
}

/**
 *  Unbind diretive
 */
DirProto.unbind = function () {
    // this can be called before the el is even assigned...
    if (!this.el || !this.vm) return
    if (this._unbind) this._unbind()
    this.vm = this.el = this.binding = this.compiler = null
}

// Exposed static methods -----------------------------------------------------

/**
 *  split a unquoted-comma separated expression into
 *  multiple clauses
 */
Directive.parse = function (str) {

    var inSingle = false,
        inDouble = false,
        curly    = 0,
        square   = 0,
        paren    = 0,
        begin    = 0,
        argIndex = 0,
        dirs     = [],
        dir      = {},
        lastFilterIndex = 0

    for (var c, i = 0, l = str.length; i < l; i++) {
        c = str.charAt(i)
        if (inSingle) {
            // check single quote
            if (c === "'") inSingle = !inSingle
        } else if (inDouble) {
            // check double quote
            if (c === '"') inDouble = !inDouble
        } else if (c === ',' && !paren && !curly && !square) {
            // reached the end of a directive
            pushDir()
            // reset & skip the comma
            dir = {}
            begin = argIndex = lastFilterIndex = i + 1
        } else if (c === ':' && !dir.key && !dir.arg) {
            // argument
            argIndex = i + 1
            dir.arg = str.slice(begin, i).trim()
        } else if (c === '|' && str.charAt(i + 1) !== '|') {
            if (!dir.key) {
                // first filter, end of key
                lastFilterIndex = i
                dir.key = str.slice(argIndex, i).trim()
            } else {
                // already has filter
                pushFilter()
            }
        } else if (c === '"') {
            inDouble = true
        } else if (c === "'") {
            inSingle = true
        } else if (c === '(') {
            paren++
        } else if (c === ')') {
            paren--
        } else if (c === '[') {
            square++
        } else if (c === ']') {
            square--
        } else if (c === '{') {
            curly++
        } else if (c === '}') {
            curly--
        }
    }
    if (begin !== i) {
        pushDir()
    }

    function pushDir () {
        dir.expression = str.slice(begin, i).trim()
        if (!dir.key) {
            dir.key = str.slice(argIndex, i).trim()
        } else if (lastFilterIndex !== begin) {
            pushFilter()
        }
        dirs.push(dir)
    }

    function pushFilter () {
        (dir.filters = dir.filters || [])
            .push(str.slice(lastFilterIndex + 1, i).trim())
        lastFilterIndex = i + 1
    }

    return dirs
}

// function split (str) {
//     var inSingle = false,
//         inDouble = false,
//         curly    = 0,
//         square   = 0,
//         paren    = 0,
//         begin    = 0,
//         end      = 0,
//         res      = []
//     for (var c, i = 0, l = str.length; i < l; i++) {
//         c = str.charAt(i)
//         if (inSingle) {
//             if (c === "'") {
//                 inSingle = !inSingle
//             }
//             end++
//         } else if (inDouble) {
//             if (c === '"') {
//                 inDouble = !inDouble
//             }
//             end++
//         } else if (c === ',' && !paren && !curly && !square) {
//             res.push(str.slice(begin, end))
//             begin = end = i + 1
//         } else {
//             if (c === '"') {
//                 inDouble = true
//             } else if (c === "'") {
//                 inSingle = true
//             } else if (c === '(') {
//                 paren++
//             } else if (c === ')') {
//                 paren--
//             } else if (c === '[') {
//                 square++
//             } else if (c === ']') {
//                 square--
//             } else if (c === '{') {
//                 curly++
//             } else if (c === '}') {
//                 curly--
//             }
//             end++
//         }
//     }
//     if (begin !== end) {
//         res.push(str.slice(begin, end))
//     }
//     return res
// }

// /**
//  *  parse a key, extract argument
//  */
// Directive.parseArg = function (rawKey) {
//     var key = rawKey,
//         arg = null
//     if (rawKey.indexOf(':') > -1) {
//         var argMatch = rawKey.match(ARG_RE)
//         key = argMatch
//             ? argMatch[2].trim()
//             : key
//         arg = argMatch
//             ? argMatch[1].trim()
//             : arg
//     }
//     return {
//         key: key,
//         arg: arg
//     }
// }

// /**
//  *  parse a the filters
//  */
// Directive.parseFilters = function (exp) {
//     if (exp.indexOf('|') < 0) {
//         return
//     }
//     var filters = exp.match(FILTERS_RE),
//         res, i, l, tokens
//     if (filters) {
//         res = []
//         for (i = 0, l = filters.length; i < l; i++) {
//             tokens = filters[i].slice(1).match(FILTER_TOKEN_RE)
//             if (tokens) {
//                 res.push({
//                     name: tokens[0],
//                     args: tokens.length > 1
//                         ? tokens.slice(1)
//                         : null
//                 })
//             }
//         }
//     }
//     return res
// }

/**
 *  Inline computed filters so they become part
 *  of the expression
 */
Directive.inlineFilters = function (key, filters) {
    var args, filter
    for (var i = 0, l = filters.length; i < l; i++) {
        filter = filters[i]
        args = filter.args
            ? ',"' + filter.args.map(escapeQuote).join('","') + '"'
            : ''
        key = 'this.$compiler.getOption("filters", "' +
                filter.name +
            '").call(this,' +
                key + args +
            ')'
    }
    return key
}

/**
 *  Convert double quotes to single quotes
 *  so they don't mess up the generated function body
 */
function escapeQuote (v) {
    return v.indexOf('"') > -1
        ? v.replace(QUOTE_RE, '\'')
        : v
}

/**
 *  Parse the key from a directive raw expression
 */
Directive.parseKey = function (expression) {
    if (expression.indexOf('|') > -1) {
        var keyMatch = expression.match(KEY_RE)
        if (keyMatch) {
            return keyMatch[0].trim()
        }
    } else {
        return expression.trim()
    }
}

/**
 *  make sure the directive and expression is valid
 *  before we create an instance
 */
Directive.build = function (dirname, expression, compiler, node) {

    var dir = compiler.getOption('directives', dirname)
    if (!dir) return

    var rawKey = Directive.parseKey(expression)
    // have a valid raw key, or be an empty directive
    if (rawKey || expression === '') {
        return new Directive(dirname, dir, expression, rawKey, compiler, node)
    } else {
        utils.warn('Invalid directive expression: ' + expression)
    }
}

module.exports = Directive