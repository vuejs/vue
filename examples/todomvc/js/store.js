var todoStorage = (function () {
    var STORAGE_KEY = 'todos-vuejs',
        todos = null
    return {
        fetch: function () {
            if (!todos) todos = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]')
            return todos
        },
        save: function () {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos))
        }
    }
}())