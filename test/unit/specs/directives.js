/*
 *  Only tests directives in `src/directives/index.js`
 *  and the non-delegated case for `v-on`
 *
 *  The combination of `v-repeat` and `v-on` are covered in
 *  the E2E test case for repeated items.
 */

describe('UNIT: Directives', function () {
    
    describe('attr', function () {

        var dir = mockDirective('attr')
        dir.arg = 'href'

        it('should set an attribute', function () {
            var url = 'http://a.b.com'
            dir.update(url)
            assert.strictEqual(dir.el.getAttribute('href'), url)
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

        it('should be empty with other stuff', function () {
            dir.update(null)
            assert.strictEqual(dir.el.textContent, '')
            dir.update(undefined)
            assert.strictEqual(dir.el.textContent, '')
            dir.update({a:123})
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

        it('should be empty with other stuff', function () {
            dir.update(null)
            assert.strictEqual(dir.el.innerHTML, '')
            dir.update(undefined)
            assert.strictEqual(dir.el.innerHTML, '')
            dir.update({a:123})
            assert.strictEqual(dir.el.innerHTML, '')
            dir.update(function () {})
            assert.strictEqual(dir.el.innerHTML, '')
        })

    })

    describe('style', function () {
        
        var dir = mockDirective('style')

        it('should convert the arg from dash style to camel case', function () {
            dir.arg = 'font-family'
            dir.bind()
            assert.strictEqual(dir.arg, 'fontFamily')
            dir.arg = '-webkit-transform'
            dir.bind()
            assert.strictEqual(dir.arg, 'webkitTransform')
        })

        it('should update the element style', function () {
            dir.update('rotate(20deg)')
            assert.strictEqual(dir.el.style.webkitTransform, 'rotate(20deg)')
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

    describe('visible', function () {
        
        var dir = mockDirective('visible')

        it('should be default value when value is truthy', function () {
            dir.update(1)
            assert.strictEqual(dir.el.style.visibility, '')
            dir.update('hi!')
            assert.strictEqual(dir.el.style.visibility, '')
            dir.update(true)
            assert.strictEqual(dir.el.style.visibility, '')
            dir.update({})
            assert.strictEqual(dir.el.style.visibility, '')
            dir.update(function () {})
            assert.strictEqual(dir.el.style.visibility, '')
        })

        it('should be hidden when value is falsy', function () {
            dir.update(0)
            assert.strictEqual(dir.el.style.visibility, 'hidden')
            dir.update('')
            assert.strictEqual(dir.el.style.visibility, 'hidden')
            dir.update(false)
            assert.strictEqual(dir.el.style.visibility, 'hidden')
            dir.update(null)
            assert.strictEqual(dir.el.style.visibility, 'hidden')
            dir.update(undefined)
            assert.strictEqual(dir.el.style.visibility, 'hidden')
        })

    })

    describe('class', function () {

        it('should set class to the value if it has no arg', function () {
            var dir = mockDirective('class')
            dir.update('test')
            assert.ok(dir.el.classList.contains('test'))
            dir.update('hoho')
            assert.ok(!dir.el.classList.contains('test'))
            assert.ok(dir.el.classList.contains('hoho'))
        })

        it('should add/remove class based on truthy/falsy if it has an arg', function () {
            var dir = mockDirective('class')
            dir.arg = 'test'
            dir.update(true)
            assert.ok(dir.el.classList.contains('test'))
            dir.update(false)
            assert.ok(!dir.el.classList.contains('test'))
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
                dir.vm = { $set: function (key, val) {
                    assert.strictEqual(key, 'foo')
                    assert.strictEqual(val, true)
                    triggered = true
                }}
                dir.el.dispatchEvent(mockMouseEvent('click'))
                assert.ok(triggered)
            })

            it('should remove event listener with unbind()', function () {
                var removed = true
                dir.vm.$set = function () {
                    removed = false
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
                dir2.vm = { $set: function (key, val) {
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
                dir1.vm = { $set: function () {
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
                dir.vm = { $set: function (key, val) {
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
                dir.vm = { $set: function () {
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
                dir.vm = { $set: function (key, val) {
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
                dir.vm.$set = function () {
                    removed = false
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
                dir.vm = {$set:function () {
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

    describe('on (non-delegated only)', function () {
        
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
            assert.strictEqual(dir.handler, null, 'should remove reference to handler')
            assert.strictEqual(dir.el.vue_viewmodel, null, 'should remove reference to VM on the element')
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
                scope: {
                    lol: 'heyhey',
                    hi: 'hohoho'
                }
            })
            assert.strictEqual(t.$el.querySelector('strong').textContent, '{{lol}}')
            assert.strictEqual(t.$el.querySelector('a').textContent, '')
            assert.ok(t.$el.querySelector('a').hasAttribute('v-text'))
        })

    })

    describe('id', function () {
        
        it('should register a VM isntance on its parent\'s $', function () {
            var called = false
            var Child = Vue.extend({
                proto: {
                    test: function () {
                        called = true
                    }
                }
            })
            var t = new Vue({
                template: '<div v-component="child" v-id="hihi"></div>',
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

})

function mockDirective (dirName, tag, type) {
    var dir = Vue.directive(dirName),
        ret = {
            binding: { compiler: { vm: {} } },
            compiler: { vm: {}, options: {} },
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