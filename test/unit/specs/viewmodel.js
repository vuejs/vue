describe('ViewModel', function () {

    var nextTick = require('vue/src/utils').nextTick

    mock('vm-test', '{{a.b.c}}')
    var data = {
            b: {
                c: 12345
            }
        },
        arr = [1, 2, 3],
        parentVM = new Vue({
            data: { fromParent: 'hello' }
        }),
        vm = new Vue({
            el: '#vm-test',
            parent: parentVM,
            data: {
                a: data,
                b: arr
            }
        })

    describe('.$get()', function () {
        it('should get correct value', function () {
            var v = vm.$get('a.b.c')
            assert.strictEqual(v, 12345)
        })

        it('should recursively get value from parents', function () {
            var v = vm.$get('fromParent')
            assert.strictEqual(v, 'hello')
        })
    })

    describe('.$set()', function () {
        it('should set correct value', function () {
            vm.$set('a.b.c', 54321)
            assert.strictEqual(data.b.c, 54321)
        })
    })

    describe('.$watch()', function () {

        it('should trigger callback when a plain value changes', function (done) {
            var val
            vm.$watch('a.b.c', function (newVal) {
                val = newVal
            })
            data.b.c = 'new value!'
            nextTick(function () {
                assert.strictEqual(val, data.b.c)
                done()
            })
        })

        it('should trigger callback when an object value changes', function (done) {
            var val, subVal, rootVal,
                target = { c: 'hohoho' }
            vm.$watch('a.b', function (newVal) {
                val = newVal
            })
            vm.$watch('a.b.c', function (newVal) {
                subVal = newVal
            })
            vm.$watch('a', function (newVal) {
                rootVal = newVal
            })

            data.b = target
            nextTick(function () {
                assert.strictEqual(val, target)
                assert.strictEqual(subVal, target.c)
                next()
            })

            function next () {
                vm.a = 'hehehe'
                nextTick(function () {
                    assert.strictEqual(rootVal, 'hehehe')
                    done()
                })
            }
            
        })

        it('should trigger callback when an array mutates', function (done) {
            var val, mut
            vm.$watch('b', function (array, mutation) {
                val = array
                mut = mutation
            })
            arr.push(4)
            nextTick(function () {
                assert.strictEqual(val, arr)
                assert.strictEqual(mut.method, 'push')
                assert.strictEqual(mut.args.length, 1)
                assert.strictEqual(mut.args[0], 4)
                done()
            })
        })

        it('should batch mutiple changes in a single event loop', function (done) {
            var callbackCount = 0,
                gotVal,
                finalValue =  { b: { c: 3} },
                vm = new Vue({
                    data: {
                        a: { b: { c: 0 }}
                    }
                })
            vm.$watch('a', function (newVal) {
                callbackCount++
                gotVal = newVal
            })
            vm.a.b.c = 1
            vm.a.b = { c: 2 }
            vm.a = finalValue
            nextTick(function () {
                assert.strictEqual(callbackCount, 1)
                assert.strictEqual(gotVal, finalValue)
                done()
            })
        })

    })

    describe('.$unwatch()', function () {
        
        it('should unwatch the stuff', function (done) {
            var triggered = false
            vm.$watch('a.b.c', function () {
                triggered = true
            })
            vm.$watch('a', function () {
                triggered = true
            })
            vm.$watch('b', function () {
                triggered = true
            })
            vm.$unwatch('a')
            vm.$unwatch('b')
            vm.$unwatch('a.b.c')
            vm.a = { b: { c:123123 }}
            vm.b.push(5)
            nextTick(function () {
                assert.notOk(triggered)
                done()
            })
        })

    })

    describe('.$on', function () {
        
        it('should register listener on vm\'s compiler\'s emitter', function () {
            var t = new Vue(),
                triggered = false,
                msg = 'on test'
            t.$on('test', function (m) {
                assert.strictEqual(m, msg)
                triggered = true
            })
            t.$compiler.emitter.emit('test', msg)
            assert.ok(triggered)
        })

    })

    describe('.$once', function () {
        
        it('should invoke the listener only once', function () {
            var t = new Vue(),
                triggered = 0,
                msg = 'on once'
            t.$once('test', function (m) {
                assert.strictEqual(m, msg)
                triggered++
            })
            t.$compiler.emitter.emit('test', msg)
            t.$compiler.emitter.emit('test', msg)
            assert.strictEqual(triggered, 1)
        })

    })

    describe('$off', function () {
        
        it('should turn off the listener', function () {
            var t = new Vue(),
                triggered1 = false,
                triggered2 = false,
                f1 = function () {
                    triggered1 = true
                },
                f2 = function () {
                    triggered2 = true
                }
            t.$on('test', f1)
            t.$on('test', f2)
            t.$off('test', f1)
            t.$compiler.emitter.emit('test')
            assert.notOk(triggered1)
            assert.ok(triggered2)
        })

    })

    describe('$emit', function () {
        
        it('should trigger the event', function () {
            var t = new Vue(),
                triggered = false
            t.$compiler.emitter.on('test', function (m) {
                triggered = m
            })
            t.$emit('test', 'hi')
            assert.strictEqual(triggered, 'hi')
        })

    })

    describe('.$broadcast()', function () {
        
        it('should notify all child VMs', function () {
            var triggered = 0,
                msg = 'broadcast test'
            var Child = Vue.extend({
                ready: function () {
                    this.$on('hello', function (m) {
                        assert.strictEqual(m, msg)
                        triggered++
                    })
                }
            })
            var Test = Vue.extend({
                template: '<div v-component="test"></div><div v-component="test"></div>',
                components: {
                    test: Child
                }
            })
            var t = new Test()
            t.$broadcast('hello', msg)
            assert.strictEqual(triggered, 2)
        })

    })

    describe('.$dispatch', function () {
        
        it('should notify all ancestor VMs', function (done) {
            var topTriggered = false,
                midTriggered = false,
                msg = 'emit test'
            var Bottom = Vue.extend({
                ready: function () {
                    var self = this
                    nextTick(function () {
                        self.$dispatch('hello', msg)
                        assert.ok(topTriggered)
                        assert.ok(midTriggered)
                        done()
                    })
                }
            })
            var Middle = Vue.extend({
                template: '<div v-component="bottom"></div>',
                components: { bottom: Bottom },
                ready: function () {
                    this.$on('hello', function (m) {
                        assert.strictEqual(m, msg)
                        midTriggered = true
                    })
                }
            })
            var Top = Vue.extend({
                template: '<div v-component="middle"></div>',
                components: { middle: Middle },
                ready: function () {
                    this.$on('hello', function (m) {
                        assert.strictEqual(m, msg)
                        topTriggered = true
                    })
                }
            })
            new Top()
        })

    })

    describe('DOM methods', function () {

        var enterCalled,
            leaveCalled,
            callbackCalled
        
        var v = new Vue({
            attributes: {
                'v-effect': 'test'
            },
            effects: {
                test: {
                    enter: function (el, change) {
                        enterCalled = true
                        change()
                    },
                    leave: function (el, change) {
                        leaveCalled = true
                        change()
                    }
                }
            }
        })

        function reset () {
            enterCalled = false
            leaveCalled = false
            callbackCalled = false
        }

        function cb () {
            callbackCalled = true
        }

        it('$appendTo', function (done) {
            reset()
            var parent = document.createElement('div')
            v.$appendTo(parent, cb)
            assert.strictEqual(v.$el.parentNode, parent)
            assert.ok(enterCalled)
            nextTick(function () {
                assert.ok(callbackCalled)
                done()
            })
        })

        it('$before', function (done) {
            reset()
            var parent = document.createElement('div'),
                ref = document.createElement('div')
            parent.appendChild(ref)
            v.$before(ref, cb)
            assert.strictEqual(v.$el.parentNode, parent)
            assert.strictEqual(v.$el.nextSibling, ref)
            assert.ok(enterCalled)
            nextTick(function () {
                assert.ok(callbackCalled)
                done()
            })
        })

        it('$after', function (done) {
            reset()
            var parent = document.createElement('div'),
                ref1 = document.createElement('div'),
                ref2 = document.createElement('div')
            parent.appendChild(ref1)
            parent.appendChild(ref2)
            v.$after(ref1, cb)
            assert.strictEqual(v.$el.parentNode, parent)
            assert.strictEqual(v.$el.nextSibling, ref2)
            assert.strictEqual(ref1.nextSibling, v.$el)
            assert.ok(enterCalled)
            nextTick(function () {
                assert.ok(callbackCalled)
                next()
            })

            function next () {
                reset()
                v.$after(ref2, cb)
                assert.strictEqual(v.$el.parentNode, parent)
                assert.notOk(v.$el.nextSibling)
                assert.strictEqual(ref2.nextSibling, v.$el)
                assert.ok(enterCalled)
                nextTick(function () {
                    assert.ok(callbackCalled)
                    done()
                })
            }
        })

        it('$remove', function (done) {
            reset()
            var parent = document.createElement('div')
            v.$appendTo(parent)
            v.$remove(cb)
            assert.notOk(v.$el.parentNode)
            assert.ok(enterCalled)
            assert.ok(leaveCalled)
            nextTick(function () {
                assert.ok(callbackCalled)
                done()
            })
        })

    })

    describe('.$destroy', function () {
        
        // since this simply delegates to Compiler.prototype.destroy(),
        // that's what we are actually testing here.
        var destroy = require('vue/src/compiler').prototype.destroy

        var beforeDestroyCalled = false,
            afterDestroyCalled = false,
            observerOffCalled = false,
            emitterOffCalled = false,
            dirUnbindCalled = false,
            expUnbindCalled = false,
            bindingUnbindCalled = false,
            unobserveCalled = false,
            elRemoved = false

        var dirMock = {
            binding: {
                compiler: null,
                dirs: []
            },
            $unbind: function () {
                dirUnbindCalled = true
            }
        }
        dirMock.binding.dirs.push(dirMock)

        var bindingsMock = {
            test: {
                root: true,
                key: 'test',
                unbind: function () {
                    bindingUnbindCalled = true
                }
            }
        }

        var compilerMock = {
            el: document.createElement('div'),
            options: {
                beforeDestroy: function () {
                    beforeDestroyCalled = true
                },
                afterDestroy: function () {
                    afterDestroyCalled = true
                }
            },
            data: {
                __emitter__: {
                    off: function () {
                        unobserveCalled = true
                        return this
                    }
                }
            },
            observer: {
                off: function () {
                    observerOffCalled = true
                },
                proxies: {
                    'test.': {},
                    '': {}
                }
            },
            emitter: {
                off: function () {
                    emitterOffCalled = true
                }
            },
            dirs: [dirMock],
            computed: [{
                unbind: function () {
                    expUnbindCalled = true
                }
            }],
            bindings: bindingsMock,
            childId: 'test',
            children: [],
            parent: {
                children: []
            },
            vm: {
                $remove: function () {
                    elRemoved = true
                }
            },
            execHook: function (id) {
                this.options[id].call(this)
            }
        }

        compilerMock.parent.children.push(compilerMock)

        destroy.call(compilerMock)

        it('should call the pre and post destroy hooks', function () {
            assert.ok(beforeDestroyCalled)
            assert.ok(afterDestroyCalled)
        })

        it('should turn observer and emitter off', function () {
            assert.ok(observerOffCalled)
            assert.ok(emitterOffCalled)
        })

        it('should unobserve the data', function () {
            assert.ok(unobserveCalled)
        })

        it('should unbind all directives', function () {
            assert.ok(dirUnbindCalled)
        })

        it('should remove directives from external bindings', function () {
            assert.strictEqual(dirMock.binding.dirs.indexOf(dirMock), -1)
        })

        it('should unbind all expressions', function () {
            assert.ok(expUnbindCalled)
        })

        it('should unbind and unobserve own bindings', function () {
            assert.ok(bindingUnbindCalled)
        })

        it('should remove self from parent', function () {
            var parent = compilerMock.parent
            assert.ok(parent.children.indexOf(compilerMock), -1)
        })

        it('should remove the dom element', function () {
            assert.ok(elRemoved)
        })

    })

    describe('$data', function () {

        it('should be the same data', function () {
            var data = {},
                vm = new Vue({data:data})
            assert.strictEqual(vm.$data, data)
        })

        it('should be able to be swapped', function (done) {
            var data1 = { a: 1 },
                data2 = { a: 2 },
                vm = new Vue({data: data1}),
                emittedChange = false
            vm.$watch('a', function (v) {
                assert.equal(v, 2)
                emittedChange = true
            })
            vm.$data = data2
            assert.equal(vm.a, 2)
            nextTick(function () {
                assert.ok(emittedChange)
                done()
            })
        })
    })

})