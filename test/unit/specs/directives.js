describe('UNIT: Directives', function () {

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

        it('should be empty with other stuff', function () {
            dir.update(null)
            assert.strictEqual(dir.el.textContent, '')
            dir.update(undefined)
            assert.strictEqual(dir.el.textContent, '')
            dir.update(function () {})
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

        it('should be empty with other stuff', function () {
            dir.update(null)
            assert.strictEqual(dir.el.innerHTML, '')
            dir.update(undefined)
            assert.strictEqual(dir.el.innerHTML, '')
            dir.update(function () {})
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
            assert.ok(dir.holder)
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

    describe('if', function () {

        it('should remain detached if it was detached during bind() and never attached', function () {
            var dir = mockDirective('if')
            dir.bind()
            dir.update(true)
            assert.notOk(dir.el.parentNode)
            dir.update(false)
            assert.notOk(dir.el.parentNode)
        })

        it('should remove el and insert ref when value is falsy', function () {
            var dir = mockDirective('if'),
                parent = document.createElement('div')
            parent.appendChild(dir.el)
            dir.bind()
            dir.update(false)
            assert.notOk(dir.el.parentNode)
            assert.notOk(parent.contains(dir.el))
            // phantomJS weird bug:
            // Node.contains() returns false when argument is a comment node.
            assert.strictEqual(dir.ref.parentNode, parent)
        })

        it('should append el and remove ref when value is truthy', function () {
            var dir = mockDirective('if'),
                parent = document.createElement('div')
            parent.appendChild(dir.el)
            dir.bind()
            dir.update(false)
            dir.update(true)
            assert.strictEqual(dir.el.parentNode, parent)
            assert.ok(parent.contains(dir.el))
            assert.notOk(parent.contains(dir.ref))
        })

        it('should work even if it was detached during bind()', function () {
            var dir = mockDirective('if')
            dir.bind()
            var parent = document.createElement('div')
            parent.appendChild(dir.el)

            dir.update(false)
            assert.strictEqual(dir.parent, parent)
            assert.notOk(dir.el.parentNode)
            assert.notOk(parent.contains(dir.el))
            assert.strictEqual(dir.ref.parentNode, parent)

            dir.update(true)
            assert.strictEqual(dir.el.parentNode, parent)
            assert.ok(parent.contains(dir.el))
            assert.notOk(parent.contains(dir.ref))
        })

    })

    describe('on', function () {
        
        var dir = mockDirective('on')
        dir.arg = 'click'

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

        it('delegation should work', function () {
            var triggered = false,
                child = document.createElement('div')
            dir.el.appendChild(child)
            dir.update(function () {
                triggered = true
            })
            child.dispatchEvent(mockMouseEvent('click'))
            assert.ok(triggered)
        })

        it('should wrap the handler to supply expected args', function () {
            var vm = dir.binding.compiler.vm, // owner VM
                e  = mockMouseEvent('click'), // original event
                triggered = false
            dir.update(function (ev) {
                assert.strictEqual(this, vm, 'handler should be called on owner VM')
                assert.strictEqual(ev, e, 'event should be passed in')
                assert.strictEqual(ev.vm, dir.vm)
                triggered = true
            })
            dir.el.dispatchEvent(e)
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

        it('should remove the handler in unbind()', function () {
            var triggered = false
            dir.update(function () {
                triggered = true
            })
            dir.unbind()
            dir.el.dispatchEvent(mockMouseEvent('click'))
            assert.notOk(triggered)
        })

        it('should not use delegation if the event is blur or focus', function () {
            var dir = mockDirective('on', 'input'),
                triggerCount = 0,
                handler = function () {
                    triggerCount++
                }

            document.body.appendChild(dir.el)

            dir.arg = 'focus'
            dir.update(handler)
            dir.el.dispatchEvent(mockHTMLEvent('focus'))
            assert.strictEqual(triggerCount, 1)

            dir.arg = 'blur'
            dir.update(handler)
            dir.el.dispatchEvent(mockHTMLEvent('blur'))
            assert.strictEqual(triggerCount, 2)

            document.body.removeChild(dir.el)

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
            mock(testId, '<span v-with="test">{{msg}}</span>')
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
                    + '<p v-with="childMsg:test.msg, n:n" v-ref="child">{{childMsg}} {{n}}</p>',
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
        
        it('should register a VM isntance on its parent\'s $', function () {
            var called = false
            var Child = Vue.extend({
                methods: {
                    test: function () {
                        called = true
                    }
                }
            })
            var t = new Vue({
                template: '<div v-component="child" v-ref="hihi"></div>',
                components: {
                    child: Child
                }
            })
            assert.ok(t.$.hihi instanceof Child)
            t.$.hihi.test()
            assert.ok(called)
            t.$.hihi.$destroy()
            assert.notOk('hihi' in t.$)
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
                template: '<span v-repeat="tags" v-ref="tags">{{$value}}</span>',
                data: {
                    tags: ['a', 'b', 'c']
                }
            })
            assert.strictEqual(v.$el.textContent, 'abc')
            v.$.tags[0].$value = 'd'
            assert.strictEqual(v.tags[0], 'd')
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
                v.obj.$repeater.push({ $key: 'c', msg: 'he!' })
                nextTick(function () {
                    assert.strictEqual(v.$el.textContent, 'a ho!b ha!c he!')
                    assert.strictEqual(v.obj.c.msg, 'he!')
                    testRemoveKey()
                })
            }

            function testRemoveKey () {
                v.obj.$repeater.shift()
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

    })

    describe('style', function () {
        
        it('should apply a normal style', function () {
            var d = mockDirective('style')
            d.arg = 'text-align'
            d.bind()
            assert.strictEqual(d.prop, 'textAlign')
            d.update('center')
            assert.strictEqual(d.el.style.textAlign, 'center')
        })

        it('should apply prefixed style', function () {
            var d = mockDirective('style')
            d.arg = '-webkit-transform'
            d.bind()
            assert.strictEqual(d.prop, 'webkitTransform')
            d.update('scale(2)')
            assert.strictEqual(d.el.style.webkitTransform, 'scale(2)')
        })

        it('should auto prefix styles', function () {
            var d = mockDirective('style')
            d.arg = '$transform'
            d.bind()
            assert.ok(d.prefixed)
            assert.strictEqual(d.prop, 'transform')
            var val = 'scale(2)'
            d.update(val)
            assert.strictEqual(d.el.style.transform, val)
            assert.strictEqual(d.el.style.webkitTransform, val)
            assert.strictEqual(d.el.style.mozTransform, val)
            assert.strictEqual(d.el.style.msTransform, val)
        })

        it('should set cssText if no arg', function () {
            var d = mockDirective('style')
            d.bind()
            var val = 'color:#fff'
            d.update(val)
            assert.strictEqual(d.el.style.color, 'rgb(255, 255, 255)')
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
        }
    }
    if (tag === 'input') ret.el.type = type || 'text'
    return ret
}