/*jshint unused:false */

(function (exports) {

    'use strict'

    var STORAGE_KEY = 'todos-vuejs'
    var todos = null

    exports.todoStorage = {
        fetch: function () {
            if (!todos) {
                todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
            }
            return todos
        },
        save: function () {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
        }
    }

})(window)