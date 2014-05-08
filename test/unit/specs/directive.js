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

    function makeSpy () {
        var spy = function () {
            spy.called++
            spy.args = [].slice.call(arguments)
        }
        spy.called = 0
        return spy
    }

    function build (name, exp, compiler) {
        var ast = Directive.parse(exp)[0]
        return new Directive(name, ast, directives[name], compiler, {})
    }

    describe('.parse()', function () {
        
        it('key', function () {
            var res = Directive.parse('key')
            assert.equal(res.length , 1)
            assert.equal(res[0].key, 'key')
            assert.equal(res[0].expression, 'key')
        })

        it('arg:key', function () {
            var res = Directive.parse('arg:key')
            assert.equal(res.length , 1)
            assert.equal(res[0].key, 'key')
            assert.equal(res[0].arg, 'arg')
            assert.equal(res[0].expression, 'arg:key')
        })

        it('arg : key | abc', function () {
            var res = Directive.parse(' arg : key | abc de')
            assert.equal(res.length , 1)
            assert.equal(res[0].key, 'key')
            assert.equal(res[0].arg, 'arg')
            assert.equal(res[0].expression, 'arg : key | abc de')
            assert.equal(res[0].filters.length, 1)
            assert.equal(res[0].filters[0].name, 'abc')
            assert.equal(res[0].filters[0].args.length, 1)
            assert.equal(res[0].filters[0].args[0], 'de')
        })

        it('a || b | c', function () {
            var res = Directive.parse('a || b | c')
            assert.equal(res.length, 1)
            assert.equal(res[0].key, 'a || b')
            assert.equal(res[0].expression, 'a || b | c')
            assert.equal(res[0].filters.length, 1)
            assert.equal(res[0].filters[0].name, 'c')
            assert.notOk(res[0].filters[0].args)
        })

        it('a ? b : c', function () {
            var res = Directive.parse('a ? b : c')
            assert.equal(res.length, 1)
            assert.equal(res[0].key, 'a ? b : c')
            assert.notOk(res[0].filters)
        })

        it('"a:b:c||d|e|f" || d ? a : b', function () {
            var res = Directive.parse('"a:b:c||d|e|f" || d ? a : b')
            assert.equal(res.length, 1)
            assert.equal(res[0].key, '"a:b:c||d|e|f" || d ? a : b')
            assert.notOk(res[0].filters)
            assert.notOk(res[0].arg)
        })

        it('a, b, c', function () {
            var res = Directive.parse('a, b, c')
            assert.equal(res.length, 3)
            assert.equal(res[0].key, 'a')
            assert.equal(res[1].key, 'b')
            assert.equal(res[2].key, 'c')
        })

        it('a:b | c, d:e | f, g:h | i', function () {
            var res = Directive.parse('a:b | c, d:e | f, g:h | i')
            assert.equal(res.length, 3)

            assert.equal(res[0].arg, 'a')
            assert.equal(res[0].key, 'b')
            assert.equal(res[0].filters.length, 1)
            assert.equal(res[0].filters[0].name, 'c')
            assert.notOk(res[0].filters[0].args)

            assert.equal(res[1].arg, 'd')
            assert.equal(res[1].key, 'e')
            assert.equal(res[1].filters.length, 1)
            assert.equal(res[1].filters[0].name, 'f')
            assert.notOk(res[1].filters[0].args)

            assert.equal(res[2].arg, 'g')
            assert.equal(res[2].key, 'h')
            assert.equal(res[2].filters.length, 1)
            assert.equal(res[2].filters[0].name, 'i')
            assert.notOk(res[2].filters[0].args)
        })

        it('click:test(c.indexOf(d,f),"e,f"), input: d || [e,f], ok:{a:1,b:2}', function () {
            var res = Directive.parse('click:test(c.indexOf(d,f),"e,f"), input: d || [e,f], ok:{a:1,b:2}')
            assert.equal(res.length, 3)
            assert.equal(res[0].arg, 'click')
            assert.equal(res[0].key, 'test(c.indexOf(d,f),"e,f")')
            assert.equal(res[1].arg, 'input')
            assert.equal(res[1].key, 'd || [e,f]')
            assert.notOk(res[1].filters)
            assert.equal(res[2].arg, 'ok')
            assert.equal(res[2].key, '{a:1,b:2}')
        })

    })

    describe('.inlineFilters()', function () {
        
        it('should inline computed filters', function () {
            var filters = Directive.parse('a | a | b | c d')[0].filters
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

    describe('instantiation', function () {
        
        it('should copy the definition as update if the def is a function', function () {

            var testDir = function () {}
            directives.test = testDir

            var d = build('test', 'abc', compiler)
            assert.strictEqual(d.update, testDir)
        })

        it('should copy methods if the def is an object', function () {

            var obj = {
                bind: function () {},
                update: function () {},
                unbind: function () {},
                custom: function () {}
            }
            directives.obj = obj
            
            var d = build('obj', 'abc', compiler)
            assert.strictEqual(d.update, obj.update)
            assert.strictEqual(d.unbind, obj.unbind)
            assert.strictEqual(d.bind, obj.bind)
            assert.strictEqual(d.custom, obj.custom, 'should copy any custom methods')
        })

        it('should trim the expression', function () {
            var exp = ' fsfsef   | fsef a  ',
                d = build('text', exp, compiler)
            assert.strictEqual(d.expression, exp.trim())
        })

        it('should extract correct key', function () {
            var d = build('text', '"fsefse | fsefsef" && bc', compiler),
                e = build('text', '"fsefsf & fsefs" | test', compiler),
                f = build('text', '"fsef:fsefsf" || ff', compiler)
            assert.strictEqual(d.key, '"fsefse | fsefsef" && bc', 'pipe inside quotes and &&')
            assert.strictEqual(e.key, '"fsefsf & fsefs"', '& inside quotes with filter')
            assert.strictEqual(f.key, '"fsef:fsefsf" || ff', ': inside quotes and ||')
        })

        it('should extract correct argument', function () {
            var d = build('text', 'todo:todos', compiler),
                e = build('text', '$todo:todos + abc', compiler),
                f = build('text', '-todo-fsef:todos | fsf fsef', compiler)
            assert.strictEqual(d.arg, 'todo', 'simple')
            assert.strictEqual(e.arg, '$todo', 'expression')
            assert.strictEqual(f.arg, '-todo-fsef', 'with hyphens and filters')
        })

        it('should be able to determine whether the key is an expression', function () {
            var d = build('text', 'abc', compiler),
                e = build('text', '!abc', compiler),
                f = build('text', 'abc + bcd * 5 / 2', compiler),
                g = build('text', 'abc && (bcd || eee)', compiler),
                h = build('text', 'test(abc)', compiler),
                i = build('text', 'a.b', compiler),
                j = build('text', 'a.$b', compiler)
            assert.ok(!d.isExp, 'non-expression')
            assert.ok(e.isExp, 'negation')
            assert.ok(f.isExp, 'math')
            assert.ok(g.isExp, 'logic')
            assert.ok(h.isExp, 'function invocation')
            assert.ok(!i.isExp, 'dot syntax')
            assert.ok(!j.isExp, 'dot syntax with $')
        })

        it('should have a filter prop of null if no filters are present', function () {
            var d = build('text', 'abc', compiler),
                e = build('text', 'abc |', compiler),
                f = build('text', 'abc ||', compiler),
                g = build('text', 'abc | | ', compiler),
                h = build('text', 'abc | unknown | nothing at all | whaaat', compiler)
            assert.strictEqual(d.filters, null)
            assert.strictEqual(e.filters, null, 'single')
            assert.strictEqual(f.filters, null, 'double')
            assert.strictEqual(g.filters, null, 'with spaces')
            assert.strictEqual(h.filters, null, 'with unknown filters')
        })

        it('should extract correct filters (single filter)', function () {
            var d = build('text', 'abc || a + "b|c" | uppercase', compiler),
                f = d.filters[0]
            assert.strictEqual(f.name, 'uppercase')
            assert.strictEqual(f.args, null)
            assert.strictEqual(f.apply('test'), 'TEST')
        })

        it('should extract correct filters (single filter with args)', function () {
            var d = build('text', 'abc + \'b | c | d\' | pluralize item \'arg with spaces\'', compiler),
                f = d.filters[0]
            assert.strictEqual(f.name, 'pluralize', 'name')
            assert.strictEqual(f.args.length, 2, 'args length')
            assert.strictEqual(f.args[0], 'item', 'args value 1')
            assert.strictEqual(f.args[1], '\'arg with spaces\'', 'args value 2')
        })

        it('should extract correct filters (multiple filters)', function () {
            // intentional double pipe
            var d = build('text', 'abc | uppercase "a,b,c" | pluralize item | lowercase', compiler),
                f1 = d.filters[0],
                f2 = d.filters[1],
                f3 = d.filters[2]
            assert.strictEqual(d.filters.length, 3)
            assert.strictEqual(f1.name, 'uppercase')
            assert.strictEqual(f1.args[0], '"a,b,c"')
            assert.strictEqual(f2.name, 'pluralize')
            assert.strictEqual(f2.args[0], 'item')
            assert.strictEqual(f3.name, 'lowercase')
        })

        it('should compile the key if the key contains interpolation tags', function () {
            compiler.eval = makeSpy()
            build('model', '{{abc}} | uppercase', compiler)
            assert.ok(compiler.eval.called)
            assert.equal(compiler.eval.args[0], '{{abc}}')
        })

    })

    describe('.$applyFilters()', function () {
        
        it('should work', function () {
            var d = build('text', 'abc | pluralize item | capitalize', compiler),
                v = d.$applyFilters(2)
            assert.strictEqual(v, 'Items')
        })

    })

    describe('.$update()', function () {
        
        var d = build('text', 'abc', compiler),
            updated = false
        d.update = function () {
            updated = true
        }

        it('should call user update() for first time update, even with undefined', function () {
            d.$update(undefined, true)
            assert.strictEqual(updated, true)
        })

        it('should user update() when a different value is given', function () {
            updated = false
            d.$update(123)
            assert.strictEqual(d.value, 123)
            assert.strictEqual(updated, true)
        })

        it('should not call user update() if the value is the same', function () {
            updated = false
            d.$update(123)
            assert.ok(!updated)
        })

        it('should call $applyFilter() is there are filters', function () {
            var filterApplied = false
            d.filters = []
            d.$applyFilters = function () {
                filterApplied = true
            }
            d.$update(234)
            assert.ok(filterApplied)
        })

    })

    describe('.$unbind()', function () {
        
        var d = build('text', 'abc', compiler),
            unbound = false,
            val
        d.unbind = function (v) {
            val = v
            unbound = true
        }

        it('should not work if it has no element yet', function () {
            d.el = null
            d.$unbind()
            assert.strictEqual(unbound, false)
        })

        it('should call user unbind() and null everything if it has an element', function () {
            d.el = true
            d.$unbind()
            assert.strictEqual(unbound, true)
            assert.ok(d.el === null && d.vm === null && d.binding === null && d.compiler === null)
        })

        it('should not execute if called more than once', function () {
            unbound = false
            d.$unbind()
            assert.notOk(unbound)
        })

    })

    describe('empty directive', function () {
        
        it('should copy as bind() if the def is a function', function () {
            var called = 0
            function call () {
                called++
            }
            Vue.directive('empty-dir-test1', call)
            var d = build('empty-dir-test1', '', compiler)
            d.bind()
            assert.strictEqual(called, 1)
        })

        it('should copy/delegate bind and unbind if the def is an object', function () {
            var called = 0
            function call () {
                called++
            }
            Vue.directive('empty-dir-test2', {
                bind: call,
                unbind: call
            })
            var d = build('empty-dir-test2', '', compiler, true)
            d.bind()
            d.unbind()
            assert.strictEqual(called, 2)
        })

    })

})