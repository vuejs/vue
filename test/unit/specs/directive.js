var Directive = require('seed/src/directive'),
    directives = require('seed/src/directives')

describe('UNIT: Directive', function () {

    var compiler = {
        vm: {
            constructor: {}
        }
    }

    describe('.parse()', function () {
        
        it('should return null if directive name does not have correct prefix', function () {
            var d = Directive.parse('ds-test', 'abc', compiler)
            assert.strictEqual(d, null)
        })

        it('should return null if directive is unknown', function () {
            var d = Directive.parse('sd-directive-that-does-not-exist', 'abc', compiler)
            assert.ok(d === null)
        })

        it('should return null if the expression is invalid', function () {
            var d = Directive.parse('sd-text', '', compiler),
                e = Directive.parse('sd-text', '  ', compiler),
                f = Directive.parse('sd-text', '|', compiler),
                g = Directive.parse('sd-text', '  |  ', compiler)
            assert.strictEqual(d, null, 'empty')
            assert.strictEqual(e, null, 'spaces')
            assert.strictEqual(f, null, 'single pipe')
            assert.strictEqual(g, null, 'pipe with spaces')
        })

        it('should return an instance of Directive if args are good', function () {
            var d = Directive.parse('sd-text', 'abc', compiler)
            assert.ok(d instanceof Directive)
        })

    })

    describe('instantiation', function () {

        var test = function () {}
        directives.test = test

        var obj = {
            bind: function () {},
            update: function () {},
            unbind: function () {},
            custom: function () {}
        }
        directives.obj = obj
        
        it('should copy the definition as _update if the def is a function', function () {
            var d = Directive.parse('sd-test', 'abc', compiler)
            assert.strictEqual(d._update, test)                
        })

        it('should copy methods if the def is an object', function () {
            var d = Directive.parse('sd-obj', 'abc', compiler)
            assert.strictEqual(d._update, obj.update, 'update should be copied as _update')
            assert.strictEqual(d._unbind, obj.unbind, 'unbind should be copied as _unbind')
            assert.strictEqual(d.bind, obj.bind)
            assert.strictEqual(d.custom, obj.custom, 'should copy any custom methods')
        })

        it('should trim the expression', function () {
            var exp = ' fsfsef   | fsef a  ',
                d = Directive.parse('sd-text', exp, compiler)
            assert.strictEqual(d.expression, exp.trim())
        })

        it('should extract correct argument', function () {
            var d = Directive.parse('sd-text', 'todo:todos', compiler),
                e = Directive.parse('sd-text', 'todo:todos + abc', compiler),
                f = Directive.parse('sd-text', 'todo:todos | fsf fsef', compiler)
            assert.strictEqual(d.arg, 'todo', 'simple')
            assert.strictEqual(e.arg, 'todo', 'expression')
            assert.strictEqual(f.arg, 'todo', 'with filters')
        })

        it('should extract correct nesting info', function () {
            var d = Directive.parse('sd-text', 'abc', compiler),
                e = Directive.parse('sd-text', '^abc', compiler),
                f = Directive.parse('sd-text', '^^^abc', compiler),
                g = Directive.parse('sd-text', '$abc', compiler)
            assert.ok(d.nesting === false && d.root === false && d.key === 'abc', 'no nesting')
            assert.ok(e.nesting === 1 && e.root === false && e.key === 'abc', '1 level')
            assert.ok(f.nesting === 3 && f.root === false && f.key === 'abc', '3 levels')
            assert.ok(g.root === true && g.nesting === false && g.key === 'abc', 'root')
        })

        it('should be able to determine whether the key is an expression', function () {
            var d = Directive.parse('sd-text', 'abc', compiler),
                e = Directive.parse('sd-text', '!abc', compiler),
                f = Directive.parse('sd-text', 'abc + bcd * 5 / 2', compiler),
                g = Directive.parse('sd-text', 'abc && (bcd || eee)', compiler),
                h = Directive.parse('sd-text', 'test(abc)', compiler)
            assert.ok(!d.isExp, 'non-expression')
            assert.ok(e.isExp, 'negation')
            assert.ok(f.isExp, 'math')
            assert.ok(g.isExp, 'logic')
            assert.ok(g.isExp, 'function invocation')
        })

        it('should have a filter prop of null if no filters are present', function () {
            var d = Directive.parse('sd-text', 'abc', compiler),
                e = Directive.parse('sd-text', 'abc |', compiler),
                f = Directive.parse('sd-text', 'abc ||', compiler),
                g = Directive.parse('sd-text', 'abc | | ', compiler),
                h = Directive.parse('sd-text', 'abc | unknown | nothing at all | whaaat', compiler)
            assert.strictEqual(d.filters, null)
            assert.strictEqual(e.filters, null, 'single')
            assert.strictEqual(f.filters, null, 'double')
            assert.strictEqual(g.filters, null, 'with spaces')
            assert.strictEqual(h.filters, null, 'with unknown filters')
        })

        it('should extract correct filters (single filter)', function () {
            var d = Directive.parse('sd-text', 'abc | uppercase', compiler),
                f = d.filters[0]
            assert.strictEqual(f.name, 'uppercase')
            assert.strictEqual(f.args, null)
            assert.strictEqual(f.apply('test'), 'TEST')
        })

        it('should extract correct filters (single filter with args)', function () {
            var d = Directive.parse('sd-text', 'abc | pluralize item \'arg with spaces\'', compiler),
                f = d.filters[0]
            assert.strictEqual(f.name, 'pluralize', 'name')
            assert.strictEqual(f.args.length, 2, 'args length')
            assert.strictEqual(f.args[0], 'item', 'args value 1')
            assert.strictEqual(f.args[1], 'arg with spaces', 'args value 2')
        })

        it('should extract correct filters (multiple filters)', function () {
            // intentional double pipe
            var d = Directive.parse('sd-text', 'abc | uppercase | pluralize item || lowercase', compiler),
                f1 = d.filters[0],
                f2 = d.filters[1],
                f3 = d.filters[2]
            assert.strictEqual(d.filters.length, 3)
            assert.strictEqual(f1.name, 'uppercase')
            assert.strictEqual(f2.name, 'pluralize')
            assert.strictEqual(f2.args[0], 'item')
            assert.strictEqual(f3.name, 'lowercase')
        })

    })

    describe('.applyFilters()', function () {
        
        it('should work', function () {
            var d = Directive.parse('sd-text', 'abc | pluralize item | capitalize', compiler),
                v = d.applyFilters(2)
            assert.strictEqual(v, 'Items')
        })

    })

    describe('.apply()', function () {

        var test,
            applyTest = function (val) { test = val }
        directives.applyTest = applyTest

        it('should invole the _update function', function () {
            var d = Directive.parse('sd-applyTest', 'abc', compiler)
            d.apply(12345)
            assert.strictEqual(test, 12345)
        })
        
        it('should apply the filter if there is any', function () {
            var d = Directive.parse('sd-applyTest', 'abc | currency £', compiler)
            d.apply(12345)
            assert.strictEqual(test, '£12,345.00')
        })

    })

    describe('.update()', function () {
        
        var d = Directive.parse('sd-text', 'abc', compiler),
            applied = false
        d.apply = function () {
            applied = true
        }

        it('should apply() for first time update, even with undefined', function () {
            d.update(undefined, true)
            assert.strictEqual(applied, true)
        })

        it('should apply() when a different value is given', function () {
            applied = false
            d.update(123)
            assert.strictEqual(d.value, 123)
            assert.strictEqual(applied, true)
        })

        it('should not apply() if the value is the same', function () {
            applied = false
            d.update(123)
            assert.ok(!applied)
        })

    })

    describe('.refresh()', function () {
        
        var d = Directive.parse('sd-text', 'abc', compiler),
            applied = false,
            el = 1, vm = 2,
            value = {
                get: function (ctx) {
                    return ctx.el + ctx.vm
                }
            }
        d.el = el
        d.vm = vm
        d.apply = function () {
            applied = true
        }

        d.refresh(value)

        it('should set the value if value arg is given', function () {
            assert.strictEqual(d.value, value)
        })

        it('should get its el&vm context and get correct computedValue', function () {
            assert.strictEqual(d.computedValue, el + vm)
        })

        it('should call apply()', function () {
            assert.ok(applied)
        })

        it('should not call apply() if computedValue is the same', function () {
            applied = false
            d.refresh()
            assert.ok(!applied)
        })

    })

    describe('.unbind()', function () {
        
        var d = Directive.parse('sd-text', 'abc', compiler),
            unbound = false,
            val
        d._unbind = function (v) {
            val = v
            unbound = true
        }

        it('should not work if it has no element yet', function () {
            d.unbind()
            assert.strictEqual(unbound, false)
        })

        it('should call _unbind() if it has an element', function () {
            d.el = true
            d.unbind(true)
            assert.strictEqual(unbound, true)
            assert.ok(d.el)
        })

        it('should null everything if it\'s called for VM destruction', function () {
            d.unbind()
            assert.ok(d.el === null && d.vm === null && d.binding === null && d.compiler === null)
        })

    })

})