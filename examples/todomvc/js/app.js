Seed.config({ debug: true })

var filters = {
    all: function () { return true },
    active: function (todo) { return !todo.completed },
    completed: function (todo) { return todo.completed }
}

window.addEventListener('hashchange', function () {
    Seed.broadcast('filterchange')
})

var Todos = Seed.ViewModel.extend({

    initialize: function () {
        // listen for hashtag change
        this.updateFilter()
        this.$on('filterchange', this.updateFilter.bind(this))
        // instance properties
        this.todos = todoStorage.fetch()
        this.remaining = this.todos.filter(filters.active).length
    },

    properties: {

        updateFilter: function () {
            var filter = location.hash.slice(2)
            this.filter = (filter in filters) ? filter : 'all'
        },

        // computed properties ----------------------------------------------------
        total: {get: function () {
            return this.todos.length
        }},

        completed: {get: function () {
            return this.total - this.remaining
        }},

        // dynamic context computed property using info from target viewmodel
        todoFiltered: {get: function (ctx) {
            return filters[this.filter]({ completed: ctx.vm.completed })
        }},

        // dynamic context computed property using info from target element
        filterSelected: {get: function (ctx) {
            return this.filter === ctx.el.textContent.toLowerCase()
        }},

        // two-way computed property with both getter and setter
        allDone: {
            get: function () {
                return this.remaining === 0
            },
            set: function (value) {
                this.todos.forEach(function (todo) {
                    todo.completed = value
                })
                this.remaining = value ? 0 : this.total
                todoStorage.save(this.todos)
            }
        },

        // event handlers ---------------------------------------------------------
        addTodo: function () {
            var value = this.newTodo && this.newTodo.trim()
            if (value) {
                this.todos.unshift({ title: value, completed: false })
                this.newTodo = ''
                this.remaining++
                todoStorage.save(this.todos)
            }
        },

        removeTodo: function (e) {
            this.todos.remove(e.vm)
            this.remaining -= e.vm.completed ? 0 : 1
            todoStorage.save(this.todos)
        },

        toggleTodo: function (e) {
            this.remaining += e.vm.completed ? -1 : 1
            todoStorage.save(this.todos)
        },

        editTodo: function (e) {
            this.beforeEditCache = e.vm.title
            e.vm.editing = true
        },

        doneEdit: function (e) {
            if (!e.vm.editing) return
            e.vm.editing = false
            e.vm.title = e.vm.title.trim()
            if (!e.vm.title) this.removeTodo(e)
            todoStorage.save(this.todos)
        },

        cancelEdit: function (e) {
            e.vm.editing = false
            e.vm.title = this.beforeEditCache
        },

        removeCompleted: function () {
            this.todos = this.todos.filter(filters.active)
            todoStorage.save(this.todos)
        }
    }
})

var app = new Todos({ el: '#todoapp' })