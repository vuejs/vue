seed.config({ debug: true })

var filters = {
    all: function () { return true },
    active: function (todo) { return !todo.completed },
    completed: function (todo) { return todo.completed }
}

var todos = [
            {title: 'hi', completed: true},
            {title: 'ha', completed: false},
            {title: 'ho', completed: false},
        ]

var Todos = seed.ViewModel.extend({

    init: function () {
        this.todos = todos//todoStorage.fetch()
        this.remaining = this.todos.filter(filters.active).length
        this.updateFilter()
    },

    props: {

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
            return filters[this.filter]({ completed: ctx.vm.todo.completed })
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
            this.todos.remove(e.item)
            this.remaining -= e.item.completed ? 0 : 1
            todoStorage.save(this.todos)
        },

        toggleTodo: function (e) {
            this.remaining += e.item.completed ? -1 : 1
            todoStorage.save(this.todos)
        },

        editTodo: function (e) {
            this.beforeEditCache = e.item.title
            e.item.editing = true
        },

        doneEdit: function (e) {
            if (!e.item.editing) return
            e.item.editing = false
            e.item.title = e.item.title.trim()
            if (!e.item.title) this.removeTodo(e)
            todoStorage.save(this.todos)
        },

        cancelEdit: function (e) {
            e.item.editing = false
            e.item.title = this.beforeEditCache
        },

        removeCompleted: function () {
            this.todos = this.todos.filter(filters.active)
            todoStorage.save(this.todos)
        }
    }
})

var app = new Todos({ el: '#todoapp' })

window.addEventListener('hashchange', function () {
    app.updateFilter()
})