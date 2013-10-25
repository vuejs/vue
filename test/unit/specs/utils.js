var utils = require('seed/src/utils')

describe('UNIT: Utils', function () {
    
    describe('hash', function () {

        it('should return an Object with null prototype', function () {
            var hash = utils.hash()
            assert.strictEqual(Object.getPrototypeOf(hash), null)
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

        it('should do nothing for strings and numbers', function () {
            assert.strictEqual(txt('hihi'), 'hihi')
            assert.strictEqual(txt(123), 123)
        })
        
        it('should output empty string if value is not string or number', function () {
            assert.strictEqual(txt({}), '')
            assert.strictEqual(txt([]), '')
            assert.strictEqual(txt(false), '')
            assert.strictEqual(txt(true), '')
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

    describe('templateToFragment', function () {
        
        it('should convert a string tempalte to a documentFragment', function () {
            var template = '<div class="a">hi</div><p>ha</p>',
                frag = utils.templateToFragment(template)
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

            var frag = utils.templateToFragment('#' + id)
            assert.ok(frag instanceof window.DocumentFragment)
            assert.equal(frag.querySelector('.a').textContent, 'hi')
            assert.equal(frag.querySelector('p').textContent, 'ha')
        })

    })

    describe('convertPartials', function () {
        
        it('should convert a hash object of strings to fragments', function () {
            var partials = {
                a: '#utils-template-to-fragment',
                b: '<div class="a">hi</div><p>ha</p>'
            }
            utils.convertPartials(partials)
            for (var key in partials) {
                var frag = partials[key]
                assert.ok(frag instanceof window.DocumentFragment)
                assert.equal(frag.querySelector('.a').textContent, 'hi')
                assert.equal(frag.querySelector('p').textContent, 'ha')
            }
        })

    })

})