Seed.controller('todos', function (scope) {

    // regular properties -----------------------------------------------------
    scope.todos = todoStorage.fetch()
    scope.remaining = scope.todos.reduce(function (n, todo) {
        return n + (todo.completed ? 0 : 1)
    }, 0)

    // computed properties ----------------------------------------------------
    scope.total = {get: function () {
        return scope.todos.length
    }}

    scope.completed = {get: function () {
        return scope.total - scope.remaining
    }}

    // dynamic context computed property using info from target scope
    scope.filterTodo = {get: function (e) {
        return filters[scope.filter](e.scope.completed)
    }}

    // dynamic context computed property using info from target element
    scope.checkFilter = {get: function (e) {
        return scope.filter === e.el.textContent.toLowerCase()
    }}

    // two-way computed property with both getter and setter
    scope.allDone = {
        get: function () {
            return scope.remaining === 0
        },
        set: function (value) {
            scope.todos.forEach(function (todo) {
                todo.completed = value
            })
            scope.remaining = value ? 0 : scope.total
        }
    }

    // event handlers ---------------------------------------------------------
    scope.addTodo = function () {
        var value = scope.newTodo && scope.newTodo.trim()
        if (value) {
            scope.todos.unshift({ title: value, completed: false })
            scope.newTodo = ''
            scope.remaining++
            todoStorage.save(scope.todos)
        }
    }

    scope.removeTodo = function (e) {
        scope.todos.remove(e.scope)
        scope.remaining -= e.scope.completed ? 0 : 1
        todoStorage.save(scope.todos)
    }

    scope.updateCount = function (e) {
        scope.remaining += e.scope.completed ? -1 : 1
        todoStorage.save(scope.todos)
    }

    var beforeEditCache
    scope.editTodo = function (e) {
        beforeEditCache = e.scope.title
        e.scope.editing = true
    }

    scope.doneEdit = function (e) {
        if (!e.scope.editing) return
        e.scope.editing = false
        e.scope.title = e.scope.title.trim()
        if (!e.scope.title) scope.removeTodo(e)
        todoStorage.save(scope.todos)
    }

    scope.cancelEdit = function (e) {
        e.scope.editing = false
        setTimeout(function () {
            e.scope.title = beforeEditCache
        }, 0)
    }

    scope.removeCompleted = function () {
        scope.todos = scope.todos.filter(function (todo) {
            return !todo.completed
        })
        todoStorage.save(scope.todos)
    }

    // filters ----------------------------------------------------------------
    var filters = {
        all: function () { return true },
        active: function (v) { return !v },
        completed: function (v) { return v }
    }

    function updateFilter () {
        scope.filter = location.hash ? location.hash.slice(2) : 'all'
    }
    
    updateFilter()
    window.addEventListener('hashchange', updateFilter)

})

Seed.bootstrap()