var filters = {
    all: function (todo) { return todo.completed || true },
    active: function (todo) { return !todo.completed },
    completed: function (todo) { return todo.completed }
}

var Todos = seed.ViewModel.extend({

    init: function () {
        this.todos = todoStorage.fetch()
        this.remaining = this.todos.filter(filters.active).length
        this.updateFilter()
    },

    proto: {

        updateFilter: function () {
            var filter = location.hash.slice(2)
            this.filter = (filter in filters) ? filter : 'all'
            this.todoFilter = filters[this.filter]
        },

        addTodo: function () {
            var value = this.newTodo && this.newTodo.trim()
            if (value) {
                this.todos.unshift({ title: value, completed: false })
                this.newTodo = ''
                this.remaining++
                todoStorage.save()
            }
        },

        removeTodo: function (e) {
            this.todos.remove(e.item)
            this.remaining -= e.item.completed ? 0 : 1
            todoStorage.save()
        },

        toggleTodo: function (e) {
            this.remaining += e.item.completed ? -1 : 1
            todoStorage.save()
        },

        editTodo: function (e) {
            this.beforeEditCache = e.item.title
            this.editedTodo = e.item
        },

        doneEdit: function (e) {
            if (!this.editedTodo) return
            this.editedTodo = null
            e.item.title = e.item.title.trim()
            if (!e.item.title) this.removeTodo(e)
            todoStorage.save()
        },

        cancelEdit: function (e) {
            this.editedTodo = null
            e.item.title = this.beforeEditCache
        },

        removeCompleted: function () {
            this.todos.mutateFilter(filters.active)
            todoStorage.save()
        },

        allDone: {
            get: function () {
                return this.remaining === 0
            },
            set: function (value) {
                this.todos.forEach(function (todo) {
                    todo.completed = value
                })
                this.remaining = value ? 0 : this.todos.length
                todoStorage.save()
            }
        }
    }
})

var app = new Todos({ el: '#todoapp' })
window.addEventListener('hashchange', function () {
    app.updateFilter()
})