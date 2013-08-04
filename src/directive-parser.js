var config     = require('./config'),
    directives = require('./directives'),
    filters    = require('./filters')

var KEY_RE          = /^[^\|]+/,
    LOCAL_KEY_RE    = /\.[^.]+$/,
    ARG_RE          = /([^:]+):(.+)$/,
    FILTERS_RE      = /\|[^\|]+/g,
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    QUOTE_RE        = /'/g

function Directive (directiveName, expression) {

    var directive = directives[directiveName]
    if (typeof directive === 'function') {
        this._update = directive
    } else {
        for (var prop in directive) {
            if (prop === 'update') {
                this['_update'] = directive.update
            } else {
                this[prop] = directive[prop]
            }
        }
    }

    var rawKey   = expression.match(KEY_RE)[0], // guarded in parse
        argMatch = rawKey.match(ARG_RE)

    this.key = argMatch
        ? argMatch[2].trim()
        : rawKey.trim()

    this.arg = argMatch
        ? argMatch[1].trim()
        : null
    
    var filterExpressions = expression.match(FILTERS_RE)
    if (filterExpressions) {
        this.filters = filterExpressions.map(function (filter) {
            var tokens = filter.slice(1)
                .match(FILTER_TOKEN_RE)
                .map(function (token) {
                    return token.replace(QUOTE_RE, '').trim()
                })
            return {
                name  : tokens[0],
                apply : filters[tokens[0]],
                args  : tokens.length > 1
                        ? tokens.slice(1)
                        : null
            }
        })
    } else {
        this.filters = null
    }
}

Directive.prototype.update = function (value) {
    // apply filters
    if (this.filters) {
        value = this.applyFilters(value)
    }
    this._update(value)
}

Directive.prototype.applyFilters = function (value) {
    var filtered = value
    this.filters.forEach(function (filter) {
        if (!filter.apply) throw new Error('Unknown filter: ' + filter.name)
        filtered = filter.apply(filtered, filter.args)
    })
    return filtered
}

module.exports = {

    // make sure the directive and value is valid
    parse: function (dirname, expression) {

        var prefix = config.prefix
        if (dirname.indexOf(prefix) === -1) return null
        dirname = dirname.slice(prefix.length + 1)

        var dir   = directives[dirname],
            valid = KEY_RE.test(expression)

        if (!dir) console.warn('unknown directive: ' + dirname)
        if (!valid) console.warn('invalid directive expression: ' + expression)

        return dir && valid
            ? new Directive(dirname, expression)
            : null
    }
}