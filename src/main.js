var prefix      = 'sd',
    Filters     = require('./filters'),
    Directives  = require('./directives'),
    selector    = Object.keys(Directives).map(function (d) {
        return '[' + prefix + '-' + d + ']'
    }).join()

function Seed (opts) {

    var self = this,
        root = this.el = document.getElementById(opts.id),
        els  = root.querySelectorAll(selector)

    var bindings = self._bindings = {} // internal real data
    self.scope = {} // external interface

    // process nodes for directives
    ;[].forEach.call(els, processNode)
    processNode(root)

    // initialize all variables by invoking setters
    for (var key in bindings) {
        self.scope[key] = opts.scope[key]
    }

    function processNode (el) {
        cloneAttributes(el.attributes).forEach(function (attr) {
            var directive = parseDirective(attr)
            if (directive) {
                bindDirective(self, el, bindings, directive)
            }
        })
    }
}

Seed.prototype.dump = function () {
    var data = {}
    for (var key in this._bindings) {
        data[key] = this._bindings[key].value
    }
    return data
}

Seed.prototype.destroy = function () {
    for (var key in this._bindings) {
        this._bindings[key].directives.forEach(function (directive) {
            if (directive.definition.unbind) {
                directive.definition.unbind(
                    directive.el,
                    directive.argument,
                    directive
                )
            }
        })
    }
    this.el.parentNode.remove(this.el)
}

// clone attributes so they don't change
function cloneAttributes (attributes) {
    return [].map.call(attributes, function (attr) {
        return {
            name: attr.name,
            value: attr.value
        }
    })
}

function bindDirective (seed, el, bindings, directive) {
    directive.el = el
    el.removeAttribute(directive.attr.name)
    var key = directive.key,
        binding = bindings[key]
    if (!binding) {
        bindings[key] = binding = {
            value: undefined,
            directives: []
        }
    }
    binding.directives.push(directive)
    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(el, binding.value)
    }
    if (!seed.scope.hasOwnProperty(key)) {
        bindAccessors(seed, key, binding)
    }
}

function bindAccessors (seed, key, binding) {
    Object.defineProperty(seed.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            binding.directives.forEach(function (directive) {
                var filteredValue = value
                if (value && directive.filters) {
                    filteredValue = applyFilters(value, directive)
                }
                directive.update(
                    directive.el,
                    filteredValue,
                    directive.argument,
                    directive,
                    seed
                )
            })
        }
    })
}

function parseDirective (attr) {

    if (attr.name.indexOf(prefix) === -1) return

    // parse directive name and argument
    var noprefix = attr.name.slice(prefix.length + 1),
        argIndex = noprefix.indexOf('-'),
        dirname  = argIndex === -1
            ? noprefix
            : noprefix.slice(0, argIndex),
        def = Directives[dirname],
        arg = argIndex === -1
            ? null
            : noprefix.slice(argIndex + 1)

    // parse scope variable key and pipe filters
    var exp = attr.value,
        pipeIndex = exp.indexOf('|'),
        key = pipeIndex === -1
            ? exp.trim()
            : exp.slice(0, pipeIndex).trim(),
        filters = pipeIndex === -1
            ? null
            : exp.slice(pipeIndex + 1).split('|').map(function (filter) {
                return filter.trim()
            })

    return def
        ? {
            attr: attr,
            key: key,
            filters: filters,
            definition: def,
            argument: arg,
            update: typeof def === 'function'
                ? def
                : def.update
        }
        : null
}

function applyFilters (value, directive) {
    if (directive.definition.customFilter) {
        return directive.definition.customFilter(value, directive.filters)
    } else {
        directive.filters.forEach(function (filter) {
            if (Filters[filter]) {
                value = Filters[filter](value)
            }
        })
        return value
    }
}

module.exports = {
    create: function (opts) {
        return new Seed(opts)
    },
    filters: Filters,
    directives: Directives
}