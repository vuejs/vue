var todoStorage = (function () {
    var STORAGE_KEY = 'todos-seedjs'
    return {
        fetch: function () {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]')
        },
        save: function (todos) {
            localStorage.setItem(this.STORAGE_KEY, Seed.utils.serialize(todos))
        }
    }
}())