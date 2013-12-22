var semver = require('semver'),
    readline = require('readline'),
    exec = require('child_process').exec

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
        exec(
            'git add -A;' +
            'git commit -m "Release v' + version + '";' + 
            'git tag v' + version + ';' +
            'git push;' + 
            'git push origin v' + version,
            this.async()
        )
    })

    grunt.registerTask('release', function (version) {

        var done = this.async(),
            current = grunt.config('pkg.version'),
            next = semver.inc(current, version || 'patch')

        if (!next) {
            if (!semver.valid(version)) {
                return grunt.fail.warn('Invalid version.')
            }
            if (semver.lt(version, current)) {
                return grunt.fail.warn('Version is older than current.')
            }
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
                    'git:' + next
                ])
            }
            done()
        })
    })
}