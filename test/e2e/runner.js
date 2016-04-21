var path = require('path')
var httpServer = require('http-server')
var server = httpServer.createServer({
  root: path.resolve(__dirname, '../../')
})

server.listen(8080)

var spawn = require('cross-spawn')
var runner = spawn(
  './node_modules/.bin/nightwatch',
  [
    '--config', 'build/nightwatch.config.js',
    '--env', 'chrome,firefox'
  ],
  {
    stdio: 'inherit'
  }
)

runner.on('exit', function (code) {
  server.close()
  process.exit(code)
})

runner.on('error', function (err) {
  server.close()
  throw err
})
