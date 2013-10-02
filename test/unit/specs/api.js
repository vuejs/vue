describe('UNIT: API', function () {

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
                    this.el.setAttribute(testId + 'bind', msg + 'bind')
                },
                update: function (value) {
                    this.el.setAttribute(testId + 'update', msg + 'update')
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
                    test2: 'ho'
                }
            })
            assert.strictEqual(Child.super, Parent)
            var child = new Child()
            assert.strictEqual(child.test, 'hi')
            assert.strictEqual(child.test2, 'ho')
        })

        describe('Options', function () {

            describe('init', function () {
                
                it('should be called on the instance when instantiating', function () {
                    var called = false,
                        Test = seed.ViewModel.extend({ init: function () {
                            called = true                           
                        }}),
                        test = new Test({ el: document.createElement('div') })
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
                })

            })

            describe('el + options', function () {
                
                it('should take a direct node', function () {
                })

                it('should take a string as selector', function () {
                })

                it('should process tagName, id, className and attributes', function () {
                })

            })

            describe('template', function () {
                
                it('should take direct string template and work', function () {
                    var Test = seed.ViewModel.extend({
                            tagName: 'p',
                            template: '<span>{{hello}}</span><a>haha</a>',
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
                })

                it('should be overwritable', function () {
                })

            })

        })

    })

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

})