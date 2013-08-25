seed.config({ debug: false })

var filters = {
    all: function () { return true },
    active: function (val) { return !val },
    completed: function (val) { return val }
}

var Todos = seed.ViewModel.extend({

    init: function () {
        this.todos = todoStorage.fetch()
        this.remaining = this.todos.filter(function (todo) {
            return filters.active(todo.completed)
        }).length
        this.updateFilter()
    },

    props: {

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
            e.item.editing = true
        },

        doneEdit: function (e) {
            if (!e.item.editing) return
            e.item.editing = false
            e.item.title = e.item.title.trim()
            if (!e.item.title) this.removeTodo(e)
            todoStorage.save()
        },

        cancelEdit: function (e) {
            e.item.editing = false
            e.item.title = this.beforeEditCache
        },

        removeCompleted: function () {
            this.todos.mutateFilter(function (todo) {
                return filters.active(todo.completed)
            })
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