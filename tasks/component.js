// automatically fill in component.json's script field

module.exports = function (grunt) {
  grunt.registerTask('component', function () {

    var component = grunt.file.readJSON('component.json')
    component.scripts = []

    grunt.file.recurse('src', function (file) {
      component.scripts.push(file)
    })

    grunt.file.write('component.json', JSON.stringify(component, null, 2))

  })
}