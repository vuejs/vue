var config = require('./config')

var ESCAPE_RE = /[-.*+?^${}()|[\]\/\\]/g,
    BINDING_RE = undefined

function escapeRegex (val) {
    return val.replace(ESCAPE_RE, '\\$&')
}

"this is {{cool}} hahah {{todo.but}} 123 {{total}}"

module.exports = {

    parse: function (node) {
        
    },

    buildRegex: function () {
        var open = escapeRegex(config.interpolateTags.open),
            close = escapeRegex(config.interpolateTags.close)
        BINDING_RE = new RegExp(open + '(.*?)' + close)
    }
}