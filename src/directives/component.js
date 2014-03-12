module.exports = {

    isLiteral: true,

    bind: function () {
        if (!this.el.vue_vm) {
            this.component = new this.Ctor({
                el: this.el,
                parent: this.vm
            })
        }
    },

    unbind: function () {
        if (this.component) {
            this.component.$destroy()
        }
    }

}