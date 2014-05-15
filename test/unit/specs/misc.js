describe('Misc Features', function () {

    var nextTick = require('vue/src/utils').nextTick
    
    describe('inline expression', function () {
        it('should evaluate the correct value', function (done) {
            var v = new Vue({
                template: '{{a + "123" + b}} and {{c}}'
            })
            v.a = 'A'
            v.b = 'B'
            v.c = 'C'
            nextTick(function () {
                assert.strictEqual(v.$el.textContent, 'A123B and C')
                done()
            })
        })
    })

    describe('expression inside attributes', function () {

        it('should interpolate the attribute', function (done) {
            var v = new Vue({
                attributes: {
                    test: 'one {{msg}} three'
                },
                data: {
                    msg: 'two'
                }
            })
            assert.strictEqual(v.$el.getAttribute('test'), 'one two three')
            v.msg = '2'
            nextTick(function () {
                assert.strictEqual(v.$el.getAttribute('test'), 'one 2 three')
                done()
            })
        })

        it('should work with filters', function (done) {
            var v = new Vue({
                attributes: {
                    'class': '{{msg | test}}'
                },
                data: {
                    msg: 'hello'
                },
                filters: {
                    test: function (v) {
                        return v + '-bye'
                    }
                }
            })
            assert.strictEqual(v.$el.className, 'hello-bye')
            v.msg = 'ok'
            nextTick(function () {
                assert.strictEqual(v.$el.className, 'ok-bye')
                done()
            })
        })
    })

    describe('triple mustache', function () {
        it('should set unescaped HTML', function () {
            var v = new Vue({
                template: '{{{html}}}',
                data: {
                    html: '<span>a</span><a>hi</a>'
                }
            })
            assert.strictEqual(v.$el.innerHTML, '<span>a</span><a>hi</a><!--v-html-->')
        })
    })

    describe('computed properties', function () {

        it('should be accessible like a normal attribtue', function () {
            var b = 2
            var v = new Vue({
                template: '{{nested.value.a}}',
                data: {
                    a: 1,
                },
                computed: {
                    test: {
                        $get: function () {
                            return this.a + b
                        },
                        $set: function (v) {
                            b = v - this.a
                        }
                    },
                    getOnly: function () {
                        return this.a + 1
                    }
                }
            })

            assert.strictEqual(v.test, 3)
            assert.strictEqual(v.getOnly, 2)
            v.a = 2
            assert.strictEqual(v.test, 4)
            assert.strictEqual(v.getOnly, 3)
            b = 3
            assert.strictEqual(v.test, 5)
            v.test = 10
            assert.strictEqual(b, 8)
        })

        it('should be bindable in templates, even nested', function (done) {
            var v = new Vue({
                template: '{{nested.value.a}}',
                data: { a: 1 },
                computed: {
                    nested: function () {
                        return {
                            value: {
                                a: this.a + 2
                            }
                        }
                    }
                }
            })
            assert.strictEqual(v.$el.textContent, '3')

            v.a = 2
            nextTick(function () {
                assert.strictEqual(v.$el.textContent, '4')
                done()
            })
        })

    })

    describe('setting an object to empty', function () {
        it('should emit undefined for paths in the old object', function (done) {
            var v = new Vue({
                data: {
                    a: {
                        b: { c: 1 }
                    }
                }
            })
            var emitted = false
            v.$watch('a.b.c', function (v) {
                assert.strictEqual(v, undefined)
                emitted = true
            })
            v.a = {}
            nextTick(function () {
                assert.ok(emitted)
                done()
            })
        })
    })

    describe('event delegation', function () {

        var inCalled = 0,
            outCalled = 0,
            innerHandler = function () {}
        var v = new Vue({
            template: '<div v-on="click:out"><div class="inner" v-on="click:in"></div></div>',
            methods: {
                'in': function (e) {
                    inCalled++
                    innerHandler(e)
                },
                out: function () {
                    outCalled++
                }
            }
        })
        v.$appendTo('#test')

        it('should work', function () {
            var e = mockMouseEvent('click')
            v.$el.querySelector('.inner').dispatchEvent(e)
            assert.strictEqual(inCalled, 1)
            assert.strictEqual(outCalled, 1)
        })
        
        it('should allow stopPropagation()', function () {
            innerHandler = function (e) {
                e.stopPropagation()
            }
            var e = mockMouseEvent('click')
            v.$el.querySelector('.inner').dispatchEvent(e)
            assert.strictEqual(inCalled, 2)
            assert.strictEqual(outCalled, 1)
        })

    })

    describe('computed filter', function () {
        
        it('should process filter with `this` as computed', function (done) {
            
            var V = Vue.extend({
                template: '<div class="plus">{{n | plus}}</div><div class="minus">{{n | minus}}</div>',
                filters: {
                    plus: function (v) {
                        return v + this.a
                    }
                }
            })

            V.filter('minus', function (v) {
                return v - this.a
            })

            var v = new V({
                data: {
                    a: 1,
                    n: 1
                }
            })

            assert.strictEqual(v.$el.querySelector('.plus').textContent, '2')
            assert.strictEqual(v.$el.querySelector('.minus').textContent, '0')

            v.a = 2

            nextTick(function () {
                assert.strictEqual(v.$el.querySelector('.plus').textContent, '3')
                assert.strictEqual(v.$el.querySelector('.minus').textContent, '-1')
                done()
            })

        })

    })

    describe('content insertion points', function () {
        
        it('should insert original content', function () {
            var div = document.createElement('div')
            div.innerHTML = '<h1>hello!</h1>'
            var t = new Vue({
                el: div,
                template: '<h1>before</h1><content></content><p>after</p>'
            })
            assert.strictEqual(t.$el.innerHTML, '<h1>before</h1><h1>hello!</h1><p>after</p>')
        })

        it('should respect "select" attributes', function () {
            var div = document.createElement('div')
            div.innerHTML = '<h1>hi</h1><h1>ha</h1><p>hehe</p>'
            var t = new Vue({
                el: div,
                template: '<h1>before</h1>' +
                    '<content></content>' +
                    '<content select="h1:nth-of-type(2)"></content>' +
                    '<content select="h1:nth-of-type(1)"></content>' +
                    '<p>after</p>'
            })
            assert.strictEqual(t.$el.innerHTML,
                '<h1>before</h1>' +
                '<p>hehe</p>' +
                '<h1>ha</h1><h1>hi</h1>' +
                '<p>after</p>'
            )
        })

        it('should use fallback content if no rawContent is available', function () {
            var t = new Vue({
                template: '<content>Hello!</content>'
            })
            assert.strictEqual(t.$el.innerHTML, 'Hello!')
        })

    })

    describe('interpolation in directive values', function () {
        
        it('should be evaled by the compiler', function () {
            var t = new Vue({
                template: '<input v-model="{{field}}">',
                data: {
                    field: 'test',
                    test: 'hello'
                }
            })
            assert.equal(t.$el.childNodes[0].value, 'hello')
        })

    })

    describe('attribute names with colons', function () {
        
        it('should be parsed properly', function () {
            var t = new Vue({
                template: '<use xlink:href="{{icon}}"></use>',
                data: {
                    icon: 'test'
                }
            })
            assert.equal(t.$el.firstChild.getAttribute('xlink:href'), 'test')
        })

    })

})