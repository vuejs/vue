spawn = require('child_process').spawn

task "compile-watch", "Compile the .coffee files to javascript and watch for changes", ->
  spawnCoffee ['-o', 'js/', '-cbw', 'coffee/']

task "compile", "Compile the .coffee files to javascript.", ->
  spawnCoffee ['-o', 'js/', '-cb', 'coffee/']

spawnCoffee = (options) ->
  csCompiler = spawn 'coffee', options
  csCompiler.stdout.on 'data', (data) ->
    console.log data.toString().trim()
  csCompiler.stderr.on 'data', (data) ->
    console.error data.toString().trim()
