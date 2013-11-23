describe('UNIT: API', function () {

    describe('config()', function () {
        
        it('should work when changing prefix', function () {
            var testId = 'config-1'
            Seed.config({
                prefix: 'test'
            })
            mock(testId, '<span test-text="test"></span>')
            new Seed({
                el: '#' + testId,
                scope: { test: testId }
            })
            assert.strictEqual(document.querySelector('#' + testId + ' span').innerHTML, testId)
        })

        after(function () {
            Seed.config({
                prefix: 'sd'
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
            Seed.filter('reverse', reverse)
            mock(testId, '{{ test | reverse }}')
            new Seed({
                el: '#' + testId,
                scope: { test: msg }
            })
            assert.strictEqual(document.querySelector('#' + testId).innerHTML, '54321')
        })

        it('should return filter function if only one arg is given', function () {
            var f = Seed.filter('reverse')
            assert.strictEqual(f, reverse)
        })

    })

    describe('directive()', function () {

        var dirTest
        
        it('should create custom directive with set function only', function () {
            var testId = 'directive-1',
                msg = 'wowow'
            Seed.directive('test', function (value) {
                this.el.setAttribute(testId, value + '123')
            })
            mock(testId, '<span sd-test="test"></span>')
            new Seed({
                el: '#' + testId,
                scope: { test: msg }
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
            Seed.directive('test2', dirTest)
            mock(testId, '<span sd-test2="test"></span>')
            var vm = new Seed({
                    el: '#' + testId,
                    scope: { test: msg }
                }),
                el = document.querySelector('#' + testId + ' span')
            assert.strictEqual(el.getAttribute(testId + 'bind'), msg + 'bind', 'should have called bind()')
            assert.strictEqual(el.getAttribute(testId + 'update'), msg + 'update', 'should have called update()')
            vm.$destroy() // assuming this works
            assert.notOk(el.getAttribute(testId + 'bind'), 'should have called unbind()')
        })

        it('should return directive object/fn if only one arg is given', function () {
            var dir = Seed.directive('test2')
            assert.strictEqual(dir, dirTest)
        })

    })

    describe('component()', function () {

        var testId = 'api-vm-test',
            testId2 = testId + '2',
            opts = {
                className: 'hihi',
                scope: { hi: 'ok' }
            },
            Test = Seed.extend(opts),
            utils = require('seed/src/utils')

        it('should register a Component constructor', function () {
            Seed.component(testId, Test)
            assert.strictEqual(utils.components[testId], Test)
        })

        it('should also work with option objects', function () {
            Seed.component(testId2, opts)
            assert.ok(utils.components[testId2].prototype instanceof Seed)
        })

        it('should retrieve the VM if has only one arg', function () {
            assert.strictEqual(Seed.component(testId), Test)
        })

        it('should work with sd-component', function () {

            mock(testId, '<div sd-component="' + testId + '">{{hi}}</div>')
            var t = new Seed({ el: '#' + testId }),
                child = t.$el.querySelector('div')
            assert.strictEqual(child.className, 'hihi')
            assert.strictEqual(child.textContent, 'ok')

            mock(testId2, '<div sd-component="' + testId2 + '">{{hi}}</div>')
            var t2 = new Seed({ el: '#' + testId2 }),
                child2 = t2.$el.querySelector('div')
            assert.strictEqual(child2.className, 'hihi')
            assert.strictEqual(child2.textContent, 'ok')
        })

    })

    describe('partial()', function () {

        var testId = 'api-partial-test',
            partial = '<div class="partial-test"><a>{{hi}}</a></div><span>hahaha</span>',
            utils = require('seed/src/utils')

        it('should register the partial as a dom fragment', function () {
            Seed.partial(testId, partial)
            var converted = utils.partials[testId]
            assert.ok(converted instanceof window.DocumentFragment)
            assert.strictEqual(converted.querySelector('.partial-test a').innerHTML, '{{hi}}')
            assert.strictEqual(converted.querySelector('span').innerHTML, 'hahaha')
        })

        it('should retrieve the partial if has only one arg', function () {
            assert.strictEqual(utils.partials[testId], Seed.partial(testId))
        })

        it('should work with sd-partial as a directive', function () {
            var testId = 'api-partial-direcitve'
            Seed.partial(testId, partial)
            mock(testId, '<div class="directive" sd-partial="' + testId + '">hello</div>')
            var t = new Seed({
                el: '#' + testId,
                scope: { hi: 'hohoho' }
            })
            assert.strictEqual(t.$el.querySelector('.directive .partial-test a').textContent, 'hohoho')
            assert.strictEqual(t.$el.querySelector('.directive span').innerHTML, 'hahaha')
        })

        it('should work with sd-partial as an inline interpolation', function () {
            var testId = 'api-partial-inline'
            Seed.partial(testId, partial)
            mock(testId, '<div class="inline">{{>' + testId + '}}</div>')
            var t = new Seed({
                el: '#' + testId,
                scope: { hi: 'hohoho' }
            })
            assert.strictEqual(t.$el.querySelector('.inline .partial-test a').textContent, 'hohoho')
            assert.strictEqual(t.$el.querySelector('.inline span').innerHTML, 'hahaha')
        })
    })

    describe('transition()', function () {
        
        var testId = 'api-trans-test',
            transition = {},
            utils = require('seed/src/utils')

        it('should register a transition object', function () {
            Seed.transition(testId, transition)
            assert.strictEqual(utils.transitions[testId], transition)
        })

        it('should retrieve the transition if has only one arg', function () {
            assert.strictEqual(Seed.transition(testId), transition)
        })

        it('should work with sd-transition', function () {

            var enterCalled = false,
                leaveCalled = false

            Seed.transition('transition-api-test', {
                enter: function (el, done) {
                    enterCalled = true
                    done()
                },
                leave: function (el, done) {
                    leaveCalled = true
                    done()
                }
            })

            var t = new Seed({
                attributes: {
                    'sd-show': 'show',
                    'sd-transition': 'transition-api-test'
                },
                scope: {
                    show: false
                }
            })

            document.body.appendChild(t.$el)
            
            t.show = true
            assert.ok(enterCalled)
            assert.strictEqual(t.$el.style.display, '')

            t.show = false
            assert.ok(leaveCalled)
            assert.strictEqual(t.$el.style.display, 'none')

            t.$destroy()
        })

    })

    describe('extend()', function () {
        
        it('should return a subclass of Seed', function () {
            var Test = Seed.extend({})
            assert.ok(Test.prototype instanceof Seed)
        })

        it('should allow further extensions', function () {
            var Parent = Seed.extend({
                scope: {
                    test: 'hi'
                }
            })
            var Child = Parent.extend({
                scope: {
                    test2: 'ho',
                    test3: {
                        hi: 1
                    }
                }
            })
            assert.strictEqual(Child.super, Parent)
            var child = new Child({
                scope: {
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

        describe('Options', function () {

            describe('init', function () {
                
                it('should be called on the instance when instantiating', function () {
                    var called = false,
                        Test = Seed.extend({ init: function () {
                            called = true
                        }})
                    new Test({ el: document.createElement('div') })
                    assert.ok(called)
                })

            })

            describe('proto', function () {
                
                it('should be mixed to the exteded VM\'s prototype', function () {
                    var mixins = {
                        a: 1,
                        b: 2,
                        c: function () {}
                    }
                    var Test = Seed.extend({ proto: mixins })
                    for (var key in mixins) {
                        assert.strictEqual(Test.prototype[key], mixins[key])
                    }
                })

            })

            describe('scope', function () {
                
                it('should be copied to each instance', function () {
                    var testData = { a: 1 },
                        Test = Seed.extend({
                            scope: {
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
                    var Test = Seed.extend({
                        template: '<input type="text" sd-model="test">',
                        lazy: true
                    })
                    var t = new Test({
                        scope: {
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
                    var Test = Seed.extend({
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
                    assert.strictEqual(now, null)
                })

                it('should replace an off DOM Seed\'s $el', function () {
                    var Test = Seed.extend({
                        template: '<p>hi</p>',
                        replace: true
                    })
                    var t = new Test()
                    assert.strictEqual(t.$el.tagName, 'P')
                    assert.strictEqual(t.$el.textContent, 'hi')
                })

                it('should not work if template has more than one child node', function () {
                    var Test = Seed.extend({
                        template: '<p>hi</p><p>ho</p>',
                        replace: true
                    })
                    var t = new Test()
                    assert.notStrictEqual(t.$el.tagName, 'P')
                    assert.strictEqual(t.$el.innerHTML, '<p>hi</p><p>ho</p>')
                })

            })

            describe('element options', function () {
                
                it('should not accept el as an extension option', function () {
                    var el = document.createElement('div'),
                        Test = Seed.extend({ el: el }),
                        t = new Test()
                    assert.notStrictEqual(t.$el, el)
                })

                it('should create el with options: tagName, id, className and attributes', function () {
                    var Test = Seed.extend({
                        tagName: 'p',
                        id: 'extend-test',
                        className: 'extend',
                        attributes: {
                            'test': 'hi',
                            'sd-text': 'hoho'
                        },
                        scope: {
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
                        Test = Seed.extend({
                            tagName: 'p',
                            id: 'extend-test',
                            className: 'extend',
                            attributes: {
                                'test': 'hi',
                                'sd-text': 'hoho'
                            },
                            scope: {
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
                    var Test = Seed.extend({
                            tagName: 'p',
                            template: raw,
                            scope: {
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
                    var Test = Seed.extend({
                        template: '#' + testId,
                        scope: { hello: testId }
                    })
                    var t = new Test()
                    assert.strictEqual(t.$el.querySelector('span').textContent, testId)
                })

                it('should be overwritable', function () {
                    var Test = Seed.extend({
                        template: '<div>this should not happen</div>'
                    })
                    var t = new Test({
                        template: raw,
                        scope: {
                            hello: 'overwritten!'
                        }
                    })
                    assert.strictEqual(t.$el.querySelector('span').textContent, 'overwritten!')
                })

            })

            describe('directives', function () {
                
                it('should allow the VM to use private directives', function () {
                    var Test = Seed.extend({
                        directives: {
                            test: function (value) {
                                this.el.innerHTML = value ? 'YES' : 'NO'
                            }
                        }
                    })
                    var t = new Test({
                        attributes: {
                            'sd-test': 'ok'
                        },
                        scope: {
                            ok: true
                        }
                    })
                    assert.strictEqual(t.$el.innerHTML, 'YES')
                    t.ok = false
                    assert.strictEqual(t.$el.innerHTML, 'NO')
                })

            })

            describe('filters', function () {
                
                it('should allow the VM to use private filters', function () {
                    var Test = Seed.extend({
                        filters: {
                            test: function (value) {
                                return value + '12345'
                            }
                        }
                    })
                    var t = new Test({
                        template: '{{hi | test}}',
                        scope: {
                            hi: 'hohoho'
                        }
                    })
                    assert.strictEqual(t.$el.textContent, 'hohoho12345')
                })

            })

            describe('components', function () {

                it('should allow the VM to use private child VMs', function () {
                    var Child = Seed.extend({
                        scope: {
                            name: 'child'
                        }
                    })
                    var Parent = Seed.extend({
                        template: '<p>{{name}}</p><div sd-component="child">{{name}}</div>',
                        scope: {
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
                    var Parent = Seed.extend({
                        template: '<p>{{name}}</p><div sd-component="child">{{name}}</div>',
                        scope: {
                            name: 'dad'
                        },
                        components: {
                            child: {
                                scope: {
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
                    var Test = Seed.extend({
                        attributes: {
                            'sd-partial': 'test'
                        },
                        partials: {
                            test: '<a>{{a}}</a><p>{{b}}</p>'
                        },
                        scope: {
                            a: 'hi',
                            b: 'ho'
                        }
                    })
                    var t = new Test()
                    assert.strictEqual(t.$el.querySelector('a').textContent, 'hi')
                    assert.strictEqual(t.$el.querySelector('p').textContent, 'ho')
                })

            })

            describe('teardown', function () {
                
                it('should be called when a vm is destroyed', function () {
                    var called = false
                    var Test = Seed.extend({
                        teardown: function () {
                            called = true
                        }
                    })
                    var test = new Test()
                    test.$destroy()
                    assert.ok(called)
                })

            })

            describe('transitions', function () {
                
                it('should get called during transitions', function () {
                    
                    var enterCalled = false,
                        leaveCalled = false

                    var t = new Seed({
                        attributes: {
                            'sd-show': 'show',
                            'sd-transition': 'test'
                        },
                        transitions: {
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
                        scope: {
                            show: false
                        }
                    })

                    document.body.appendChild(t.$el)
                    
                    t.show = true
                    assert.ok(enterCalled)
                    assert.strictEqual(t.$el.style.display, '')

                    t.show = false
                    assert.ok(leaveCalled)
                    assert.strictEqual(t.$el.style.display, 'none')

                    t.$destroy()

                })

            })

        })

    })

})