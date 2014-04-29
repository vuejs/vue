describe('Transition', function () {

    var transition = require('vue/src/transition'),
        config     = require('vue/src/config'),
        codes      = transition.codes,
        endEvents  = transition.sniff(),
        enterClass = config.enterClass,
        leaveClass = config.leaveClass,
        nextTick   = Vue.nextTick

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

    describe('CSS Transitions', function () {

        if (!endEvents.trans) { // IE9 only test case

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

        describe('enter: transition', function () {

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
            el.addEventListener(endEvents.trans, el.vue_trans_cb)

            it('should add the class before calling changeState()', function () {
                code = transition(el, 1, c.change, compiler)
                assert.ok(c.called)
            })

            it('should remove unfinished leave callback if exists', function () {
                assert.notOk(el.vue_trans_cb)
                var e = mockHTMLEvent(endEvents.trans)
                el.dispatchEvent(e)
                assert.notOk(cbCalled)
            })

            it('should remove the v-leave class if the leave callback exists', function () {
                var el = mockEl('css')
                document.body.appendChild(el)
                el.style.width = '1px'
                code = transition(el, -1, function(){}, compiler)
                code = transition(el, 1, function(){}, compiler)
                assert.notOk(el.classList.contains(leaveClass))
            })

            it('should remove the class afterwards', function (done) {
                nextTick(function () {
                    assert.notOk(el.classList.contains(enterClass))
                    done()
                })
            })

            it('should return correct code', function () {
                assert.strictEqual(code, codes.CSS_E)
            })

            it('should have called attached hook', function () {
                assert.ok(compiler.attached)
            })

        })

        describe('enter: animation', function () {
            
            var el = mockEl('css'),
                c = mockChange(function () {
                    c.called = true
                    assert.ok(el.classList.contains(enterClass))
                }),
                compiler = mockCompiler(),
                code
            // mark it to use CSS animation instead of transition
            el.vue_anim = ''

            before(function () {
                document.body.appendChild(el)
            })

            after(function () {
                document.body.removeChild(el)
            })

            it('should add enterClass before calling changeState()', function () {
                code = transition(el, 1, c.change, compiler)
                assert.ok(c.called)
            })

            it('should still have the class on nextTick', function (done) {
                nextTick(function () {
                    assert.ok(el.classList.contains(enterClass))
                    done()
                })
            })

            it('should remove the class when the animation is done', function (done) {
                el.addEventListener(endEvents.anim, function () {
                    assert.notOk(el.vue_trans_cb)
                    assert.notOk(el.classList.contains(enterClass))
                    done()
                })
                var e = mockHTMLEvent(endEvents.anim)
                el.dispatchEvent(e)
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

            after(function () {
                document.body.removeChild(el)
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
                var e = mockHTMLEvent(endEvents.trans)
                el.dispatchEvent(e)
                assert.ok(c.called)
            })

            it('should remove the callback after called', function () {
                assert.notOk(el.vue_trans_cb)
                var e = mockHTMLEvent(endEvents.trans)
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

    describe('JavaScript Transitions', function () {

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

        describe('wrapped timeout', function () {
            
            var el = mockEl('js'),
                c = mockChange(),
                timerFired = false,
                def = {
                    enter: function (el, change, timeout) {
                        change()
                        timeout(function () {
                            timerFired = true
                        }, 0)
                    },
                    leave: function () {}
                },
                compiler = mockCompiler(def)

            it('should cancel previous unfired timers', function (done) {
                transition(el, 1, c.change, compiler)
                assert.strictEqual(el.vue_timeouts.length, 1)
                transition(el, -1, c.change, compiler)
                assert.strictEqual(el.vue_timeouts.length, 0)
                setTimeout(function () {
                    assert.notOk(timerFired)
                    done()
                }, 0)
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
            el.vue_effect = 'test'
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

})