var ViewModel

module.exports = {

    bind: function () {
        if (this.isEmpty) {
            this.build()
        }
    },

    update: function (value) {
        if (!this.component) {
            this.build(value)
        } else {
            this.component.$data = value
        }
    },

    build: function (value) {
        ViewModel = ViewModel || require('../viewmodel')
        var Ctor = this.Ctor || ViewModel
        this.component = new Ctor({
            el: this.el,
            data: value,
            compilerOptions: {
                parentCompiler: this.compiler
            }
        })
    },

    unbind: function () {
        this.component.$destroy()
    }

}