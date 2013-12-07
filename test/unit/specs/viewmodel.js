describe('UNIT: ViewModel', function () {

    mock('vm-test', '{{a.b.c}}')
    var data = {
            b: {
                c: 12345
            }
        },
        arr = [1, 2, 3],
        vm = new Vue({
            el: '#vm-test',
            scope: {
                a: data,
                b: arr
            }
        })

    describe('.$set()', function () {
        vm.$set('a.b.c', 54321)
        it('should set correct value', function () {
            assert.strictEqual(data.b.c, 54321)
        })
    })

    describe('.$watch()', function () {

        it('should trigger callback when a plain value changes', function () {
            var val
            vm.$watch('a.b.c', function (newVal) {
                val = newVal
            })
            data.b.c = 'new value!'
            assert.strictEqual(val, data.b.c)
        })

        it('should trigger callback when an object value changes', function () {
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
            assert.strictEqual(val, target)
            assert.strictEqual(subVal, target.c)
            vm.a = 'hehehe'
            assert.strictEqual(rootVal, 'hehehe')
        })

        it('should trigger callback when an array mutates', function () {
            var val, mut
            vm.$watch('b', function (array, mutation) {
                val = array
                mut = mutation
            })
            arr.push(4)
            assert.strictEqual(val, arr)
            assert.strictEqual(mut.method, 'push')
            assert.strictEqual(mut.args.length, 1)
            assert.strictEqual(mut.args[0], 4)
        })

    })

    describe('.$unwatch()', function () {
        
        it('should unwatch the stuff', function () {
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
            assert.notOk(triggered)
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

    describe('.$broadcast()', function () {
        
        it('should notify all child VMs', function () {
            var triggered = 0,
                msg = 'broadcast test'
            var Child = Vue.extend({
                init: function () {
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

    describe('.$emit', function () {
        
        it('should notify all ancestor VMs', function (done) {
            var topTriggered = false,
                midTriggered = false,
                msg = 'emit test'
            var Bottom = Vue.extend({
                init: function () {
                    var self = this
                    setTimeout(function () {
                        self.$emit('hello', msg)
                        assert.ok(topTriggered)
                        assert.ok(midTriggered)
                        done()
                    }, 0)
                }
            })
            var Middle = Vue.extend({
                template: '<div v-component="bottom"></div>',
                components: { bottom: Bottom },
                init: function () {
                    this.$on('hello', function (m) {
                        assert.strictEqual(m, msg)
                        midTriggered = true
                    })
                }
            })
            var Top = Vue.extend({
                template: '<div v-component="middle"></div>',
                components: { middle: Middle },
                init: function () {
                    this.$on('hello', function (m) {
                        assert.strictEqual(m, msg)
                        topTriggered = true
                    })
                }
            })
            new Top()
        })

    })

    describe('.$destroy', function () {
        
        // since this simply delegates to Compiler.prototype.destroy(),
        // that's what we are actually testing here.
        var destroy = require('vue/src/compiler').prototype.destroy

        var tearDownCalled = false,
            observerOffCalled = false,
            emitterOffCalled = false,
            dirUnbindCalled = false,
            expUnbindCalled = false,
            bindingUnbindCalled = false,
            unobserveCalled = 0,
            elRemoved = false,
            externalBindingUnbindCalled = false

        var dirMock = {
            binding: {
                compiler: null,
                instances: []
            },
            unbind: function () {
                dirUnbindCalled = true
            }
        }
        dirMock.binding.instances.push(dirMock)

        var bindingsMock = Object.create({
            'test2': {
                unbind: function () {
                    externalBindingUnbindCalled = true
                }
            }
        })
        bindingsMock.test = {
            root: true,
            key: 'test',
            value: {
                __observer__: {
                    off: function () {
                        unobserveCalled++
                        return this
                    }
                }
            },
            unbind: function () {
                bindingUnbindCalled = true
            }
        }

        var compilerMock = {
            options: {
                teardown: function () {
                    tearDownCalled = true
                }
            },
            observer: {
                off: function () {
                    observerOffCalled = true
                },
                proxies: {
                    'test.': {}
                }
            },
            emitter: {
                off: function () {
                    emitterOffCalled = true
                }
            },
            dirs: [dirMock],
            exps: [{
                unbind: function () {
                    expUnbindCalled = true
                }
            }],
            bindings: bindingsMock,
            childId: 'test',
            parentCompiler: {
                childCompilers: [],
                vm: {
                    $: {
                        'test': true
                    }
                }
            },
            el: {
                getAttribute: function () {},
                parentNode: {
                    removeChild: function () {
                        elRemoved = true
                    }
                }
            }
        }

        compilerMock.parentCompiler.childCompilers.push(compilerMock)

        destroy.call(compilerMock)

        it('should call the teardown option', function () {
            assert.ok(tearDownCalled)
        })

        it('should turn observer and emitter off', function () {
            assert.ok(observerOffCalled)
            assert.ok(emitterOffCalled)
        })

        it('should unbind all directives', function () {
            assert.ok(dirUnbindCalled)
        })

        it('should remove directives from external bindings', function () {
            assert.strictEqual(dirMock.binding.instances.indexOf(dirMock), -1)
        })

        it('should unbind all expressions', function () {
            assert.ok(expUnbindCalled)
        })

        it('should unbind and unobserve own bindings', function () {
            assert.ok(bindingUnbindCalled)
            assert.strictEqual(unobserveCalled, 3)
        })

        it('should not unbind external bindings', function () {
            assert.notOk(externalBindingUnbindCalled)
        })

        it('should remove self from parentCompiler', function () {
            var parent = compilerMock.parentCompiler
            assert.ok(parent.childCompilers.indexOf(compilerMock), -1)
            assert.strictEqual(parent.vm.$[compilerMock.childId], undefined)
        })

        it('should remove the dom element', function () {
            assert.ok(elRemoved)
        })

    })

})