var BINDING_RE = /{{{?(.+?)}?}}/

/**
 *  Parse a piece of text, return an array of tokens
 */
function parse (text) {
    if (!BINDING_RE.test(text)) return null
    var m, i, token, match, tokens = []
    /* jshint boss: true */
    while (m = text.match(BINDING_RE)) {
        i = m.index
        if (i > 0) tokens.push(text.slice(0, i))
        token = { key: m[1].trim() }
        match = m[0]
        token.html =
            match.charAt(2) === '{' &&
            match.charAt(match.length - 3) === '}'
        tokens.push(token)
        text = text.slice(i + m[0].length)
    }
    if (text.length) tokens.push(text)
    return tokens
}

/**
 *  Parse an attribute value with possible interpolation tags
 *  return a Directive-friendly expression
 */
function parseAttr (attr) {
    var tokens = parse(attr)
    if (!tokens) return null
    if (tokens.length === 1) return tokens[0].key
    var res = [], token
    for (var i = 0, l = tokens.length; i < l; i++) {
        token = tokens[i]
        res.push(
            token.key
                ? ('(' + token.key + ')')
                : ('"' + token + '"')
        )
    }
    return res.join('+')
}

exports.parse = parse
exports.parseAttr = parseAttr