var utils = require('../utils')

module.exports = {

    bind: function () {
        if (this.isSimple) {
            this.build()
        }
    },

    update: function (value) {
        if (!this.component) {
            this.build(value)
        } else {
            this.component.model = value
        }
    },

    build: function (value) {
        var Ctor = this.compiler.getOption('components', this.arg)
        if (!Ctor) utils.warn('unknown component: ' + this.arg)
        var options = {
            el: this.el,
            compilerOptions: {
                parentCompiler: this.compiler
            }
        }
        if (value) {
            options.scope = {
                model: value
            }
        }
        this.component = new Ctor(options)
    },

    unbind: function () {
        this.component.$destroy()
    }

}