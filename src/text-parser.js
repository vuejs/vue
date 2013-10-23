var BINDING_RE = /\{\{(.+?)\}\}/

module.exports = {

    /**
     *  Parse a piece of text, return an array of tokens
     */
    parse: function (text) {
        if (!BINDING_RE.test(text)) return null
        var m, i, tokens = []
        /* jshint boss: true */
        while (m = text.match(BINDING_RE)) {
            i = m.index
            if (i > 0) tokens.push(text.slice(0, i))
            tokens.push({ key: m[1].trim() })
            text = text.slice(i + m[0].length)
        }
        if (text.length) tokens.push(text)
        return tokens
    }
    
}