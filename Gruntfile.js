module.exports = function( grunt ) {

    grunt.initConfig({

        component_build: {
            build: {
                output: './dist/',
                name: 'element',
                styles: false,
                scripts: true,
                verbose: true
            }
        },

        jshint: {
            build: {
                src: ['src/**/*.js'],
                options: {
                    jshintrc: "./.jshintrc"
                }
            }
        },

        mocha: {
            build: {
                src: ['test/test.html'],
                options: {
                    reporter: 'Spec',
                    run: true
                }
            }
        },

        watch: {
            component: {
                files: ['src/**/*.js', 'component.json'],
                tasks: 'component_build'
            }
        }

    })

    grunt.loadNpmTasks( 'grunt-contrib-watch' )
    grunt.loadNpmTasks( 'grunt-contrib-jshint' )
    grunt.loadNpmTasks( 'grunt-component-build' )
    grunt.loadNpmTasks( 'grunt-mocha' )
    grunt.registerTask( 'test', ['mocha'] )
    grunt.registerTask( 'default', ['jshint', 'component_build', 'mocha'] )
    
}