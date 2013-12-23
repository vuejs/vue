Vue.config({debug:true})

var filters = {
    all: function () { return true },
    active: function (completed) { return !completed },
    completed: function (completed) { return completed }
}

Vue.directive('todo-focus', function (value) {
    var el = this.el
    if (value) {
        setTimeout(function () { el.focus() }, 0)
    }
})

var app = new Vue({

    el: '#todoapp',

    created: function () {
        this.updateFilter()
        this.remaining = this.todos.filter(function (todo) {
            return !todo.completed
        }).length
    },

    data: {

        todos: todoStorage.fetch(),

        allDone: {
            $get: function () {
                return this.remaining === 0
            },
            $set: function (value) {
                this.todos.forEach(function (todo) {
                    todo.completed = value
                })
                this.remaining = value ? 0 : this.todos.length
                todoStorage.save()
            }
        }
    },

    methods: {
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
            this.todos.remove(e.targetVM.$data)
            this.remaining -= e.targetVM.completed ? 0 : 1
            todoStorage.save()
        },

        toggleTodo: function (e) {
            this.remaining += e.targetVM.completed ? -1 : 1
            todoStorage.save()
        },

        editTodo: function (e) {
            this.beforeEditCache = e.targetVM.title
            this.editedTodo = e.targetVM
        },

        doneEdit: function (e) {
            if (!this.editedTodo) return
            this.editedTodo = null
            e.targetVM.title = e.targetVM.title.trim()
            if (!e.targetVM.title) this.removeTodo(e)
            todoStorage.save()
        },

        cancelEdit: function (e) {
            this.editedTodo = null
            e.targetVM.title = this.beforeEditCache
        },

        removeCompleted: function () {
            this.todos.remove(function (todo) {
                return todo.completed
            })
            todoStorage.save()
        }
    }
})

window.addEventListener('hashchange', function () {
    app.updateFilter()
})