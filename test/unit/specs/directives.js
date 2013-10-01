/*
 *  Only tests directives in `src/directives/index.js`
 *  and the non-delegated case for `sd-on`
 *
 *  The combination of `sd-each` and `sd-on` are covered in
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

        it('should be empty with other stuff', function () {
            dir.update(null)
            assert.strictEqual(dir.el.textContent, '')
            dir.update(false)
            assert.strictEqual(dir.el.textContent, '')
            dir.update(true)
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

        it('should be empty with other stuff', function () {
            dir.update(null)
            assert.strictEqual(dir.el.innerHTML, '')
            dir.update(false)
            assert.strictEqual(dir.el.innerHTML, '')
            dir.update(true)
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

    describe('focus', function () {
        
        var dir = mockDirective('focus', 'input')

        it('should focus on the element', function (done) {
            var focused = false
            // the el needs to be in the dom and visible to actually
            // trigger the focus event
            document.body.appendChild(dir.el)
            dir.el.addEventListener('focus', function () {
                focused = true
            })
            dir.update(true)
            // the focus event has a 0ms timeout to make it async
            setTimeout(function () {
                assert.ok(focused)
                document.body.removeChild(dir.el)
                done()
            }, 0)
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

    describe('value', function () {
        
        var dir = mockDirective('value', 'input')
        dir.bind()
        
        before(function () {
            document.body.appendChild(dir.el)
        })

        it('should set the value on update()', function () {
            dir.update('foobar')
            assert.strictEqual(dir.el.value, 'foobar')
        })

        it('should trigger vm.$set when value is changed via keyup', function () {
            var triggered = false
            dir.key = 'foo'
            dir.vm = { $set: function (key, val) {
                assert.strictEqual(key, 'foo')
                assert.strictEqual(val, 'bar')
                triggered = true
            }}
            dir.el.value = 'bar'
            dir.el.dispatchEvent(mockKeyEvent('keyup'))
            assert.ok(triggered)
        })

        it('should remove event listener with unbind()', function () {
            var removed = true
            dir.vm.$set = function () {
                removed = false
            }
            dir.unbind()
            dir.el.dispatchEvent(mockKeyEvent('keyup'))
            assert.ok(removed)
        })

        after(function () {
            document.body.removeChild(dir.el)
        })

    })

    describe('checked', function () {
        
        var dir = mockDirective('checked', 'input', 'checkbox')
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

        it('should trigger vm.$set on change event', function () {
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

    describe('if', function () {
        // body...
    })

    describe('on (non-delegated only)', function () {
        
        var dir = mockDirective('on')
        dir.arg = 'click'

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
            assert.strictEqual(dir.el.sd_viewmodel, null, 'should remove reference to VM on the element')
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
            dir.el.focus()
            assert.strictEqual(triggerCount, 1)

            dir.arg = 'blur'
            dir.update(handler)
            dir.el.blur()
            assert.strictEqual(triggerCount, 2)

            document.body.removeChild(dir.el)

        })

    })

})

function mockDirective (dirName, tag, type) {
    var dir = seed.directive(dirName),
        ret = {
            binding: { compiler: { vm: {} } },
            compiler: { vm: {} },
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

function mockKeyEvent (type) {
    var e = document.createEvent('KeyboardEvent'),
        initMethod = e.initKeyboardEvent
            ? 'initKeyboardEvent'
            : 'initKeyEvent'
    e[initMethod](type, true, true, null, false, false, false, false, 9, 0)
    return e
}

function mockMouseEvent (type) {
    var e = document.createEvent('MouseEvent')
    e.initMouseEvent(type, true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
    return e
}