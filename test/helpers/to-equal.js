import isEqual from 'lodash.isequal'

beforeEach(() => {
  jasmine.addMatchers({
    // override built-in toEqual because it behaves incorrectly
    // on Vue-observed arrays in Safari
    toEqual: () => {
      return {
        compare: (a, b) => {
          const pass = isEqual(a, b)
          return {
            pass,
            message: `Expected ${a}${pass ? ' ' : ' not '}to equal ${b}`
          }
        }
      }
    }
  })
})
