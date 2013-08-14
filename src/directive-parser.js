var config     = require('./config'),
    directives = require('./directives'),
    filters    = require('./filters')

var KEY_RE          = /^[^\|<]+/,
    ARG_RE          = /([^:]+):(.+)$/,
    FILTERS_RE      = /\|[^\|<]+/g,
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    INVERSE_RE      = /^!/,
    NESTING_RE      = /^\^+/,
    ONEWAY_RE       = /-oneway$/

/*
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive (directiveName, expression, oneway) {

    var prop,
        definition = directives[directiveName]

    // mix in properties from the directive definition
    if (typeof definition === 'function') {
        this._update = definition
    } else {
        this._update = definition.update
        for (prop in definition) {
            if (prop !== 'update') {
                if (prop === 'unbind') {
                    this._unbind = definition[prop]
                } else {
                    this[prop] = definition[prop]
                }
            }
        }
    }

    this.oneway        = !!oneway
    this.directiveName = directiveName
    this.expression    = expression.trim()
    this.rawKey        = expression.match(KEY_RE)[0].trim()
    
    this.parseKey(this.rawKey)
    
    var filterExps = expression.match(FILTERS_RE)
    this.filters = filterExps
        ? filterExps.map(parseFilter)
        : null
}

var DirProto = Directive.prototype

/*
 *  called when a new value is set 
 *  for computed properties, this will only be called once
 *  during initialization.
 */
DirProto.update = function (value) {
    if (value && (value === this.value)) return
    this.value = value
    this.apply(value)
}

/*
 *  -- computed property only --
 *  called when a dependency has changed
 */
DirProto.refresh = function () {
    // pass element and viewmodel info to the getter
    // enables powerful context-aware bindings
    var value = this.value.get({
        el: this.el,
        vm: this.vm
    })
    if (value === this.computedValue) return
    this.computedValue = value
    this.apply(value)
    this.binding.pub()
}

/*
 *  Actually invoking the _update from the directive's definition
 */
DirProto.apply = function (value) {
    if (this.inverse) value = !value
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
        if (!filter.apply) throw new Error('Unknown filter: ' + filter.name)
        filtered = filter.apply(filtered, filter.args)
    }
    return filtered
}

/*
 *  parse a key, extract argument and nesting/root info
 */
DirProto.parseKey = function (rawKey) {

    var argMatch = rawKey.match(ARG_RE)

    var key = argMatch
        ? argMatch[2].trim()
        : rawKey.trim()

    this.arg = argMatch
        ? argMatch[1].trim()
        : null

    this.inverse = INVERSE_RE.test(key)
    if (this.inverse) {
        key = key.slice(1)
    }

    var nesting = key.match(NESTING_RE)
    this.nesting = nesting
        ? nesting[0].length
        : false

    this.root = key.charAt(0) === '$'

    if (this.nesting) {
        key = key.replace(NESTING_RE, '')
    } else if (this.root) {
        key = key.slice(1)
    }

    this.key = key
}

/*
 *  unbind noop, to be overwritten by definitions
 */
DirProto.unbind = function (update) {
    if (!this.el) return
    if (this._unbind) this._unbind(update)
    if (!update) this.vm = this.el = this.compiler = this.binding =  null
}

/*
 *  parse a filter expression
 */
function parseFilter (filter) {

    var tokens = filter.slice(1)
        .match(FILTER_TOKEN_RE)
        .map(function (token) {
            return token.replace(/'/g, '').trim()
        })

    return {
        name  : tokens[0],
        apply : filters[tokens[0]],
        args  : tokens.length > 1
                ? tokens.slice(1)
                : null
    }
}

module.exports = {

    /*
     *  make sure the directive and expression is valid
     *  before we create an instance
     */
    parse: function (dirname, expression) {

        var prefix = config.prefix
        if (dirname.indexOf(prefix) === -1) return null
        dirname = dirname.slice(prefix.length + 1)

        var oneway = ONEWAY_RE.test(dirname)
        if (oneway) {
            dirname = dirname.slice(0, -7)
        }

        var dir   = directives[dirname],
            valid = KEY_RE.test(expression)

        if (!dir) config.warn('unknown directive: ' + dirname)
        if (!valid) config.warn('invalid directive expression: ' + expression)

        return dir && valid
            ? new Directive(dirname, expression, oneway)
            : null
    }
}