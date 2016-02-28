###global app, Router ###

do (app, Router) ->

  'use strict'

  router = new Router

  ['all', 'active', 'completed'].forEach (visibility) ->
    router.on visibility, ->
      app.visibility = visibility

  router.configure
    notfound: ->
      window.location.hash = ''
      app.visibility = 'all'

  do router.init
