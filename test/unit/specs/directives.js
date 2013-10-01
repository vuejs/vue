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
        // body...
    })

    describe('if', function () {
        // body...
    })

    describe('style', function () {
        // body...
    })

    describe('on (non-delegated only)', function () {
        // body...
    })

})

function mockDirective (dirName, tag) {
    var dir = seed.directive(dirName),
        ret = {
            el: document.createElement(tag || 'div')
        }
    if (typeof dir === 'function') {
        ret.update = dir
    } else {
        for (var key in dir) {
            ret[key] = dir[key]
        }
    }
    if (tag === 'input') ret.el.type = 'text'
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