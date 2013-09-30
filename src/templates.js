var templates = {}

module.exports = {
    set: function (name, content) {
        var node = document.createElement('div'),
            frag = document.createDocumentFragment(),
            child
        node.innerHTML = content.trim()
        /* jshint boss: true */
        while (child = node.firstChild) {
            frag.appendChild(child)
        }
        return templates[name] = frag
    },

    get: function (name) {
        return templates[name]
    }
}