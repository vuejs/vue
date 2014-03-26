describe('Directive', function () {

    var Directive  = require('vue/src/directive'),
        directives = require('vue/src/directives')

    var compiler = {
        options: {},
        getOption: function (type, id) {
            return Vue.options[type][id]
        },
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
                test1 = 'fsef(a, b(d,e(f,g),k), c)',
                test2 = 'ffsef + "fse,fsef"',
                test3 = 'fsef + \'fesfsfe\'',
                test4 = '\"fsefsf,fsef,fsef\"',
                test5 = '(a, {a:1, b:2})'

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
                test2 = ['asf-fsef:fsf', '"efs,s(e,f),sf"'],
                test3 = ['\'fsef,sef\'', 'fse:fsf(a,b(c,d),c)'],
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

    describe('.parseKey()', function () {
        
        it('should extract the raw key', function () {
            var res = Directive.parseKey('arg: hehehe | abc | d')
            assert.strictEqual(res, 'arg: hehehe')
        })

    })

    describe('.parseArg()', function () {

        it('should extract the argument', function () {
            var res = Directive.parseArg('abc:def')
            assert.strictEqual(res.key, 'def')
            assert.strictEqual(res.arg, 'abc')
        })

        it('should deal with spaces', function () {
            var res = Directive.parseArg('  abc :  def')
            assert.strictEqual(res.key, 'def')
            assert.strictEqual(res.arg, 'abc')
        })

        it('should omit colons in strings', function () {
            var res = Directive.parseArg('"abc:def" + bcd')
            assert.strictEqual(res.key, '"abc:def" + bcd')
            assert.strictEqual(res.arg, null)
        })

    })

    describe('.parseFilters()', function () {
        
        it('should extract filters', function () {
            var res = Directive.parseFilters('a | b | c d e')
            assert.strictEqual(res.length, 2)
            assert.strictEqual(res[0].name, 'b')
            assert.strictEqual(res[1].name, 'c')
            assert.deepEqual(res[1].args, ['d', 'e'])
        })

    })

    describe('.inlineFilters()', function () {
        
        it('should inline computed filters', function () {
            var filters = Directive.parseFilters('| a | b | c d')
            var exp = Directive.inlineFilters('this.a + this.b', filters)
            var mock = new Vue({
                filters: {
                    a: function (v) {
                        return v + 'a'
                    },
                    b: function (v) {
                        return v + 'b'
                    },
                    c: function (v, d) {
                        return v + 'c' + d
                    }
                },
                data: {
                    a: 'a',
                    b: 'b'
                }
            })
            var getter = new Function('return ' + exp)
            var res = getter.call(mock)
            assert.strictEqual(res, 'ababcd')
        })

    })

    describe('.build()', function () {
        
        it('should return undefined if directive name does not have correct prefix', function () {
            var d = Directive.build('ds-test', 'abc', compiler)
            assert.strictEqual(d, undefined)
        })

        it('should return undefined if directive is unknown', function () {
            var d = Directive.build('directive-that-does-not-exist', 'abc', compiler)
            assert.ok(d === undefined)
        })

        it('should return undefined if the expression is invalid', function () {
            var e = Directive.build('text', '  ', compiler),
                f = Directive.build('text', '|', compiler),
                g = Directive.build('text', '  |  ', compiler)
            assert.strictEqual(e, undefined, 'spaces')
            assert.strictEqual(f, undefined, 'single pipe')
            assert.strictEqual(g, undefined, 'pipe with spaces')
        })

        it('should return a simple Directive if expression is empty', function () {
            var d = Directive.build('text', '', compiler)
            assert.ok(d instanceof Directive)
            assert.ok(d.isEmpty)
        })

        it('should return an instance of Directive if args are good', function () {
            var d = Directive.build('text', 'abc', compiler)
            assert.ok(d instanceof Directive)
        })

    })

    describe('instantiation', function () {
        
        it('should copy the definition as _update if the def is a function', function () {

            var testDir = function () {}
            directives.test = testDir

            var d = Directive.build('test', 'abc', compiler)
            assert.strictEqual(d._update, testDir)
        })

        it('should copy methods if the def is an object', function () {

            var obj = {
                bind: function () {},
                update: function () {},
                unbind: function () {},
                custom: function () {}
            }
            directives.obj = obj
            
            var d = Directive.build('obj', 'abc', compiler)
            assert.strictEqual(d._update, obj.update, 'update should be copied as _update')
            assert.strictEqual(d._unbind, obj.unbind, 'unbind should be copied as _unbind')
            assert.strictEqual(d.bind, obj.bind)
            assert.strictEqual(d.custom, obj.custom, 'should copy any custom methods')
        })

        it('should trim the expression', function () {
            var exp = ' fsfsef   | fsef a  ',
                d = Directive.build('text', exp, compiler)
            assert.strictEqual(d.expression, exp.trim())
        })

        it('should extract correct key', function () {
            var d = Directive.build('text', '"fsefse | fsefsef" && bc', compiler),
                e = Directive.build('text', '"fsefsf & fsefs" | test', compiler),
                f = Directive.build('text', '"fsef:fsefsf" || ff', compiler)
            assert.strictEqual(d.key, '"fsefse | fsefsef" && bc', 'pipe inside quotes and &&')
            assert.strictEqual(e.key, '"fsefsf & fsefs"', '& inside quotes with filter')
            assert.strictEqual(f.key, '"fsef:fsefsf" || ff', ': inside quotes and ||')
        })

        it('should extract correct argument', function () {
            var d = Directive.build('text', 'todo:todos', compiler),
                e = Directive.build('text', '$todo:todos + abc', compiler),
                f = Directive.build('text', '-todo-fsef:todos | fsf fsef', compiler)
            assert.strictEqual(d.arg, 'todo', 'simple')
            assert.strictEqual(e.arg, '$todo', 'expression')
            assert.strictEqual(f.arg, '-todo-fsef', 'with hyphens and filters')
        })

        it('should be able to determine whether the key is an expression', function () {
            var d = Directive.build('text', 'abc', compiler),
                e = Directive.build('text', '!abc', compiler),
                f = Directive.build('text', 'abc + bcd * 5 / 2', compiler),
                g = Directive.build('text', 'abc && (bcd || eee)', compiler),
                h = Directive.build('text', 'test(abc)', compiler),
                i = Directive.build('text', 'a.b', compiler),
                j = Directive.build('text', 'a.$b', compiler)
            assert.ok(!d.isExp, 'non-expression')
            assert.ok(e.isExp, 'negation')
            assert.ok(f.isExp, 'math')
            assert.ok(g.isExp, 'logic')
            assert.ok(h.isExp, 'function invocation')
            assert.ok(!i.isExp, 'dot syntax')
            assert.ok(!j.isExp, 'dot syntax with $')
        })

        it('should have a filter prop of null if no filters are present', function () {
            var d = Directive.build('text', 'abc', compiler),
                e = Directive.build('text', 'abc |', compiler),
                f = Directive.build('text', 'abc ||', compiler),
                g = Directive.build('text', 'abc | | ', compiler),
                h = Directive.build('text', 'abc | unknown | nothing at all | whaaat', compiler)
            assert.strictEqual(d.filters, null)
            assert.strictEqual(e.filters, null, 'single')
            assert.strictEqual(f.filters, null, 'double')
            assert.strictEqual(g.filters, null, 'with spaces')
            assert.strictEqual(h.filters, null, 'with unknown filters')
        })

        it('should extract correct filters (single filter)', function () {
            var d = Directive.build('text', 'abc || a + "b|c" | uppercase', compiler),
                f = d.filters[0]
            assert.strictEqual(f.name, 'uppercase')
            assert.strictEqual(f.args, null)
            assert.strictEqual(f.apply('test'), 'TEST')
        })

        it('should extract correct filters (single filter with args)', function () {
            var d = Directive.build('text', 'abc + \'b | c | d\' | pluralize item \'arg with spaces\'', compiler),
                f = d.filters[0]
            assert.strictEqual(f.name, 'pluralize', 'name')
            assert.strictEqual(f.args.length, 2, 'args length')
            assert.strictEqual(f.args[0], 'item', 'args value 1')
            assert.strictEqual(f.args[1], '\'arg with spaces\'', 'args value 2')
        })

        it('should extract correct filters (multiple filters)', function () {
            // intentional double pipe
            var d = Directive.build('text', 'abc | uppercase | pluralize item || lowercase', compiler),
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
            var d = Directive.build('text', 'abc | pluralize item | capitalize', compiler),
                v = d.applyFilters(2)
            assert.strictEqual(v, 'Items')
        })

    })

    describe('.update()', function () {
        
        var d = Directive.build('text', 'abc', compiler),
            updated = false
        d._update = function () {
            updated = true
        }

        it('should call _update() for first time update, even with undefined', function () {
            d.update(undefined, true)
            assert.strictEqual(updated, true)
        })

        it('should _update() when a different value is given', function () {
            updated = false
            d.update(123)
            assert.strictEqual(d.value, 123)
            assert.strictEqual(updated, true)
        })

        it('should not _update() if the value is the same', function () {
            updated = false
            d.update(123)
            assert.ok(!updated)
        })

        it('should call applyFilter() is there are filters', function () {
            var filterApplied = false
            d.filters = []
            d.applyFilters = function () {
                filterApplied = true
            }
            d.update(234)
            assert.ok(filterApplied)
        })

    })

    describe('.unbind()', function () {
        
        var d = Directive.build('text', 'abc', compiler),
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

        it('should call _unbind() and null everything if it has an element', function () {
            d.el = true
            d.unbind()
            assert.strictEqual(unbound, true)
            assert.ok(d.el === null && d.vm === null && d.binding === null && d.compiler === null)
        })

        it('should not execute if called more than once', function () {
            unbound = false
            d.unbind()
            assert.notOk(unbound)
        })

    })

    describe('simple directive', function () {
        
        it('should copy as bind() if the def is a function', function () {
            var called = 0
            function call () {
                called++
            }
            Vue.directive('simple-dir-test1', call)
            var d = Directive.build('simple-dir-test1', '', compiler)
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
            var d = Directive.build('simple-dir-test2', '', compiler, true)
            d.bind()
            d.unbind()
            assert.strictEqual(called, 2)
        })

    })

})