// automatically fill in component.json's script field

module.exports = function (grunt) {
  grunt.registerTask('component', function () {

    var jsRE = /\.js$/
    var component = grunt.file.readJSON('component.json')
    component.scripts = []

    grunt.file.recurse('src', function (file) {
      if (jsRE.test(file)) {
        component.scripts.push(file)
      }
    })

    grunt.file.write('component.json', JSON.stringify(component, null, 2))

  })
}