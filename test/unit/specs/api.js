describe('API', function () {

    var utils = require('vue/src/utils'),
        assets = require('vue/src/config').globalAssets,
        nextTick = utils.nextTick

    describe('config()', function () {

        var config = require('vue/src/config')

        it('should get', function () {
            assert.strictEqual(Vue.config('debug'), false)
        })

        it('should set', function () {
            Vue.config('test', 1)
            assert.strictEqual(config.test, 1)
        })

        describe('changing prefix', function () {
            
            before(function () {
                Vue.config({ prefix: 'test' })
            })

            after(function () {
                Vue.config({ prefix: 'v' })
            })

            it('should work', function () {
                var v = new Vue({
                    template: '<span test-text="test"></span>',
                    data: { test: 'helllllo' }
                })
                assert.strictEqual(v.$el.innerHTML, '<span>' + v.test + '</span>')
            })

        })

        describe('changing interpolation delimiters', function () {
            
            before(function () {
                Vue.config({ delimiters: ['[', ']'] })
            })

            after(function () {
                Vue.config({ delimiters: ['{', '}'] })
            })

            it('should work', function () {
                var v = new Vue({
                    template: '<span>[[text]]</span><div>[[[html]]]</div>',
                    data: {
                        text: 'hello!!!',
                        html: '<span><a>some raw html</a></span>'
                    }
                })

                assert.strictEqual(v.$el.querySelector('span').innerHTML, v.text)
                assert.strictEqual(v.$el.querySelector('div').innerHTML, v.html + '<!--v-html-->')
            })

        })

        describe('skipping interpolation', function () {
            
            before(function () {
                Vue.config({ interpolate: false })
            })

            after(function () {
                Vue.config({ interpolate: true })
            })

            it('should work', function () {
                var raw = '<span class="{{text}}">{{text}}</span>'
                var v = new Vue({
                    template: raw,
                    data: {
                        text: 'hello!!!'
                    }
                })
                assert.strictEqual(v.$el.innerHTML, raw)
            })

        })

    })

    describe('require()', function () {
        
        it('should expose internal modules', function () {
            var c = Vue.require('config'),
                cc = require('vue/src/config')
            assert.strictEqual(c, cc)
        })

    })

    describe('use()', function () {
        
        it('should install a plugin via its install function', function () {
            var called = false
            Vue.use({
                install: function (vue) {
                    called = true
                    assert.strictEqual(vue, Vue)
                }
            })
            assert.ok(called)
        })

        it('should install a plugin if it’s a function itself', function () {
            var called = false
            Vue.use(function (vue) {
                called = true
                assert.strictEqual(vue, Vue)
            })
            assert.ok(called)
        })

        it('should pass any additional parameter', function () {
            var param1 = 'a',
                param2 = { b: 'c' }

            Vue.use(function (vue, p1, p2) {
                assert.strictEqual(p1, param1)
                assert.strictEqual(p2, param2)
            }, param1, param2)

            Vue.use({
                install: function (vue, p1, p2) {
                    assert.strictEqual(p1, param1)
                    assert.strictEqual(p2, param2)
                }
            }, param1, param2)
        })

        it('should properly set the value of this', function () {
            var plugin = {
                install: function () {
                    assert.strictEqual(this, plugin)
                }
            }
            Vue.use(plugin)

            Vue.use(function () {
                assert.strictEqual(this, global)
            })
        })

    })

    describe('filter()', function () {

        var reverse = function (input) {
            return input.split('').reverse().join('')
        }
        
        it('should create custom filter', function () {
            var testId = 'filter-1',
                msg = '12345'
            Vue.filter('reverse', reverse)
            mock(testId, '{{ test | reverse }}')
            new Vue({
                el: '#' + testId,
                data: { test: msg }
            })
            assert.strictEqual(document.querySelector('#' + testId).innerHTML, '54321')
        })

        it('should return filter function if only one arg is given', function () {
            var f = Vue.filter('reverse')
            assert.strictEqual(f, reverse)
        })

    })

    describe('directive()', function () {

        var dirTest
        
        it('should create custom directive with update() function only', function () {
            var testId = 'directive-1',
                msg = 'wowow'
            Vue.directive('test', function (value) {
                this.el.setAttribute(testId, value + '123')
            })
            mock(testId, '<span v-test="test"></span>')
            new Vue({
                el: '#' + testId,
                data: { test: msg }
            })
            var el = document.querySelector('#' + testId + ' span')
            assert.strictEqual(el.getAttribute(testId), msg + '123')
        })

        it('should create custom directive with object', function () {
            var testId = 'directive-2',
                msg = 'wowaaaa?'
            dirTest = {
                bind: function (value) {
                    this.el.setAttribute(testId + 'bind', value + 'bind')
                },
                update: function (value) {
                    this.el.setAttribute(testId + 'update', value + 'update')
                },
                unbind: function () {
                    this.el.removeAttribute(testId + 'bind')
                }
            }
            Vue.directive('test2', dirTest)
            mock(testId, '<span v-test2="test"></span>')
            var vm = new Vue({
                    el: '#' + testId,
                    data: { test: msg }
                }),
                el = document.querySelector('#' + testId + ' span')
            assert.strictEqual(el.getAttribute(testId + 'bind'), msg + 'bind', 'should have called bind() with value')
            assert.strictEqual(el.getAttribute(testId + 'update'), msg + 'update', 'should have called update() with value')
            vm.$destroy() // assuming this works
            assert.notOk(el.getAttribute(testId + 'bind'), 'should have called unbind()')
        })

        it('should not create binding for literal or empty directives', function () {
            var literalCalled = false,
                emptyCalled = false
            Vue.directive('test-literal', {
                isLiteral: true,
                bind: function () {
                    literalCalled = true
                    assert.strictEqual(this.expression, 'hihi')
                    assert.notOk(this.binding)
                },
                update: function () {}
            })
            Vue.directive('test-empty', {
                isEmpty: true,
                bind: function () {
                    emptyCalled = true
                    assert.notOk(this.binding)
                },
                update: function () {}
            })
            new Vue({
                template: '<div v-test-literal="hihi"></div><div v-test-empty="123"></div>'
            })
            assert.ok(literalCalled)
            assert.ok(emptyCalled)
        })

        it('should return directive object/fn if only one arg is given', function () {
            var dir = Vue.directive('test2')
            assert.strictEqual(dir, dirTest)
        })

    })

    describe('component()', function () {

        var testId = 'api-component-test',
            testId2 = testId + '2',
            opts = {
                className: 'hihi',
                data: { hi: 'ok' }
            },
            Test = Vue.extend(opts)

        it('should register a Component constructor', function () {
            Vue.component(testId, Test)
            assert.strictEqual(assets.components[testId], Test)
        })

        it('should also work with option objects', function () {
            Vue.component(testId2, opts)
            assert.ok(assets.components[testId2].prototype instanceof Vue)
        })

        it('should retrieve the VM if has only one arg', function () {
            assert.strictEqual(Vue.component(testId), Test)
        })

        it('should work with v-component', function () {

            mock(testId, '<div v-component="' + testId + '">{{hi}}</div>')
            var t = new Vue({ el: '#' + testId }),
                child = t.$el.querySelector('div')
            assert.strictEqual(child.className, 'hihi')
            assert.strictEqual(child.textContent, 'ok')

            mock(testId2, '<div v-component="' + testId2 + '">{{hi}}</div>')
            var t2 = new Vue({ el: '#' + testId2 }),
                child2 = t2.$el.querySelector('div')
            assert.strictEqual(child2.className, 'hihi')
            assert.strictEqual(child2.textContent, 'ok')
        })

    })

    describe('partial()', function () {

        var testId = 'api-partial-test',
            partial = '<div class="partial-test"><a>{{hi}}</a></div><span>hahaha</span>'

        it('should register the partial as a dom fragment', function () {
            Vue.partial(testId, partial)
            var converted = assets.partials[testId]
            assert.ok(converted instanceof window.DocumentFragment)
            assert.strictEqual(converted.querySelector('.partial-test a').innerHTML, '{{hi}}')
            assert.strictEqual(converted.querySelector('span').innerHTML, 'hahaha')
        })

        it('should retrieve the partial if has only one arg', function () {
            assert.strictEqual(assets.partials[testId], Vue.partial(testId))
        })

        it('should work with v-partial as a directive', function () {
            var testId = 'api-partial-direcitve'
            Vue.partial(testId, partial)
            mock(testId, '<div class="directive" v-partial="' + testId + '">hello</div>')
            var t = new Vue({
                el: '#' + testId,
                data: { hi: 'hohoho' }
            })
            assert.strictEqual(t.$el.querySelector('.directive .partial-test a').textContent, 'hohoho')
            assert.strictEqual(t.$el.querySelector('.directive span').innerHTML, 'hahaha')
        })

        it('should work with v-partial as an inline interpolation', function () {
            var testId = 'api-partial-inline'
            Vue.partial(testId, partial)
            mock(testId, '<div class="inline">{{>' + testId + '}}</div>')
            var t = new Vue({
                el: '#' + testId,
                data: { hi: 'hohoho' }
            })
            assert.strictEqual(t.$el.querySelector('.inline .partial-test a').textContent, 'hohoho')
            assert.strictEqual(t.$el.querySelector('.inline span').innerHTML, 'hahaha')
        })
    })

    describe('effect()', function () {
        
        var testId = 'api-effect-test',
            effect = {}

        it('should register a effect object', function () {
            Vue.effect(testId, effect)
            assert.strictEqual(assets.effects[testId], effect)
        })

        it('should retrieve the effect if has only one arg', function () {
            assert.strictEqual(Vue.effect(testId), effect)
        })

        it('should work with v-effect', function (done) {

            var enterCalled = false,
                leaveCalled = false

            Vue.effect('effect-api-test', {
                enter: function (el, done) {
                    enterCalled = true
                    done()
                },
                leave: function (el, done) {
                    leaveCalled = true
                    done()
                }
            })

            var t = new Vue({
                attributes: {
                    'v-show': 'show',
                    'v-effect': 'effect-api-test'
                },
                data: {
                    show: false
                }
            })

            document.body.appendChild(t.$el)
            
            t.show = true
            nextTick(function () {
                assert.ok(enterCalled)
                assert.strictEqual(t.$el.style.display, '')
                t.show = false
                nextTick(function () {
                    assert.ok(leaveCalled)
                    assert.strictEqual(t.$el.style.display, 'none')
                    t.$destroy()
                    done()
                })
            })
        })

    })

    describe('extend()', function () {
        
        it('should return a subclass of Vue', function () {
            var Test = Vue.extend({})
            assert.ok(Test.prototype instanceof Vue)
        })

        it('should allow further extensions', function () {
            var Parent = Vue.extend({
                data: {
                    test: 'hi'
                }
            })
            var Child = Parent.extend({
                data: {
                    test2: 'ho',
                    test3: {
                        hi: 1
                    }
                }
            })
            assert.strictEqual(Child.super, Parent)
            var child = new Child({
                data: {
                    test3: {
                        ho: 2
                    }
                }
            })
            assert.strictEqual(child.test, 'hi')
            assert.strictEqual(child.test2, 'ho')
            // should overwrite past 1 level deep
            assert.strictEqual(child.test3.ho, 2)
            assert.notOk(child.test3.hi)
        })

        it('should allow subclasses to attach private assets', function () {
            var testId = 'sub-private'
            var Sub = Vue.extend({})
            Sub.component(testId, {})
            assert.strictEqual(Sub.options.components[testId].super, Vue)
            Sub.partial(testId, '123')
            assert.ok(Sub.options.partials[testId] instanceof window.DocumentFragment)

            var Sub2 = Vue.extend({})
            Sub2.component(testId, {})
            assert.notStrictEqual(Sub.options.components[testId], Sub2.options.components[testId])
            assert.notOk(Vue.options.components[testId])
        })

        it('should allow subclasses to use plugins', function () {
            var Sub = Vue.extend({})
            Sub.use(function (Sub) {
                Sub.directive('hello', {})
            })
            assert.ok(Sub.options.directives.hello)
        })

        describe('Options', function () {

            describe('methods', function () {
                
                it('should be mixed to the exteded VM\'s instances', function () {
                    var methods = {
                        c: function () {},
                        d: function () {}
                    }
                    var Test = Vue.extend({ methods: methods })
                    var t = new Test()
                    assert.strictEqual(t.c, methods.c)
                    assert.strictEqual(t.d, methods.d)
                })

                it('should be bindable like normal properties', function (done) {
                    var Test = Vue.extend({
                        template: '{{ go(msg) }}',
                        data: {
                            msg: 'ok'
                        },
                        methods: {
                            go: function (v) {
                                return v + ' before'
                            }
                        }
                    })
                    var vm = new Test()
                    assert.equal(vm.$el.textContent, 'ok before')
                    vm.go = function (v) {
                        return v + ' after'
                    }
                    nextTick(function () {
                        assert.equal(vm.$el.textContent, 'ok after')
                        done()
                    })
                })

            })

            describe('data', function () {
                
                it('should be copied to each instance', function () {
                    var testData = { a: 1 },
                        Test = Vue.extend({
                            data: {
                                test: testData
                            }
                        })
                    var t1 = new Test(),
                        t2 = new Test()
                    assert.ok(t1.hasOwnProperty('test'))
                    assert.strictEqual(t1.test, testData)
                    assert.ok(t2.hasOwnProperty('test'))
                    assert.strictEqual(t2.test, testData)
                })

            })

            describe('lazy', function () {
                
                it('should make text input fields only trigger on change', function () {
                    var Test = Vue.extend({
                        template: '<input type="text" v-model="test">',
                        lazy: true
                    })
                    var t = new Test({
                        data: {
                            test: 'hi'
                        }
                    })
                    var input = t.$el.querySelector('input')
                    input.value = 'hohoho'
                    input.dispatchEvent(mockHTMLEvent('input'))
                    assert.strictEqual(t.test, 'hi')
                    input.dispatchEvent(mockHTMLEvent('change'))
                    assert.strictEqual(t.test, 'hohoho')
                })

            })

            describe('replace', function () {
                
                it('should replace an in DOM node', function () {
                    var testId = 'replace-test'
                    mock(testId, '<div>ho</div>')
                    var old = document.getElementById(testId),
                        parent = old.parentNode
                    var Test = Vue.extend({
                        template: '<p>hi</p>',
                        replace: true
                    })
                    var t = new Test({
                        el: '#' + testId
                    })
                    assert.strictEqual(t.$el.tagName, 'P')
                    assert.strictEqual(t.$el.textContent, 'hi')
                    assert.strictEqual(t.$el.parentNode, parent)
                    var now = document.getElementById(testId)
                    assert.strictEqual(now, t.$el, 'should copy over attributes from replaced node')
                })

                it('should replace an off DOM Vue\'s $el', function () {
                    var Test = Vue.extend({
                        template: '<p>hi</p>',
                        replace: true
                    })
                    var t = new Test()
                    assert.strictEqual(t.$el.tagName, 'P')
                    assert.strictEqual(t.$el.textContent, 'hi')
                })

                it('should not work if template has more than one child node', function () {
                    var Test = Vue.extend({
                        template: '<p>hi</p><p>ho</p>',
                        replace: true
                    })
                    var t = new Test()
                    assert.notStrictEqual(t.$el.tagName, 'P')
                    assert.strictEqual(t.$el.innerHTML, '<p>hi</p><p>ho</p>')
                })

            })

            describe('DOM element options', function () {
                
                it('should not accept el as an extension option', function () {
                    var el = document.createElement('div'),
                        Test = Vue.extend({ el: el }),
                        t = new Test()
                    assert.notStrictEqual(t.$el, el)
                })

                it('should create el with options: tagName, id, className and attributes', function () {
                    var Test = Vue.extend({
                        tagName: 'p',
                        id: 'extend-test',
                        className: 'extend',
                        attributes: {
                            'test': 'hi',
                            'v-text': 'hoho'
                        },
                        data: {
                            hoho: 'what'
                        }
                    })
                    var t = new Test()
                    assert.strictEqual(t.$el.nodeName, 'P', 'tagName should match')
                    assert.strictEqual(t.$el.id, 'extend-test', 'id should match')
                    assert.strictEqual(t.$el.className, 'extend', 'className should match')
                    assert.strictEqual(t.$el.getAttribute('test'), 'hi', 'normal attr should work')
                    assert.strictEqual(t.$el.textContent, 'what', 'directives passed in as attr should work')
                })

                it('should ignore tagName when el is passed as an instance option', function () {
                    var el = document.createElement('div'),
                        Test = Vue.extend({
                            tagName: 'p',
                            id: 'extend-test',
                            className: 'extend',
                            attributes: {
                                'test': 'hi',
                                'v-text': 'hoho'
                            },
                            data: {
                                hoho: 'what'
                            }
                        }),
                        t = new Test({
                            el: el
                        })
                    assert.strictEqual(t.$el, el, 'should use instance el')
                    assert.notStrictEqual(t.$el.nodeName, 'P', 'tagName should NOT match')
                    assert.strictEqual(t.$el.id, 'extend-test', 'id should match')
                    assert.strictEqual(t.$el.className, 'extend', 'className should match')
                    assert.strictEqual(t.$el.getAttribute('test'), 'hi', 'normal attr should work')
                    assert.strictEqual(t.$el.textContent, 'what', 'directives passed in as attr should work')
                })

            })

            describe('template', function () {

                var raw = '<span>{{hello}}</span><a>haha</a>'
                
                it('should take direct string template and work', function () {
                    var Test = Vue.extend({
                            tagName: 'p',
                            template: raw,
                            data: {
                                hello: 'Ahaha'
                            }
                        }),
                        vm = new Test(),
                        text1 = vm.$el.querySelector('span').textContent,
                        text2 = vm.$el.querySelector('a').textContent
                    assert.strictEqual(vm.$el.nodeName, 'P')
                    assert.strictEqual(text1, 'Ahaha')
                    assert.strictEqual(text2, 'haha')
                })

                it('should take a #id and work', function () {
                    var testId = 'template-test',
                        tpl = document.createElement('script')
                    tpl.id = testId
                    tpl.type = 'text/template'
                    tpl.innerHTML = raw
                    document.getElementById('test').appendChild(tpl)
                    var Test = Vue.extend({
                        template: '#' + testId,
                        data: { hello: testId }
                    })
                    var t = new Test()
                    assert.strictEqual(t.$el.querySelector('span').textContent, testId)
                })

                it('should be overwritable', function () {
                    var Test = Vue.extend({
                        template: '<div>this should not happen</div>'
                    })
                    var t = new Test({
                        template: raw,
                        data: {
                            hello: 'overwritten!'
                        }
                    })
                    assert.strictEqual(t.$el.querySelector('span').textContent, 'overwritten!')
                })

            })

            describe('paramAttributes', function () {
                
                it('should copy listed attributes into data and parse Numbers', function () {
                    var Test = Vue.extend({
                        template: '<div a="1" b="hello"></div>',
                        replace: true,
                        paramAttributes: ['a', 'b', 'c']
                    })
                    var v = new Test()
                    assert.strictEqual(v.a, 1)
                    assert.strictEqual(v.$data.a, 1)
                    assert.strictEqual(v.b, 'hello')
                    assert.strictEqual(v.$data.b, 'hello')
                    assert.strictEqual(v.c, null)
                    assert.strictEqual(v.$data.c, null)
                })

                it('should be able to bind data from parents', function (done) {
                    var v = new Vue({
                        template: '<div v-component="test" v-ref="child"></div>',
                        data: {
                            size: 123
                        },
                        components: {
                            test: {
                                replace: true,
                                paramAttributes: ['size'],
                                template: '<div class="child" size="{{size}}"></div>'
                            }
                        }
                    })
                    var childAttr = v.$el.querySelector('.child').getAttribute('size')
                    assert.strictEqual(childAttr, '123')

                    v.size = 234

                    nextTick(function () {
                        var childAttr = v.$el.querySelector('.child').getAttribute('size')
                        assert.strictEqual(childAttr, '234')
                        assert.strictEqual(v.$.child.size, 234)
                        done()
                    })
                })

            })

            describe('parent', function () {

                var parent, child
                
                it('should allow child to access parent bindings', function () {

                    parent = new Vue({
                        data: {
                            test: 'from parent'
                        }
                    })

                    child = new Vue({
                        parent: parent,
                        template: '{{test}}'
                    })

                    assert.strictEqual(child.$el.textContent, 'from parent')

                })

                it('should allow event communication between parent and child', function () {
                    
                    var dispatched = false,
                        broadcasted = false
                    parent.$on('dispatch', function () {
                        dispatched = true
                    })
                    child.$on('broadcast', function () {
                        broadcasted = true
                    })
                    parent.$broadcast('broadcast')
                    child.$dispatch('dispatch')

                    assert.ok(dispatched)
                    assert.ok(broadcasted)

                })

                it('should destroy the child when parent is destroyed', function () {
                    
                    parent.$destroy()
                    assert.ok(child.$compiler.destroyed)

                })

            })

            describe('directives', function () {
                
                it('should allow the VM to use private directives', function (done) {
                    var Test = Vue.extend({
                        directives: {
                            test: function (value) {
                                this.el.innerHTML = value ? 'YES' : 'NO'
                            }
                        }
                    })
                    var t = new Test({
                        attributes: {
                            'v-test': 'ok'
                        },
                        data: {
                            ok: true
                        }
                    })
                    assert.strictEqual(t.$el.innerHTML, 'YES')
                    t.ok = false
                    nextTick(function () {
                        assert.strictEqual(t.$el.innerHTML, 'NO')
                        done()
                    })
                })

            })

            describe('filters', function () {
                
                it('should allow the VM to use private filters', function () {
                    var Test = Vue.extend({
                        filters: {
                            test: function (value) {
                                return value + '12345'
                            }
                        }
                    })
                    var t = new Test({
                        template: '{{hi | test}}',
                        data: {
                            hi: 'hohoho'
                        }
                    })
                    assert.strictEqual(t.$el.textContent, 'hohoho12345')
                })

            })

            describe('components', function () {

                it('should allow the VM to use private child VMs', function () {
                    var Child = Vue.extend({
                        data: {
                            name: 'child'
                        }
                    })
                    var Parent = Vue.extend({
                        template: '<p>{{name}}</p><div v-component="child">{{name}}</div>',
                        data: {
                            name: 'dad'
                        },
                        components: {
                            child: Child
                        }
                    })
                    var p = new Parent()
                    assert.strictEqual(p.$el.querySelector('p').textContent, 'dad')
                    assert.strictEqual(p.$el.querySelector('div').textContent, 'child')
                })

                it('should work with plain option object', function () {
                    var Parent = Vue.extend({
                        template: '<p>{{name}}</p><div v-component="child">{{name}}</div>',
                        data: {
                            name: 'dad'
                        },
                        components: {
                            child: {
                                data: {
                                    name: 'child'
                                }
                            }
                        }
                    })
                    var p = new Parent()
                    assert.strictEqual(p.$el.querySelector('p').textContent, 'dad')
                    assert.strictEqual(p.$el.querySelector('div').textContent, 'child')
                })

            })

            describe('partials', function () {
                
                it('should allow the VM to use private partials', function () {
                    var Test = Vue.extend({
                        attributes: {
                            'v-partial': 'test'
                        },
                        partials: {
                            test: '<a>{{a}}</a><p>{{b}}</p>'
                        },
                        data: {
                            a: 'hi',
                            b: 'ho'
                        }
                    })
                    var t = new Test()
                    assert.strictEqual(t.$el.querySelector('a').textContent, 'hi')
                    assert.strictEqual(t.$el.querySelector('p').textContent, 'ho')
                })

            })

            describe('effects', function () {
                
                it('should get called during effects', function (done) {
                    
                    var enterCalled = false,
                        leaveCalled = false

                    var t = new Vue({
                        attributes: {
                            'v-show': 'show',
                            'v-effect': 'test'
                        },
                        effects: {
                            test: {
                                enter: function (el, done) {
                                    enterCalled = true
                                    done()
                                },
                                leave: function (el, done) {
                                    leaveCalled = true
                                    done()
                                }
                            }
                        },
                        data: {
                            show: false
                        }
                    })

                    document.body.appendChild(t.$el)

                    t.show = true
                    nextTick(function () {
                        assert.ok(enterCalled)
                        assert.strictEqual(t.$el.style.display, '')
                        t.show = false
                        nextTick(function () {
                            assert.ok(leaveCalled)
                            assert.strictEqual(t.$el.style.display, 'none')
                            t.$destroy()
                            done()
                        })
                    })

                })

            })

            describe('hooks', function () {

                describe('created', function () {
                
                    it('should be called before compile and give access to all vm properties', function () {
                        
                        var called = false,
                            Test = Vue.extend({ created: function () {
                                assert.ok(this.$data)
                                assert.ok(this.$el)
                                assert.ok(this.$)
                                assert.ok(this.$compiler)
                                assert.ok(this.$root)
                                assert.ok(this.$options.ok)
                                called = true
                            }})
                        new Test({ ok: true })
                        assert.ok(called)

                    })

                })

                describe('ready', function () {

                    it('should be called after compile', function () {
                        var called = false,
                            hook = function () {
                                assert.ok(this.$options.ok)
                                assert.notOk(this.$compiler.init)
                                called = true
                            },
                            Test = Vue.extend({ ready: hook })
                        new Test({ ok: true })
                        assert.ok(called)
                    })

                })
                
                describe('beforeDestroy', function () {
                
                    it('should be called before a vm is destroyed', function () {
                        var called1 = false,
                            called2 = false
                        var Test = Vue.extend({
                            beforeDestroy: function () {
                                called1 = true
                            }
                        })
                        var test = new Test()
                        test.$on('hook:beforeDestroy', function () {
                            called2 = true
                        })
                        test.$destroy()
                        assert.ok(called1)
                        assert.ok(called2)
                    })

                })

                describe('afterDestroy', function () {
                    
                    it('should be called after a vm is destroyed', function () {
                        var called1 = false, called2 = false,
                            Test = Vue.extend({
                                afterDestroy: function () {
                                    assert.notOk(this.$el.parentNode)
                                    called1 = true
                                }
                            })
                        var test = new Test()
                        document.body.appendChild(test.$el)
                        test.$on('hook:afterDestroy', function () {
                            called2 = true
                        })
                        test.$destroy()
                        assert.ok(called1)
                        assert.ok(called2)
                    })

                })

                describe('attached', function () {
                    
                    it('should be called after enter view', function () {
                        var called1 = false, called2 = false,
                            test = new Vue({
                                attached: function () {
                                    assert.strictEqual(this.$el.parentNode, document.getElementById('test'))
                                    called1 = true
                                }
                            })
                        test.$on('hook:attached', function () {
                            called2 = true
                        })
                        test.$appendTo('#test')
                        assert.ok(called1)
                        assert.ok(called2)
                    })

                })

                describe('detached', function () {
                    
                    it('should be called after left view', function () {
                        var called1 = false, called2 = false,
                            test = new Vue({
                                detached: function () {
                                    assert.strictEqual(this.$el.parentNode, null)
                                    called1 = true
                                }
                            })
                        test.$on('hook:detached', function () {
                            called2 = true
                        })
                        document.getElementById('test').appendChild(test.$el)
                        test.$remove()
                        assert.ok(called1)
                        assert.ok(called2)
                    })

                })

                describe('Hook inheritance', function () {
                    
                    it('should merge hooks with parent Class', function () {
                        var called = []
                        var Parent = Vue.extend({
                            created: function () {
                                called.push('parent')
                            }
                        })
                        var Child = Parent.extend({
                            created: function () {
                                called.push('child')
                            }
                        })
                        new Child({
                            created: function () {
                                called.push('instance')
                            }
                        })
                        assert.deepEqual(called, ['parent', 'child', 'instance'])
                    })

                })

            })

        })

    })

})