###global Vue, todoStorage ###

((exports) ->

  'use strict'

  filters =
    all: (todos) ->
      todos
    active: (todos) ->
      todos.filter (todo) ->
        !todo.completed
    completed: (todos) ->
      todos.filter (todo) ->
        todo.completed

  exports.app = new Vue

    # the root element that will be compiled
    el: '.todoapp'

    # app initial state
    data:
      todos: todoStorage.fetch()
      newTodo: ''
      editedTodo: null
      visibility: 'all'

    # watch todos change for localStorage persistence
    watch:
      todos:
        handler: (todos) ->
          todoStorage.save todos
        deep: true

    # computed properties
		# http://vuejs.org/guide/computed.html
    computed:
      filteredTodos: ->
        filters[@visibility] @todos
      remaining: ->
        filters.active(@todos).length
      allDone:
        get: ->
          @remaining == 0
        set: (value) ->
          @todos.forEach (todo) ->
            todo.completed = value

    # methods that implement data logic.
		# note there's no DOM manipulation here at al
    methods:

      addTodo: ->
        value = @newTodo and @newTodo.trim()
        if !value
          return
        @todos.push
          title: value
          completed: false
        @newTodo = ''

      removeTodo: (todo) ->
        @todos.$remove todo

      editTodo: (todo) ->
        @beforeEditCache = todo.title
        @editedTodo = todo

      doneEdit: (todo) ->
        if !@editedTodo
          return
        @editedTodo = null
        todo.title = todo.title.trim()
        if !todo.title
          @removeTodo todo

      cancelEdit: (todo) ->
        @editedTodo = null
        todo.title = @beforeEditCache

      removeCompleted: ->
        @todos = filters.active(@todos)

    # a custom directive to wait for the DOM to be updated
		# before focusing on the input field.
		# http://vuejs.org/guide/custom-directive.html
    directives:
      'todo-focus': (value) ->
        if !value
          return
        el = @el
        Vue.nextTick ->
          el.focus()

) window
