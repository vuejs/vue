var semver = require('semver'),
    readline = require('readline'),
    ShellTask = require('shell-task')

module.exports = function (grunt) {

    grunt.registerTask('version', function (version) {
        ;['package', 'bower', 'component'].forEach(function (file) {
            file = file + '.json'
            var json = grunt.file.read(file)
            json = json.replace(/"version"\s*:\s*"(.+?)"/, '"version": "' + version + '"')
            grunt.file.write(file, json)
            console.log('updated ' + blue(file))
        })
    })

    grunt.registerTask('git', function (version) {
        new ShellTask('git add -A')
            .then('git commit -m Release-v' + version)
            .then('git tag v' + version)
            .then('git push')
            .then('git push origin v' + version)
            .then('npm publish')
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
                console.log(blue('Releasing: v' + next))
                grunt.task.run([
                    'jshint',
                    'build:' + next,
                    'test',
                    'version:' + next,
                    'git:' + next
                ])
            }
            done()
        })
    })
}

function blue (str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}