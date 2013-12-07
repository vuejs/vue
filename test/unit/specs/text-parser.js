describe('UNIT: TextNode Parser', function () {

    var TextParser = require('vue/src/text-parser')

    describe('.parse()', function () {
        
        it('should return null if no interpolate tags are present', function () {
            var result = TextParser.parse('hello no tags')
            assert.strictEqual(result, null)
        })

        it('should ignore escapped tags', function () {
            var result = TextParser.parse('test {{key}} &#123;&#123;hello&#125;&#125;')
            assert.strictEqual(result.length, 3)
            assert.strictEqual(result[2], ' &#123;&#123;hello&#125;&#125;')
        })

        var tokens = TextParser.parse('hello {{a}}! {{ bcd }}{{d.e.f}} {{a + (b || c) ? d : e}} {{>test}}')
        
        it('should extract correct amount of tokens', function () {
            assert.strictEqual(tokens.length, 9)
        })

        it('should extract plain strings', function () {
            assert.strictEqual(typeof tokens[0], 'string')
            assert.strictEqual(typeof tokens[2], 'string')
            assert.strictEqual(typeof tokens[5], 'string')
            assert.strictEqual(typeof tokens[7], 'string')
        })

        it('should extract basic keys', function () {
            assert.strictEqual(tokens[1].key, 'a')
        })

        it('should trim extracted keys', function () {
            assert.strictEqual(tokens[3].key, 'bcd')
        })

        it('should extract nested keys', function () {
            assert.strictEqual(tokens[4].key, 'd.e.f')
        })

        it('should extract expressions', function () {
            assert.strictEqual(tokens[6].key, 'a + (b || c) ? d : e')
        })

        it('should extract partials', function () {
            assert.strictEqual(tokens[8].key, '>test')
        })

    })

})