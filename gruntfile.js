module.exports = function (grunt) {

    grunt.initConfig({
        karma: {
            options: {
                frameworks: ['jasmine', 'commonjs'],
                preprocessors: {
                    'src/*.js': ['commonjs'],
                    'test/unit/specs/*': ['commonjs']
                },
                files: [
                    'src/*.js',
                    'test/unit/specs/*.js'
                ],
                singleRun: true
            },
            browsers: {
                options: {
                   browsers: ['Chrome', 'Firefox'],
                   reporters: ['progress']
                }
            }
        }
    })

    grunt.loadNpmTasks('grunt-karma')
    grunt.registerTask('unit', ['karma:browsers'])

}