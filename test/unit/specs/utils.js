describe('UNIT: Utils', function () {

    var utils = require('vue/src/utils')
    
    describe('hash', function () {

        it('should return an Object with null prototype', function () {
            var hash = utils.hash()
            assert.strictEqual(Object.getPrototypeOf(hash), null)
        })

    })

    describe('attr', function () {

        var el = document.createElement('div'),
            testAttr = 'transition',
            full = 'v-' + testAttr
        el.setAttribute (full, 'test')
        
        it('should append the prefix and return the attribute value', function () {
            var val = utils.attr(el, testAttr)
            assert.strictEqual(val, 'test')
        })

        it('should remove the attribute', function () {
            assert.notOk(el.hasAttribute(full))
        })

        it('should work with different prefix', function () {

            Vue.config({ prefix: 'test' })

            var el = document.createElement('div')
            el.setAttribute('test-' + testAttr, 'test')
            var val = utils.attr(el, testAttr)
            assert.strictEqual(val, 'test')
            assert.notOk(el.hasAttribute('test-' + testAttr))

            Vue.config({ prefix: 'v' })
        })

    })

    describe('defProtected', function () {
        
        it('should define a protected property', function () {
            var a = {}
            utils.defProtected(a, 'test', 1)

            var keys = []
            for (var key in a) {
                keys.push(key)
            }
            assert.strictEqual(keys.length, 0, 'inenumerable')
            assert.strictEqual(JSON.stringify(a), '{}', 'unstringifiable')

            a.test = 2
            assert.strictEqual(a.test, 1, 'unconfigurable')
        })

        it('should take enumerable option', function () {
            var a = {}
            utils.defProtected(a, 'test', 1, true)

            var keys = []
            for (var key in a) {
                keys.push(key)
            }
            assert.strictEqual(keys.length, 1, 'enumerable')
            assert.strictEqual(keys[0], 'test')
            assert.strictEqual(JSON.stringify(a), '{"test":1}', 'stringifiable')
        })

    })

    describe('typeOf', function () {
        
        it('should return correct type', function () {
            var tof = utils.typeOf
            assert.equal(tof({}), 'Object')
            assert.equal(tof([]), 'Array')
            assert.equal(tof(1), 'Number')
            assert.equal(tof(''), 'String')
            assert.equal(tof(true), 'Boolean')
            // phantomjs weirdness
            assert.ok(tof(null) === 'Null' || tof(null) === 'DOMWindow')
            assert.ok(tof(undefined) === 'Undefined' || tof(undefined) === 'DOMWindow')
        })

    })

    describe('toText', function () {

        var txt = utils.toText

        it('should do nothing for strings, numbers and booleans', function () {
            assert.strictEqual(txt('hihi'), 'hihi')
            assert.strictEqual(txt(123), 123)
            assert.strictEqual(txt(true), true)
            assert.strictEqual(txt(false), false)
        })
        
        it('should output empty string if value is not string or number', function () {
            assert.strictEqual(txt({}), '')
            assert.strictEqual(txt([]), '')
            assert.strictEqual(txt(undefined), '')
            assert.strictEqual(txt(null), '')
            assert.strictEqual(txt(NaN), '')
        })

    })

    describe('extend', function () {
        
        it('should extend the obj with extension obj', function () {
            var a = {a: 1}, b = {a: {}, b: 2}
            utils.extend(a, b)
            assert.strictEqual(a.a, b.a)
            assert.strictEqual(a.b, b.b)
        })

        it('should respect the protective option', function () {
            var a = {a: 1}, b = {a: {}, b: 2}
            utils.extend(a, b, true)
            assert.strictEqual(a.a, 1)
            assert.strictEqual(a.b, b.b)
        })

    })

    describe('unique', function () {
        
        it('should filter an array with duplicates into unqiue ones', function () {
            var arr = [1, 2, 3, 1, 2, 3, 4, 5],
                res = utils.unique(arr),
                l = res.length
            assert.strictEqual(l, 5)
            while (l--) {
                assert.strictEqual(res[l], 5 - l)
            }
        })

    })


    describe('bind', function () {
        
        it('should bind the right context', function () {
            function test () {
                return this + 1
            }
            var bound = utils.bind(test, 2)
            assert.strictEqual(bound(), 3)
        })

    })

    describe('toFragment', function () {
        
        it('should convert a string tempalte to a documentFragment', function () {
            var template = '<div class="a">hi</div><p>ha</p>',
                frag = utils.toFragment(template)
            assert.ok(frag instanceof window.DocumentFragment)
            assert.equal(frag.querySelector('.a').textContent, 'hi')
            assert.equal(frag.querySelector('p').textContent, 'ha')
        })

        it('should also work if the string is an ID selector', function () {
            var id = 'utils-template-to-fragment',
                template = '<div class="a">hi</div><p>ha</p>',
                el = document.createElement('template')
                el.id = id
                el.innerHTML = template
            document.getElementById('test').appendChild(el)

            var frag = utils.toFragment('#' + id)
            assert.ok(frag instanceof window.DocumentFragment)
            assert.equal(frag.querySelector('.a').textContent, 'hi')
            assert.equal(frag.querySelector('p').textContent, 'ha')
        })

    })

    describe('toConstructor', function () {
        
        it('should convert an non-VM object to a VM constructor', function () {
            var a = { test: 1 },
                A = utils.toConstructor(a)
            assert.ok(A.prototype instanceof Vue)
            assert.strictEqual(A.options, a)
        })

        it('should return the argument if it is already a consutructor', function () {
            var A = utils.toConstructor(Vue)
            assert.strictEqual(A, Vue)
        })

    })

    describe('processOptions', function () {
        
        var options = {
            partials: {
                a: '#utils-template-to-fragment',
                b: '<div class="a">hi</div><p>ha</p>'
            },
            components: {
                a: { scope: { data: 1 } },
                b: { scope: { data: 2 } }
            },
            elements: {
                c: { scope: { data: 3 }}
            },
            template: '<a>{{hi}}</a>'
        }

        it('should convert string partials to fragment nodes', function () {

            // call it here
            utils.processOptions(options)

            var partials = options.partials
            for (var key in partials) {
                var frag = partials[key]
                assert.ok(frag instanceof window.DocumentFragment)
                assert.equal(frag.querySelector('.a').textContent, 'hi')
                assert.equal(frag.querySelector('p').textContent, 'ha')
            }
        })

        it('should convert string template to fragment node', function () {
            assert.ok(options.template instanceof window.DocumentFragment)
            assert.equal(options.template.querySelector('a').textContent, '{{hi}}')
        })

        it('should convert plain object components & elements to constructors', function () {
            var components = options.components
            assert.ok(components.a.prototype instanceof Vue)
            assert.strictEqual(components.a.options.scope.data, 1)
            assert.ok(components.b.prototype instanceof Vue)
            assert.strictEqual(components.b.options.scope.data, 2)
            var elements = options.elements
            assert.ok(elements.c.prototype instanceof Vue)
            assert.strictEqual(elements.c.options.scope.data, 3)
        })

    })

})