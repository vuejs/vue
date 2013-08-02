var config = require('./config'),
    controllers = require('./controllers'),
    watchArray = require('./watchArray')

module.exports = {

    text: function (value) {
        this.el.textContent = value || ''
    },

    show: function (value) {
        this.el.style.display = value ? '' : 'none'
    },

    class: function (value) {
        this.el.classList[value ? 'add' : 'remove'](this.arg)
    },

    on: {
        update: function (handler) {
            var event = this.arg
            if (!this.handlers) {
                this.handlers = {}
            }
            var handlers = this.handlers
            if (handlers[event]) {
                this.el.removeEventListener(event, handlers[event])
            }
            if (handler) {
                handler = handler.bind(this.seed)
                this.el.addEventListener(event, handler)
                handlers[event] = handler
            }
        },
        unbind: function () {
            var event = this.arg
            if (this.handlers) {
                this.el.removeEventListener(event, this.handlers[event])
            }
        }
    },

    each: {
        bind: function () {
            this.el['sd-block'] = true
            this.prefixRE = new RegExp('^' + this.arg + '.')
            var ctn = this.container = this.el.parentNode
            this.marker = document.createComment('sd-each-' + this.arg + '-marker')
            ctn.insertBefore(this.marker, this.el)
            ctn.removeChild(this.el)
            this.childSeeds = []
        },
        update: function (collection) {
            if (this.childSeeds.length) {
                this.childSeeds.forEach(function (child) {
                    child.destroy()
                })
                this.childSeeds = []
            }
            watchArray(collection, this.mutate.bind(this))
            var self = this
            collection.forEach(function (item, i) {
                self.childSeeds.push(self.buildItem(item, i, collection))
            })
        },
        mutate: function (mutation) {
            console.log(mutation)
        },
        buildItem: function (data, index, collection) {
            var Seed = require('./seed'),
                node = this.el.cloneNode(true),
                ctrl = node.getAttribute(config.prefix + '-controller'),
                Ctrl = ctrl ? controllers[ctrl] : Seed
            if (ctrl) node.removeAttribute(config.prefix + '-controller')
            var spore = new Ctrl(node, data, {
                    eachPrefixRE: this.prefixRE,
                    parentScope: this.seed.scope
                })
            this.container.insertBefore(node, this.marker)
            collection[index] = spore.scope
            return spore
        }
    }

}