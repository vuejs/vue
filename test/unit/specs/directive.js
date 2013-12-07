describe('UNIT: Directive', function () {

    var Directive  = require('vue/src/directive'),
        directives = require('vue/src/directives')

    var compiler = {
        options: {},
        getOption: function () {},
        vm: {
            constructor: {}
        }
    }

    describe('.split()', function () {
        
        it('should return array with one empty string for empty string', function () {
            var e = Directive.split('')
            assert.strictEqual(e.length, 1)
            assert.strictEqual(e[0], '')
        })

        it('should return array with the string if it\'s a single clause', function () {
            var e,
                test1 = 'fsef(a, b, c)',
                test2 = 'ffsef + "fse,fsef"',
                test3 = 'fsef + \'fesfsfe\'',
                test4 = '\"fsefsf,fsef,fsef\"',
                test5 = '(a, b)'

            e = Directive.split(test1)
            assert.strictEqual(e.length, 1)
            assert.strictEqual(e[0], test1)

            e = Directive.split(test2)
            assert.strictEqual(e.length, 1)
            assert.strictEqual(e[0], test2)

            e = Directive.split(test3)
            assert.strictEqual(e.length, 1)
            assert.strictEqual(e[0], test3)

            e = Directive.split(test4)
            assert.strictEqual(e.length, 1)
            assert.strictEqual(e[0], test4)

            e = Directive.split(test5)
            assert.strictEqual(e.length, 1)
            assert.strictEqual(e[0], test5)
        })

        it('should return split multiple clauses correctly', function () {
            var e,
                test1 = ['(fse,fggg)', 'fsf:({a:1,b:2}, [1,2,3])'],
                test2 = ['asf-fsef:fsf', '"efs,s(e,f)sf"'],
                test3 = ['\'fsef,sef\'', 'fse:fsf(a,b,c)'],
                test4 = ['\"fsef,fsef\"', 'sefsef\'fesfsf']

            e = Directive.split(test1.join(','))
            assert.strictEqual(e.length, 2, 'expression with {}, [] inside ()')
            assert.strictEqual(e[0], test1[0])
            assert.strictEqual(e[1], test1[1])

            e = Directive.split(test2.join(','))
            assert.strictEqual(e.length, 2, 'expression with double quotes')
            assert.strictEqual(e[0], test2[0])
            assert.strictEqual(e[1], test2[1])

            e = Directive.split(test3.join(','))
            assert.strictEqual(e.length, 2, 'expression with single quotes')
            assert.strictEqual(e[0], test3[0])
            assert.strictEqual(e[1], test3[1])

            e = Directive.split(test4.join(','))
            assert.strictEqual(e.length, 2, 'expression with escaped quotes')
            assert.strictEqual(e[0], test4[0])
            assert.strictEqual(e[1], test4[1])
        })

    })

    describe('.parse()', function () {
        
        it('should return undefined if directive name does not have correct prefix', function () {
            var d = Directive.parse('ds-test', 'abc', compiler)
            assert.strictEqual(d, undefined)
        })

        it('should return undefined if directive is unknown', function () {
            var d = Directive.parse('v-directive-that-does-not-exist', 'abc', compiler)
            assert.ok(d === undefined)
        })

        it('should return undefined if the expression is invalid', function () {
            var e = Directive.parse('v-text', '  ', compiler),
                f = Directive.parse('v-text', '|', compiler),
                g = Directive.parse('v-text', '  |  ', compiler)
            assert.strictEqual(e, undefined, 'spaces')
            assert.strictEqual(f, undefined, 'single pipe')
            assert.strictEqual(g, undefined, 'pipe with spaces')
        })

        it('should return a simple Directive if expression is empty', function () {
            var d = Directive.parse('v-text', '', compiler)
            assert.ok(d instanceof Directive)
            assert.ok(d.isSimple)
        })

        it('should return an instance of Directive if args are good', function () {
            var d = Directive.parse('v-text', 'abc', compiler)
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
            var d = Directive.parse('v-test', 'abc', compiler)
            assert.strictEqual(d._update, test)
        })

        it('should copy methods if the def is an object', function () {
            var d = Directive.parse('v-obj', 'abc', compiler)
            assert.strictEqual(d._update, obj.update, 'update should be copied as _update')
            assert.strictEqual(d._unbind, obj.unbind, 'unbind should be copied as _unbind')
            assert.strictEqual(d.bind, obj.bind)
            assert.strictEqual(d.custom, obj.custom, 'should copy any custom methods')
        })

        it('should trim the expression', function () {
            var exp = ' fsfsef   | fsef a  ',
                d = Directive.parse('v-text', exp, compiler)
            assert.strictEqual(d.expression, exp.trim())
        })

        it('should extract correct key', function () {
            var d = Directive.parse('v-text', '"fsefse | fsefsef" && bc', compiler),
                e = Directive.parse('v-text', '"fsefsf & fsefs" | test', compiler),
                f = Directive.parse('v-text', '"fsef:fsefsf" || ff', compiler)
            assert.strictEqual(d.key, '"fsefse | fsefsef" && bc', 'pipe inside quotes and &&')
            assert.strictEqual(e.key, '"fsefsf & fsefs"', '& inside quotes with filter')
            assert.strictEqual(f.key, '"fsef:fsefsf" || ff', ': inside quotes and ||')
        })

        it('should extract correct argument', function () {
            var d = Directive.parse('v-text', 'todo:todos', compiler),
                e = Directive.parse('v-text', 'todo:todos + abc', compiler),
                f = Directive.parse('v-text', 'todo:todos | fsf fsef', compiler)
            assert.strictEqual(d.arg, 'todo', 'simple')
            assert.strictEqual(e.arg, 'todo', 'expression')
            assert.strictEqual(f.arg, 'todo', 'with filters')
        })

        it('should extract correct nesting info', function () {
            var d = Directive.parse('v-text', 'abc', compiler),
                e = Directive.parse('v-text', '^abc', compiler),
                f = Directive.parse('v-text', '^^^abc', compiler),
                g = Directive.parse('v-text', '*abc', compiler)
            assert.ok(d.nesting === false && d.root === false && d.key === 'abc', 'no nesting')
            assert.ok(e.nesting === 1 && e.root === false && e.key === 'abc', '1 level')
            assert.ok(f.nesting === 3 && f.root === false && f.key === 'abc', '3 levels')
            assert.ok(g.root === true && g.nesting === false && g.key === 'abc', 'root')
        })

        it('should be able to determine whether the key is an expression', function () {
            var d = Directive.parse('v-text', 'abc', compiler),
                e = Directive.parse('v-text', '!abc', compiler),
                f = Directive.parse('v-text', 'abc + bcd * 5 / 2', compiler),
                g = Directive.parse('v-text', 'abc && (bcd || eee)', compiler),
                h = Directive.parse('v-text', 'test(abc)', compiler),
                i = Directive.parse('v-text', 'a.b', compiler),
                j = Directive.parse('v-text', 'a.$b', compiler)
            assert.ok(!d.isExp, 'non-expression')
            assert.ok(e.isExp, 'negation')
            assert.ok(f.isExp, 'math')
            assert.ok(g.isExp, 'logic')
            assert.ok(h.isExp, 'function invocation')
            assert.ok(!i.isExp, 'dot syntax')
            assert.ok(!j.isExp, 'dot syntax with $')
        })

        it('should have a filter prop of null if no filters are present', function () {
            var d = Directive.parse('v-text', 'abc', compiler),
                e = Directive.parse('v-text', 'abc |', compiler),
                f = Directive.parse('v-text', 'abc ||', compiler),
                g = Directive.parse('v-text', 'abc | | ', compiler),
                h = Directive.parse('v-text', 'abc | unknown | nothing at all | whaaat', compiler)
            assert.strictEqual(d.filters, null)
            assert.strictEqual(e.filters, null, 'single')
            assert.strictEqual(f.filters, null, 'double')
            assert.strictEqual(g.filters, null, 'with spaces')
            assert.strictEqual(h.filters, null, 'with unknown filters')
        })

        it('should extract correct filters (single filter)', function () {
            var d = Directive.parse('v-text', 'abc || a + "b|c" | uppercase', compiler),
                f = d.filters[0]
            assert.strictEqual(f.name, 'uppercase')
            assert.strictEqual(f.args, null)
            assert.strictEqual(f.apply('test'), 'TEST')
        })

        it('should extract correct filters (single filter with args)', function () {
            var d = Directive.parse('v-text', 'abc + \'b | c | d\' | pluralize item \'arg with spaces\'', compiler),
                f = d.filters[0]
            assert.strictEqual(f.name, 'pluralize', 'name')
            assert.strictEqual(f.args.length, 2, 'args length')
            assert.strictEqual(f.args[0], 'item', 'args value 1')
            assert.strictEqual(f.args[1], 'arg with spaces', 'args value 2')
        })

        it('should extract correct filters (multiple filters)', function () {
            // intentional double pipe
            var d = Directive.parse('v-text', 'abc | uppercase | pluralize item || lowercase', compiler),
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
            var d = Directive.parse('v-text', 'abc | pluralize item | capitalize', compiler),
                v = d.applyFilters(2)
            assert.strictEqual(v, 'Items')
        })

    })

    describe('.apply()', function () {

        var test,
            applyTest = function (val) { test = val }
        directives.applyTest = applyTest

        it('should invole the _update function', function () {
            var d = Directive.parse('v-applyTest', 'abc', compiler)
            d.apply(12345)
            assert.strictEqual(test, 12345)
        })
        
        it('should apply the filter if there is any', function () {
            var d = Directive.parse('v-applyTest', 'abc | currency £', compiler)
            d.apply(12345)
            assert.strictEqual(test, '£12,345.00')
        })

    })

    describe('.update()', function () {
        
        var d = Directive.parse('v-text', 'abc', compiler),
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
        
        var d = Directive.parse('v-text', 'abc', compiler),
            applied = false,
            el = 1, vm = 2,
            value = {
                $get: function () {
                    return el + vm
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
        
        var d = Directive.parse('v-text', 'abc', compiler),
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

    describe('simple directive', function () {
        
        it('should copy as bind() if the def is a function', function () {
            var called = 0
            function call () {
                called++
            }
            Vue.directive('simple-dir-test1', call)
            var d = Directive.parse('v-simple-dir-test1', '', compiler)
            d.bind()
            assert.strictEqual(called, 1)
        })

        it('should copy/delegate bind and unbind if the def is an object', function () {
            var called = 0
            function call () {
                called++
            }
            Vue.directive('simple-dir-test2', {
                bind: call,
                unbind: call
            })
            var d = Directive.parse('v-simple-dir-test2', '', compiler, true)
            d.bind()
            d.unbind()
            assert.strictEqual(called, 2)
        })

    })

})