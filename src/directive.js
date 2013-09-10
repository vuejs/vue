var config     = require('./config'),
    utils      = require('./utils'),
    directives = require('./directives'),
    filters    = require('./filters')

var KEY_RE          = /^[^\|]+/,
    ARG_RE          = /([^:]+):(.+)$/,
    FILTERS_RE      = /\|[^\|]+/g,
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    NESTING_RE      = /^\^+/,
    SINGLE_VAR_RE   = /^[\w\.]+$/

/*
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive (directiveName, expression, rawKey) {

    var definition = directives[directiveName]

    // mix in properties from the directive definition
    if (typeof definition === 'function') {
        this._update = definition
    } else {
        for (var prop in definition) {
            if (prop === 'unbind' || prop === 'update') {
                this['_' + prop] = definition[prop]
            } else {
                this[prop] = definition[prop]
            }
        }
    }

    this.name       = directiveName
    this.expression = expression.trim()
    this.rawKey     = rawKey
    
    parseKey(this, rawKey)

    this.isExp = !SINGLE_VAR_RE.test(this.key)
    
    var filterExps = expression.match(FILTERS_RE)
    if (filterExps) {
        this.filters = []
        var i = 0, l = filterExps.length, filter
        for (; i < l; i++) {
            filter = parseFilter(filterExps[i])
            if (filter) this.filters.push(filter)
        }
        if (!this.filters.length) this.filters = null
    } else {
        this.filters = null
    }
}

var DirProto = Directive.prototype

/*
 *  parse a key, extract argument and nesting/root info
 */
function parseKey (dir, rawKey) {

    var argMatch = rawKey.match(ARG_RE)

    var key = argMatch
        ? argMatch[2].trim()
        : rawKey.trim()

    dir.arg = argMatch
        ? argMatch[1].trim()
        : null

    var nesting = key.match(NESTING_RE)
    dir.nesting = nesting
        ? nesting[0].length
        : false

    dir.root = key.charAt(0) === '$'

    if (dir.nesting) {
        key = key.replace(NESTING_RE, '')
    } else if (dir.root) {
        key = key.slice(1)
    }

    dir.key = key
}

/*
 *  parse a filter expression
 */
function parseFilter (filter) {

    var tokens = filter.slice(1).match(FILTER_TOKEN_RE)
    if (!tokens) return
    tokens = tokens.map(function (token) {
        return token.replace(/'/g, '').trim()
    })

    var name = tokens[0],
        apply = filters[name]
    if (!apply) {
        utils.warn('Unknown filter: ' + name)
        return
    }

    return {
        name  : name,
        apply : apply,
        args  : tokens.length > 1
                ? tokens.slice(1)
                : null
    }
}

/*
 *  called when a new value is set 
 *  for computed properties, this will only be called once
 *  during initialization.
 */
DirProto.update = function (value, init) {
    if (!init && value === this.value) return
    this.value = value
    this.apply(value)
}

/*
 *  -- computed property only --
 *  called when a dependency has changed
 */
DirProto.refresh = function (value) {
    // pass element and viewmodel info to the getter
    // enables powerful context-aware bindings
    if (value) this.value = value
    value = this.value.get({
        el: this.el,
        vm: this.vm
    })
    if (value && value === this.computedValue) return
    this.computedValue = value
    this.apply(value)
}

/*
 *  Actually invoking the _update from the directive's definition
 */
DirProto.apply = function (value) {
    this._update(
        this.filters
        ? this.applyFilters(value)
        : value
    )
}

/*
 *  pipe the value through filters
 */
DirProto.applyFilters = function (value) {
    var filtered = value, filter
    for (var i = 0, l = this.filters.length; i < l; i++) {
        filter = this.filters[i]
        filtered = filter.apply(filtered, filter.args)
    }
    return filtered
}

/*
 *  Unbind diretive
 *  @ param {Boolean} update
 *    Sometimes we call unbind before an update (i.e. not destroy)
 *    just to teardown previousstuff, in that case we do not want
 *    to null everything.
 */
DirProto.unbind = function (update) {
    // this can be called before the el is even assigned...
    if (!this.el) return
    if (this._unbind) this._unbind(update)
    if (!update) this.vm = this.el = this.binding = this.compiler = null
}

/*
 *  make sure the directive and expression is valid
 *  before we create an instance
 */
Directive.parse = function (dirname, expression) {

    var prefix = config.prefix
    if (dirname.indexOf(prefix) === -1) return null
    dirname = dirname.slice(prefix.length + 1)

    var dir = directives[dirname],
        keyMatch = expression.match(KEY_RE),
        rawKey = keyMatch && keyMatch[0].trim()

    if (!dir) utils.warn('unknown directive: ' + dirname)
    if (!rawKey) utils.warn('invalid directive expression: ' + expression)

    return dir && rawKey
        ? new Directive(dirname, expression, rawKey)
        : null
}

module.exports = Directive