describe('UNIT: Transition', function () {

    var transition = require('vue/src/transition'),
        config     = require('vue/src/config'),
        codes      = transition.codes,
        endEvent   = sniffTransitionEndEvent(),
        enterClass = config.enterClass,
        leaveClass = config.leaveClass

    describe('General', function () {
        
        it('should skip if compiler is in init stage', function () {
            var c = mockChange(),
                code = transition(null, 1, c.change, { init: true })
            assert.ok(c.called)
            assert.strictEqual(code, codes.INIT)
        })

        it('should skip if no transition is found on the node', function () {
            var c = mockChange(),
                code = transition(mockEl(), 1, c.change, {})
            assert.ok(c.called)
            assert.strictEqual(code, codes.SKIP)
        })

    })

    describe('CSS class transition', function () {

        if (!endEvent) { // IE9 only test case

            it('should skip if transition is not available', function () {
                var c = mockChange(),
                    code = transition(mockEl('css'), 1, c.change, {})
                assert.ok(c.called)
                assert.strictEqual(code, codes.CSS_SKIP)
            })

            // skip the rest
            return

        }

        describe('enter', function () {

            var el = mockEl('css'),
                c = mockChange(function () {
                    c.called = true
                    assert.ok(el.classList.contains(enterClass))
                }),
                code,
                cbCalled = false
            el.vue_trans_cb = function () {
                cbCalled = true
            }
            el.addEventListener(endEvent, el.vue_trans_cb)

            it('should add the class before calling changeState()', function () {
                code = transition(el, 1, c.change, {})
                assert.ok(c.called)
            })

            it('should remove unfinished leave callback if exists', function () {
                assert.notOk(el.vue_trans_cb)
                var e = mockHTMLEvent(endEvent)
                el.dispatchEvent(e)
                assert.notOk(cbCalled)
            })
            
            it('should remove the class afterwards', function () {
                assert.notOk(el.classList.contains(enterClass))
            })

            it('should return correct code', function () {
                assert.strictEqual(code, codes.CSS_E)
            })

        })

        describe('leave', function () {

            var el = mockEl('css'),
                c = mockChange(),
                code = transition(el, -1, c.change, {})

            it('should attach an ontransitionend listener', function () {
                assert.ok(typeof el.vue_trans_cb === 'function')
            })

            it('should add the class', function () {
                assert.ok(el.classList.contains(leaveClass))
            })

            it('should call changeState on transitionend', function () {
                var e = mockHTMLEvent(endEvent)
                el.dispatchEvent(e)
                assert.ok(c.called)
            })

            it('should remove the callback after called', function () {
                assert.notOk(el.vue_trans_cb)
                var e = mockHTMLEvent(endEvent)
                el.dispatchEvent(e)
                assert.strictEqual(c.n, 1)
            })

            it('should remove the class after called', function () {
                assert.notOk(el.classList.contains(leaveClass))
            })

            it('should return correct code', function () {
                assert.strictEqual(code, codes.CSS_L)
            })

        })

    })

    describe('JavaScript transition', function () {

        it('should skip if correspinding option is not defined', function () {
            var c = mockChange(),
                code = transition(mockEl('js'), 1, c.change, {
                    getOption: function () {}
                })
            assert.ok(c.called)
            assert.strictEqual(code, codes.JS_SKIP)
        })

        it('should skip if the option is given but the enter/leave func is not defined', function () {
            var c = mockChange(),
                code = transition(mockEl('js'), 1, c.change, {
                    getOption: function () {
                        return {}
                    }
                })
            assert.ok(c.called)
            assert.strictEqual(code, codes.JS_SKIP_E)

            c = mockChange()
            code = transition(mockEl('js'), -1, c.change, {
                getOption: function () {
                    return {}
                }
            })
            assert.ok(c.called)
            assert.strictEqual(code, codes.JS_SKIP_L)
        })

        describe('enter', function () {

            var code,
                c = mockChange(),
                el = mockEl('js'),
                def = {
                    enter: function (element, change) {
                        assert.strictEqual(el, element)
                        change()
                    }
                }

            it('should call the enter function', function () {
                code = transition(el, 1, c.change, {
                    getOption: function () {
                        return def
                    }
                })
                assert.ok(c.called)
            })

            it('should return correct code', function () {
                assert.strictEqual(code, codes.JS_E)
            })

        })

        describe('leave', function () {

            var code,
                c = mockChange(),
                el = mockEl('js'),
                def = {
                    leave: function (element, change) {
                        assert.strictEqual(el, element)
                        change()
                    }
                }

            it('should call the leave function', function () {
                code = transition(el, -1, c.change, {
                    getOption: function () {
                        return def
                    }
                })
                assert.ok(c.called)
            })

            it('should return correct code', function () {
                assert.strictEqual(code, codes.JS_L)
            })

        })

    })

    function mockChange (change) {
        var c = {
            called: false,
            n: 0,
            change: change || function () {
                c.called = true
                c.n += 1
            }
        }
        return c
    }

    function mockEl (type) {
        var el = document.createElement('div')
        if (type === 'css') {
            el.vue_trans = ''
        } else if (type === 'js') {
            el.vue_trans = 'test'
        }
        return el
    }

    function sniffTransitionEndEvent () {
        var el = document.createElement('vue'),
            defaultEvent = 'transitionend',
            events = {
                'transition'       : defaultEvent,
                'MozTransition'    : defaultEvent,
                'WebkitTransition' : 'webkitTransitionEnd'
            }
        for (var name in events) {
            if (el.style[name] !== undefined) {
                return events[name]
            }
        }
    }

})