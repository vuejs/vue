import { keySort, looseEqual } from 'shared/util'

describe('keySort', () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+./'
  const randomWord = () => {
    const letters = []
    for (let cnt = 0; cnt < 10; cnt++) {
      letters.push(chars.charAt(Math.floor(Math.random() * chars.length)))
    }
    return letters.join('')
  }
  const unsortedObject = () => {
    const unsorted = {}
    chars.split('').map(c => {
      unsorted[c + '' + randomWord()] = randomWord()
    })
    return unsorted
  }

  it('returns Object for empty Object argument', () => {
    expect(looseEqual(keySort({}), {})).toBe(true)
  })

  it('returns Object for Array argument', () => {
    expect(looseEqual(keySort([]), {})).toBe(true)
  })

  it('returns Object for String argument', () => {
    expect(looseEqual(keySort('Test String'), {})).toBe(true)
  })

  it('returns Object for Number argument', () => {
    expect(looseEqual(keySort(Number.MAX_SAFE_INTEGER), {})).toBe(true)
  })

  it('returns Object for Undefined argument', () => {
    expect(looseEqual(keySort(undefined), {})).toBe(true)
  })

  it('returns Object for Null argument', () => {
    expect(looseEqual(keySort(null), {})).toBe(true)
  })

  it('Sorts an unsorted Object, which are equal', () => {
    const unsortedTestObj = unsortedObject()
    const sortedObject = keySort(unsortedTestObj)
    expect(looseEqual(sortedObject, unsortedTestObj)).toBe(true)
  })

  it('does not unsort a sorted object', () => {
    const sortedObject = keySort(unsortedObject())
    const sortedObjectCompare = keySort(sortedObject)
    expect(looseEqual(sortedObject, sortedObjectCompare)).toBe(true)
  })
})
