/**
 * Register release-related tasks.
 */

module.exports = function (grunt) {

  /**
   * Update manifest file versions.
   */

  grunt.registerTask('version', function (version) {
    var manifests = ['package']
    manifests.forEach(function (file) {
      file = file + '.json'
      var json = grunt.file.read(file)
      json = json.replace(
        /"version"\s*:\s*"(.+?)"/,
        '"version": "' + version + '"'
      )
      grunt.file.write(file, json)
      console.log('updated ' + blue(file))
    })
    // update main file verison
    var main = 'src/vue.js'
    var file = grunt.file.read(main)
    file = file.replace(/Vue\.version = '(.*)'/, 'Vue.version = \'' + version + '\'')
    grunt.file.write(main, file)
    console.log('updated ' + blue(main))
  })

  /**
   * Commit & push to branches & tags + npm publish
   */

  grunt.registerTask('git', function (version) {
    var ShellTask = require('shell-task')
    new ShellTask('git add -A')
      .then('git commit -m "[release] ' + version + '"')
      .then('git tag ' + version)
      .then('git push')
      .then('git push origin refs/tags/' + version)
      .then('npm publish')
      .run(this.async())
  })

  /**
   * Main release routine.
   */

  grunt.registerTask('release', function (version) {

    var semver = require('semver')
    var readline = require('readline')
    var done = this.async()
    var current = grunt.config.get('version')
    var next = semver.inc(current, version || 'patch') || version

    if (!semver.valid(next)) {
      grunt.fail.warn('Invalid version.')
    }
    if (semver.lt(next, current)) {
      grunt.fail.warn('Version is older than current.')
    }

    readline.createInterface({
      input: process.stdin,
      output: process.stdout
    }).question('Releasing version ' + next + '. Continue? (Y/n)', function (answer) {
      if (!answer || answer.toLowerCase() === 'y') {
        console.log(blue('Releasing: ' + next))
        // set version in env
        grunt.task.run([
          'eslint',
          'cover',
          'version:' + next,
          'build',
          'casper',
          'sauce',
          'git:' + next
        ])
      }
      done()
    })
  })

  function blue (str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
  }
}
