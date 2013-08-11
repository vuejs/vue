var storageKey = 'todos-seedjs',
    todos = JSON.parse(localStorage.getItem(storageKey)) || [],
    filters = {
        all: function () { return true },
        active: function (v) { return !v },
        completed: function (v) { return v }
    }

Seed.controller('Todos', function (scope) {

    // regular properties -----------------------------------------------------
    scope.todos = todos
    scope.remaining = todos.reduce(function (n, todo) {
        return n + (todo.completed ? 0 : 1)
    }, 0)

    // computed properties ----------------------------------------------------
    scope.total = {get: function () {
        return scope.todos.length
    }}

    scope.completed = {get: function () {
        return scope.total - scope.remaining
    }}

    scope.itemLabel = {get: function () {
        return scope.remaining > 1 ? 'items' : 'item'
    }}

    // computed property using info from target scope
    scope.filterTodo = {get: function (e) {
        return filters[scope.filter](e.scope.completed)
    }}

    // computed property using info from target element
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
        if (scope.newTodo.trim()) {
            scope.todos.unshift({ title: scope.newTodo.trim(), completed: false })
            scope.newTodo = ''
            scope.remaining++
            sync()
        }
    }

    scope.removeTodo = function (e) {
        scope.todos.remove(e.scope)
        scope.remaining -= e.scope.completed ? 0 : 1
        sync()
    }

    scope.updateCount = function (e) {
        scope.remaining += e.scope.completed ? -1 : 1
        sync()
    }

    var beforeEditCache
    scope.edit = function (e) {
        beforeEditCache = e.scope.title
        e.scope.editing = true
    }

    scope.doneEdit = function (e) {
        if (!e.scope.editing) return
        e.scope.editing = false
        e.scope.title = e.scope.title.trim()
        if (!e.scope.title) scope.removeTodo(e)
        sync()
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
        sync()
    }

    // filters
    updateFilter()
    window.addEventListener('hashchange', updateFilter)
    function updateFilter () {
        if (!location.hash) return
        scope.filter = location.hash.slice(2) || 'all'
    }

    // data persistence using localStorage
    function sync () {
        localStorage.setItem(storageKey, scope.$serialize('todos'))
    }

})

Seed.bootstrap({ debug: true })