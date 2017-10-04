import Vue from 'vue'

export default function testObjectOption (name) {
  it('should warn non object value', () => {
    const options = {}
    options[name] = () => {}
    new Vue(options)
    expect(`component option "${name}" should be an object`).toHaveBeenWarned()
  })

  it('should not warn valid object value', () => {
    const options = {}
    options[name] = {}
    new Vue(options)
    expect(`component option "${name}" should be an object`).not.toHaveBeenWarned()
  })
}
