var utils = require('../utils')

module.exports = {

    isLiteral: true,

    bind: function () {

        var compiler = this.compiler,
            id = this.expression
        if (!id) return

        var partial = id === 'yield'
            ? this.compiler.rawContent
            : this.compiler.getOption('partials', id)

        if (!partial) {
            utils.warn('Unknown partial: ' + id)
            return
        }

        // comment ref node means inline partial
        if (this.el.nodeType === 8) {

            // keep a ref for the partial's content nodes
            var nodes = [].slice.call(partial.childNodes),
                ref = this.el,
                parent = ref.parentNode
            parent.insertBefore(partial, ref)
            parent.removeChild(ref)
            // compile partial after appending, because its children's parentNode
            // will change from the fragment to the correct parentNode.
            // This could affect directives that need access to its element's parentNode.
            nodes.forEach(compiler.compile, compiler)

        } else {

            // just set innerHTML...
            this.el.innerHTML = ''
            this.el.appendChild(partial.cloneNode(true))

        }
    }

}