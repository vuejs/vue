describe('UNIT: API', function () {

    describe('config()', function () {
        
        it('should work when changing prefix', function () {
            var testId = 'config-1'
            seed.config({
                prefix: 'test'
            })
            mock(testId, '<span test-text="test"></span>')
            new seed.ViewModel({
                el: '#' + testId,
                data: { test: testId }
            })
            assert.strictEqual($('#' + testId + ' span'), testId)
        })

        it('should work when changing interpolate tags', function () {
            var testId = 'config-2'
            seed.config({
                interpolateTags: {
                    open: '<%',
                    close: '%>'
                }
            })
            mock(testId, '<% test %>')
            new seed.ViewModel({
                el: '#' + testId,
                data: { test: testId }
            })
            assert.strictEqual($('#' + testId), testId)
        })

        after(function () {
            seed.config({
                prefix: 'sd',
                interpolateTags: {
                    open: '{{',
                    close: '}}'
                }
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
            seed.filter('reverse', reverse)
            mock(testId, '{{ test | reverse }}')
            new seed.ViewModel({
                el: '#' + testId,
                data: { test: msg }
            })
            assert.strictEqual($('#' + testId), '54321')
        })

        it('should return filter function if only one arg is given', function () {
            var f = seed.filter('reverse')
            assert.strictEqual(f, reverse)
        })

    })

    describe('directive()', function () {

        var dirTest
        
        it('should create custom directive with set function only', function () {
            var testId = 'directive-1',
                msg = 'wowow'
            seed.directive('test', function (value) {
                this.el.setAttribute(testId, value + '123')
            })
            mock(testId, '<span sd-test="test"></span>')
            new seed.ViewModel({
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
            seed.directive('test2', dirTest)
            mock(testId, '<span sd-test2="test"></span>')
            var vm = new seed.ViewModel({
                    el: '#' + testId,
                    data: { test: msg }
                }),
                el = document.querySelector('#' + testId + ' span')
            assert.strictEqual(el.getAttribute(testId + 'bind'), msg + 'bind', 'should have called bind()')
            assert.strictEqual(el.getAttribute(testId + 'update'), msg + 'update', 'should have called update()')
            vm.$destroy() // assuming this works
            assert.notOk(el.getAttribute(testId + 'bind'), 'should have called unbind()')
        })

        it('should return directive object/fn if only one arg is given', function () {
            var dir = seed.directive('test2')
            assert.strictEqual(dir, dirTest)
        })

    })

    describe('vm()', function () {

        var testId = 'api-vm-test',
            Test = seed.ViewModel.extend({
                className: 'hihi',
                data: { hi: 'ok' }
            }),
            utils = require('seed/src/utils')

        it('should register a VM constructor', function () {
            seed.vm(testId, Test)
            assert.strictEqual(utils.vms[testId], Test)
        })

        it('should retrieve the VM if has only one arg', function () {
            assert.strictEqual(seed.vm(testId), Test)
        })

        it('should work with sd-viewmodel', function () {
            mock(testId, '<div sd-viewmodel="' + testId + '">{{hi}}</div>')
            var t = new seed.ViewModel({ el: '#' + testId }),
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
            seed.partial(testId, partial)
            var converted = utils.partials[testId]
            assert.ok(converted instanceof window.DocumentFragment)
            assert.strictEqual(converted.querySelector('.partial-test a').innerHTML, '{{hi}}')
            assert.strictEqual(converted.querySelector('span').innerHTML, 'hahaha')
        })

        it('should retrieve the partial if has only one arg', function () {
            assert.strictEqual(utils.partials[testId], seed.partial(testId))
        })

        it('should work with sd-partial', function () {
            mock(testId, 'hello', {
                'sd-partial': testId
            })
            var t = new seed.ViewModel({
                el: '#' + testId,
                data: { hi: 'hohoho' }
            })
            assert.strictEqual(t.$el.querySelector('.partial-test a').textContent, 'hohoho')
            assert.strictEqual(t.$el.querySelector('span').innerHTML, 'hahaha')
        })
    })

    describe('transition()', function () {
        
        var testId = 'api-trans-test',
            transition = {},
            utils = require('seed/src/utils')

        it('should register a transition object', function () {
            seed.transition(testId, transition)
            assert.strictEqual(utils.transitions[testId], transition)
        })

        it('should retrieve the transition if has only one arg', function () {
            assert.strictEqual(seed.transition(testId), transition)
        })

        it('should work with sd-transition', function () {
            assert.ok(false)
        })

    })

    describe('ViewModel.extend()', function () {
        
        it('should return a subclass of seed.ViewModel', function () {
            var Test = seed.ViewModel.extend({})
            assert.ok(Test.prototype instanceof seed.ViewModel)
        })

        it('should allow further extensions', function () {
            var Parent = seed.ViewModel.extend({
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

        describe('Options', function () {

            describe('init', function () {
                
                it('should be called on the instance when instantiating', function () {
                    var called = false,
                        Test = seed.ViewModel.extend({ init: function () {
                            called = true
                        }})
                    new Test({ el: document.createElement('div') })
                    assert.ok(called)
                })

            })

            describe('props', function () {
                
                it('should be mixed to the exteded VM\'s prototype', function () {
                    var props = {
                        a: 1,
                        b: 2,
                        c: function () {}
                    }
                    var Test = seed.ViewModel.extend({ props: props })
                    for (var key in props) {
                        assert.strictEqual(Test.prototype[key], props[key])
                    }
                })

            })

            describe('data', function () {
                
                it('should be copied to each instance', function () {
                    var testData = { a: 1 },
                        Test = seed.ViewModel.extend({
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

            describe('element options', function () {
                
                it('should not accept el as an extension option', function () {
                    var el = document.createElement('div'),
                        Test = seed.ViewModel.extend({ el: el }),
                        t = new Test()
                    assert.notStrictEqual(t.$el, el)
                })

                it('should create el with options: tagName, id, className and attributes', function () {
                    var Test = seed.ViewModel.extend({
                        tagName: 'p',
                        id: 'extend-test',
                        className: 'extend',
                        attributes: {
                            'test': 'hi',
                            'sd-text': 'hoho'
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
                        Test = seed.ViewModel.extend({
                            tagName: 'p',
                            id: 'extend-test',
                            className: 'extend',
                            attributes: {
                                'test': 'hi',
                                'sd-text': 'hoho'
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
                    var Test = seed.ViewModel.extend({
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
                    var Test = seed.ViewModel.extend({
                        template: '#' + testId,
                        data: { hello: testId }
                    })
                    var t = new Test()
                    assert.strictEqual(t.$el.querySelector('span').textContent, testId)
                })

                it('should be overwritable', function () {
                    var Test = seed.ViewModel.extend({
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

            describe('directives', function () {
                
                it('should allow the VM to use private directives', function () {
                    var Test = seed.ViewModel.extend({
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
                        data: {
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
                    var Test = seed.ViewModel.extend({
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

            describe('vms', function () {
                it('should be tested', function () {
                    assert.ok(false)
                })
            })

            describe('partials', function () {
                it('should be tested', function () {
                    assert.ok(false)
                })
            })

            describe('transitions', function () {
                it('should be tested', function () {
                    assert.ok(false)
                })
            })

        })

    })

})