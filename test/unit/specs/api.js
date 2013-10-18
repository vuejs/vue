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

    describe('viewmodel()', function () {

        var testId = 'api-vm-test',
            Test = Seed.extend({
                className: 'hihi',
                scope: { hi: 'ok' }
            }),
            utils = require('seed/src/utils')

        it('should register a VM constructor', function () {
            Seed.viewmodel(testId, Test)
            assert.strictEqual(utils.vms[testId], Test)
        })

        it('should retrieve the VM if has only one arg', function () {
            assert.strictEqual(Seed.viewmodel(testId), Test)
        })

        it('should work with sd-viewmodel', function () {
            mock(testId, '<div sd-viewmodel="' + testId + '">{{hi}}</div>')
            var t = new Seed({ el: '#' + testId }),
                child = t.$el.querySelector('div')
            assert.strictEqual(child.className, 'hihi')
            assert.strictEqual(child.textContent, 'ok')
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

        // it('should work with sd-transition', function () {
        //     assert.ok(false)
        // })

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
                    input.dispatchEvent(mockKeyEvent('keyup'))
                    assert.strictEqual(t.test, 'hi')
                    input.dispatchEvent(mockHTMLEvent('change'))
                    assert.strictEqual(t.test, 'hohoho')
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

            describe('vms', function () {

                it('should allow the VM to use private child VMs', function () {
                    var Child = Seed.extend({
                        scope: {
                            name: 'child'
                        }
                    })
                    var Parent = Seed.extend({
                        template: '<p>{{name}}</p><div sd-viewmodel="child">{{name}}</div>',
                        scope: {
                            name: 'dad'
                        },
                        vms: {
                            child: Child
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

            describe('transitions', function () {
                // it('should be tested', function () {
                //     assert.ok(false)
                // })
            })

        })

    })

})