var config = require('../config'),
    transition = require('../transition')

module.exports = {

    bind: function () {
        this.parent = this.el.parentNode || this.el.vue_if_parent
        this.ref = document.createComment(config.prefix + '-if-' + this.key)
        if (this.el.vue_if_ref) {
            this.parent.insertBefore(this.ref, this.el.vue_if_ref)
        }
        this.el.vue_if_ref = this.ref
    },

    update: function (value) {

        var el = this.el

        // sometimes we need to create a VM on a detached node,
        // e.g. in v-repeat. In that case, store the desired v-if
        // state on the node itself so we can deal with it elsewhere.
        el.vue_if = !!value

        var parent   = this.parent,
            ref      = this.ref,
            compiler = this.compiler

        if (!parent) {
            if (!el.parentNode) {
                return
            } else {
                parent = this.parent = el.parentNode
            }
        }

        if (!value) {
            transition(el, -1, remove, compiler)
        } else {
            transition(el, 1, insert, compiler)
        }

        function remove () {
            if (!el.parentNode) return
            // insert the reference node
            var next = el.nextSibling
            if (next) {
                parent.insertBefore(ref, next)
            } else {
                parent.appendChild(ref)
            }
            parent.removeChild(el)
        }

        function insert () {
            if (el.parentNode) return
            parent.insertBefore(el, ref)
            parent.removeChild(ref)
        }
    },

    unbind: function () {
        this.el.vue_if_ref = this.el.vue_if_parent = null
        var ref = this.ref
        if (ref.parentNode) {
            ref.parentNode.removeChild(ref)
        }
    }
}