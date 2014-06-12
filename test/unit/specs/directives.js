describe('Directives', function () {

    var nextTick = require('vue/src/utils').nextTick,
        VM = require('vue/src/viewmodel')
    
    describe('attr', function () {

        var dir = mockDirective('attr', 'input'),
            el = dir.el

        it('should set a truthy attribute value', function () {
            var value = 'Arrrrrr!'

            dir.arg = 'value'
            dir.update(value)
            assert.strictEqual(el.getAttribute('value'), value)
        })

        it('should set attribute value to `0`', function () {
            dir.arg = 'value'
            dir.update(0)
            assert.strictEqual(el.getAttribute('value'), '0')
        })

        it('should remove an attribute if value is `false`', function () {
            dir.arg = 'disabled'
            el.setAttribute('disabled', 'disabled')
            dir.update(false)
            assert.strictEqual(el.getAttribute('disabled'), null)
        })

        it('should remove an attribute if value is `null`', function () {
            dir.arg = 'disabled'
            el.setAttribute('disabled', 'disabled')
            dir.update(null)
            assert.strictEqual(el.getAttribute('disabled'), null)
        })

        it('should remove an attribute if value is `undefined`', function () {
            dir.arg = 'disabled'
            el.setAttribute('disabled', 'disabled')
            dir.update(undefined)
            assert.strictEqual(el.getAttribute('disabled'), null)
        })

    })

    describe('text', function () {

        var dir = mockDirective('text')
        dir.bind()

        it('should work with a string', function () {
            dir.update('hallo')
            assert.strictEqual(dir.el.textContent, 'hallo')
        })

        it('should work with a number', function () {
            dir.update(12345)
            assert.strictEqual(dir.el.textContent, '12345')
        })

        it('should work with booleans', function () {
            dir.update(true)
            assert.strictEqual(dir.el.textContent, 'true')
        })

        it('should work with objects', function () {
            dir.update({foo:"bar"})
            assert.strictEqual(dir.el.textContent, '{"foo":"bar"}')
        })

        it('should be empty with null & undefined', function () {
            dir.update(null)
            assert.strictEqual(dir.el.textContent, '')
            dir.update(undefined)
            assert.strictEqual(dir.el.textContent, '')
        })
    })

    describe('html', function () {
        
        var dir = mockDirective('html')

        it('should work with a string', function () {
            dir.update('hi!!!')
            assert.strictEqual(dir.el.innerHTML, 'hi!!!')
            dir.update('<span>haha</span><a>lol</a>')
            assert.strictEqual(dir.el.querySelector('span').textContent, 'haha')
        })

        it('should work with a number', function () {
            dir.update(12345)
            assert.strictEqual(dir.el.innerHTML, '12345')
        })

        it('should work with booleans', function () {
            dir.update(true)
            assert.strictEqual(dir.el.textContent, 'true')
        })

        it('should work with objects', function () {
            dir.update({foo:"bar"})
            assert.strictEqual(dir.el.textContent, '{"foo":"bar"}')
        })

        it('should be empty with with null & undefined', function () {
            dir.update(null)
            assert.strictEqual(dir.el.innerHTML, '')
            dir.update(undefined)
            assert.strictEqual(dir.el.innerHTML, '')
        })

        it('should swap html if el is a comment placeholder', function () {
            var dir = mockDirective('html'),
                comment = document.createComment('hi'),
                parent = dir.el
            parent.innerHTML = 'what!'
            parent.appendChild(comment)
            dir.el = comment

            dir.bind()
            assert.ok(dir.nodes)

            var pre = 'what!',
                after = '<!--hi-->',
                h1 = '<span>hello</span><span>world</span>',
                h2 = '<a>whats</a><a>up</a>'
            dir.update(h1)
            assert.strictEqual(parent.innerHTML, pre + h1 + after)
            dir.update(h2)
            assert.strictEqual(parent.innerHTML, pre + h2 + after)
        })

    })

    describe('show', function () {
        
        var dir = mockDirective('show')

        it('should be default value when value is truthy', function () {
            dir.update(1)
            assert.strictEqual(dir.el.style.display, '')
            dir.update('hi!')
            assert.strictEqual(dir.el.style.display, '')
            dir.update(true)
            assert.strictEqual(dir.el.style.display, '')
            dir.update({})
            assert.strictEqual(dir.el.style.display, '')
            dir.update(function () {})
            assert.strictEqual(dir.el.style.display, '')
        })

        it('should be none when value is falsy', function () {
            dir.update(0)
            assert.strictEqual(dir.el.style.display, 'none')
            dir.update('')
            assert.strictEqual(dir.el.style.display, 'none')
            dir.update(false)
            assert.strictEqual(dir.el.style.display, 'none')
            dir.update(null)
            assert.strictEqual(dir.el.style.display, 'none')
            dir.update(undefined)
            assert.strictEqual(dir.el.style.display, 'none')
        })

    })

    describe('class', function () {

        function contains (el, cls) {
            var cur = ' ' + el.className + ' '
            return cur.indexOf(' ' + cls + ' ') > -1
        }

        it('should set class to the value if it has no arg', function () {
            var dir = mockDirective('class')
            dir.update('test')
            assert.ok(contains(dir.el, 'test'))
            dir.update('hoho')
            assert.ok(!contains(dir.el, 'test'))
            assert.ok(contains(dir.el, 'hoho'))
        })

        it('should add/remove class based on truthy/falsy if it has an arg', function () {
            var dir = mockDirective('class')
            dir.arg = 'test'
            dir.update(true)
            assert.ok(contains(dir.el, 'test'))
            dir.update(false)
            assert.ok(!contains(dir.el, 'test'))
        })

    })

    describe('model', function () {

        describe('input[checkbox]', function () {

            var dir = mockDirective('model', 'input', 'checkbox')
            dir.bind()

            before(function () {
                document.body.appendChild(dir.el)
            })

            it('should set checked on update()', function () {
                dir.update(true)
                assert.ok(dir.el.checked)
                dir.update(false)
                assert.ok(!dir.el.checked)
            })

            it('should trigger vm.$set when clicked', function () {
                var triggered = false
                dir.key = 'foo'
                dir.ownerVM = { $set: function (key, val) {
                    assert.strictEqual(key, 'foo')
                    assert.strictEqual(val, true)
                    triggered = true
                }}
                dir.el.dispatchEvent(mockMouseEvent('click'))
                assert.ok(triggered)
            })

            it('should remove event listener with unbind()', function () {
                var removed = true
                dir.ownerVM = {
                    $set: function () {
                       removed = false
                    }
                }
                dir.unbind()
                dir.el.dispatchEvent(mockMouseEvent('click'))
                assert.ok(removed)
            })

            after(function () {
                document.body.removeChild(dir.el)
            })

        })

        describe('input[radio]', function () {
            
            var dir1 = mockDirective('model', 'input', 'radio'),
                dir2 = mockDirective('model', 'input', 'radio')
            dir1.el.name = 'input-radio'
            dir2.el.name = 'input-radio'
            dir1.el.value = '12345'
            dir2.el.value = '54321'
            dir1.bind()
            dir2.bind()

            before(function () {
                document.body.appendChild(dir1.el)
                document.body.appendChild(dir2.el)
            })

            it('should set el.checked on update()', function () {
                assert.notOk(dir1.el.checked)
                dir1.update(12345)
                assert.ok(dir1.el.checked)
            })

            it('should trigger vm.$set when clicked', function () {
                var triggered = false
                dir2.key = 'radio'
                dir2.ownerVM = { $set: function (key, val) {
                    triggered = true
                    assert.strictEqual(key, 'radio')
                    assert.strictEqual(val, dir2.el.value)
                }}
                dir2.el.dispatchEvent(mockMouseEvent('click'))
                assert.ok(triggered)
                assert.ok(dir2.el.checked)
                assert.notOk(dir1.el.checked)
            })

            it('should remove listeners on unbind()', function () {
                var removed = true
                dir1.ownerVM = { $set: function () {
                    removed = false
                }}
                dir1.unbind()
                dir1.el.dispatchEvent(mockMouseEvent('click'))
                assert.ok(removed)
            })

            after(function () {
                document.body.removeChild(dir1.el)
                document.body.removeChild(dir2.el)
            })

        })

        describe('select', function () {
            
            var dir = mockDirective('model', 'select'),
                o1 = document.createElement('option'),
                o2 = document.createElement('option')
            o1.value = 0
            o2.value = 1
            dir.el.appendChild(o1)
            dir.el.appendChild(o2)
            dir.bind()

            before(function () {
                document.body.appendChild(dir.el)
            })

            it('should set value on update()', function () {
                dir.update(0)
                assert.strictEqual(dir.el.value, '0')
            })

            it('should trigger vm.$set when value is changed', function () {
                var triggered = false
                dir.key = 'select'
                dir.ownerVM = { $set: function (key, val) {
                    triggered = true
                    assert.strictEqual(key, 'select')
                    assert.equal(val, 1)
                }}
                dir.el.options.selectedIndex = 1
                dir.el.dispatchEvent(mockHTMLEvent('change'))
                assert.ok(triggered)
            })

            it('should remove listener on unbind()', function () {
                var removed = true
                dir.ownerVM = { $set: function () {
                    removed = false
                }}
                dir.unbind()
                dir.el.dispatchEvent(mockHTMLEvent('change'))
                assert.ok(removed)
            })

            after(function () {
                document.body.removeChild(dir.el)
            })

        })
        
        describe('input[text] and others', function () {
            
            var dir = mockDirective('model', 'input', 'text')
            dir.bind()
            
            before(function () {
                document.body.appendChild(dir.el)
            })

            it('should set the value on update()', function () {
                dir.update('foobar')
                assert.strictEqual(dir.el.value, 'foobar')
            })

            // `lazy` option is tested in the API suite
            it('should trigger vm.$set when value is changed via input', function () {
                var triggered = false
                dir.key = 'foo'
                dir.ownerVM = { $set: function (key, val) {
                    assert.ok(dir.lock, 'the directive should be locked if it has no filters')
                    assert.strictEqual(key, 'foo')
                    assert.strictEqual(val, 'bar')
                    triggered = true
                }}
                dir.el.value = 'bar'
                dir.el.dispatchEvent(mockHTMLEvent('input'))
                assert.ok(triggered)
            })

            it('should remove event listener with unbind()', function () {
                var removed = true
                dir.ownerVM = {
                    $set: function () {
                        removed = false
                    }
                }
                dir.unbind()
                dir.el.dispatchEvent(mockHTMLEvent('input'))
                assert.ok(removed)
            })

            it('should not lock during vm.$set if it has filters', function (done) {
                var triggered = false
                var dir = mockDirective('model', 'input', 'text')
                dir.filters = []
                dir.bind()
                dir.ownerVM = {$set:function () {
                    assert.notOk(dir.lock)
                    triggered = true
                }}
                dir.el.value = 'foo'
                document.body.appendChild(dir.el)
                dir.el.dispatchEvent(mockHTMLEvent('input'))
                // timeout becuase the update is async
                setTimeout(function () {
                    assert.ok(triggered)
                    document.body.removeChild(dir.el)
                    done()
                }, 1)
            })

            after(function () {
                document.body.removeChild(dir.el)
            })

        })

    })

    describe('on', function () {
        
        var dir = mockDirective('on')
        dir.arg = 'click'
        dir.bind()

        before(function () {
            document.body.appendChild(dir.el)
        })

        it('should set the handler to be triggered by arg through update()', function () {
            var triggered = false
            dir.update(function () {
                triggered = true
            })
            dir.el.dispatchEvent(mockMouseEvent('click'))
            assert.ok(triggered)
        })

        it('should remove previous handler when update() a new handler', function () {
            var triggered1 = false,
                triggered2 = false
            dir.update(function () {
                triggered1 = true
            })
            dir.update(function () {
                triggered2 = true
            })
            dir.el.dispatchEvent(mockMouseEvent('click'))
            assert.notOk(triggered1)
            assert.ok(triggered2)
        })

        it('should wrap the handler to supply expected args', function () {
            var vm = dir.binding.compiler.vm, // owner VM
                e  = mockMouseEvent('click'), // original event
                triggered = false
            dir.update(function (ev) {
                assert.strictEqual(this, vm, 'handler should be called on owner VM')
                assert.strictEqual(ev, e, 'event should be passed in')
                assert.strictEqual(ev.targetVM, dir.vm)
                triggered = true
            })
            dir.el.dispatchEvent(e)
            assert.ok(triggered)
        })

        it('should remove the handler in unbind()', function () {
            var triggered = false
            dir.update(function () {
                triggered = true
            })
            dir.unbind()
            dir.el.dispatchEvent(mockMouseEvent('click'))
            assert.notOk(triggered)
        })

        after(function () {
            document.body.removeChild(dir.el)
        })

    })

    describe('pre', function () {
        
        it('should skip compilation', function () {
            var testId = 'pre-test'
            mock(testId, '<span v-pre><strong>{{lol}}</strong><a v-text="hi"></a></span>')
            var t = new Vue({
                el: '#' + testId,
                data: {
                    lol: 'heyhey',
                    hi: 'hohoho'
                }
            })
            assert.strictEqual(t.$el.querySelector('strong').textContent, '{{lol}}')
            assert.strictEqual(t.$el.querySelector('a').textContent, '')
            assert.ok(t.$el.querySelector('a').hasAttribute('v-text'))
        })

    })

    describe('component', function () {
        
        it('should create a child viewmodel with given constructor', function () {
            var testId = 'component-test'
            mock(testId, '<div v-component="' + testId + '"></div>')
            var t = new Vue({
                el: '#' + testId,
                data: {
                    msg: '123'
                },
                components: {
                    'component-test': {
                        template: '<span>{{msg}}</span>'
                    }
                }
            })
            assert.strictEqual(t.$el.querySelector('span').textContent, '123')
        })

    })

    describe('with', function () {
        
        it('should create a child viewmodel with given data', function () {
            var testId = 'with-test'
            mock(testId, '<span v-component v-with="test">{{msg}}</span>')
            var t = new Vue({
                el: '#' + testId,
                data: {
                    test: {
                        msg: testId
                    }
                }
            })
            assert.strictEqual(t.$el.querySelector('span').textContent, testId)
        })

        it('should accept args and sync parent and child', function (done) {
            var t = new Vue({
                template:
                    '<span>{{test.msg}} {{n}}</span>'
                    + '<p v-component v-with="childMsg:test.msg, n:n" v-ref="child">{{childMsg}} {{n}}</p>',
                data: {
                    n: 1,
                    test: {
                        msg: 'haha!'
                    }
                }
            })

            nextTick(function () {
                assert.strictEqual(t.$el.querySelector('span').textContent, 'haha! 1')
                assert.strictEqual(t.$el.querySelector('p').textContent, 'haha! 1')
                testParentToChild()
            })
            
            function testParentToChild () {
                // test sync from parent to child
                t.test = { msg: 'hehe!' }
                nextTick(function () {
                    assert.strictEqual(t.$el.querySelector('p').textContent, 'hehe! 1')
                    testChildToParent()
                })
            }
            
            function testChildToParent () {
                // test sync back
                t.$.child.childMsg = 'hoho!'
                t.$.child.n = 2
                assert.strictEqual(t.test.msg, 'hoho!')
                assert.strictEqual(t.n, 2)
                nextTick(function () {
                    assert.strictEqual(t.$el.querySelector('span').textContent, 'hoho! 2')
                    assert.strictEqual(t.$el.querySelector('p').textContent, 'hoho! 2')
                    done()
                })
            }

        })

    })

    describe('ref', function () {

        var t
        
        it('should register a VM isntance on its parent\'s $', function () {
            var called = false
            var Child = Vue.extend({
                methods: {
                    test: function () {
                        called = true
                    }
                }
            })
            t = new Vue({
                template: '<div v-component="child" v-ref="hihi"></div>',
                components: {
                    child: Child
                }
            })
            assert.ok(t.$.hihi instanceof Child)
            t.$.hihi.test()
            assert.ok(called)
        })

        it('should remove the reference if child is destroyed', function () {
            t.$.hihi.$destroy()
            assert.notOk('hihi' in t.$)
        })

        it('should register an Array of VMs with v-repeat', function () {
            t = new Vue({
                template: '<p v-repeat="list" v-ref="list"></p>',
                data: { list: [{a:1}, {a:2}, {a:3}] }
            })
            assert.equal(t.$.list.length, 3)
            assert.ok(t.$.list[0] instanceof Vue)
            assert.equal(t.$.list[1].a, 2)
        })

        it('should work with interpolation', function () {
            t = new Vue({
                template: '<div v-component v-with="obj" v-ref="{{ok ? \'a\' : \'b\'}}"></div>',
                data: { obj: { a: 123 } }
            })
            assert.equal(t.$.b.a, 123)
        })

    })

    describe('partial', function () {
        
        it('should replace the node\'s content', function () {
            var t = new Vue({
                template: '<div v-partial="test"></div>',
                partials: {
                    test: '<a>ahahaha!</a>'
                }
            })
            assert.strictEqual(t.$el.innerHTML, '<div><a>ahahaha!</a></div>')
        })

        it('should work with interpolation', function () {
            var t = new Vue({
                template: '<div v-partial="{{ ready ? \'a\' : \'b\'}}"></div>',
                partials: {
                    a: 'A',
                    b: 'B'
                },
                data: {
                    ready: true
                }
            })
            assert.strictEqual(t.$el.innerHTML, '<div>A</div>')
        })

    })

    describe('style', function () {
        
        it('should apply a normal style', function () {
            var d = mockDirective('style')
            d.arg = 'text-align'
            d.bind()
            assert.strictEqual(d.prop, 'text-align')
            d.update('center')
            assert.strictEqual(d.el.style.textAlign, 'center')
        })

        it('should apply style with !important priority', function () {
            var d = mockDirective('style')
            d.arg = 'font-size'
            d.bind()
            d.update('100px !important')
            assert.strictEqual(d.el.style.getPropertyPriority('font-size'), 'important')
        })

        it('should auto prefix styles', function () {
            var d = mockDirective('style')
            d.arg = '$transform'
            d.bind()
            assert.ok(d.prefixed)
            assert.strictEqual(d.prop, 'transform')

            // mock the el's CSSStyleDeclaration object
            // so we can test setProperty calls
            var results = []
            d.el = {
                style: {
                    setProperty: function (prop, value) {
                        results.push({
                            prop: prop,
                            value: value
                        })
                    }
                }
            }

            var val = 'scale(2)'
            d.update(val)
            assert.strictEqual(results.length, 4)
            assert.strictEqual(results[0].prop, 'transform')
            assert.strictEqual(results[1].prop, '-ms-transform')
            assert.strictEqual(results[2].prop, '-moz-transform')
            assert.strictEqual(results[3].prop, '-webkit-transform')

            assert.strictEqual(results[0].value, val)
            assert.strictEqual(results[1].value, val)
            assert.strictEqual(results[2].value, val)
            assert.strictEqual(results[3].value, val)
        })

        it('should set cssText if no arg', function () {
            var d = mockDirective('style')
            d.bind()
            var val = 'color:#fff'
            d.update(val)
            assert.strictEqual(d.el.style.color, 'rgb(255, 255, 255)')
        })

        it('should work with numbers', function () {
            var d = mockDirective('style')
            d.arg = 'line-height'
            d.bind()
            d.update(0)
            assert.strictEqual(d.el.style.lineHeight, '0')
        })

    })

    describe('cloak', function () {
        
        it('should remove itself after the instance is ready', function () {
            // it doesn't make sense to test with a mock for this one, so...
            var v = new Vue({
                template: '<div v-cloak></div>',
                replace: true,
                ready: function () {
                    // this hook is attached before the v-cloak hook
                    // so it should still have the attribute
                    assert.ok(this.$el.hasAttribute('v-cloak'))
                }
            })
            assert.notOk(v.$el.hasAttribute('v-cloak'))
        })

    })

    describe('if', function () {

        var v

        it('should create and insert the childVM when value is truthy', function () {

            v = new Vue({
                template: '<div v-if="ok">{{msg}}</div>',
                data: {
                    ok: true,
                    msg: 'hello'
                }
            })
            assert.strictEqual(v.$el.innerHTML, '<div>hello</div><!--vue-if-->')

        })

        it('should destroy childVM and remove content when value is falsy', function (done) {

            v.ok = false
            nextTick(function () {
                assert.strictEqual(v.$el.innerHTML, '<!--vue-if-->')
                done()
            })

        })

        it('should work with v-component', function (done) {
            
            v = new Vue({
                template: '<div v-if="ok" v-component="test"></div>',
                data: {
                    ok: true,
                    msg: 'hello'
                },
                components: {
                    test: {
                        template: '{{msg}}'
                    }
                }
            })
            assert.strictEqual(v.$el.innerHTML, '<div>hello</div><!--vue-if-->')

            v.ok = false
            nextTick(function () {
                assert.strictEqual(v.$el.innerHTML, '<!--vue-if-->')
                done()
            })

        })

    })

    describe('view', function () {
        
        it('should dynamically switch components', function (done) {
            
            var v = new Vue({
                template: '<div v-view="view" class="view"></div>',
                data: {
                    view: 'a'
                },
                components: {
                    a: { template: 'A' },
                    b: { template: 'B' }
                }
            })

            assert.equal(
                v.$el.innerHTML,
                '<div class="view">A</div><!--v-view-->'
            )
            v.view = 'b'

            nextTick(function () {
                assert.equal(
                    v.$el.innerHTML,
                    '<div class="view">B</div><!--v-view-->'
                )
                done()
            })

        })

    })

    // More detailed testing for v-repeat can be found in functional tests.
    // this is mainly for code coverage
    describe('repeat', function () {

        it('should work', function (done) {
            var handlerCalled = false
            var v = new Vue({
                template: '<span v-repeat="items" v-on="click:check">{{title}}</span>',
                data: {
                    items: [
                        {title: 1},
                        {title: 2}
                    ]
                },
                methods: {
                    check: function (e) {
                        assert.ok(e.targetVM instanceof VM)
                        assert.strictEqual(this, v)
                        handlerCalled = true
                    }
                }
            })
            nextTick(function () {
                assert.equal(v.$el.innerHTML, '<span>1</span><span>2</span><!--v-repeat-items-->')
                v.items.push({title:3})
                v.items.pop()
                v.items.unshift({title:0})
                v.items.shift()
                v.items.splice(0, 1, {title:-1})
                v.items.sort(function (a, b) {
                    return a.title > b.title
                })
                v.items.reverse()
                nextTick(function () {
                    assert.equal(v.$el.innerHTML, '<span>2</span><span>-1</span><!--v-repeat-items-->')
                    testHandler()
                })
            })

            function testHandler () {
                document.getElementById('test').appendChild(v.$el)
                var span = v.$el.querySelector('span'),
                    e = mockMouseEvent('click')
                span.dispatchEvent(e)
                nextTick(function () {
                    assert.ok(handlerCalled)
                    done()
                })
            }
        })

        it('should work with primitive values', function () {
            var v = new Vue({
                template: '<span v-repeat="tags">{{$value}}</span>',
                data: {
                    tags: ['a', 'b', 'c']
                },
                computed: {
                    concat: function () {
                        return this.tags.join(',')
                    }
                }
            })
            assert.strictEqual(v.concat, 'a,b,c')
            assert.strictEqual(v.$el.textContent, 'abc')
        })

        it('should diff and reuse existing VMs when reseting arrays', function (done) {
            var v = new Vue({
                template: '<span v-repeat="tags" v-ref="tags">{{$value}}</span>',
                data: {
                    tags: ['a', 'b', 'c']
                }
            })
            var oldVMs = v.$.tags
            v.tags = v.tags.slice()
            nextTick(function () {
                assert.deepEqual(oldVMs, v.$.tags)
                done()
            })
        })
        
        it('should also work on objects', function (done) {
            var v = new Vue({
                template: '<span v-repeat="obj">{{$key}} {{msg}}</span>',
                data: {
                    obj: {
                        a: {
                            msg: 'hi!'
                        },
                        b: {
                            msg: 'ha!'
                        }
                    }
                }
            })
            assert.strictEqual(v.$el.textContent, 'a hi!b ha!')

            v.obj.a.msg = 'ho!'
            
            nextTick(function () {
                assert.strictEqual(v.$el.textContent, 'a ho!b ha!')
                testAddKey()
            })

            function testAddKey () {
                v.obj.$add('c', { msg: 'he!' })
                nextTick(function () {
                    assert.strictEqual(v.$el.textContent, 'a ho!b ha!c he!')
                    assert.strictEqual(v.obj.c.msg, 'he!')
                    testRemoveKey()
                })
            }

            function testRemoveKey () {
                v.obj.$delete('a')
                nextTick(function () {
                    assert.strictEqual(v.$el.textContent, 'b ha!c he!')
                    assert.strictEqual(v.obj.a, undefined)
                    testSwap()
                })
            }

            function testSwap () {
                v.obj.b = { msg: 'hehe' }
                nextTick(function () {
                    assert.strictEqual(v.$el.textContent, 'b hehec he!')
                    testRootSwap()
                })
            }

            function testRootSwap () {
                v.obj = { b: { msg: 'wa'}, c: {msg: 'wo'} }
                nextTick(function () {
                    assert.strictEqual(v.$el.textContent, 'b wac wo')
                    done()
                })
            }
           
        })

        it('should accept arg for aliasing on primitive arrays', function () {
            
            var v = new Vue({
                template: '<span v-repeat="item:items" >{{item}}</span>',
                data: {
                    items: [1,2,3]
                }
            })
            assert.strictEqual(v.$el.textContent, '123')

        })

        it('should accept arg for aliasing on object arrays', function () {
            
            var v = new Vue({
                template: '<span v-repeat="item:items">{{item.id}}</span>',
                data: {
                    items: [{id:1},{id:2},{id:3}]
                }
            })
            assert.strictEqual(v.$el.textContent, '123')

        })

    })

})

function mockDirective (dirName, tag, type) {
    var dir = Vue.directive(dirName),
        ret = {
            binding: { compiler: { vm: {} } },
            compiler: { vm: {}, options: {}, execHook: function () {}},
            el: document.createElement(tag || 'div')
        }
    if (typeof dir === 'function') {
        ret.update = dir
    } else {
        for (var key in dir) {
            ret[key] = dir[key]
            ret._update = dir.update
            ret._unbind = dir.unbind
        }
    }
    if (tag === 'input') ret.el.type = type || 'text'
    return ret
}