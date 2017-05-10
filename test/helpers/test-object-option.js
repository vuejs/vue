import Vue from 'vue'

export default function testObjectOption (name: string) {
  it('should warn non object', () => {
    const options = {}
    options[name] = 'wrong'
    new Vue(options)
    expect(`${name} should be an object`).toHaveBeenWarned()
  })

  it('don\'t warn when is an object', () => {
    const options = {}
    options[name] = {}
    new Vue(options)
    expect(`${name} should be an object`).not.toHaveBeenWarned()
  })
}
