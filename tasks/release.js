var semver = require('semver'),
    readline = require('readline'),
    ShellTask = require('shell-task')

module.exports = function (grunt) {

    grunt.registerTask('version', function (version) {
        ;['package', 'bower', 'component'].forEach(function (file) {
            file = './' + file + '.json'
            var json = grunt.file.read(file)
            json = json.replace(/"version"\s*:\s*"(.+?)"/, '"version": "' + version + '"')
            grunt.file.write(file, json)
        })
    })

    grunt.registerTask('git', function (version) {
        new ShellTask('git add -A')
            .then('git commit -m Release-v' + version)
            .then('git tag v' + version)
            .then('git push')
            .then('git push origin v' + version)
            .run(this.async(), function (err) {
                grunt.fail.fatal(err)
            })
    })

    grunt.registerTask('release', function (version) {

        var done = this.async(),
            current = grunt.config('version'),
            next = semver.inc(current, version || 'patch') || version

        if (!semver.valid(next)) {
            return grunt.fail.warn('Invalid version.')
        }
        if (semver.lt(next, current)) {
            return grunt.fail.warn('Version is older than current.')
        }

        readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }).question('Releasing version v' + next + '. Continue? (Y/n)', function (answer) {
            if (!answer || answer.toLowerCase() === 'y') {
                console.log(
                    '\n\x1b[1m\x1b[34m' +
                    'Releasing: v' + next +
                    '\x1b[39m\x1b[22m'
                )
                grunt.config.set('version', next)
                grunt.task.run([
                    'jshint',
                    'test',
                    'version:' + next,
                    'uglify',
                    'size',
                    'git:' + next
                ])
            }
            done()
        })
    })
}