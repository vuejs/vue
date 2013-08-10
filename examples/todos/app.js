var Seed = require('seed')

var todos = [
    { text: 'make nesting Objects work', done: false },
    { text: 'auto dependency extraction', done: true },
    { text: 'computed properties', done: true }
]

Seed.controller('Todos', function (scope) {

    // regular properties -----------------------------------------------------
    scope.todos = todos
    scope.filter = window.location.hash.slice(2) || 'all'
    scope.remaining = todos.reduce(function (count, todo) {
        return count + (todo.done ? 0 : 1)
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

    scope.allDone = {
        get: function () {
            return scope.remaining === 0
        },
        set: function (value) {
            scope.todos.forEach(function (todo) {
                todo.done = value
            })
            scope.remaining = value ? 0 : scope.total
        }
    }

    // event handlers ---------------------------------------------------------
    scope.addTodo = function (e) {
        if (e.el.value) {
            scope.todos.unshift({ text: e.el.value, done: false })
            e.el.value = ''
            scope.remaining++
        }
    }

    scope.removeTodo = function (e) {
        scope.todos.remove(e.scope)
        scope.remaining -= e.scope.done ? 0 : 1
    }

    scope.updateCount = function (e) {
        scope.remaining += e.scope.done ? -1 : 1
    }

    scope.edit = function (e) {
        e.scope.editing = true
    }

    scope.stopEdit = function (e) {
        e.scope.editing = false
    }

    scope.setFilter = function (e) {
        scope.filter = e.el.dataset.filter
    }

    scope.removeCompleted = function () {
        if (scope.completed === 0) return
        scope.todos = scope.todos.filter(function (todo) {
            return !todo.done
        })
    }

})

Seed.bootstrap({ debug: true })