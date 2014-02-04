var todoStorage = (function () {

    var STORAGE_KEY = 'todos-vuejs',
        todos = null
        
    return {
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
}())