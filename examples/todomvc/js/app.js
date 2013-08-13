var filters = {
    all: function () { return true },
    active: function (todo) { return !todo.completed },
    completed: function (todo) { return todo.completed }
}

window.addEventListener('hashchange', function () {
    Seed.broadcast('filterchange')
})

Seed.controller('todos', {

    // initializer, reserved
    init: function () {
        // listen for hashtag change
        this.updateFilter()
        this.$on('filterchange', this.updateFilter.bind(this))
        // instance properties
        this.todos = todoStorage.fetch()
        this.remaining = this.todos.filter(filters.active).length
    },

    // computed properties ----------------------------------------------------
    total: {get: function () {
        return this.todos.length
    }},

    completed: {get: function () {
        return this.total - this.remaining
    }},

    // dynamic context computed property using info from target scope
    todoFiltered: {get: function (ctx) {
        return filters[this.filter](ctx.scope)
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
            this.remaining = value ? 0 : this.total
            this.todos.forEach(function (todo) {
                todo.completed = value
            })
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
        this.todos.remove(e.scope)
        this.remaining -= e.scope.completed ? 0 : 1
        todoStorage.save(this.todos)
    },

    toggleTodo: function (e) {
        this.remaining += e.scope.completed ? -1 : 1
        todoStorage.save(this.todos)
    },

    editTodo: function (e) {
        this.beforeEditCache = e.scope.title
        e.scope.editing = true
    },

    doneEdit: function (e) {
        if (!e.scope.editing) return
        e.scope.editing = false
        e.scope.title = e.scope.title.trim()
        if (!e.scope.title) this.removeTodo(e)
        todoStorage.save(this.todos)
    },

    cancelEdit: function (e) {
        e.scope.editing = false
        e.scope.title = this.beforeEditCache
    },

    removeCompleted: function () {
        this.todos = this.todos.filter(filters.active)
        todoStorage.save(this.todos)
    },

    updateFilter: function () {
        var filter = location.hash.slice(2)
        this.filter = (filter in filters) ? filter : 'all'
    }
})

Seed.bootstrap()