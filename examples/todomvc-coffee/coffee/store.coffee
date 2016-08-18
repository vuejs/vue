###jshint unused:false ###

((exports) ->

  'use strict'

  STORAGE_KEY = 'todos-vuejs'

  exports.todoStorage =
    fetch: ->
      JSON.parse localStorage.getItem(STORAGE_KEY) or '[]'
    save: (todos) ->
      localStorage.setItem STORAGE_KEY, JSON.stringify(todos)

) window
