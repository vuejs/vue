var Seed = require('seed')

var todos = [
    { text: 'make nesting controllers work', done: true },
    { text: 'complete ArrayWatcher', done: false },
    { text: 'computed properties', done: false },
    { text: 'parse textnodes', done: false }
]

Seed.controller('Todos', function (scope) {

    // regular properties -----------------------------------------------------
    scope.todos = todos
    scope.filter = window.location.hash.slice(2)
    scope.allDone = false
    scope.remaining = todos.reduce(function (count, todo) {
        return count + (todo.done ? 0 : 1)
    }, 0)

    // computed properties ----------------------------------------------------
    scope.total = function () {
        return scope.todos.length
    }

    scope.completed = function () {
        return scope.total() - scope.remaining
    }

    scope.itemLabel = function () {
        return scope.remaining > 1 ? 'items' : 'item'
    }

    // event handlers ---------------------------------------------------------
    scope.addTodo = function (e) {
        var val = e.el.value
        if (val) {
            e.el.value = ''
            scope.todos.unshift({ text: val, done: false })
        }
        scope.remaining++
    }

    scope.removeTodo = function (e) {
        scope.todos.remove(e.scope)
        scope.remaining -= e.scope.done ? 0 : 1
    }

    scope.updateCount = function (e) {
        scope.remaining += e.scope.done ? -1 : 1
        scope.allDone = scope.remaining === 0
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

    scope.toggleAll = function (e) {
        scope.todos.forEach(function (todo) {
            todo.done = e.el.checked
        })
        scope.remaining = e.el.checked ? 0 : scope.total()
    }

    scope.removeCompleted = function () {
        scope.todos = scope.todos.filter(function (todo) {
            return !todo.done
        })
    }

})

Seed.bootstrap()