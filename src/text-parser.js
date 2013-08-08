var config     = require('./config'),
    ESCAPE_RE  = /[-.*+?^${}()|[\]\/\\]/g,
    BINDING_RE = undefined

function escapeRegex (val) {
    return val.replace(ESCAPE_RE, '\\$&')
}

module.exports = {

    /*
     *  Parse a piece of text, return an array of tokens
     */
    parse: function (node) {
        var text = node.nodeValue
        if (!BINDING_RE.test(text)) return null
        var m, i, tokens = []
        do {
            m = text.match(BINDING_RE)
            if (!m) break
            i = m.index
            if (i > 0) tokens.push(text.slice(0, i))
            tokens.push({ key: m[1] })
            text = text.slice(i + m[0].length)
        } while (true)
        if (text.length) tokens.push(text)
        return tokens
    },

    /*
     *  Build interpolate tag regex from config settings
     */
    buildRegex: function () {
        var open = escapeRegex(config.interpolateTags.open),
            close = escapeRegex(config.interpolateTags.close)
        BINDING_RE = new RegExp(open + '(.+?)' + close)
    }
}