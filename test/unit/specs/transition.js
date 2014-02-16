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
                compiler = mockCompiler()
            compiler.init = true
            var code = transition(null, 1, c.change, compiler)
            assert.ok(c.called)
            assert.strictEqual(code, codes.INIT)
            assert.ok(compiler.attached)
        })

        it('should skip if no transition is found on the node', function () {
            var c = mockChange(),
                compiler = mockCompiler(),
                code = transition(mockEl(), 1, c.change, compiler)
            assert.ok(c.called)
            assert.strictEqual(code, codes.SKIP)
            assert.ok(compiler.attached)
        })

    })

    describe('CSS class transition', function () {

        if (!endEvent) { // IE9 only test case

            it('should skip if transition is not available', function () {
                var c = mockChange(),
                    compiler = mockCompiler(),
                    code = transition(mockEl('css'), 1, c.change, compiler)
                assert.ok(c.called)
                assert.strictEqual(code, codes.CSS_SKIP)
                assert.ok(compiler.attached)
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
                compiler = mockCompiler(),
                code,
                cbCalled = false
            el.vue_trans_cb = function () {
                cbCalled = true
            }
            el.addEventListener(endEvent, el.vue_trans_cb)

            it('should add the class before calling changeState()', function () {
                code = transition(el, 1, c.change, compiler)
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

            it('should have called attached hook', function () {
                assert.ok(compiler.attached)
            })

        })

        describe('leave', function () {

            var el = mockEl('css'),
                c = mockChange(),
                compiler = mockCompiler(),
                code

            before(function () {
                document.body.appendChild(el)
            })

            it('should call change immediately if el is invisible', function () {
                var el = mockEl('css'),
                    c = mockChange(),
                    compiler = mockCompiler()
                code = transition(el, -1, c.change, compiler)
                assert.ok(c.called)
                assert.ok(compiler.detached)
            })

            it('should attach an ontransitionend listener', function () {
                el.style.width = '1px'
                code = transition(el, -1, c.change, compiler)
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

            it('should have called detached hook', function () {
                assert.ok(compiler.detached)
            })

        })

    })

    describe('JavaScript transition', function () {

        it('should skip if correspinding option is not defined', function () {
            var c = mockChange(),
                compiler = mockCompiler(),
                code = transition(mockEl('js'), 1, c.change, compiler)
            assert.ok(c.called)
            assert.strictEqual(code, codes.JS_SKIP)
            assert.ok(compiler.attached)
        })

        it('should skip if the option is given but the enter/leave func is not defined', function () {
            var c = mockChange(),
                compiler = mockCompiler({}),
                code = transition(mockEl('js'), 1, c.change, compiler)
            assert.ok(c.called)
            assert.strictEqual(code, codes.JS_SKIP_E)
            assert.ok(compiler.attached)

            c = mockChange()
            compiler = mockCompiler({})
            code = transition(mockEl('js'), -1, c.change, compiler)
            assert.ok(c.called)
            assert.strictEqual(code, codes.JS_SKIP_L)
            assert.ok(compiler.detached)
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
                },
                compiler = mockCompiler(def)

            it('should call the enter function', function () {
                code = transition(el, 1, c.change, compiler)
                assert.ok(c.called)
            })

            it('should return correct code', function () {
                assert.strictEqual(code, codes.JS_E)
            })

            it('should have called attached hook', function () {
                assert.ok(compiler.attached)
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
                },
                compiler = mockCompiler(def)

            it('should call the leave function', function () {
                code = transition(el, -1, c.change, compiler)
                assert.ok(c.called)
            })

            it('should return correct code', function () {
                assert.strictEqual(code, codes.JS_L)
            })

            it('should have called detached hook', function () {
                assert.ok(compiler.detached)
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

    function mockCompiler (opt) {
        return {
            getOption: function () {
                return opt
            },
            execHook: function (hook) {
                this[hook] = true
            }
        }
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